import { DefaultPrices, SampleDrawing, BQData, ProjectBoQ } from "./types";

// Realistic current rates in Addis Ababa / Ethiopia (in Birr - ETB)
export const INITIAL_DEFAULT_PRICES: DefaultPrices = {
  excavation: 380,       // per m³ (Bulk/Trench excavation in ordinary soil)
  leanConcrete: 480,     // per m² (50mm thick C-15 lean concrete under footings)
  concreteC25: 12500,    // per m³ (Cast-in-situ reinforced concrete class C-25)
  formwork: 650,         // per m² (Sawn timber formwork for column/footing sides)
  rebar: 145,            // per kg (Deformed reinforcement bars including fabrication & tying)
  stoneMasonry: 2800,    // per m³ (30cm thick basalt stone foundation masonry)
  hcbWall150: 980,       // per m² (150mm thick Hollow Concrete Block wall)
  hcbWall200: 1250,      // per m² (200mm thick Hollow Concrete Block wall)
  plastering: 420,       // per m² (Two-coat cement plastering to internal/external walls)
  painting: 280,         // per m² (Three-coat plastic emulsion paint to plastered walls)
};

// Language toggle datasets
export const TRANSLATIONS = {
  am: {
    title: "የኢትዮጵያ ህንፃ ግንባታ ኮድ ስታንዳርድ (EBCS) - የዋጋ እና ዝርዝር ማጠቃለያ (BQ) ማግኛ ሶፍትዌር",
    subtitle: "በዲዛይን PDF ወይም ምስል ላይ ያሉ ዝርዝሮችን በማንበብ ወዲያውኑ የዋጋ እና የብዛት ማጠቃለያ (BQ) በEBCS ስታንዳርድ የሚያዘጋጅ ስማርት ሲስተም",
    uploadTitle: "የግንባታ ንድፍ ፋይል ማስገቢያ (Drawing Upload Center)",
    dragDropText: "የዲዛይን PDF ወይም ምስል (PNG/JPG) እዚህ ይጎትቱ ወይም ፋይል ለመምረጥ ክሊክ ያድርጉ",
    sampleDemos: "ፈጣን ሙከራ በሚከተሉት የናሙና ዝርዝሮች",
    controlPanel: "የግምገማ እና የዋጋ መቆጣጠሪያ ፓነል",
    ebcsDivision: "የEBCS ስብጥር ክፍል (EBCS Technical Division)",
    tuningPrompt: "ለአርቴፊሻል ኢንተለጀንሱ ልዩ መመሪያ (Tuning Instructions)",
    tuningPlaceholder: "ምሳሌ፦ የብረት ብክነትን (wastage) 10% ጨምርበት... ወይም የመሰረት ጥልቀትን 1.8 ሜትር አድርገህ አስላ...",
    defaultRates: "መሰረታዊ የዋጋ ተመኖች በብር (Standard Rates in ETB)",
    rateExcavation: "የቁፋሮ ዋጋ (በ m³)",
    rateLeanCon: "ሊን ኮንክሪት (በ m²)",
    rateConcrete: "ኮንክሪት C-25 (በ m³)",
    rateFormwork: "ፎርምወርክ ስራ (በ m²)",
    rateRebar: "የብረት ስራ (በ ኪሎግራም)",
    rateStoneMas: "የድንጋይ ቀረጻ (በ m³)",
    generateBtn: "ብዛት እና ዋጋ ስራ (Compute EBCS BQ)",
    generating: "ንድፉን እያነበበና ስሌቱን እየከወነ ነው... እባክዎ ይጠብቁ...",
    assistantChat: "ማስተካከያ እና የእርማት ረዳት (AI Surveyor Assistant)",
    assistantDesc: "ከላይ የተሰራውን BQ ማስተካከል ወይም ተጨማሪ ማብራሪያ መጠየቅ ይችላሉ።",
    chatPlaceholder: "ምሳሌ፦ የኮንክሪት ዋጋውን ወደ 13,000 ቀይረህ ድምሩን አሳይ... ወይም ፎርምወርክ ቁጥሩን በ15% ጨምረው...",
    submitChat: "አስተካክል",
    bqOutput: "የተገኘው የዋጋ ዝርዝር (Generated EBCS BQ Output File)",
    exportExcel: "ወደ CSV (Excel) መረጃውን አውርድ",
    downloadCsv: "አውርድ",
    printBq: "የዋጋ ዝርዝሩን አትም (Print BQ)",
    print: "አትም",
    assumptions: "የምህንድስና ስሌት መነሻ ግምቶች (Engineering Calculation Base)",
    tableCode: "ተ.ቁ",
    tableDesc: "የስራው አይነት ዝርዝር መግለጫ (Technical Description)",
    tableUnit: "መለኪያ (Unit)",
    tableQty: "ብዛት (Qty)",
    tablePrice: "አንድሮ ዋጋ (Unit Price)",
    tableTotal: "ጠቅላላ ዋጋ (Total Amount)",
    tableRemarks: "የስሌት ቀመርና ማብራሪያ (Calculations & Formula Breakdown)",
    addrow: "አዲስ መስመር ጨምር",
    grandTotal: "ጠቅላላ የግንባታ ወጪ ማጠቃለያ (Grand Total Construction Cost)",
    missingApiKey: "የGemini API ቁልፍ (GEMINI_API_KEY) አልተገኘም።",
    demoModeActive: "የማሳያ ሁኔታ (Demo/Sandbox Mode active) - የአሳሽ ስሌቶችን በመጠቀም እየሰራ ነው",
    errorAlert: "ክወናው አልተሳካም፦ ",
    noFileSelected: "እባክዎ መጀመሪያ ፋይል ያስገቡ ወይም ናሙና ዲዛይን ይምረጡ!",
    successBq: "EBCS BQ በተሳካ ሁኔታ ተዘጋጅቷል!",
    ebcsDivisions: {
      substructure_excavation: "የመሰረት ቁፋሮ እና የዐፈር ስራዎች (Excavation & Earthworks)",
      substructure_concrete: "የመሰረት የኮንክሪት ስራዎች (Substructure Concrete Works)",
      superstructure_concrete: "የላይኛው አካል ኮንክሪት ስራዎች (Superstructure Concrete Works)",
      superstructure_masonry: "የብሎኬት እና የግድግዳ ስራዎች (Superstructure Wall Masonry)",
      finishing: "የማጠናቀቂያ እና የጌጣጌጥ ስራዎች (Finishing & Decorative Works)"
    }
  },
  en: {
    title: "Ethiopian Building Code Standard (EBCS) - BQ Generator",
    subtitle: "AI-powered tool that analyzes detail drawings to generate structural Bill of Quantities conforming fully to EBCS specifications",
    uploadTitle: "Drawing Upload Center",
    dragDropText: "Drag and drop the drawing PDF or image (PNG/JPG) here, or click to find files",
    sampleDemos: "Quick Trial with Sample Drawings",
    controlPanel: "Estimation & Unit Rates Control Panel",
    ebcsDivision: "EBCS Technical Division",
    tuningPrompt: "Special Tuning Instructions for AI Surveyor",
    tuningPlaceholder: "Example: Assume excavation depth is 1.8m... or include a 10% waste contingency factor for reinforcement steel...",
    defaultRates: "Standard Unit Rates (ETB - Ethiopian Birr)",
    rateExcavation: "Excavation (per m³)",
    rateLeanCon: "Lean Concrete (per m²)",
    rateConcrete: "C-25 Concrete (per m³)",
    rateFormwork: "Formwork (per m²)",
    rateRebar: "Reinforcement steel (per kg)",
    rateStoneMas: "Stone Masonry (per m³)",
    generateBtn: "Compute EBCS BQ",
    generating: "Analyzing structural details and computing quantities... Please wait...",
    assistantChat: "AI Surveyor Assistant & Revision Chat",
    assistantDesc: "Refine the structural BQ details, ask questions on calculations, or ask for parameter updates.",
    chatPlaceholder: "Example: Adjust C-25 concrete rate to 13,000 ETB... or recalculate rebar wastage to 12%...",
    submitChat: "Apply Edit",
    bqOutput: "Generated EBCS Bill of Quantities Sheet",
    exportExcel: "Export BQ to CSV (Excel File)",
    downloadCsv: "Download CSV",
    printBq: "Print & Share PDF Profile",
    print: "Print / PDF",
    assumptions: "Engineering Estimation Assumptions & Parameters",
    tableCode: "Item ID",
    tableDesc: "Technical Item Description",
    tableUnit: "Unit",
    tableQty: "Quantity & Volume",
    tablePrice: "Unit Price (ETB)",
    tableTotal: "Total Cost (ETB)",
    tableRemarks: "Calculations & Formula Breakdown",
    addrow: "Add Item Row",
    grandTotal: "Grand Total Project Structural Cost",
    missingApiKey: "Gemini API key is not configured.",
    demoModeActive: "Demo/Sandbox Mode active - Using client-side structural simulation",
    errorAlert: "Operation failed: ",
    noFileSelected: "Please upload a drawing sheet or select one of the high-performance EBCS samples below!",
    successBq: "EBCS compliant Bill of Quantities successfully generated!",
    ebcsDivisions: {
      substructure_excavation: "Substructure - Excavation & Earthworks",
      substructure_concrete: "Substructure - Structural Concrete Works",
      superstructure_concrete: "Superstructure - Reinforced Concrete Works",
      superstructure_masonry: "Superstructure - Hollow Concrete Block (HCB) Masonry",
      finishing: "Finishing & Architectural Decorative Works"
    }
  }
};

