import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize dotenv
dotenv.config();

const app = express();
const PORT = 3000;

// Set up body parsing with high limits to handle base64 drawing PDFs/Images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Check if Gemini API Key is available
const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// REST API endpoint for generating BQ
app.post("/api/generate-bq", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "የGemini API ቁልፍ (GEMINI_API_KEY) አልተገኘም። እባክዎ በSettings > Secrets በኩል ያስገቡት። (Gemini API key is missing. Please add it in Settings > Secrets.)",
      });
    }

    const { fileBase64, mimeType, promptExtension, division, defaultPrices } = req.body;

    if (!fileBase64 || !mimeType) {
      return res.status(400).json({ error: "እባክዎ የዲዛይን ፎቶ ወይም PDF ፋይል ያስገቡ። (Please provide a drawing file or image data.)" });
    }

    // Clean base64 string
    const formatBase64 = fileBase64.replace(/^data:.*,/, "");

    const filePart = {
      inlineData: {
        mimeType: mimeType,
        data: formatBase64,
      },
    };

    // Construct a comprehensive EBCS-focused prompt for Gemini
    const systemPrompt = `You are an expert Ethiopian Civil Engineer, Estimator, and Quantity Surveyor specializing in the Ethiopian Building Code Standard (EBCS) and the standard Technical Specifications & Method of Measurement for Buildings in Ethiopia. 
Your task is to analyze the construction detail drawing (PDF or Image) provided and generate a highly accurate, professional, EBCS-compliant Bill of Quantities (BQ) section.

Guidelines for Quantity Calculation in Ethiopia:
1. Sub-Structure:
   - Excavation: Measured in m³ (Volume = excavated width * length * depth). Identify footings like F1, F2 dimensions.
   - Lean Concrete (usually C-15, 50mm or 100mm thick): Measured in m². Laid under footing bases & grade beams.
   - Reinforced Concrete (C-25 or C-30) in Substructure: Measured in m³ of concrete volume (excluding steel and formwork). Includes Footings, Foundation Columns (Pad columns), and Grade Beams.
   - Formwork: Measured in m² of contact area.
   - Reinforcement Steel (Rebar): Calculated in kg. Concrete cast usually has reinforcement logs block. Steel weights per meter:
     - Ø6mm = 0.222 kg/m, Ø8mm = 0.395 kg/m, Ø10mm = 0.617 kg/m, Ø12mm = 0.888 kg/m, Ø14mm = 1.21 kg/m, Ø16mm = 1.58 kg/m, Ø20mm = 2.47 kg/m, Ø24mm = 3.55 kg/m.
   - Stone Masonry under Grade Beam (normally 30cm or 40cm basalt stone): Measured in m³.
2. Super-Structure:
   - Concrete Works (Columns, Beams, Slabs): Measured in m³.
   - Hollow Concrete Block (HCB) walls (typically 150mm or 200mm thick): Measured in m².
   - Finishing (Plastering, Screed, Painting): m².
   
The user has requested the BQ for the division: "${division}".

Default Unit Prices proposed by user (in ETB):
${JSON.stringify(defaultPrices, null, 2)}

Please write the BQ descriptions in bilingual format: AMHARIC / ENGLISH. For example: "የኮንክሪት ሙሌት C-25 ላቲስ ፉቲንግ / Concrete casting C-25 for footing bases".
Calculate real numbers based on the given drawing. If some dimensions are not explicit, make logical engineering assumptions based on common Ethiopian practices (e.g. footing depth = 1.5m, lean concrete thickness = 50mm, concrete grade = C-25) and state your calculation logic clearly in the "remarks" field in Amharic and English.

Generate the BQ items in JSON format that exactly fits the requested Schema.`;

    const promptText = `Analyze the drawing and compile a Bill of Quantities for EBCS division: "${division}".
Additional instructions: ${promptExtension || "None"}.
Provide calculated quantity, EBCS-level descriptions (Amharic & English), appropriate unit, defaulted unit price fitting the work, and concrete calculations breakdown in the remarks column.`;

    // Run Gemini 3.5 Flash which is high performance and natively supports image/pdf reading
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        filePart,
        { text: `${systemPrompt}\n\n${promptText}` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["divisionTitle", "items", "engineeringAssumptions"],
          properties: {
            divisionTitle: {
              type: Type.STRING,
              description: "The title of the EBCS Division, e.g., 'Sub-Structure Concrete Works' or Amharic equivalent",
            },
            engineeringAssumptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of assumptions/measurement standards applied based on the EBCS code and drawing details (Amharic & English)",
            },
            items: {
              type: Type.ARRAY,
              description: "Calculated EBCS BQ items",
              items: {
                type: Type.OBJECT,
                required: ["id", "description", "unit", "quantity", "unitPrice", "remarks"],
                properties: {
                  id: { type: Type.STRING, description: "Item ID e.g., '1.1', '1.2'" },
                  description: { type: Type.STRING, description: "Detailed description of the item in both AMHARIC and ENGLISH" },
                  unit: { 
                    type: Type.STRING, 
                    description: "Standard unit: m³, m², m, kg, Pcs, or Ls" 
                  },
                  quantity: { type: Type.NUMBER, description: "Calculated quantity from drawing dimensions" },
                  unitPrice: { type: Type.NUMBER, description: "Standard Unit price in ETB (Ethiopian Birr). Adopt from default prices if matches, or construct market rate." },
                  remarks: { type: Type.STRING, description: "Clear explanation of how the quantity was measured/derived (e.g., '6 columns * 1.5m * 0.4m * 0.4m = 1.44m³') in Amharic and English" }
                }
              }
            }
          }
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Gemini returned empty response.");
    }

    const bqData = JSON.parse(outputText.trim());
    return res.json(bqData);

  } catch (error: any) {
    console.error("Error in BQ generation:", error);
    return res.status(500).json({
      error: error.message || "BQ generation generator failed.",
      details: error.stack
    });
  }
});

// Serve sample files base64 directly to help test
app.get("/api/samples", (req, res) => {
  // Let's provide standard mock drawings so the user can test easily!
  res.json({
    isolatedFooting: {
      name: "የፉቲንግ ዝርዝር ዲዛይን (Isolated Footing Detail)",
      type: "image/png",
      description: "A standard isolated concrete footing (F1) drawing with dimensions: pad size 1200x1200x400mm, column depth 1.5m, lean concrete 50mm, rebar Ø12 c/c 150mm both ways."
    },
    columnSchedule: {
      name: "የአምድ መዋቅር ንድፍ (Column Detail Schedule)",
      type: "image/png",
      description: "A standard RC column drawing schedule (C1) with 300x300mm core, rebar 8Ø16 longitudinal bars, and Ø8 ties/stirrups spaced at 100mm/150mm."
    }
  });
});

// Configure Vite or Static Files
const isProd = process.env.NODE_ENV === "production";

async function configureServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EBCS BQ Generator server running on port ${PORT}`);
  });
}

configureServer();