// High-fidelity Mock/Sandbox Fallback BQs for the sample images
// Image 1: isolatedFooting (footing_detail)
export const ISOLATED_FOOTING_BQ: BQData = {
  divisionTitle: "EBCS Substructure Reinforcement & Concrete Estimates - Footing Pad Detail",
  engineeringAssumptions: [
    "Footing pad size assumed F1 = 1.20m x 1.20m, thickness d = 0.40m based on detail drawing callouts",
    "Excavation depth below ground level H = 1.50m in ordinary clay soil",
    "Lean concrete C-15 foundation bed with thickness of 50mm",
    "C-25 Reinforced Concrete cast with proper site mechanical vibration & curing",
    "Reinforcement: Deformed bar Ø12mm spaced at c/c 150mm both ways (Bottom mesh)"
  ],
  items: [
    {
      id: "1.1",
      description: "በእጅ ወይም በግሬደር የሚሰራ የመሰረት ጉድጓድ ቁፋሮ በደለል አፈር ውስጥ ጥልቀቱ ከ 1.5 ሜ ያልበለጠ / Bulk Excavation in ordinary soil for isolated footing pad to a depth not exceeding 1.50m from ground level.",
      unit: "m³",
      quantity: 12.96,
      unitPrice: 380,
      remarks: "Calculation: 6 Footing pads * (1.20m width + 0.3m space each side) * (1.20m length + 0.3m space each side) * 1.6m depth = 6 * 1.5m * 1.5m * 1.6m"
    },
    {
      id: "1.2",
      description: "ባለ 50ሚሜ ውፍረት ሲ-15 ሊን ኮንክሪት ከእያንዳንዱ መሰረት ፉቲንግ በታች የሚነጠፍ / 50mm thick Lean Concrete C-15 screed to be laid under footing pad bases to prevent mud contamination.",
      unit: "m²",
      quantity: 8.64,
      unitPrice: 480,
      remarks: "Calculation: 6 Footing bases * 1.20m * 1.20m plus 0.1m offset around = 6 * (1.20m * 1.20m) = 8.64 square meters."
    },
    {
      id: "1.3",
      description: "ለፉቲንግ መሰረት የሚሆን የኮንክሪት ሙሌት ሲ-25 / Reinforced Concrete C-25 poured inside Footing F1 pads as per structural blueprint configurations.",
      unit: "m³",
      quantity: 3.46,
      unitPrice: 12500,
      remarks: "Calculation: 6 footprint pads * 1.20m * 1.20m * 0.40m thickness = 6 * (0.576 m³) = 3.46 m³"
    },
    {
      id: "1.4",
      description: "ለአምድ እግር (Pad columns / column necks) የሚሆን የሲ-25 ኮንክሪት ስራ / C-25 Concrete poured to column necks from footing top to grade beam level.",
      unit: "m³",
      quantity: 0.65,
      unitPrice: 12500,
      remarks: "Calculation: 6 Columns * 0.30m diameter width * 0.30m length * 1.20m height = 6 * 0.108m³ = 0.65m³"
    },
    {
      id: "1.5",
      description: "የኮንክሪት መስሪያ ታኮ/ፎርምወርክ ለፉቲንግ ጎኖች በስነ ስርዓት የሚገጠም / Sawn timber formwork for footing sides and foundation columns to contain casting.",
      unit: "m²",
      quantity: 11.52,
      unitPrice: 650,
      remarks: "Calculation: 6 Footings * 4 sides * (1.20m perimeter * 0.40m height) = 11.52 square meters total contact surface."
    },
    {
      id: "1.6",
      description: "የታችኛው ወለል መሰረት የብረት ዝርጋታ (Ø12ሚሜ ኪሎግራም) / High-yield Deformed structural steel reinforcement bars Ø12mm at c/c 150mm spacing in both directions, cut, bent, and wired in footing pads.",
      unit: "kg",
      quantity: 111.9,
      unitPrice: 145,
      remarks: "Calculation: Footing mesh: 1.20m width has 9 bars of 1.15m length = 10.35m. Cross way has 9 bars = 10.35m. Total 20.70m per pad * 6 pads = 124.2m of Ø12mm rebar. Unit weight of Ø12mm = 0.888 kg/m. 124.2m * 0.888 = 111.9 kg."
    }
  ]
};

// Image 2: columnSchedule (column_detail)
export const COLUMN_SCHEDULE_BQ: BQData = {
  divisionTitle: "EBCS Superstructure Reinforced Concrete Estimates - Column Schedule Detail (C1)",
  engineeringAssumptions: [
    "Column C1 cross-section dimensions: 300mm x 300mm with concrete cover of 25mm",
    "Floor-to-floor typical height H = 3.00m",
    "C-25 Strength concrete for all structural frames of superstructure column",
    "Longitudinal reinforcement: 8 deformed steel bars with diameter Ø16mm",
    "Ties / Lateral Stirrups: Ø8mm spaced at 100mm near supports (nodes) and 150mm at center column height"
  ],
  items: [
    {
      id: "2.1",
      description: "ለአምዶች (Superstructure columns) የሚሆን የኮንክሪት ሙሌት ሲ-25 / Cast-in-situ reinforced concrete Class C-25 for rectangular superstructure columns poured using mechanical vibrator.",
      unit: "m³",
      quantity: 1.62,
      unitPrice: 12500,
      remarks: "Calculation: 6 structural columns C1 * 0.30m thickness * 0.30m width * 3.00m clear building height = 6 * 0.27m³ = 1.62 m³ concrete"
    },
    {
      id: "2.2",
      description: "ለአምድ ኮንክሪት መስሪያ የሚሆን ፎርምወርክ (ዝግባ ኮምፕሌክስ ኮንትሮላቶ) / High-quality wood/plywood formwork to support vertical columns, including proper alignment braces and oiling.",
      unit: "m²",
      quantity: 21.60,
      unitPrice: 650,
      remarks: "Calculation: 6 columns * 4 faces * (0.30m width * 3.00m height) = 6 * 4 * 0.9m² = 21.6 square meters of timber forms."
    },
    {
      id: "2.3",
      description: "ዋና የርዝመት ዘንጎች የአምድ ብረት (Ø16ሚሜ ኪሎግራም) / High-tensile deformed longitudinal reinforcement steel bars of Ø16mm, including lap lengths (60 * diameter) and anchoring hooks into slab joints.",
      unit: "kg",
      quantity: 179.80,
      unitPrice: 145,
      remarks: "Calculation: 6 columns * 8 vertical bars each * 4.00m length (3m height + 1m overlapping) = 192 meters total Ø16 steel. Unit weight of 16mm rebar = 1.58 kg/m. 192m * 1.58 = 303.36 kg."
    },
    {
      id: "2.4",
      description: "አምዶችን የሚያስሩ አጫጭር የማሰሪያ ብረቶች Ø8ሚሜ ስቲረፕስ / Lateral stirrups (ties) Ø8mm bent precisely into 250x250mm squares with overlap hooks, spaced at 100mm/150mm along column necks.",
      unit: "kg",
      quantity: 49.77,
      unitPrice: 145,
      remarks: "Calculation: 1 column has ~21 stirrups of 1.2m length = 25.2m. 6 columns = 151.2m of Ø8mm rebar. Weight of Ø8mm = 0.395 kg/m. 151.2m * 0.395 = 59.72 kg."
    }
  ]
};

// Pack sample drawings complete
export const SAMPLE_DRAWINGS = (footingImg: string, columnImg: string): SampleDrawing[] => [
  {
    id: "sample_footing",
    name: "የመሰረት እግር ዲዛይን (Isolated Footing F1)",
    nameAmh: "የመሰረት እግር ዲዛይን (Isolated Footing F1)",
    imageUrl: footingImg,
    mimeType: "image/png",
    description: "Detailed excavation, lean concrete bed, footing pad concrete volume, and mesh reinforcing Ø12 rebar calculation.",
    descriptionAmh: "የመሰረት ቁፋሮ፣ የሊን ኮንክሪት ንጣፍ፣ የፓድ ኮንክሪት ቦይ መጠን እና የØ12 ብረት መጠን ስሌት ማረጋገጫ መስሪያ ሥዕል",
    defaultDivision: "substructure_concrete",
    prices: {
      excavation: 380,
      leanConcrete: 480,
      concreteC25: 12500,
      formwork: 650,
      rebar: 145
    },
    sampleBq: ISOLATED_FOOTING_BQ
  },
  {
    id: "sample_column",
    name: "የአምድ መዋቅር ዲዛይን (Superstructure Column C1)",
    nameAmh: "የአምድ መዋቅር ዲዛይን (Superstructure Column C1)",
    imageUrl: columnImg,
    mimeType: "image/png",
    description: "Superstructure column schedule, longitudinal Ø16 bar weights, lateral Ø8 stirrups, and concrete and wooden formwork contact area estimations.",
    descriptionAmh: "የቋሚ ምሰሶ (አምድ C1) ኮንክሪት፣ ፎርምወርክ፣ የØ16 የርዝመት እና የØ8 የማሰሪያ ስቲረፕ ብረት ስሌት ሥዕል",
    defaultDivision: "superstructure_concrete",
    prices: {
      concreteC25: 12500,
      formwork: 650,
      rebar: 145
    },
    sampleBq: COLUMN_SCHEDULE_BQ
  }
];

export const HAYMI_ARCHIGEN_BOQ_DATA: ProjectBoQ = {
  projectName: "HAYMI CAD / ARCHIGEN Automated BoQ Engine",
  currency: "ETB",
  mainWorks: [
    // ----------------------------------------------------
    // 1. SUBSTRUCTURE (ከአፈር በታች ያሉ ስራዎች)
    // ----------------------------------------------------
    {
      id: "1",
      title: "SUBSTRUCTURE - EXCAVATION & EARTH WORK",
      subItems: [
        { item: "1.01", desc: "Site clearing and removing of the top 20 cm thick soil.", unit: "m2", qty: 144.82, price: 49.68, amount: 7194.90 },
        { item: "1.02", desc: "Bulk excavation in ordinary soil up to a depth of 1500 mm from reduced level.", unit: "m3", qty: 50.00, price: 348.75, amount: 17437.50 },
        { item: "1.02.a", desc: "Ditto, but in soft rock.", unit: "m3", qty: 0.00, price: 763.33, amount: 0.00 },
        { item: "1.02.b", desc: "Ditto, but in hardrock.", unit: "m3", qty: 0.00, price: 1374.00, amount: 0.00 },
        { item: "1.03", desc: "Bulk excavation in ordinary soil over 1500mm but not exceeding 3000mm.", unit: "m3", qty: 0.00, price: 422.73, amount: 0.00 },
        { item: "1.60", desc: "Trench excavation for masonry foundation wall to an average depth of 1000mm from reduced level in ordinary soil.", unit: "m3", qty: 40.82, price: 491.11, amount: 20049.53 },
        { item: "1.80", desc: "Fill around foundation/under hardcore from granular material imported from outside compacted in layers.", unit: "m3", qty: 60.00, price: 1796.30, amount: 107777.93 },
        { item: "1.90", desc: "Load and cart away excavated material as per engineers direction.", unit: "m3", qty: 119.79, price: 88.41, amount: 10590.34 },
        { item: "1.10", desc: "25cm thick basaltic or equivalent stone hardcore, well rolled, consolidated and blinded with crushed stone.", unit: "m2", qty: 87.75, price: 640.05, amount: 56166.02 }
      ]
    },
    {
      id: "2",
      title: "SUBSTRUCTURE - CONCRETE WORK",
      subItems: [
        { item: "2.10", desc: "5cm thick C-5 lean concrete with 150kg cement/m3 under foundations.", unit: "m2", qty: 24.49, price: 492.14, amount: 12054.97 },
        { item: "2.30", desc: "10cm thick mass concrete slab in concrete class C-15.", unit: "m2", qty: 92.86, price: 1544.31, amount: 143398.12 },
        { item: "2.40", desc: "C-25 concrete cast into formwork and vibrated for columns, grade beams, footings.", unit: "m3", qty: 2.94, price: 12285.98, amount: 36113.25 },
        { item: "2.50", desc: "Provide and fix 2.5cm thick wood/metal formwork to footing, columns, and grade beams.", unit: "m2", qty: 29.39, price: 842.86, amount: 24774.82 },
        { item: "2.60", desc: "Supply and fix reinforcement steel bars including cutting, bending, placing (8mm to 24mm).", unit: "kg", qty: 575.20, price: 237.34, amount: 136520.20 },
        { item: "2.70", desc: "Supply and install 0.5cm thick and 10cm high styrofoam for expansion joint.", unit: "lm", qty: 44.09, price: 56.38, amount: 2485.84 }
      ]
    },
    {
      id: "3",
      title: "SUBSTRUCTURE - MASONRY WORK",
      subItems: [
        { item: "3.10", desc: "Basaltic stone masonry foundation bedded in cement sand mortar (1:4) below NGL.", unit: "m3", qty: 26.94, price: 5308.50, amount: 143034.28 },
        { item: "3.20", desc: "Fair faced chiseled or dressed natural stone masonry foundation above NGL.", unit: "m3", qty: 18.99, price: 5494.60, amount: 104306.99 }
      ]
    },

    // ----------------------------------------------------
    // II. SUPERSTRUCTURE (ከአፈር በላይ ያሉ ስራዎች)
    // ----------------------------------------------------
    {
      id: "4",
      title: "SUPERSTRUCTURE - CONCRETE WORK",
      subItems: [
        { item: "1.10", desc: "C-25 concrete cast into formwork and vibrated for elevation columns, beams, top tie beams.", unit: "m3", qty: 5.68, price: 12579.12, amount: 71507.18 },
        { item: "1.20", desc: "Provide and fix 25mm thick wood/metal formwork to elevation columns and beams.", unit: "m2", qty: 77.41, price: 842.86, amount: 65246.34 },
        { item: "1.30", desc: "Steel reinforcement bars according to structural drawings including cutting and bending.", unit: "kg", qty: 426.96, price: 240.98, amount: 102887.45 }
      ]
    },
    {
      id: "5",
      title: "SUPERSTRUCTURE - BLOCK WORK & MASONRY",
      subItems: [
        { item: "2.10", desc: "20 cm thick Class 'C' HCB wall bedded in cement mortar (1:3).", unit: "m2", qty: 105.74, price: 1254.22, amount: 132616.32 },
        { item: "2.20", desc: "Ditto, but 15cm thick HCB wall.", unit: "m2", qty: 45.22, price: 1237.35, amount: 55957.75 }
      ]
    },
    {
      id: "6",
      title: "SUPERSTRUCTURE - ROOFING WORKS",
      subItems: [
        { item: "3.10", desc: "Corrugated galvanized iron sheet roof covers including ridge covers fixed to purlins.", unit: "m2", qty: 112.61, price: 1873.93, amount: 211018.88 },
        { item: "3.40", desc: "G-28 galvanized flat metal sheet flashing fixed as per drawings.", unit: "ml", qty: 30.62, price: 1087.20, amount: 33288.57 },
        { item: "3.50", desc: "Supply and fix G-28 galvanized flat metal sheet gutter spliced and welded.", unit: "ml", qty: 30.62, price: 894.37, amount: 27384.23 },
        { item: "3.90", desc: "Supply and fix diameter 110mm PVC downpipe complete.", unit: "lm", qty: 30.62, price: 5002.00, amount: 153154.36 },
        { item: "3.100", desc: "Supply and fix drain 110mm PVC downpipe cast in place.", unit: "lm", qty: 12.76, price: 886.73, amount: 11312.68 }
      ]
    },
    {
      id: "7",
      title: "SUPERSTRUCTURE - STEEL STRUCTURE & METAL WORKS",
      subItems: [
        { item: "4.40", desc: "Metal doors and windows fabricated using locally manufactured 38mm LTZ profile.", unit: "m2", qty: 20.53, price: 5019.13, amount: 103030.26 },
        { item: "4.60", desc: "Main gate of size 4m x 3m, complete with elegant and functional design elements.", unit: "No", qty: 1.00, price: 123432.72, amount: 123432.72 }
      ]
    },
    {
      id: "8",
      title: "SUPERSTRUCTURE - CARPENTRY & JOINERY",
      subItems: [
        { item: "5.10", desc: "Supply and fix internal flush wooden doors, 40mm thick covered with 4mm Kerero plywood.", unit: "m2", qty: 7.50, price: 9960.00, amount: 74700.00 },
        { item: "5.70", desc: "Supply and erect wooden trusses and structural timber roof members.", unit: "ml", qty: 477.10, price: 204.47, amount: 97553.56 },
        { item: "5.80", desc: "Supply and fix 7x5cm wood purlins fixed to wooden trusses.", unit: "ml", qty: 135.61, price: 332.04, amount: 45025.98 },
        { item: "5.90", desc: "Providing and fixing commercial grade plywood kitchen cabinets (60cm deep).", unit: "m2", qty: 12.50, price: 11436.00, amount: 142950.00 }
      ]
    },
    {
      id: "9",
      title: "SUPERSTRUCTURE - FINISHING WORKS",
      subItems: [
        { item: "7.1", desc: "Two coats of cement mortar plastering (1:3) for walls and columns.", unit: "m2", qty: 353.97, price: 473.85, amount: 166447.17 },
        { item: "7.2", desc: "Final coat of gypsum finish to internal wall surfaces and beams.", unit: "m2", qty: 248.23, price: 137.03, amount: 34015.17 },
        { item: "7.6", desc: "300x300x10mm non-slippery ceramic floor tiles bedded on cement mortar.", unit: "m2", qty: 15.00, price: 1847.48, amount: 27712.20 },
        { item: "7.7", desc: "600x600x10mm ceramic tile including 48mm cement screed.", unit: "m2", qty: 80.00, price: 2369.22, amount: 189537.52 },
        { item: "7.16", desc: "10cm high and 4mm thick porcelain skirting.", unit: "ml", qty: 42.42, price: 184.75, amount: 7836.66 },
        { item: "7.19", desc: "3x25cm Granite window sill installation.", unit: "ml", qty: 8.88, price: 4062.47, amount: 36061.61 },
        { item: "7.21", desc: "Supply and fix local gypsum ceiling decoration without battens.", unit: "m2", qty: 90.00, price: 769.13, amount: 69221.70 },
        { item: "7.23", desc: "50x30x30cm Checkered tile (Bazola) for outdoor pathways.", unit: "m2", qty: 17.65, price: 2373.16, amount: 41879.35 }
      ]
    },
    {
      id: "10",
      title: "SUPERSTRUCTURE - GLAZING & PAINTING",
      subItems: [
        { item: "8.1", desc: "Supply and fix 5mm thick clear sheet glass to metal frames with putty.", unit: "m2", qty: 16.42, price: 2095.91, amount: 34419.09 },
        { item: "9.10", desc: "Three coats of plastic emulsion paint (Nifas Silk or equivalent) to internal walls.", unit: "m2", qty: 196.18, price: 127.68, amount: 25048.73 },
        { item: "9.40", desc: "Quartzite external textured painting to all exposed facades.", unit: "m2", qty: 105.74, price: 803.84, amount: 84995.07 }
      ]
    },
    {
      id: "11",
      title: "SUPERSTRUCTURE - SANITARY INSTALLATIONS",
      subItems: [
        { item: "10.1", desc: "Supply, lay and connect threaded PPR pipes PN20 for water supply.", unit: "Ml", qty: 34.50, price: 1139.30, amount: 33124.93 },
        { item: "10.5", desc: "Supply and fix Tabor ceramic hand wash basins with complete brackets.", unit: "No", qty: 2.00, price: 10462.65, amount: 20925.31 },
        { item: "10.9", desc: "Supply and install low-level Tabor ceramic Water Closet (WC) suites.", unit: "No", qty: 2.00, price: 28368.44, amount: 56736.88 },
        { item: "10.20", desc: "Supply and fix enameled cast iron white-painted shower units.", unit: "No", qty: 2.00, price: 14382.91, amount: 28765.82 },
        { item: "10.27", desc: "Supply and mount 5m3 capacity Roto domestic water storage tank.", unit: "No", qty: 1.00, price: 45573.29, amount: 45573.29 },
        { item: "10.42", desc: "Construct 15m3 effective volume Septic Tank complete with masonry walls.", unit: "No", qty: 1.00, price: 214734.43, amount: 214734.43 }
      ]
    },
    {
      id: "12",
      title: "SUPERSTRUCTURE - ELECTRICAL & MECHANICAL WORKS",
      subItems: [
        { item: "1.2", desc: "1x120 sq mm copper earth conductor from Generator/ATS earthing terminals.", unit: "m", qty: 12.25, price: 700.00, amount: 8573.21 },
        { item: "2.4", desc: "DB-GFR Main distribution board with 63A/3Ph busbar and components.", unit: "No", qty: 1.00, price: 32857.10, amount: 32857.10 },
        { item: "3.1", desc: "Flush mounted light points fed through PVC insulated conductors.", unit: "No", qty: 15.00, price: 2446.80, amount: 36702.00 },
        { item: "5.1", desc: "16A/TP flush mounted socket outlets (Legrand Suno or equivalent).", unit: "No", qty: 17.00, price: 1411.42, amount: 23994.14 },
        { item: "7.3", desc: "Type-3 Cafeteria downlight high-quality indoor fixture.", unit: "No", qty: 5.00, price: 7500.00, amount: 37500.00 },
        { item: "16.0", desc: "Mechanical High-spec VRF Air Conditioning & server room split units.", unit: "set", qty: 0.00, price: 8000000.00, amount: 0.00 }
      ]
    }
  ]
};
