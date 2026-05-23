import React, { useState, useRef, useEffect } from "react";
import { 
  Building2, 
  UploadCloud, 
  Settings, 
  Trash2, 
  Plus, 
  Download, 
  Printer, 
  Languages, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Send, 
  FileSpreadsheet,
  RefreshCw,
  HelpCircle,
  Eye,
  Minimize2,
  Lock,
  PieChart,
  Layers,
  Activity,
  FileCheck,
  ArrowRight,
  BookOpen,
  Sliders,
  ChevronRight,
  Search,
  RotateCcw,
  Building,
  DollarSign
} from "lucide-react";
import { BQData, BQItem, EBCSDivisionCode, DefaultPrices, SampleDrawing, ProjectBoQ, BQMainWork, BQSubItem, TakeoffItem, MaterialItem } from "./types";
import { INITIAL_DEFAULT_PRICES, TRANSLATIONS, SAMPLE_DRAWINGS, HAYMI_ARCHIGEN_BOQ_DATA } from "./data";
import BbsVolumeCalculators from "./components/BbsVolumeCalculators";
import ProjectListManager from "./components/ProjectListManager";

// Reference sample images generated inside our assets folder
const footingImg = "/src/assets/images/footing_detail_1779444649682.png";
const columnImg = "/src/assets/images/column_detail_1779444669978.png";

export default function App() {
  // Locale State: 'am' (Amharic) or 'en' (English)
  const [lang, setLang] = useState<"am" | "en">("am");

  // Application Mode: "haymi-project" (The 12-work division manager) or "ai-vision" (Plan scanner)
  const [appMode, setAppMode] = useState<"haymi-project" | "ai-vision">("haymi-project");

  // Selected sub-tab within haymi-project workspace: "sheet" | "profile" | "calc" | "projects"
  const [haymiSubTab, setHaymiSubTab] = useState<"sheet" | "profile" | "calc" | "projects">("sheet");

  // Multi-Projects management states synced with LocalStorage
  const [projectsList, setProjectsList] = useState<ProjectBoQ[]>([]);
  const [activeProjId, setActiveProjId] = useState<string>("");

  // Active state representing the entire 12-work division dataset
  const [projectData, setProjectData] = useState<ProjectBoQ>(JSON.parse(JSON.stringify(HAYMI_ARCHIGEN_BOQ_DATA)));

  // Currency States
  const [selectedCurrency, setSelectedCurrency] = useState<"ETB" | "USD" | "EUR">("ETB");
  const [exchangeRateToEtb, setExchangeRateToEtb] = useState<number>(125);

  useEffect(() => {
    const raw = localStorage.getItem("archigen_projects");
    if (raw) {
      try {
        const parsed: ProjectBoQ[] = JSON.parse(raw);
        if (parsed && parsed.length > 0) {
          setProjectsList(parsed);
          const lastActive = localStorage.getItem("archigen_active_proj_id");
          const found = parsed.find(p => p.id === lastActive);
          const activeProj = found || parsed[0];
          setActiveProjId(activeProj.id || "proj_default");
          setProjectData(activeProj);
        } else {
          seedDefaultProject();
        }
      } catch (err) {
        console.error("Failed to parse stored projects, seeding default", err);
        seedDefaultProject();
      }
    } else {
      seedDefaultProject();
    }
  }, []);

  const seedDefaultProject = () => {
    const defaultProj: ProjectBoQ = JSON.parse(JSON.stringify(HAYMI_ARCHIGEN_BOQ_DATA));
    defaultProj.id = "proj_default";
    defaultProj.clientName = defaultProj.clientName || "Haymi Real Estate Plc";
    defaultProj.engineerName = defaultProj.engineerName || "ArchiGen Design Studio Ltd";
    defaultProj.location = defaultProj.location || "Addis Ababa, Bole Sub-City";
    defaultProj.dateCreated = defaultProj.dateCreated || "2026-05-22";
    defaultProj.revisionNo = defaultProj.revisionNo || "Rev. 01";
    defaultProj.contractorName = defaultProj.contractorName || "Yared & Brothers Gen. Contractor Class 1";
    defaultProj.totalFloorArea = defaultProj.totalFloorArea || 1250;
    const list = [defaultProj];
    setProjectsList(list);
    setActiveProjId("proj_default");
    setProjectData(defaultProj);
    localStorage.setItem("archigen_projects", JSON.stringify(list));
    localStorage.setItem("archigen_active_proj_id", "proj_default");
  };

  const updateProjectDataAndPersist = (updatedProj: ProjectBoQ) => {
    setProjectData(updatedProj);
    const updatedList = projectsList.map(p => p.id === updatedProj.id ? updatedProj : p);
    setProjectsList(updatedList);
    localStorage.setItem("archigen_projects", JSON.stringify(updatedList));
  };

  const onActivateProject = (id: string) => {
    const proj = projectsList.find(p => p.id === id);
    if (proj) {
      setActiveProjId(id);
      setProjectData(proj);
      localStorage.setItem("archigen_active_proj_id", id);
      setChatHistory(prev => [
        ...prev,
        {
          sender: "bot",
          text: lang === "am"
            ? `የተመረጠው ፕሮጀክት '${proj.projectName}' በተሳካ ሁኔታ ተጭኗል።`
            : `Project '${proj.projectName}' successfully loaded into active workspace.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const onDeleteProject = (id: string) => {
    if (projectsList.length <= 1) return;
    const filtered = projectsList.filter(p => p.id !== id);
    setProjectsList(filtered);
    localStorage.setItem("archigen_projects", JSON.stringify(filtered));

    if (activeProjId === id) {
      const nextActive = filtered[0];
      setActiveProjId(nextActive.id || "proj_default");
      setProjectData(nextActive);
      localStorage.setItem("archigen_active_proj_id", nextActive.id || "proj_default");
    }
  };

  const onCloneProject = (id: string) => {
    const src = projectsList.find(p => p.id === id);
    if (src) {
      const clone: ProjectBoQ = JSON.parse(JSON.stringify(src));
      clone.id = "proj_" + Date.now();
      clone.projectName = clone.projectName + " (Copy / ቅጂ)";
      const updated = [...projectsList, clone];
      setProjectsList(updated);
      localStorage.setItem("archigen_projects", JSON.stringify(updated));
      setActiveProjId(clone.id);
      setProjectData(clone);
      localStorage.setItem("archigen_active_proj_id", clone.id);
    }
  };

  const onCreateNewProject = (name: string) => {
    const blankProj: ProjectBoQ = {
      id: "proj_" + Date.now(),
      projectName: name,
      clientName: "Private Client",
      engineerName: "ArchiGen Design Studio",
      location: "Addis Ababa, Ethiopia",
      dateCreated: new Date().toISOString().split("T")[0],
      revisionNo: "Rev. 01",
      contractorName: "TBD",
      totalFloorArea: 500,
      currency: "ETB",
      mainWorks: Array.from({ length: 12 }, (_, i) => {
        const divNum = (i + 1).toString();
        const titles: Record<string, string> = {
          "1": "SUBSTRUCTURE - EXCAVATION & EARTH WORK",
          "2": "SUBSTRUCTURE - CONCRETE WORK",
          "3": "SUBSTRUCTURE - MASONRY WORK",
          "4": "SUPERSTRUCTURE - CONCRETE WORK",
          "5": "SUPERSTRUCTURE - BLOCK WORK & MASONRY",
          "6": "SUPERSTRUCTURE - ROOFING WORKS",
          "7": "SUPERSTRUCTURE - STEEL STRUCTURE & METAL WORKS",
          "8": "SUPERSTRUCTURE - CARPENTRY & JOINERY",
          "9": "SUPERSTRUCTURE - FINISHING WORKS",
          "10": "SUPERSTRUCTURE - GLAZING & PAINTING",
          "11": "SUPERSTRUCTURE - SANITARY INSTALLATIONS",
          "12": "SUPERSTRUCTURE - ELECTRICAL & MECHANICAL WORKS"
        };
        return {
          id: divNum,
          title: titles[divNum] || `Division ${divNum}`,
          subItems: []
        };
      })
    };
    
    const updated = [...projectsList, blankProj];
    setProjectsList(updated);
    localStorage.setItem("archigen_projects", JSON.stringify(updated));
    setActiveProjId(blankProj.id);
    setProjectData(blankProj);
    localStorage.setItem("archigen_active_proj_id", blankProj.id);
  };

  const onImportProject = (imported: ProjectBoQ) => {
    const updated = [...projectsList, imported];
    setProjectsList(updated);
    localStorage.setItem("archigen_projects", JSON.stringify(updated));
    setActiveProjId(imported.id || "proj_imported");
    setProjectData(imported);
    localStorage.setItem("archigen_active_proj_id", imported.id || "proj_imported");
  };

  const onAppendCalculatorItem = (divId: string, item: BQSubItem) => {
    const updated = { ...projectData };
    const div = updated.mainWorks.find(d => d.id === divId);
    if (div) {
      div.subItems.push(item);
      updateProjectDataAndPersist(updated);
      setChatHistory(prev => [
        ...prev,
        {
          sender: "bot",
          text: lang === "am"
            ? `አስሊ መሣሪያ በመጠቀም አዲስ ረድፍ ወደ ክፍል ${divId} ተጨምሯል፦ '${item.desc}' በዉህደት መጠን ${item.qty} ${item.unit}።`
            : `Added item calculated via estimator tool to Division ${divId}: '${item.desc}' with quantity ${item.qty} ${item.unit}.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Selected Division in the HAYMI project manager (or "all" to inspect full combined spreadsheet)
  const [activeDivisionId, setActiveDivisionId] = useState<string>("all");

  // Search keywords across descriptions and item codes
  const [searchQuery, setSearchQuery] = useState("");

  // Editing state for main works items list
  const [editingItemKey, setEditingItemKey] = useState<{ divId: string; itemIndex: number } | null>(null);
  const [editingItemData, setEditingItemData] = useState<BQSubItem | null>(null);

  // New item draft states
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormDivId, setAddFormDivId] = useState<string>("1");
  const [newRowDraft, setNewRowDraft] = useState<Partial<BQSubItem>>({
    item: "",
    desc: "",
    unit: "m2",
    qty: 0,
    price: 0,
    amount: 0
  });

  // Original UI / AI vision state configs
  const [rates, setRates] = useState<DefaultPrices>(INITIAL_DEFAULT_PRICES);
  const [division, setDivision] = useState<EBCSDivisionCode>("substructure_concrete");
  const [promptExtension, setPromptExtension] = useState("");
  const samples = SAMPLE_DRAWINGS(footingImg, columnImg);
  const [selectedSampleId, setSelectedSampleId] = useState<string>("sample_footing");
  const [customFile, setCustomFile] = useState<{
    name: string;
    type: string;
    size: string;
    base64: string;
  } | null>(null);

  const [pdfScale, setPdfScale] = useState<string>("1:100");
  const [strictEbcsConcreteCover, setStrictEbcsConcreteCover] = useState<boolean>(true);
  const [rebarWastageFactor, setRebarWastageFactor] = useState<string>("10%");
  const [concreteWastageFactor, setConcreteWastageFactor] = useState<string>("5%");
  const [pdfDetectedSheets, setPdfDetectedSheets] = useState<string[]>([
    "Sheet 1: Architectural Floor Plan & Elevation",
    "Sheet 2: Structural Substructure Foundation & Concrete Details",
    "Sheet 3: Ground Floor Slab & Column Layout",
    "Sheet 4: Reinforcement Bar Schedule (EBCS-2 Logs)"
  ]);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState<number>(1);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [bqData, setBqData] = useState<BQData>(samples[0].sampleBq);

  // New Sizing Wizard / Parametric Estimation Settings
  const [estimationType, setEstimationType] = useState<"drawing" | "parametric">("parametric");
  const [customBuiltUpArea, setCustomBuiltUpArea] = useState<number>(180);
  const [constructionType, setConstructionType] = useState<"residential" | "commercial" | "institutional">("residential");
  const [stories, setStories] = useState<string>("g+3");
  const [countryRegion, setCountryRegion] = useState<string>("eth_addis");
  const [generatedReportType, setGeneratedReportType] = useState<"bq" | "takeoff" | "material">("bq");
  const [takeoffData, setTakeoffData] = useState<TakeoffItem[] | null>(null);
  const [materialData, setMaterialData] = useState<MaterialItem[] | null>(null);

  // States for interactive parametric list editing
  const [editTakeoffIndex, setEditTakeoffIndex] = useState<number | null>(null);
  const [editTakeoffData, setEditTakeoffData] = useState<TakeoffItem | null>(null);
  const [editMaterialIndex, setEditMaterialIndex] = useState<number | null>(null);
  const [editMaterialData, setEditMaterialData] = useState<MaterialItem | null>(null);

  // Manual row editing inside standalone AI results
  const [editRowIndex, setEditRowIndex] = useState<number | null>(null);
  const [editRowData, setEditRowData] = useState<BQItem | null>(null);
  const [aiNewRow, setAiNewRow] = useState<Partial<BQItem>>({
    id: "",
    description: "",
    unit: "m³",
    quantity: 0,
    unitPrice: 0,
    remarks: ""
  });
  const [aiShowAddForm, setAiShowAddForm] = useState(false);

  // Chat History
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "bot"; text: string; time: string }>>([
    {
      sender: "bot",
      text: "እንኳን ደህና መጡ! እኔ የ HAYMI CAD / ARCHIGEN መጠንና ዋጋ ግምገማ ረዳት ነኝ። በ 12ቱ ክፍሎች የዋጋ ዝርዝር ላይ ፍንጭ በመስጠት ወይም በማዘዝ ለውጥ ማድረግ ይችላሉ። (ምሳሌ፦ 'የኮንክሪት ዋጋ ወደ 13200 ቀይር'፣ 'የብረት መጠን በአስር ፐርሰንት ጨምር' ወይንም 'የጣራ ዋጋ 2200 አድርገው')",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Handle Drag Over
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize dynamic defaults when AI mode sample is clicked
  useEffect(() => {
    if (selectedSampleId !== "custom" && appMode === "ai-vision") {
      const activeSample = samples.find(s => s.id === selectedSampleId);
      if (activeSample) {
        setBqData(activeSample.sampleBq);
        setDivision(activeSample.defaultDivision);
      }
    }
  }, [selectedSampleId, appMode]);

  // Amharic and English mappings for division titles
  const DIVISION_LANGS: Record<string, { am: string; en: string }> = {
    "1": { am: "ክፍል 1 - ቁፋሮ እና የአፈር ስራዎች", en: "Division 1 - Excavation & Earthwork" },
    "2": { am: "ክፍል 2 - መለስተኛ እና ኮንክሪት ስራዎች", en: "Division 2 - Substructure Concrete" },
    "3": { am: "ክፍል 3 - የመሰረት የድንጋይ ግንባታ", en: "Division 3 - Substructure Stone Masonry" },
    "4": { am: "ክፍል 4 - የላይኛው አካል ኮንክሪት ስራዎች", en: "Division 4 - Superstructure Concrete" },
    "5": { am: "ክፍል 5 - የብሎኬት እና ግድግዳ ስራዎች", en: "Division 5 - Superstructure Blockwall" },
    "6": { am: "ክፍል 6 - የጣራ ክዳን እና ረዳት ስራዎች", en: "Division 6 - Superstructure Roofing" },
    "7": { am: "ክፍል 7 - የአርማታ ድንጋይ እና የብረታብረት ስራ", en: "Division 7 - Superstructure Steel Structures" },
    "8": { am: "ክፍል 8 - የአናጺነት እና የእንጨት ስራዎች", en: "Division 8 - Carpentry & Joinery" },
    "9": { am: "ክፍል 9 - የማጠናቀቂያ እና የሰረገላ ስራዎች", en: "Division 9 - Architectural Finishing" },
    "10": { am: "ክፍል 10 - የቀለም እና የብርጭቆ ገጠማ", en: "Division 10 - Glazing & Painting" },
    "11": { am: "ክፍል 11 - የሳኒተሪ እና ፍሳሽ እቃዎች ዝርጋታ", en: "Division 11 - Sanitary Installations" },
    "12": { am: "ክፍል 12 - የኤሌክትሪክ እና የሜካኒካል ሲስተም", en: "Division 12 - Electrical & HVAC VRF" }
  };

  // Dictionary translations
  const customTranslations = {
    am: {
      haymiTitle: "HAYMI CAD / ARCHIGEN Automated BoQ Engine",
      projectNameLabel: "ፕሮጀክት ስም",
      currencyLabel: "የገንዘብ አይነት",
      allDivs: "ሁሉም ክፍሎች (Full Project Sheet)",
      searchPlaceholder: "የስራ ዝርዝር ወይም የአይተም ኮድ ፈልግ...",
      resetBaseline: "ወደ ቀደመው baseline መልስ",
      addBtn: "አዲስ አይተም ጨምር",
      divisionLabel: "የስራ ክፍል",
      continuousView: "ቀጣይነት ያለው ሙሉ እይታ",
      budgetShare: "የበጀት ድርሻ ግራፍ (Division Budget Distribution)",
      aiVisionTab: "AI Vision Plan Analyzer & CAD OCR",
      haymiTab: "Bole Tower (B+G+4) EBCS Project Model",
      grandTotalLabel: "የፕሮጀክት አጠቃላይ የግንባታ ወጪ ማጠቃለያ (Project Grand Total)",
      itemCode: "ክፍል ኮድ",
      desc: "ዝርዝር የስራ መግለጫ (Description of Work)",
      unit: "መለኪያ (Unit)",
      qty: "ብዛት (Qty)",
      price: "ነጠላ ዋጋ (Unit Price)",
      amt: "ጠቅላላ ወጪ (Amount)",
      remarks: "የስሌት ቀመር / Remarks",
      actions: "ክወናዎች",
      cancel: "ሰርዝ",
      save: "አስቀምጥ",
      divisionSubtotal: "የሥራው ክፍል ጠቅላላ ድምር (Division Subtotal)",
      aiAsst: "AI Surveyor & Revision Controller",
      editPrompt: "የመመዘኛ ማሻሻያዎችን እዚህ ይጻፉ...",
      apply: "ግብር አድርግ",
      noResults: "እባክዎ ሌሎች ቃላትን በመጠቀም ይፈልጉ። የተገኘ መረጃ የለም።",
      backToTop: "ወደ ላይ ተመለስ"
    },
    en: {
      haymiTitle: "HAYMI CAD / ARCHIGEN Automated BoQ Engine",
      projectNameLabel: "Project Name",
      currencyLabel: "Currency",
      allDivs: "All Divisions (Full Project Sheet)",
      searchPlaceholder: "Search work item description or code...",
      resetBaseline: "Reset to baseline",
      addBtn: "Add New Row Item",
      divisionLabel: "Technical Division",
      continuousView: "Continuous Project Sheet",
      budgetShare: "Division Budget Distribution",
      aiVisionTab: "AI Vision Plan Analyzer & CAD OCR",
      haymiTab: "Bole Tower (B+G+4) EBCS Project Model",
      grandTotalLabel: "Project Grand Total Cost (EBCS Compiled)",
      itemCode: "Item Code",
      desc: "Description of Work",
      unit: "Unit",
      qty: "Qty",
      price: "Unit Price",
      amt: "Amount",
      remarks: "Method of Calculation / Remarks",
      actions: "Actions",
      cancel: "Cancel",
      save: "Save",
      divisionSubtotal: "Division Subtotal",
      aiAsst: "AI Surveyor & Revision Controller",
      editPrompt: "Type estimation commands or price revisions...",
      apply: "Apply",
      noResults: "No matching items found. Please try another search.",
      backToTop: "Back to Top"
    }
  };

  const tl = customTranslations[lang];

  // Helper to live recalculate totals for the 12 divisions
  const getDivisionTotal = (divId: string) => {
    const div = projectData.mainWorks.find(d => d.id === divId);
    if (!div) return 0;
    return div.subItems.reduce((acc, current) => acc + (current.qty * current.price), 0);
  };

  const getProjectGrandTotal = () => {
    return projectData.mainWorks.reduce((acc, div) => {
      return acc + div.subItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
    }, 0);
  };

  const formatVal = (rawEtb: number) => {
    if (selectedCurrency === "ETB") {
      return `${rawEtb.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
    } else if (selectedCurrency === "USD") {
      const val = rawEtb / exchangeRateToEtb;
      return `$ ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
    } else {
      const val = (rawEtb / exchangeRateToEtb) * 0.92; // 1 USD = 0.92 EUR approx
      return `€ ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`;
    }
  };

  const formatUnitPriceVal = (rawEtbPrice: number) => {
    if (selectedCurrency === "ETB") {
      return `${rawEtbPrice.toLocaleString()} ETB`;
    } else if (selectedCurrency === "USD") {
      const price = rawEtbPrice / exchangeRateToEtb;
      return `$ ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      const price = (rawEtbPrice / exchangeRateToEtb) * 0.92;
      return `€ ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  // Recalculates amount dynamically inside items
  const handleItemValueChange = (divId: string, itemIdx: number, field: keyof BQSubItem, val: string | number) => {
    const updated = { ...projectData };
    const div = updated.mainWorks.find(d => d.id === divId);
    if (div && div.subItems[itemIdx]) {
      const item = div.subItems[itemIdx];
      (item as any)[field] = val;
      // Recalculate amount
      item.amount = parseFloat((item.qty * item.price).toFixed(2));
      updateProjectDataAndPersist(updated);
    }
  };

  // Save selected edited item
  const saveMainWorkItem = () => {
    if (editingItemKey && editingItemData) {
      const updated = { ...projectData };
      const div = updated.mainWorks.find(d => d.id === editingItemKey.divId);
      if (div && div.subItems[editingItemKey.itemIndex]) {
        // compute amount
        editingItemData.amount = parseFloat((editingItemData.qty * editingItemData.price).toFixed(2));
        div.subItems[editingItemKey.itemIndex] = editingItemData;
        updateProjectDataAndPersist(updated);
        setEditingItemKey(null);
        setEditingItemData(null);
      }
    }
  };

  // Add new item to a division
  const addMainWorkItem = () => {
    if (!newRowDraft.item || !newRowDraft.desc) {
      alert(lang === "am" ? "እባክዎ መለያ ኮድ እና ማብራሪያ ያስገቡ።" : "Please provide item code and description of work.");
      return;
    }
    const updated = { ...projectData };
    const div = updated.mainWorks.find(d => d.id === addFormDivId);
    if (div) {
      const newItem: BQSubItem = {
        item: newRowDraft.item,
        desc: newRowDraft.desc,
        unit: newRowDraft.unit || "m2",
        qty: Number(newRowDraft.qty) || 0,
        price: Number(newRowDraft.price) || 0,
        amount: parseFloat(((Number(newRowDraft.qty) || 0) * (Number(newRowDraft.price) || 0)).toFixed(2)),
        remarks: newRowDraft.remarks || ""
      };
      div.subItems.push(newItem);
      updateProjectDataAndPersist(updated);
      setNewRowDraft({ item: "", desc: "", unit: "m2", qty: 0, price: 0, amount: 0, remarks: "" });
      setShowAddForm(false);
    }
  };

  // Delete main work item
  const deleteMainWorkItem = (divId: string, itemIdx: number) => {
    const updated = { ...projectData };
    const div = updated.mainWorks.find(d => d.id === divId);
    if (div) {
      div.subItems.splice(itemIdx, 1);
      updateProjectDataAndPersist(updated);
    }
  };

  // Reset HAYMI / ARCHIGEN data to baseline (retaining structural metadata profile details)
  const resetToBaseline = () => {
    const rawDefault = JSON.parse(JSON.stringify(HAYMI_ARCHIGEN_BOQ_DATA));
    const restored: ProjectBoQ = {
      ...projectData,
      mainWorks: rawDefault.mainWorks
    };
    updateProjectDataAndPersist(restored);
    setChatHistory(prev => [
      ...prev,
      {
        sender: "bot",
        text: lang === "am" 
          ? "ሁሉም የ12 ክፍሎች ዋጋዎች እና ብዛቶች በተሳካ ሁኔታ ወደ baseline ተመልሰዋል።"
          : "All 12 divisions quantities and rates have been successfully restored to the default baseline.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // CSV/Excel Exporter for HAYMI dataset (either active division or whole project)
  const exportHaymiToCSV = () => {
    const headers = [tl.itemCode, tl.desc, tl.unit, tl.qty, tl.price, tl.amt];
    const rows: Array<any[]> = [];

    projectData.mainWorks.forEach(div => {
      if (activeDivisionId !== "all" && div.id !== activeDivisionId) return;
      
      // Division Section Banner
      rows.push(["", "", "", "", "", ""]);
      rows.push([`--- ${div.title} ---`, "", "", "", "", ""]);
      rows.push(["", "", "", "", "", ""]);

      div.subItems.forEach((sub, i) => {
        // Filter out if query is active
        const matchesQuery = searchQuery === "" || 
          sub.desc.toLowerCase().includes(searchQuery.toLowerCase()) || 
          sub.item.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesQuery) return;

        rows.push([
          sub.item,
          `"${sub.desc.replace(/"/g, '""')}"`,
          sub.unit,
          sub.qty,
          sub.price,
          sub.amount.toFixed(2)
        ]);
      });

      // Division Total
      rows.push(["", `${tl.divisionSubtotal}`, "", "", "", getDivisionTotal(div.id).toFixed(2)]);
    });

    // Project Grand Total
    rows.push(["", "", "", "", "", ""]);
    rows.push(["", `${tl.grandTotalLabel}`, "", "", "", getProjectGrandTotal().toFixed(2)]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${projectData.projectName.replace(/\s+/g, "_")}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Convert uploaded file to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCustomFile({
        name: file.name,
        type: file.type,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        base64: reader.result as string
      });
      setSelectedSampleId("custom");
    };
    reader.readAsDataURL(file);
  };

  const handleExportCSV = () => {
    if (appMode === "ai-vision") {
      if (generatedReportType === "takeoff") {
        const headers = ["No", "Work Section", "Member Description", "Multiplier", "Length (m)", "Width (m)", "Height (m)", "Formula", "Output Qty", "Unit"];
        const rows = (takeoffData || []).map(item => [
          item.id,
          `"${item.section.replace(/"/g, '""')}"`,
          `"${item.itemDescription.replace(/"/g, '""')}"`,
          item.multiplier,
          item.length,
          item.width,
          item.height,
          `"${item.formula.replace(/"/g, '""')}"`,
          item.outputQty,
          item.unit
        ]);
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
          + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `AI_Takeoff_Export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } else if (generatedReportType === "material") {
        const headers = ["Material Name", "Amharic Name", "Work Category", "Unit", "Req. Quantity", "Est. Rate", "Total Cost"];
        const rows = (materialData || []).map(item => [
          `"${item.name.replace(/"/g, '""')}"`,
          `"${item.nameAm.replace(/"/g, '""')}"`,
          `"${item.category.replace(/"/g, '""')}"`,
          item.unit,
          item.quantity,
          item.rate,
          item.total
        ]);
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
          + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `AI_Material_Breakdown_Export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
    }

    const headers = [tl.itemCode, tl.desc, tl.unit, tl.qty, tl.price, tl.amt];
    const rows = bqData.items.map(item => [
      item.id,
      `"${item.description.replace(/"/g, '""')}"`,
      item.unit,
      item.quantity,
      item.unitPrice,
      (item.quantity * item.unitPrice).toFixed(2)
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AI_Vision_BQ_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF Layout
  const handlePrint = () => {
    window.print();
  };

  // Smart natural language chatbot surveyor logic connected to 12 work divisions
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [
      ...prev,
      { sender: "user", text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);

    // Parse commands for Bole Tower 12 Works
    setTimeout(() => {
      let reply = "";
      const updated = { ...projectData };
      const normalized = userMsg.toLowerCase().trim();

      if (normalized.includes("concrete") || normalized.includes("ኮንክሪት") || normalized.includes("ሲ-25") || normalized.includes("ኮንክሪትስራ")) {
        // Detect custom pricing command (e.g. 13200 or 12500)
        const priceMatch = normalized.match(/(?:to|ወደ|እስከ)?\s*(\d{4,6})/);
        if (priceMatch) {
          const targetPrice = parseInt(priceMatch[1]);
          let counter = 0;
          updated.mainWorks.forEach(div => {
            div.subItems.forEach(item => {
              if (item.desc.toLowerCase().includes("concrete") || item.desc.toLowerCase().includes("ኮንክሪት") || item.desc.toLowerCase().includes("lean")) {
                item.price = targetPrice;
                item.amount = parseFloat((item.qty * targetPrice).toFixed(2));
                counter++;
              }
            });
          });
          setProjectData(updated);
          reply = lang === "am"
            ? `በእሺታ! የኮንክሪት ግዢ ተመን ወደ ${targetPrice.toLocaleString()} ETB ተለውጧል። በአጠቃላይ ${counter} አይተሞች ማስተካከያ ተደርጎባቸዋል።`
            : `Success! Recalculated ${counter} concrete items with the updated rate of ${targetPrice.toLocaleString()} ETB. Project total updated.`;
        } else if (normalized.includes("10%")) {
          let counter = 0;
          updated.mainWorks.forEach(div => {
            div.subItems.forEach(item => {
              if (item.desc.toLowerCase().includes("concrete") || item.desc.toLowerCase().includes("ኮንክሪት")) {
                item.qty = parseFloat((item.qty * 1.10).toFixed(2));
                item.amount = parseFloat((item.qty * item.price).toFixed(2));
                counter++;
              }
            });
          });
          setProjectData(updated);
          reply = lang === "am"
            ? `የሁሉም የኮንክሪት ስራዎች መጠን (quantities) በ 10% እንዲጨምር ተደርጓል (${counter} አይተሞች)።`
            : `Increased quantities by standard 10% safety index margin across ${counter} concrete lines.`;
        } else {
          reply = lang === "am"
            ? "በኮንክሪት ስሌት ላይ የተወሰነ ዋጋ መመሪያ መስጠት ይችላሉ። ለምሳሌ 'የኮንክሪት ዋጋ ወደ 13000 ቀይር' በማለት ማዘዝ ይችላሉ።"
            : "I can assist with concrete pricing updates. Command example: 'set concrete price to 13500' or 'add 10% quantity buffer to concrete'.";
        }
      } 
      else if (normalized.includes("rebar") || normalized.includes("steel") || normalized.includes("ብረት") || normalized.includes("ብረታብረት")) {
        const priceMatch = normalized.match(/(?:to|ወደ|እስከ)?\s*(\d{2,4})/);
        if (priceMatch) {
          const targetPrice = parseInt(priceMatch[1]);
          let counter = 0;
          updated.mainWorks.forEach(div => {
            div.subItems.forEach(item => {
              if (item.desc.toLowerCase().includes("rebar") || item.desc.toLowerCase().includes("steel") || item.desc.toLowerCase().includes("ብረት") || item.unit === "kg") {
                item.price = targetPrice;
                item.amount = parseFloat((item.qty * targetPrice).toFixed(2));
                counter++;
              }
            });
          });
          setProjectData(updated);
          reply = lang === "am"
            ? `በእሺታ! የብረታ ብረት ዋጋ ተመን በ ኪሎግራም ወደ ${targetPrice} ETB ተቀይሯል። (${counter} አይተሞች ተዘምነዋል)`
            : `Understood! Adjusted steel/rebar unit rate to ${targetPrice} ETB across ${counter} lines.`;
        } else if (normalized.includes("15%")) {
          let counter = 0;
          updated.mainWorks.forEach(div => {
            div.subItems.forEach(item => {
              if (item.desc.toLowerCase().includes("rebar") || item.desc.toLowerCase().includes("steel") || item.unit === "kg") {
                item.qty = parseFloat((item.qty * 1.15).toFixed(2));
                item.amount = parseFloat((item.qty * item.price).toFixed(2));
                counter++;
              }
            });
          });
          setProjectData(updated);
          reply = lang === "am"
            ? `ለብረት ቁርጥራጭ ብክነት (cutting wastage) 15% ተጨማሪ መጠን በማሰሪያ ብረቶች ላይ ተሰልቷል። (${counter} ስሪቶች)`
            : `Factored in 15% cutting allowance contingency on ${counter} reinforcement steel line items.`;
        } else {
          reply = lang === "am"
            ? "የብረት ስራ ተመንን ለመቀየር 'የብረት ዋጋ 245 አድርግ' ወይም ከተጨማሪ ፐርሰንት ጋር ማስተካከል ይችላሉ።"
            : "I can process rebar rate directives. Example: 'set rebar rate to 240' or 'apply 15% cutting allowance to steel'.";
        }
      }
      else if (normalized.includes("excavation") || normalized.includes("ቁፋሮ") || normalized.includes("የአፈር") || normalized.includes("አፈር")) {
        const priceMatch = normalized.match(/(?:to|ወደ|እስከ)?\s*(\d{2,4})/);
        if (priceMatch) {
          const targetPrice = parseInt(priceMatch[1]);
          let counter = 0;
          updated.mainWorks.forEach(div => {
            div.subItems.forEach(item => {
              if (item.desc.toLowerCase().includes("excavation") || item.desc.toLowerCase().includes("ቁፋሮ") || item.desc.toLowerCase().includes("trench")) {
                item.price = targetPrice;
                item.amount = parseFloat((item.qty * targetPrice).toFixed(2));
                counter++;
              }
            });
          });
          setProjectData(updated);
          reply = lang === "am"
            ? `የመሰረት ቁፋሮ በአንድ ሜትር ኩብ ወደ ${targetPrice} ETB ሆኗል።`
            : `Set foundation excavation unit price to ${targetPrice} ETB.`;
        } else {
          reply = lang === "am"
            ? "የመሰረት አፈር ቁፋሮ ዋጋን ለመቀየር 'የቁፋሮ ዋጋ 450 አድርግ' በማለት ያዝዙኝ።"
            : "I can adjust excavation rates. Try: 'set excavation price to 380'.";
        }
      }
      else if (normalized.includes("roof") || normalized.includes("ጣራ") || normalized.includes("ክዳን")) {
        const priceMatch = normalized.match(/(?:to|ወደ|እስከ)?\s*(\d{3,5})/);
        if (priceMatch) {
          const targetPrice = parseInt(priceMatch[1]);
          let counter = 0;
          updated.mainWorks.forEach(div => {
            div.subItems.forEach(item => {
              if (item.desc.toLowerCase().includes("roof") || item.desc.toLowerCase().includes("ጣራ") || item.desc.toLowerCase().includes("corrugated")) {
                item.price = targetPrice;
                item.amount = parseFloat((item.qty * targetPrice).toFixed(2));
                counter++;
              }
            });
          });
          setProjectData(updated);
          reply = lang === "am"
            ? `የጣራ ክዳን (Corrugated sheet) ዋጋ ወደ ${targetPrice} ETB ተስተካክሏል።`
            : `Successfully adjusted corrugated roof covers rate to ${targetPrice} ETB.`;
        } else {
          reply = lang === "am"
            ? "የጣራ ንጣፍ ስራዎችን ዋጋ ለመቀየር 'የጣራ ዋጋ 2000 አድርግ' የሚል ትእዛዝ መጻፍ ይችላሉ።"
            : "For roofing adjustments, write: 'set roof sheet price to 1900'.";
        }
      }
      else if (normalized.includes("reset") || normalized.includes("መልስ") || normalized.includes("ቀድሞ")) {
        setProjectData(JSON.parse(JSON.stringify(HAYMI_ARCHIGEN_BOQ_DATA)));
        reply = lang === "am"
          ? "ሁሉም የዋጋ ግምገማዎች ወደ መጀመሪያው baseline ተመልሰዋል።"
          : "System restored. Bill of quantities reset to original HAYMI CAD Baseline.";
      }
      else if (normalized.includes("total") || normalized.includes("ድምር") || normalized.includes("ስንት")) {
        const grand = getProjectGrandTotal();
        const subCost = getDivisionTotal("1") + getDivisionTotal("2") + getDivisionTotal("3");
        const superCost = grand - subCost;
        reply = lang === "am"
          ? `የፕሮጀክቱ አጠቃላይ ወጪ ${grand.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB ነው። ከዚህ ውስጥ ከአፈር በታች (Substructure) ${subCost.toLocaleString()} ETB ሲሆን፣ ከአፈር በላይ (Superstructure) ${superCost.toLocaleString()} ETB ያጠቃልላል።`
          : `The current Project Grand Total is ${grand.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB. Substructure works stand at ${subCost.toLocaleString()} ETB while Superstructure works account for ${superCost.toLocaleString()} ETB.`;
      }
      else {
        reply = lang === "am"
          ? "መመሪያዎን በደስታ እቀበላለሁ! የተወሰነ ክፍል ዋጋ ወይም መጠን ለመለወጥ የእንቅስቃሴ ቃል ይጨምሩ (ለምሳሌ 'የኮንክሪት ዋጋ 13000 ቀይር' ወይንም 'የጣራ ዋጋ ወደ 2500 አድርገው')።"
          : "Command received. To apply changes, try specifying exact materials like concrete, rebar, or roof cover rates (e.g., 'set concrete price to 13500').";
      }

      setChatHistory(prev => [
        ...prev,
        { sender: "bot", text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 700);
  };

  // Original AI Vision upload & compute actions
  const handleGenerateBQ = async () => {
    setApiError(null);
    let fileBase64 = "";
    let mimeType = "";

    if (selectedSampleId !== "custom") {
      const activeSample = samples.find(s => s.id === selectedSampleId);
      if (activeSample) {
        try {
          setIsLoading(true);
          setLoadingStep(lang === "am" ? "የናሙና ዲዛይን ፕላን መረጃ በማመቻቸት ላይ..." : "Fetching demo sheet image bytes...");
          
          const response = await fetch(activeSample.imageUrl);
          const blob = await response.blob();
          const reader = new FileReader();
          
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
          });
          reader.readAsDataURL(blob);
          fileBase64 = await base64Promise;
          mimeType = blob.type || "image/png";
        } catch (e) {
          console.error("Failed to read image as base64", e);
          simulateOfflineBQ();
          return;
        }
      }
    } else if (customFile) {
      fileBase64 = customFile.base64;
      mimeType = customFile.type;
    } else {
      alert(lang === "am" ? "እባክዎ መጀመሪያ ፋይል ያስገቡ ወይም ናሙና ዲዛይን ይምረጡ!" : "Please upload a drawing sheet or select a demo sample.");
      return;
    }

    try {
      setIsLoading(true);
      setLoadingStep(lang === "am" ? "የGemini Vision OCR ቴክኖሎጂን በመጠቀም ፕላኑን እያነበበ ነው..." : "Initiating multimodal drawing intelligence analyzer...");

      const calibrationPrompt = `
- CALIBRATION METRIC: Target blueprint scale is configured to "${pdfScale}".
- EBCS NORMS: Strict compliance with Ethiopian Building Code Standard (EBCS-2) is enabled: ${strictEbcsConcreteCover ? "Enabled" : "Disabled"}.
- CONCRETE COVER: Substructure footing concrete cover set to 50mm, super-structure to 25mm.
- WASTAGE COEFFICIENTS: Reinforcement steel cutting waste buffer of "${rebarWastageFactor}" and concrete pour margin of "${concreteWastageFactor}" must be applied.
- ACTIVE SHEET/PAGE: Focused specifically on "${pdfDetectedSheets[selectedSheetIndex]}" layout.
`;

      const apiPayload = {
        fileBase64: fileBase64,
        mimeType: mimeType,
        promptExtension: `${calibrationPrompt}\n${promptExtension}`,
        division: TRANSLATIONS[lang].ebcsDivisions[division],
        defaultPrices: rates
      };

      const res = await fetch("/api/generate-bq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiPayload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || errData.details || "API server returned an error");
      }

      const generatedData: BQData = await res.json();
      setBqData(generatedData);
      
      setChatHistory(prev => [
        ...prev,
        {
          sender: "bot",
          text: lang === "am" 
            ? `የዋጋ ዝርዝሩ በክፍል "${TRANSLATIONS[lang].ebcsDivisions[division]}" በተሳካ ሁኔታ ተዘጋጅቷል!`
            : `Drafted BQ table specifically for "${TRANSLATIONS[lang].ebcsDivisions[division]}" segment!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      setIsLoading(false);
    } catch (err: any) {
      console.warn("API Error, fallback to simulation:", err);
      setApiError(err.message || "Failed to call backend AI.");
      simulateOfflineBQ();
    }
  };

  const getStoryCount = (storiesStr: string): number => {
    const match = storiesStr.match(/\d+/);
    if (match) {
      return parseInt(match[0]) + 1; // e.g. G+4 -> 4 + 1 = 5 stories
    }
    return 1; // Default
  };

  const generateParametricData = (reportType: "bq" | "takeoff" | "material") => {
    setIsLoading(true);
    setLoadingStep(
      lang === "am"
        ? "የፓራሜትሪክ ስሌት መለኪያዎችን በመተንተን ላይ..."
        : "Analyzing parametric design area and floor levels..."
    );

    setTimeout(() => {
      const area = customBuiltUpArea || 120;
      const totalStories = getStoryCount(stories);
      
      // Determine engineering scale factors
      let cMult = 1.0;
      let cTypeAm = "መኖሪያ ቤት (Residential)";
      let cTypeEn = "Residential Villa / Complex";
      if (constructionType === "commercial") {
        cMult = 1.22;
        cTypeAm = "ለንግድ አገልግሎት (Commercial)";
        cTypeEn = "Commercial Complex / Mall";
      } else if (constructionType === "institutional") {
        cMult = 1.35;
        cTypeAm = "ለትምህርት / ለህዝብ ተቋም (Institutional)";
        cTypeEn = "Institutional Building";
      }

      let rFactor = 1.0;
      let rNameAm = "ኢትዮጵያ - አዲስ አበባ";
      let rNameEn = "Ethiopia - Addis Ababa (Standard Rates)";
      if (countryRegion === "eth_hawassa") {
        rFactor = 0.92;
        rNameAm = "ኢትዮጵያ - ሐዋሳ (የአካባቢ ጥሬ እቃ ተስተካካይ)";
        rNameEn = "Ethiopia - Hawassa (92% Local Material Index)";
      } else if (countryRegion === "eth_adama") {
        rFactor = 0.95;
        rNameAm = "ኢትዮጵያ - አዳማ (የአካባቢ ጥሬ እቃ ተስተካካይ)";
        rNameEn = "Ethiopia - Adama (95% Local Material Index)";
      } else if (countryRegion === "ken_nairobi") {
        rFactor = 1.15;
        rNameAm = "ኬንያ - ናይሮቢ (የምስራቅ አፍሪካ መደበኛ ዋጋ)";
        rNameEn = "Kenya - Nairobi (115% Regional Cost Adjustor)";
      }

      // Base Rates
      const pExcavation = rates.excavation * rFactor;
      const pLean = rates.leanConcrete * rFactor;
      const pConcrete = rates.concreteC25 * rFactor;
      const pFormwork = rates.formwork * rFactor;
      const pRebar = rates.rebar * rFactor;
      const pStone = 2800 * rFactor;
      const pHcb = 1250 * rFactor;
      const pPlastering = 420 * rFactor;
      const pPainting = 280 * rFactor;

      // Calculations based on Built up area * scale * floors
      const qtyExcavation = parseFloat((area * 0.45 * Math.log2(totalStories + 2) * cMult).toFixed(2));
      const qtyLean = parseFloat((area * 0.16 * cMult).toFixed(2));
      const qtyFootingConcrete = parseFloat((area * 0.18 * Math.sqrt(totalStories) * cMult).toFixed(2));
      const qtyColumnConcrete = parseFloat((area * 0.045 * totalStories * cMult).toFixed(2));
      const qtySlabConcrete = parseFloat((area * 0.16 * totalStories * cMult).toFixed(2));
      
      const totalConcreteVol = qtyFootingConcrete + qtyColumnConcrete + qtySlabConcrete;
      const qtyFormwork = parseFloat((totalConcreteVol * 5.8).toFixed(2));
      const qtyRebar = parseFloat((totalConcreteVol * 112 * cMult).toFixed(2)); // ~112kg per m3 average deform steel
      
      const wallArea = parseFloat((area * 0.85 * totalStories).toFixed(2));
      const plasteringArea = parseFloat((wallArea * 2).toFixed(2));
      const paintingArea = parseFloat((wallArea * 2).toFixed(1));

      // 1. BILL OF QUANTITIES DATA STRUCTURE
      const customBq: BQData = {
        divisionTitle: `EBCS Compliant Parametric BQ: ${stories.toUpperCase()} ${cTypeEn} (${area} m²)`,
        engineeringAssumptions: [
          `አጠቃላይ የተሰራበት ቦታ (Built-up Area): ${area} m² | የተመረጠ የግንባታ አይነት: ${cTypeAm}`,
          `ፎቆች ብዛት: ${stories.toUpperCase()} (${totalStories} ድምር ወለሎች) | የሚገነባበት ክልል/ሀገር: ${rNameAm}`,
          `ደረጃውን የጠበቀ ባለ C-25 የኮንክሪት መከላከያ እና የብረት ብክነት (rebar wastage) በኢትዮጵያ ህንጻ ኮድ ስታንዳርድ (EBCS-2) መሰረት ተሰልቷል።`,
          `አካባቢያዊ የዋጋ ማስተካከያ ተደርጎበታል (Multiplier factor: ${rFactor.toFixed(2)}x)`
        ],
        items: [
          {
            id: "1.1",
            description: lang === "am"
              ? `የመሰረት ጉድጓድ ቁፋሮ በደለል አፈር ውስጥ ጥልቀቱ ከ 1.5 ሜ - 2.0 ሜትር በEBCS-2 መሰረት ለ ${stories.toUpperCase()} መዋቅር የሚሰራ / Trench & bulk excavation for pad footings in ordinary clay soil at depth of 1.80m for G+N works.`
              : `Bulk excavation for isolated column pads and grade beams in ordinary clay soil to a depth of 1.80m from natural ground level conforming to EBCS specification.`,
            unit: "m³",
            quantity: qtyExcavation,
            unitPrice: Math.round(pExcavation),
            remarks: `Area: ${area} m2 * design coefficient * ${stories.toUpperCase()} story factor`
          },
          {
            id: "1.2",
            description: lang === "am"
              ? `ባለ 50ሚሜ ውፍረት ሲ-15 ሊን ኮንክሪት ከእያንዳንዱ መሰረት ፉቲንግ በታች የሚነጠፍ / 50mm thick Lean Concrete C-15 under footing pads.`
              : `50mm thick Lean Concrete C-15 foundation bed under pad footings as per EBCS-2 instructions.`,
            unit: "m²",
            quantity: qtyLean,
            unitPrice: Math.round(pLean),
            remarks: `Footprint estimated: area ${area} m2 * 0.16 pad coverage`
          },
          {
            id: "1.3",
            description: lang === "am"
              ? `የመሰረት ጫማ (Footing Pads) የተጠናከረ የኮንክሪት ሙሌት በሲ-25 ደረጃ የሚሰራ / Cast-in-situ reinforced concrete C-25 for footing pads.`
              : `Cast-in-situ Reinforced Concrete C-25 for pad footings, inclusive of standard mechanical vibrator and curing as per EBCS.`,
            unit: "m³",
            quantity: qtyFootingConcrete,
            unitPrice: Math.round(pConcrete),
            remarks: `Estimated concrete structural depth coefficient based on height: ${stories}`
          },
          {
            id: "1.4",
            description: lang === "am"
              ? `የአምዶች (Structural Columns) የኮንክሪት ስራ በሲ-25 ደረጃ እስከ ፎቅ ጣራ የሚሰሩ / Cast-in-situ concrete C-25 for structural frame columns.`
              : `Cast-in-situ Reinforced Concrete C-25 for structural columns from foundation up to roof level.`,
            unit: "m³",
            quantity: qtyColumnConcrete,
            unitPrice: Math.round(pConcrete),
            remarks: `Sizing: Columns cross-section * story height across ${totalStories} levels`
          },
          {
            id: "1.5",
            description: lang === "am"
              ? `የቢም እና ወለሎች (Slabs & Beams) የኮንክሪት ስራ በሲ-25 ደረጃ በሁሉም ፎቆች ላይ የሚፈስ / Cast-in-situ Reinforced Concrete C-25 for horizontal slabs and structural beams.`
              : `Cast-in-situ Reinforced Concrete C-25 for horizontal 15cm slabs and beams across all upper floor framing.`,
            unit: "m³",
            quantity: qtySlabConcrete,
            unitPrice: Math.round(pConcrete),
            remarks: `Standard 150mm slab thickness + 250x450mm structural beams`
          },
          {
            id: "1.6",
            description: lang === "am"
              ? `ለኮንክሪት ስራዎች የሚሰበሰብ የባህር ዛፍ ፎርምወርክ (ዝርግ ሳህኖችና አምድ ድጋፎችን ጨምሮ) / Sawn timber wood formwork for columns, footings and beam sides.`
              : `Sawn timber and wood formwork for concrete framework columns, beams, slab decking and footings, including props, bracing, and striking.`,
            unit: "m²",
            quantity: qtyFormwork,
            unitPrice: Math.round(pFormwork),
            remarks: `Calculated from concrete contact area: concrete total volume * contact ratio 5.8m2 per m3`
          },
          {
            id: "1.7",
            description: lang === "am"
              ? `ባለከፍተኛ ጥንካሬ የብረታ ብረት ቆረጣ፣ ማጠፍ እና ማሰር ስራ (Ø8ሚሜ - Ø20ሚሜ የሚጠቀስ) / Deformed reinforcement steel bars including cutting, bending, fabrication and tying.`
              : `High-tensile deformed rebar steel structural reinforcement (various diameters Ø8mm to Ø24mm) for foundations, columns, beams, and slabs in compliance with EBCS-2 spacing.`,
            unit: "kg",
            quantity: qtyRebar,
            unitPrice: Math.round(pRebar),
            remarks: `Steel weight factor: C-25 concrete volume * structural ratio (~112 kg/m³)`
          },
          {
            id: "1.8",
            description: lang === "am"
              ? `ባለ 200ሚሜ ውፍረት ሆሎው ኮንክሪት ብሎክ (HCB) ግድግዳ ስራ በተገቢው የሲሚንቶ ሙሌት የሚሰራ / 200mm thick Hollow Concrete Block (HCB) masonry walls.`
              : `200mm thick external/internal Hollow Concrete Block (HCB) masonry walls laid in cement mortar (1:3 mix) as per building code layout.`,
            unit: "m²",
            quantity: wallArea,
            unitPrice: Math.round(pHcb),
            remarks: `Based on building floor height and story partitions`
          },
          {
            id: "1.9",
            description: lang === "am"
              ? `ባለ ሁለት እጅ የሲሚንቶ ልስን ስራ በውስጥና ውጭ ግድግዳዎች ላይ የሚለጠፍ / Two-coat cement sand plastering applied to masonry walls.`
              : `Two-coat cement plastering to internal and external wall surfaces, including scaffolding, screeding, and float finish.`,
            unit: "m²",
            quantity: plasteringArea,
            unitPrice: Math.round(pPlastering),
            remarks: `Two-sided coverage of masonry walls (Multiplier 2.0x)`
          },
          {
            id: "1.10",
            description: lang === "am"
              ? `የፕላስቲክ ቀለም ቅባት በልስን ግድግዳዎች ላይ በ 3 እጅ የሚቀባ / Internal/external 3-coat plastic emulsion paint.`
              : `Application of 3-coat high-grade plastic emulsion paint over plastered internal and external wall surfaces.`,
            unit: "m²",
            quantity: paintingArea,
            unitPrice: Math.round(pPainting),
            remarks: `Painted wall surface coordinates matching plastering areas`
          }
        ]
      };

      // 2. GENERATE TAKEOFF SHEET DATA STRUC
      const numColumns = Math.round(10 + area / 22);
      const rootArea = Math.round(Math.sqrt(area));

      const generatedTakeoff: TakeoffItem[] = [
        {
          id: "1",
          section: lang === "am" ? "1. መሰረት ቁፋሮ (Bulk Excavation)" : "1. Substructure Excavation",
          itemDescription: lang === "am" ? "የአምዶች ጫማ የመሰረት ቁፋሮ (Footing Pad Excavations)" : "Pits excavation for Column Footings",
          multiplier: numColumns,
          length: parseFloat((1.4 + totalStories * 0.05).toFixed(2)),
          width: parseFloat((1.4 + totalStories * 0.05).toFixed(2)),
          height: parseFloat((1.6 + totalStories * 0.06).toFixed(2)),
          outputQty: 0,
          unit: "m³",
          formula: "Pad Count * L * W * H"
        },
        {
          id: "2",
          section: lang === "am" ? "1. መሰረት ቁፋሮ (Trench Excavation)" : "1. Substructure Excavation",
          itemDescription: lang === "am" ? "የመሬት ላይ ቢም (Grade Beam) ቦይ ቁፋሮ" : "Trenches excavation for Grade Beams",
          multiplier: 1,
          length: parseFloat((rootArea * 4 * 1.22).toFixed(2)),
          width: 0.40,
          height: 0.80,
          outputQty: 0,
          unit: "m³",
          formula: "Trench Length * Width * Depth"
        },
        {
          id: "3",
          section: lang === "am" ? "2. ሊን ኮንክሪት (Lean Concrete)" : "2. Lean Concrete C-15",
          itemDescription: lang === "am" ? "ለአምዶች ጫማ በታች የሚነጠፍ ሊን ኮንክሪት" : "50mm C-15 Lean screed under Pad Footings",
          multiplier: numColumns,
          length: parseFloat((1.4 + totalStories * 0.05 + 0.1).toFixed(2)),
          width: parseFloat((1.4 + totalStories * 0.05 + 0.1).toFixed(2)),
          height: 1,
          outputQty: 0,
          unit: "m²",
          formula: "Pad Count * (Pad L + 10cm offset) * (Pad W + 10cm offset)"
        },
        {
          id: "4",
          section: lang === "am" ? "3. የኮንክሪት ስራ (C-25 reinforced concrete)" : "3. RC Concrete C-25",
          itemDescription: lang === "am" ? "የመሰረት ጫማዎች (Footing Pads) ሙሌት" : "C-25 Structural Concrete in Pad Footings",
          multiplier: numColumns,
          length: parseFloat((1.4 + totalStories * 0.05).toFixed(2)),
          width: parseFloat((1.4 + totalStories * 0.05).toFixed(2)),
          height: parseFloat((0.40 + totalStories * 0.02).toFixed(2)),
          outputQty: 0,
          unit: "m³",
          formula: "Pad Count * L * W * thickness"
        },
        {
          id: "5",
          section: lang === "am" ? "3. የኮንክሪት ስራ (C-25 columns)" : "3. RC Concrete C-25",
          itemDescription: lang === "am" ? "የህንፃው አምዶች (Columns) በሁሉም ወለሎች" : "RC Columns structural concrete (All Stories)",
          multiplier: numColumns * totalStories,
          length: parseFloat((0.30 + totalStories * 0.02).toFixed(2)),
          width: parseFloat((0.30 + totalStories * 0.02).toFixed(2)),
          height: 3.00,
          outputQty: 0,
          unit: "m³",
          formula: "(Column Width * Column Breadth * Height) * No. Columns * Stories"
        },
        {
          id: "6",
          section: lang === "am" ? "3. የኮንክሪት ስራ (C-25 slabs & beams)" : "3. RC Concrete C-25",
          itemDescription: lang === "am" ? "የንዝርግ ወለል ስላብ (Slabs Casting 15cm thickness)" : "RC Concrete casting in horizontal floor slabs (150mm thick)",
          multiplier: totalStories,
          length: rootArea,
          width: rootArea,
          height: 0.15,
          outputQty: 0,
          unit: "m³",
          formula: "Floors Count * Area (L * W) * 15cm depth"
        },
        {
          id: "7",
          section: lang === "am" ? "4. የብሎኬት ግድግዳ (HCB Wall)" : "4. Hollow Block Masonry",
          itemDescription: lang === "am" ? "ለክፍሎች መለያ 200ሚሜ HCB ግድግዳ ስራ" : "200mm thick Hollow Concrete Block masonry walls",
          multiplier: totalStories,
          length: parseFloat((rootArea * 4 * 0.85).toFixed(2)),
          width: 1,
          height: 2.85,
          outputQty: 0,
          unit: "m²",
          formula: "Stories * Net wall length * wall height"
        }
      ].map(it => {
        let computed = 0;
        if (it.unit === "m³") {
          computed = it.multiplier * it.length * it.width * it.height;
        } else if (it.unit === "m²") {
          computed = it.multiplier * it.length * (it.width || 1) * (it.height === 1 ? 1 : it.height);
        }
        return {
          ...it,
          outputQty: parseFloat(computed.toFixed(2))
        };
      });

      // 3. GENERATE MATERIAL BREAKDOWN
      const cementConcrete = Math.round(totalConcreteVol * 350 + wallArea * 12);
      const cementBags = Math.round(cementConcrete / 50);
      const sandVolume = parseFloat((totalConcreteVol * 0.44 + wallArea * 0.035).toFixed(2));
      const aggregateVolume = parseFloat((totalConcreteVol * 0.84).toFixed(2));
      const totalSteelKg = qtyRebar;

      const generatedMaterials: MaterialItem[] = [
        {
          name: "Standard Portland OPC Cement (50kg bags)",
          nameAm: "የፖርትላንድ ሲሚንቶ (ባለ 50ኪግ ከረጢት)",
          category: lang === "am" ? "መሠረታዊ ኮንክሪት / አሸዋ ሙሌት" : "Concrete & Masonry Mortars",
          unit: "Bags",
          quantity: cementBags,
          rate: countryRegion === "ken_nairobi" ? 1200 : 960,
          total: cementBags * (countryRegion === "ken_nairobi" ? 1200 : 960)
        },
        {
          name: "Clean River Sand / Silty sand mix",
          nameAm: "የወንዝ አሸዋ (ጥሩ ጥራት ያለው)",
          category: lang === "am" ? "መሠረታዊ ኮንክሪት" : "Concrete & Mortar Aggregates",
          unit: "m³",
          quantity: sandVolume,
          rate: countryRegion === "ken_nairobi" ? 2400 : 1900,
          total: Math.round(sandVolume * (countryRegion === "ken_nairobi" ? 2400 : 1900))
        },
        {
          name: "Crushed Black Basalt Aggregate (19mm size)",
          nameAm: "የተሰነጠቀ የድንጋይ ጠጠር (ባሳልት 19ሚሜ)",
          category: lang === "am" ? "መሠረታዊ ኮንክሪት" : "Coarse Concrete Aggregates",
          unit: "m³",
          quantity: aggregateVolume,
          rate: countryRegion === "ken_nairobi" ? 2800 : 2200,
          total: Math.round(aggregateVolume * (countryRegion === "ken_nairobi" ? 2800 : 2200))
        },
        {
          name: "Structural Deformed Rebar Steel Ø16mm",
          nameAm: "የብረት ዱላ Ø16ሚሜ (ለአምድና ለቢም ስራ)",
          category: lang === "am" ? "መዋቅራዊ ብረት" : "Structural Rebar Steel",
          unit: "kg",
          quantity: Math.round(totalSteelKg * 0.45),
          rate: Math.round(pRebar),
          total: Math.round(totalSteelKg * 0.45 * pRebar)
        },
        {
          name: "Structural Deformed Rebar Steel Ø12mm",
          nameAm: "የብረት ዱላ Ø12ሚሜ (ለስላብና ለጫማዎች)",
          category: lang === "am" ? "መዋቅራዊ ብረት" : "Structural Rebar Steel",
          unit: "kg",
          quantity: Math.round(totalSteelKg * 0.35),
          rate: Math.round(pRebar),
          total: Math.round(totalSteelKg * 0.35 * pRebar)
        },
        {
          name: "Mild Steel Rebar Wire Ø8mm for loops/stirrups",
          nameAm: "ለማሰሪያ የሚሆን ቀጭን ብረት Ø8ሚሜ",
          category: lang === "am" ? "መዋቅራዊ ብረት" : "Structural Stirrups & Wire",
          unit: "kg",
          quantity: Math.round(totalSteelKg * 0.20),
          rate: Math.round(pRebar * 0.95),
          total: Math.round(totalSteelKg * 0.20 * pRebar * 0.95)
        },
        {
          name: "HCB Concrete Blocks 200mm Grade C",
          nameAm: "የኮንክሪት ብሎኬት 200ሚሜ (HCB ግድግዳ)",
          category: lang === "am" ? "የግድግዳ ብሎክ" : "Masonry blockwork",
          unit: "Pcs",
          quantity: Math.round(wallArea * 12.8),
          rate: countryRegion === "ken_nairobi" ? 55 : 42,
          total: Math.round(wallArea * 12.8 * (countryRegion === "ken_nairobi" ? 55 : 42))
        },
        {
          name: "Construction Sawn Wood Formwork panels",
          nameAm: "የባህር ዛፍ ሳንቃዎች (ለፎርምወርክ ድጋፍ)",
          category: lang === "am" ? "ፎርምወርክ ስራ" : "Timber Framing",
          unit: "Ls",
          quantity: 1,
          rate: Math.round(qtyFormwork * pFormwork * 0.4),
          total: Math.round(qtyFormwork * pFormwork * 0.4)
        }
      ];

      // Mutate states
      setBqData(customBq);
      setTakeoffData(generatedTakeoff);
      setMaterialData(generatedMaterials);
      setGeneratedReportType(reportType);
      
      setIsLoading(false);

      // Add cool confirmation message to AI Chat Assistant
      setChatHistory(prev => [
        ...prev,
        {
          sender: "bot",
          text: lang === "am"
            ? `በእሺታ! በ ${stories.toUpperCase()} ${cTypeAm} ዲዛይን ለ ${area} m² ስፋት በተሳካ ሁኔታ የ ${reportType === "bq" ? "የዋጋ ዝርዝር (BQ)" : reportType === "takeoff" ? "ዝርዝር ስሌት (Take-off)" : "የጥሬ እቃዎች ዝርዝር (Material breakdown)"} ዝግጅት ተከናውኗል። ውጤቱን በቀኝ በኩል ባለው ገበታ ላይ ያገኙታል！`
            : `Splendid! Generated customized ${reportType === "bq" ? "Bill of Quantities (BQ)" : reportType === "takeoff" ? "Take-off sheet dimensions" : "Material ingredient bills"} for G+${totalStories - 1} ${cTypeEn} structure on ${area} m² built-up area in ${rNameEn}. View the live interactive sheets on your right!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  const simulateOfflineBQ = () => {
    const steps = [
      lang === "am" ? "የዲዛይን ፎርማት በመገምገም ላይ..." : "Parsing design parameters...",
      lang === "am" ? "የEBCS መስፈርቶችን መሰረት በማድረግ ዝርዝር መዋቅሮችን እያወጣ ነው..." : "Detecting concrete sections & structural frames...",
      lang === "am" ? "የመጨረሻ የዋጋ እና ዝርዝር ሰንጠረዥ እያዘጋጀ ነው..." : "Formatting quantities and compiling final BQ rows..."
    ];

    let currentStep = 0;
    setIsLoading(true);
    setLoadingStep(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setLoadingStep(steps[currentStep]);
      } else {
        clearInterval(interval);
        setIsLoading(false);

        if (selectedSampleId !== "custom") {
          const activeSample = samples.find(s => s.id === selectedSampleId);
          if (activeSample) {
            const calculatedBq = JSON.parse(JSON.stringify(activeSample.sampleBq)) as BQData;
            calculatedBq.items = calculatedBq.items.map(item => {
              let adjustedPrice = item.unitPrice;
              if (item.unit === "m³" && item.description.toLowerCase().includes("excavation")) adjustedPrice = rates.excavation;
              else if (item.unit === "m²" && item.description.toLowerCase().includes("lean")) adjustedPrice = rates.leanConcrete;
              else if (item.unit === "m³" && item.description.toLowerCase().includes("c-25")) adjustedPrice = rates.concreteC25;
              else if (item.unit === "m³" && item.description.toLowerCase().includes("column")) adjustedPrice = rates.concreteC25;
              else if (item.unit === "m²" && item.description.toLowerCase().includes("formwork")) adjustedPrice = rates.formwork;
              else if (item.unit === "kg") adjustedPrice = rates.rebar;
              return { ...item, unitPrice: adjustedPrice };
            });
            setBqData(calculatedBq);
          }
        } else {
          // Dynamic calculation based on uploaded PDF parameters and EBCS calibrations selected!
          const parsedScaleMultiplier = pdfScale === "1:50" ? 1.4 : pdfScale === "1:200" ? 0.7 : 1.0;
          const rebarMultiplier = rebarWastageFactor === "15%" ? 1.15 : rebarWastageFactor === "5%" ? 1.05 : 1.10;
          const concreteMultiplier = concreteWastageFactor === "10%" ? 1.10 : concreteWastageFactor === "3%" ? 1.03 : 1.05;

          const customCalculatedBq: BQData = {
            divisionTitle: `EBCS Substructure - ${pdfDetectedSheets[selectedSheetIndex]} (${pdfScale})`,
            engineeringAssumptions: [
              `ዲዛይን ፋይል / Drawing file parsed: "${customFile?.name || 'Uploaded PDF Architectural'}"`,
              `መለኪያ ስኬል / Scale Calibration used: ${pdfScale} (EBCS scale adapter)`,
              `በEBCS-2 ስታንዳርድ መሰረት ባለ 50ሚሜ የኮንክሪት መከላከያ (Concrete cover) ተረጋግጧል: ${strictEbcsConcreteCover ? 'አዎ (Strict)' : 'አይደለም (Default)'}`,
              `የብረት ስራ ብክነት ተመን / Rebar wastage margin applied: ${rebarWastageFactor}`,
              `የኮንክሪት ማፍሰሻ ብክነት ተመን / Concrete casting wastage allowance: ${concreteWastageFactor}`
            ],
            items: [
              {
                id: "1.1",
                description: lang === "am"
                  ? `የመሰረት ጉድጓድ ቁፋሮ በደለል አፈር ውስጥ ጥልቀቱ ከ 1.5 ሜ ያልበለጠ / Bulk Excavation in ordinary clay soil to a depth not exceeding 1.50m from ground level based on EBCS standard.`
                  : `Bulk Excavation for foundation columns in ordinary soil to a depth not exceeding 1.50m based on drawing dimensions.`,
                unit: "m³",
                quantity: parseFloat((24.5 * parsedScaleMultiplier).toFixed(2)),
                unitPrice: rates.excavation,
                remarks: `Parsed from drawing. Calculation: 8 columns pads * (1.35m * 1.35m) * 1.60m * scale multiplier = ${(24.5 * parsedScaleMultiplier).toFixed(2)} m³`
              },
              {
                id: "1.2",
                description: lang === "am"
                  ? `ባለ 50ሚሜ ውፍረት ሲ-15 ሊን ኮንክሪት ከእያንዳንዱ መሰረት ፉቲንግ በታች የሚነጠፍ / 50mm thick Lean Concrete C-15 under footing pads.`
                  : `50mm thick Lean concrete C-15 foundation bed layed under footing pad bases.`,
                unit: "m²",
                quantity: parseFloat((14.58 * parsedScaleMultiplier).toFixed(2)),
                unitPrice: rates.leanConcrete,
                remarks: `Calculation: 8 bases * (1.35m * 1.35m) * scale multiplier = ${(14.58 * parsedScaleMultiplier).toFixed(2)} m²`
              },
              {
                id: "1.3",
                description: lang === "am"
                  ? `የመሰረት ኮንክሪት ሙሌት ሲ-25 ለፉቲንግ እግሮች / Cast-in-situ reinforced concrete C-25 for footing bases with strict EBCS-2 spacing.`
                  : `Cast-in-situ concrete C-25 poured inside foundation footing pads.`,
                unit: "m³",
                quantity: parseFloat((5.83 * parsedScaleMultiplier * concreteMultiplier).toFixed(2)),
                unitPrice: rates.concreteC25,
                remarks: `Calculation: 8 bases * (1.35m * 1.35m) * 0.40m thickness * wastage coefficient = ${(5.83 * parsedScaleMultiplier * concreteMultiplier).toFixed(2)} m³`
              },
              {
                id: "1.4",
                description: lang === "am"
                  ? `የመሰረት ፎርምወርክ ስራ ለፉቲንግ ኮንክሪት ጎኖች / Formwork with sawn timber for footing pad sides.`
                  : `Sawn timber formwork to sides of foundation footing pads.`,
                unit: "m²",
                quantity: parseFloat((17.28 * parsedScaleMultiplier).toFixed(2)),
                unitPrice: rates.formwork,
                remarks: `Calculation: 8 bases * 4 sides * 1.35m width * 0.40m footing depth = ${(17.28 * parsedScaleMultiplier).toFixed(2)} m²`
              },
              {
                id: "1.5",
                description: lang === "am"
                  ? `የመሰረት የብረት ስራ የተለያየ መጠን ያላቸው ባለአራት ማዕዘን ብረቶች / Reinforcement steel deformed bars fabricated, bent, and tied in footing meshes.`
                  : `Deformed reinforcement steel bars in footing meshes including fabrication, bending, and fixing.`,
                unit: "kg",
                quantity: parseFloat((480.20 * parsedScaleMultiplier * rebarMultiplier).toFixed(2)),
                unitPrice: rates.rebar,
                remarks: `Calculated from schedule. Formula: 8 meshes * 20 bars each weigh (0.888 kg/m) * wastage coefficient = ${(480.20 * parsedScaleMultiplier * rebarMultiplier).toFixed(2)} kg`
              }
            ]
          };

          setBqData(customCalculatedBq);
        }
        setChatHistory(prev => [
          ...prev,
          {
            sender: "bot",
            text: lang === "am" 
              ? "የናሙና ስሌቱ ተጠናቋል። ለትክክለኛው የVision AI ስሌት እባክዎ በSettings > Secrets በኩል የእርስዎን GEMINI_API_KEY ያስቀምጡ።"
              : "Structural simulation completed. To experience full multimodal drawing analysis, please configure your GEMINI_API_KEY in Settings > Secrets.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }, 1000);
  };

  const startEditAiRow = (index: number, item: BQItem) => {
    setEditRowIndex(index);
    setEditRowData({ ...item });
  };

  const saveEditAiRow = () => {
    if (editRowIndex !== null && editRowData) {
      const updatedItems = [...bqData.items];
      updatedItems[editRowIndex] = editRowData;
      setBqData({ ...bqData, items: updatedItems });
      setEditRowIndex(null);
      setEditRowData(null);
    }
  };

  const deleteAiRow = (index: number) => {
    const updatedItems = [...bqData.items];
    updatedItems.splice(index, 1);
    setBqData({ ...bqData, items: updatedItems });
  };

  const handleAiAddRow = () => {
    if (!aiNewRow.id || !aiNewRow.description) {
      alert("Please provide code and description.");
      return;
    }
    const val: BQItem = {
      id: aiNewRow.id,
      description: aiNewRow.description,
      unit: aiNewRow.unit || "m³",
      quantity: Number(aiNewRow.quantity) || 0,
      unitPrice: Number(aiNewRow.unitPrice) || 0,
      remarks: aiNewRow.remarks || ""
    };
    setBqData({ ...bqData, items: [...bqData.items, val] });
    setAiNewRow({ id: "", description: "", unit: "m³", quantity: 0, unitPrice: 0, remarks: "" });
    setAiShowAddForm(false);
  };

  // Take-off Row edits
  const startEditTakeoff = (index: number, item: TakeoffItem) => {
    setEditTakeoffIndex(index);
    setEditTakeoffData({ ...item });
  };

  const saveEditTakeoff = () => {
    if (editTakeoffIndex !== null && editTakeoffData && takeoffData) {
      const updated = [...takeoffData];
      
      // Auto recalculate quantity
      let computed = 0;
      if (editTakeoffData.unit === "m³") {
        computed = editTakeoffData.multiplier * editTakeoffData.length * editTakeoffData.width * editTakeoffData.height;
      } else if (editTakeoffData.unit === "m²") {
        computed = editTakeoffData.multiplier * editTakeoffData.length * (editTakeoffData.width || 1) * (editTakeoffData.height === 1 ? 1 : editTakeoffData.height);
      } else {
        computed = editTakeoffData.multiplier * (editTakeoffData.length || 1);
      }
      
      editTakeoffData.outputQty = parseFloat(computed.toFixed(2));
      
      updated[editTakeoffIndex] = editTakeoffData;
      setTakeoffData(updated);
      setEditTakeoffIndex(null);
      setEditTakeoffData(null);
    }
  };

  const deleteTakeoffRow = (index: number) => {
    if (takeoffData) {
      const updated = takeoffData.filter((_, i) => i !== index);
      setTakeoffData(updated);
    }
  };

  // Material Row edits
  const startEditMaterial = (index: number, item: MaterialItem) => {
    setEditMaterialIndex(index);
    setEditMaterialData({ ...item });
  };

  const saveEditMaterial = () => {
    if (editMaterialIndex !== null && editMaterialData && materialData) {
      const updated = [...materialData];
      
      // Auto recalculate total
      editMaterialData.total = Math.round(editMaterialData.quantity * editMaterialData.rate);
      
      updated[editMaterialIndex] = editMaterialData;
      setMaterialData(updated);
      setEditMaterialIndex(null);
      setEditMaterialData(null);
    }
  };

  const deleteMaterialRow = (index: number) => {
    if (materialData) {
      const updated = materialData.filter((_, i) => i !== index);
      setMaterialData(updated);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EFEA] text-[#141414] font-sans flex flex-col p-3 md:p-6 selection:bg-[#F27D26] selection:text-white antialiased">
      
      {/* BRAND HEADER BAR (Swiss Brutalist: thick black borders, structural orange accents) */}
      <header className="bg-[#141414] text-white p-4 md:p-6 border-4 md:border-8 border-[#141414] flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shadow-[5px_5px_0px_rgba(0,0,0,0.15)] rounded-none">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="p-2 bg-[#F27D26] text-white flex items-center justify-center">
              <Building2 className="w-6 h-6 md:w-8 md:h-8" />
            </span>
            <h1 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tight leading-none">
              ARCHIGEN<span className="text-[#F27D26]">.</span>
              <span className="text-stone-300 font-normal font-sans text-xl md:text-2xl lowercase tracking-widest pl-1">
                boq automated
              </span>
            </h1>
          </div>
          <p className="mt-3 text-xs md:text-sm font-mono tracking-wider uppercase text-stone-400 max-w-xl leading-relaxed">
            HAYMI CAD / ARCHIGEN Automated BoQ Engine — Conforming fully to the EBCS (Ethiopian Building Code Standards)
          </p>
        </div>

        {/* Action controls combined */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full md:w-auto">
          {/* Dynamic Language toggle */}
          <button 
            onClick={() => setLang(lang === "am" ? "en" : "am")}
            className="flex items-center justify-center gap-2 bg-[#F27D26] hover:bg-white text-white hover:text-[#141414] transition-all font-bold uppercase tracking-wider text-xs px-4 py-2.5 border-2 border-transparent hover:border-[#141414] self-end cursor-pointer font-display"
          >
            <Languages className="w-4 h-4" />
            <span>{lang === "am" ? "English (EN)" : "አማርኛ (AMH)"}</span>
          </button>

          {/* Current Project Profile Card */}
          <div className="flex flex-col text-left font-mono text-[10px] bg-stone-900 border border-stone-800 p-2 text-stone-300">
            <p className="text-[#F27D26] font-extrabold uppercase tracking-widest">{lang === "am" ? "ገባሪ ግምት ፕሮጀክት" : "ACTIVE ESTIMATION PROJECT"}</p>
            <p className="font-bold text-[12px] text-white uppercase truncate max-w-[200px]">{projectData.projectName}</p>
          </div>
        </div>
      </header>

      {/* CORE ADRESSABLE SYSTEM DESCRIPTOR TAG */}
      <div className="mt-4 flex flex-col md:flex-row border-4 border-[#141414] bg-white divide-y-4 md:divide-y-0 md:divide-x-4 divide-[#141414] shadow-[4px_4px_0px_#141414]">
        <div className="p-3 bg-stone-100 flex items-center gap-2 font-mono text-xs font-bold shrink-0">
          <Sliders className="w-4 h-4 text-[#F27D26]" />
          <span>CHOOSE WORKSPACE MODE:</span>
        </div>
        <button 
          onClick={() => setAppMode("haymi-project")}
          className={`flex-1 text-center p-3 text-xs md:text-sm font-black uppercase tracking-tight transition-all cursor-pointer ${
            appMode === "haymi-project" 
              ? "bg-[#141414] text-white" 
              : "bg-white text-stone-700 hover:bg-stone-50"
          }`}
        >
          📂 {tl.haymiTab}
        </button>
        <button 
          onClick={() => setAppMode("ai-vision")}
          className={`flex-1 text-center p-3 text-xs md:text-sm font-black uppercase tracking-tight transition-all cursor-pointer ${
            appMode === "ai-vision" 
              ? "bg-[#141414] text-white" 
              : "bg-white text-stone-700 hover:bg-stone-50"
          }`}
        >
          🔍 {tl.aiVisionTab}
        </button>
      </div>

      {/* HAYMI WORKSPACE SUB-TABS (Only visible in haymi-project mode) */}
      {appMode === "haymi-project" && (
        <div className="mt-3 flex flex-wrap border-2 border-[#141414] bg-white divide-x-2 divide-[#141414] font-mono text-xs font-bold shadow-[2px_2px_0px_#141414]">
          <button 
            onClick={() => setHaymiSubTab("sheet")}
            className={`flex-1 min-w-[120px] text-center p-2.5 transition-all text-[11px] cursor-pointer ${
              haymiSubTab === "sheet" ? "bg-[#F27D26] text-white" : "hover:bg-stone-50"
            }`}
          >
            📊 {lang === "am" ? "የዋጋ ገበታ (Spreadsheet)" : "BQ Spreadsheet"}
          </button>
          <button 
            onClick={() => setHaymiSubTab("profile")}
            className={`flex-1 min-w-[120px] text-center p-2.5 transition-all text-[11px] cursor-pointer ${
              haymiSubTab === "profile" ? "bg-[#F27D26] text-white" : "hover:bg-stone-50"
            }`}
          >
            🏢 {lang === "am" ? "ፕሮጀክት መግለጫ (Profile)" : "Project Profile"}
          </button>
          <button 
            onClick={() => setHaymiSubTab("calc")}
            className={`flex-1 min-w-[120px] text-center p-2.5 transition-all text-[11px] cursor-pointer ${
              haymiSubTab === "calc" ? "bg-[#F27D26] text-white" : "hover:bg-stone-50"
            }`}
          >
            📐 {lang === "am" ? "የመጠን ማስያ ቀመሮች (Calculators)" : "BBS & Dimension Calcs"}
          </button>
          <button 
            onClick={() => setHaymiSubTab("projects")}
            className={`flex-1 min-w-[120px] text-center p-2.5 transition-all text-[11px] cursor-pointer ${
              haymiSubTab === "projects" ? "bg-[#F27D26] text-white" : "hover:bg-stone-50"
            }`}
          >
            🗂️ {lang === "am" ? "የፕሮጀክቶች ዝርዝር (Manage Projects)" : "Manage Projects"}
          </button>
        </div>
      )}

      {/* DETAILED NOTIFICATION IF API_KEY IS ABSENT FOR AI SCANNING */}
      {!process.env.GEMINI_API_KEY && appMode === "ai-vision" && (
        <div className="mt-4 bg-amber-50 border-4 border-[#141414] p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="p-2 bg-amber-400 border-2 border-[#141414] text-black">
            <Lock className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="font-black text-xs text-[#141414] uppercase tracking-wider flex items-center gap-2 font-display">
              ⚠️ Simulated Estimations Active (API Key Not Configured)
            </h4>
            <p className="text-xs text-stone-700 leading-relaxed font-sans">
              To trigger actual multi-page structural blue-print drawing scans via automated Vision AI, please append your <code className="bg-amber-100 font-mono px-1 py-0.5 text-[11px] font-bold">GEMINI_API_KEY</code> in Settings &gt; Secrets. In the meantime, you can instantly test our interactive footing schedules and structural frames below!
            </p>
          </div>
        </div>
      )}

      {/* CORE WORKSPACE: GRID OF MODULES */}
      <main className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
        
        {/* HAYMI DIVISION SELECTOR BAR - LEFT PANEL IN "HAYMI" MODE */}
        {appMode === "haymi-project" && haymiSubTab === "sheet" && (
          <nav className="lg:col-span-3 space-y-3 print:hidden">
            <div className="bg-white border-4 border-[#141414] p-4 shadow-[4px_4px_0px_#141414]">
              <div className="flex justify-between items-center border-b-2 border-stone-100 pb-2 mb-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#141414]">
                  👷 {tl.divisionLabel}
                </span>
                <span className="bg-[#F27D26] text-white font-mono text-[9px] px-1.5 py-0.5 uppercase font-bold">
                  Bole G+4
                </span>
              </div>

              {/* List of Divisions with Cost Tags */}
              <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                <button
                  onClick={() => setActiveDivisionId("all")}
                  className={`w-full text-left p-2.5 text-xs font-bold uppercase transition-all flex items-center justify-between border-2 cursor-pointer rounded-none ${
                    activeDivisionId === "all"
                      ? "bg-[#141414] text-white border-[#141414]"
                      : "bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200"
                  }`}
                >
                  <span className="truncate pr-1">📊 {tl.allDivs}</span>
                  <span className="font-mono text-[10px] shrink-0 font-bold bg-[#F27D26]/10 text-[#F27D26] px-1.5 py-0.5">
                    {formatVal(getProjectGrandTotal())}
                  </span>
                </button>

                {projectData.mainWorks.map((div) => {
                  const divLang = DIVISION_LANGS[div.id] || { am: div.title, en: div.title };
                  const divTitle = lang === "am" ? divLang.am : divLang.en;
                  const score = getDivisionTotal(div.id);
                  const isSelected = activeDivisionId === div.id;

                  return (
                    <button
                      key={div.id}
                      onClick={() => setActiveDivisionId(div.id)}
                      className={`w-full text-left p-2.5 text-xs font-bold uppercase transition-all flex items-center justify-between border-2 cursor-pointer rounded-none ${
                        isSelected
                          ? "bg-[#141414] text-white border-[#141414]"
                          : "bg-white text-stone-700 hover:bg-stone-50 border-stone-200"
                      }`}
                    >
                      <span className="truncate pr-1 shrink">
                        {div.id}. {divTitle.replace(/Division \d+\s*-\s*|ክፍል \d+\s*-\s*/, "")}
                      </span>
                      <span className="font-mono text-[10px] shrink-0 bg-stone-100 text-[#141414] font-bold px-1.5 py-0.5 rounded-none group-hover:bg-amber-100 transition-colors">
                        {formatVal(score)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DYNAMIC SPENDING GRAPH / METERS (ELEGANT BULLET CHARTS REPRESENTING SHARES) */}
            <div className="bg-white border-4 border-[#141414] p-4 shadow-[4px_4px_0px_#141414] space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-[#141414] flex items-center justify-between border-b pb-1.5 border-stone-100">
                <span>📉 {tl.budgetShare}</span>
                <PieChart className="w-4 h-4 text-stone-500" />
              </p>
              
              <div className="space-y-2.5 font-mono text-[10px]">
                {projectData.mainWorks.map(div => {
                  const total = getDivisionTotal(div.id);
                  const grandTotal = getProjectGrandTotal();
                  const sharePercent = grandTotal > 0 ? (total / grandTotal * 100) : 0;
                  if (sharePercent === 0) return null;

                  const divLang = DIVISION_LANGS[div.id] || { am: div.title, en: div.title };
                  const divTitleShort = (lang === "am" ? divLang.am : divLang.en).replace(/Division \d+\s*-\s*|ክፍል \d+\s*-\s*/, "");

                  return (
                    <div key={div.id} className="space-y-1">
                      <div className="flex justify-between font-bold text-[#141414] text-[9px]">
                        <span className="truncate max-w-[150px]">{div.id}. {divTitleShort}</span>
                        <span>{sharePercent.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 border border-stone-200 relative">
                        <div 
                          className="bg-[#F27D26] h-full transition-all duration-500" 
                          style={{ width: `${sharePercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </nav>
        )}

        {/* AI RATES CONTROLLER & SELECTORS - LEFT PANEL IN "AI VISION" MODE */}
        {appMode === "ai-vision" && (
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white border-4 border-[#141414] p-4 shadow-[4px_4px_0px_#141414]">
              <p className="text-xs font-black text-[#141414] uppercase tracking-widest mb-3 border-b-2 border-stone-100 pb-1.5 flex items-center justify-between font-display">
                <span>Controls &amp; Rates</span>
                <Settings className="w-3.5 h-3.5" />
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                    EBCS Division to Target
                  </label>
                  <select 
                    value={division}
                    onChange={(e) => setDivision(e.target.value as EBCSDivisionCode)}
                    className="w-full p-2 bg-white text-xs font-bold border-2 border-[#141414] rounded-none focus:outline-none focus:ring-2 focus:ring-[#F27D26]"
                  >
                    <option value="substructure_excavation">{TRANSLATIONS[lang].ebcsDivisions.substructure_excavation}</option>
                    <option value="substructure_concrete">{TRANSLATIONS[lang].ebcsDivisions.substructure_concrete}</option>
                    <option value="superstructure_concrete">{TRANSLATIONS[lang].ebcsDivisions.superstructure_concrete}</option>
                    <option value="superstructure_masonry">{TRANSLATIONS[lang].ebcsDivisions.superstructure_masonry}</option>
                    <option value="finishing">{TRANSLATIONS[lang].ebcsDivisions.finishing}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                    Special Tuning prompt instructions
                  </label>
                  <textarea
                    value={promptExtension}
                    onChange={(e) => setPromptExtension(e.target.value)}
                    placeholder={TRANSLATIONS[lang].tuningPlaceholder}
                    rows={4}
                    className="w-full p-2 bg-stone-50 text-xs text-[#141414] border-2 border-[#141414] rounded-none focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#F27D26]"
                  />
                </div>
              </div>
            </div>

            {/* Price indexes calibration panel */}
            <div className="bg-white border-4 border-[#141414] p-4 shadow-[4px_4px_0px_#141414] space-y-3.5">
              <p className="text-xs font-black text-[#141414] uppercase tracking-widest border-b pb-1.5 border-stone-100">
                🛠️ Market rates (ETB)
              </p>

              <div className="space-y-3.5 font-mono text-xs">
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="truncate pr-1">Excavation (m³)</span>
                    <span className="text-[#F27D26]">{rates.excavation} ETB</span>
                  </div>
                  <input 
                    type="range" min="200" max="800" step="10" value={rates.excavation}
                    onChange={(e) => setRates({ ...rates, excavation: parseInt(e.target.value) })}
                    className="w-full accent-[#F27D26]" 
                  />
                </div>
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="truncate pr-1">Lean Concrete (m²)</span>
                    <span className="text-[#F27D26]">{rates.leanConcrete} ETB</span>
                  </div>
                  <input 
                    type="range" min="200" max="1000" step="10" value={rates.leanConcrete}
                    onChange={(e) => setRates({ ...rates, leanConcrete: parseInt(e.target.value) })}
                    className="w-full accent-[#F27D26]" 
                  />
                </div>
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="truncate pr-1">Concrete C-25 (m³)</span>
                    <span className="text-[#F27D26]">{rates.concreteC25} ETB</span>
                  </div>
                  <input 
                    type="range" min="8000" max="18000" step="100" value={rates.concreteC25}
                    onChange={(e) => setRates({ ...rates, concreteC25: parseInt(e.target.value) })}
                    className="w-full accent-[#F27D26]" 
                  />
                </div>
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span className="truncate pr-1">Steel/Rebar (kg)</span>
                    <span className="text-[#F27D26]">{rates.rebar} ETB</span>
                  </div>
                  <input 
                    type="range" min="100" max="300" step="5" value={rates.rebar}
                    onChange={(e) => setRates({ ...rates, rebar: parseInt(e.target.value) })}
                    className="w-full accent-[#F27D26]" 
                  />
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* MIDDLE CORE PORTION: CONTENT SHEETS */}
        <section className={`
          ${appMode === "ai-vision" ? "lg:col-span-6" : ""}
          ${appMode === "haymi-project" && haymiSubTab === "sheet" ? "lg:col-span-6" : ""}
          ${appMode === "haymi-project" && haymiSubTab !== "sheet" ? "lg:col-span-12" : ""}
          space-y-4 md:space-y-6
        `}>

          {/* PROJECT LIST MANAGER TABS */}
          {appMode === "haymi-project" && haymiSubTab === "projects" && (
            <ProjectListManager
              lang={lang}
              projectsList={projectsList}
              activeProjId={activeProjId}
              onActivateProject={onActivateProject}
              onDeleteProject={onDeleteProject}
              onCloneProject={onCloneProject}
              onCreateNewProject={onCreateNewProject}
              onImportProject={onImportProject}
              activeProject={projectData}
            />
          )}

          {/* BBS & DETAILED DIVISION EXCAVATION AND CONCRETE VOLUME CALCULATORS */}
          {appMode === "haymi-project" && haymiSubTab === "calc" && (
            <BbsVolumeCalculators
              lang={lang}
              activeRates={{
                excavation: rates.excavation,
                leanConcrete: rates.leanConcrete,
                concreteC25: rates.concreteC25,
                formwork: 650,
                rebar: rates.rebar,
                stoneMasonry: 5300,
                hcbWall150: 1230,
                hcbWall200: 1250,
                plastering: 470,
                painting: 130
              }}
              divisions={projectData.mainWorks.map(d => ({ id: d.id, title: d.title }))}
              onAppendItem={onAppendCalculatorItem}
            />
          )}

          {/* PROJECT PROFILE & COVET SHEET SETTINGS */}
          {appMode === "haymi-project" && haymiSubTab === "profile" && (
            <div className="bg-white border-4 border-[#141414] p-5 shadow-[5px_5px_0px_#141414] space-y-6">
              <div className="border-b-4 border-[#141414] pb-3 flex justify-between items-center bg-stone-50 p-3 border border-stone-200">
                <div>
                  <h3 className="text-xl font-black uppercase text-[#141414]">🏢 Project Parameter Settings &amp; Currency Tuning</h3>
                  <p className="text-xs text-stone-500 font-mono mt-0.5">Define corporate identities, floor sizing, and global exchange rates.</p>
                </div>
                <Building className="w-8 h-8 text-[#F27D26]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-stone-700 mb-1">Project Work Name (የስራ መለያ ስም)</label>
                    <input 
                      type="text"
                      className="w-full p-2 border-2 border-[#141414] text-xs font-mono focus:bg-amber-50"
                      value={projectData.projectName || ""}
                      onChange={(e) => updateProjectDataAndPersist({ ...projectData, projectName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-stone-700 mb-1">Developer / Client Corporate Identity (ባለቤት)</label>
                    <input 
                      type="text"
                      className="w-full p-2 border-2 border-[#141414] text-xs font-mono focus:bg-amber-50"
                      value={projectData.clientName || ""}
                      onChange={(e) => updateProjectDataAndPersist({ ...projectData, clientName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-stone-700 mb-1">Principal Consulting Engineer (ዲዛይነር)</label>
                    <input 
                      type="text"
                      className="w-full p-2 border-2 border-[#141414] text-xs font-mono focus:bg-amber-50"
                      value={projectData.engineerName || ""}
                      onChange={(e) => updateProjectDataAndPersist({ ...projectData, engineerName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-stone-700 mb-1">Contractor Company Name (ተቋራጭ)</label>
                    <input 
                      type="text"
                      className="w-full p-2 border-2 border-[#141414] text-xs font-mono focus:bg-amber-50"
                      value={projectData.contractorName || ""}
                      onChange={(e) => updateProjectDataAndPersist({ ...projectData, contractorName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-stone-700 mb-1">Geographical Site Location (አድራሻ)</label>
                    <input 
                      type="text"
                      className="w-full p-2 border-2 border-[#141414] text-xs font-mono focus:bg-amber-50"
                      value={projectData.location || ""}
                      onChange={(e) => updateProjectDataAndPersist({ ...projectData, location: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-stone-700 mb-1">Floor Area (ጠቅላላ ስፋት m²)</label>
                      <input 
                        type="number"
                        className="w-full p-2 border-2 border-[#141414] text-xs font-mono focus:bg-amber-50"
                        value={projectData.totalFloorArea || 0}
                        onChange={(e) => updateProjectDataAndPersist({ ...projectData, totalFloorArea: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-stone-700 mb-1">Revision Code</label>
                      <input 
                        type="text"
                        className="w-full p-2 border-2 border-[#141414] text-xs font-mono focus:bg-amber-50"
                        value={projectData.revisionNo || "Rev. 01"}
                        onChange={(e) => updateProjectDataAndPersist({ ...projectData, revisionNo: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 p-3 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#141414] flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-[#F27D26]" />
                      <span>Currency conversion &amp; valuation</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5 font-display">Select Currency</label>
                        <select 
                          className="w-full p-1.5 border border-[#141414] bg-white text-xs font-bold"
                          value={selectedCurrency}
                          onChange={(e) => setSelectedCurrency(e.target.value as any)}
                        >
                          <option value="ETB">ETB (Ethiopian Birr)</option>
                          <option value="USD">USD (US Dollar)</option>
                          <option value="EUR">EUR (Euro)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5 font-display">USD Exchange Rate</label>
                        <input 
                          type="number"
                          className="w-full p-1 border border-[#141414] text-xs font-mono text-stone-900"
                          value={exchangeRateToEtb}
                          onChange={(e) => setExchangeRateToEtb(parseFloat(e.target.value) || 125)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COVER PAGE SPECIMEN */}
              <div className="border-4 border-dashed border-stone-300 p-6 bg-stone-50 space-y-4">
                <span className="text-[10px] font-mono text-stone-500 uppercase block select-none">Preview of printable formal BQ cover page:</span>
                <div className="bg-white border-2 border-[#141414] p-8 max-w-[620px] mx-auto text-center space-y-6 shadow-sm">
                  <h1 className="text-xl font-black tracking-tight uppercase border-b-2 border-stone-200 pb-2">{projectData.projectName}</h1>
                  <h2 className="text-lg font-black uppercase tracking-widest text-[#F27D26]">EBCS Standard Bill Of Quantities Layout</h2>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-left font-mono text-[11px] border-t py-4 text-stone-700">
                    <div>
                      <p className="font-bold uppercase opacity-60">Developer / Client:</p>
                      <p className="font-black text-[#141414]">{projectData.clientName}</p>
                    </div>
                    <div>
                      <p className="font-bold uppercase opacity-60">Consulting Architect &amp; Eng:</p>
                      <p className="font-black text-[#141414]">{projectData.engineerName}</p>
                    </div>
                    <div>
                      <p className="font-bold uppercase opacity-60">Geographical Location:</p>
                      <p className="font-black text-[#141414]">{projectData.location}</p>
                    </div>
                    <div>
                      <p className="font-bold uppercase opacity-60">General Contractor:</p>
                      <p className="font-black text-[#141414]">{projectData.contractorName}</p>
                    </div>
                    <div>
                      <p className="font-bold uppercase opacity-60">Sizing index:</p>
                      <p className="font-black text-[#141414]">{projectData.totalFloorArea} sq. meters</p>
                    </div>
                    <div>
                      <p className="font-bold uppercase opacity-60">Evaluation Currency:</p>
                      <p className="font-black text-[#141414]">{selectedCurrency}</p>
                    </div>
                  </div>

                  <p className="text-[10px] font-mono text-stone-400">Generated on {projectData.dateCreated || new Date().toLocaleDateString()} — {projectData.revisionNo || "Rev. 01"}</p>
                </div>
              </div>
            </div>
          )}

          {/* SEARCH, ACCORDIONS, AND REVIEWS PORT - ONLY IN "HAYMI PROJECT" SPREADSHEET SUB-TAB MODE */}
          {appMode === "haymi-project" && haymiSubTab === "sheet" && (
            <div className="bg-white border-4 border-[#141414] p-4 shadow-[4px_4px_0px_#141414] space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={tl.searchPlaceholder}
                    className="w-full pl-9 pr-3 py-2 border-2 border-[#141414] text-xs font-mono bg-[#ECEBE7] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={resetToBaseline}
                    className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-[#F27D26] text-black hover:text-white transition-all text-xs border border-[#141414] font-bold cursor-pointer uppercase tracking-tight"
                    title="Restore all default model rates and quantities"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{tl.resetBaseline}</span>
                  </button>
                </div>
              </div>

              {/* Quick Filter division title alert */}
              {searchQuery && (
                <div className="p-2 bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20 font-mono text-[10px] font-bold uppercase">
                  🔍 Filtering project items by query: "{searchQuery}"
                </div>
              )}
            </div>
          )}

          {/* AI DRAWING INTERACTIVE ANALYZER UPLOADER - ONLY IN "AI VISION" MODE */}
          {appMode === "ai-vision" && (
            <div className="space-y-4">
              {/* Estimation Type Selector Switcher */}
              <div className="flex border-4 border-[#141414] bg-white divide-x-4 divide-[#141414] shadow-[4px_4px_0px_#141414]">
                <button
                  type="button"
                  onClick={() => { setEstimationType("drawing"); setGeneratedReportType("bq"); }}
                  className={`flex-1 p-3 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    estimationType === "drawing" ? "bg-[#141414] text-white" : "bg-white text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  📁 {lang === "am" ? "የዲዛይን ፋይል ማስጫኛ (Drawing Upload)" : "Upload Blueprint Design PDF"}
                </button>
                <button
                  type="button"
                  onClick={() => { setEstimationType("parametric"); }}
                  className={`flex-1 p-3 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    estimationType === "parametric" ? "bg-[#141414] text-[#F27D26]" : "bg-white text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  📐 {lang === "am" ? "ያለ ዲዛይን በስፋት ብቻ (Sizing Wizard)" : "Quick Sizing Parametric Wizard"}
                </button>
              </div>

              {estimationType === "drawing" ? (
                <div className="bg-white border-4 border-[#141414] p-4 shadow-[4px_4px_0px_#141414] space-y-4">
                  {/* Core Purpose of the software callout banner */}
                  <div className="bg-[#141414] text-white p-3.5 border-b-4 border-[#F27D26] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-[#F27D26] text-white font-black px-1.5 py-0.5 uppercase tracking-wider text-[10px]">
                        {lang === "am" ? "ዋና ዓላማ" : "CORE PURPOSE"}
                      </span>
                      <h4 className="font-black text-xs uppercase text-stone-100 tracking-wider">
                        {lang === "am" ? "የዲዛይን ፋይል አንባቢ እና አውቶማቲክ BQ አዘጋጅ" : "Design Parser & Automated BQ Generator"}
                      </h4>
                    </div>
                    <p className="text-[11px] leading-relaxed text-stone-300 font-medium">
                      {lang === "am" 
                        ? "ይህ ሶፍትዌር የተሰራው ከስልክዎ ወይም ከባለሙያ ኮምፒውተርዎ ላይ ማንኛውንም የህንፃ ዲዛይን (PDF / CAD Drawing / Image) በቀጥታ በማንበብ በሰከንዶች ውስጥ በኢትዮጵያ ህንጻ ኮድ ስታንዳርድ (EBCS-2) መሰረት ዝርዝር የዋጋና የቁሳቁስ መግለጫ (Bill of Quantity) በራሱ አውቶማቲክ አሰላልቶ ለማውጣት ነው።"
                        : "This software is specifically designed to ingest blueprint designs (PDF / CAD / Images) from your phone or PC, automatically reading layout scales to synthesize highly precise, localized project Bills of Quantities (BQ) conforming with the Ethiopian Building Code (EBCS) standards."
                      }
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-[#141414] flex items-center gap-1.5">
                      📁 {lang === "am" ? "የፒዲኤፍ ዲዛይንና መዋቅሮች ማስጫኛ" : "EBCS PDF Drawings & Blueprint Upload"}
                    </span>
                    <span className="font-mono text-[9px] bg-red-100 text-[#F27D26] px-1.5 py-0.5 rounded-none uppercase font-black">
                      {lang === "am" ? "በEBCS ታማኝ" : "EBCS Compliant Rasterizer"}
                    </span>
                  </div>

                  {/* Instructions on how to upload from local devices (Phone/PC) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-stone-50 p-3 border-2 border-[#141414]">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-[#F27D26] uppercase flex items-center gap-1">
                        📱 {lang === "am" ? "ከሞባይል ስልክዎ ላይ ለመስቀል" : "UPLOAD FROM SMARTPHONE"}
                      </p>
                      <ul className="text-[10px] text-stone-700 space-y-1 font-medium list-disc list-inside">
                        {lang === "am" ? (
                          <>
                            <li>የስልክዎን ካሜራ በመጠቀም የፕላን ረቂቁን ፎቶ ያንሱ</li>
                            <li>ወይም በስልክዎ ፋይል ማከማቻ (Files) ውስጥ ያለውን ፒዲኤፍ ይምረጡ</li>
                            <li>ከታች ያለውን ብርቱካናማ ሳጥን በመንካት ወዲያውኑ ይስቀሉ</li>
                          </>
                        ) : (
                          <>
                            <li>Take a clear photo of the drawing using your phone camera</li>
                            <li>Or browse local PDF documents in your mobile storage</li>
                            <li>Tap the orange dashed box below to snap/upload instantly</li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="space-y-1 border-t md:border-t-0 md:border-l border-stone-200 pt-2 md:pt-0 md:pl-3">
                      <p className="text-[10px] font-black text-sky-600 uppercase flex items-center gap-1">
                        💻 {lang === "am" ? "ከኮምፒውተርዎ ላይ ለመስቀል" : "UPLOAD FROM LAPTOP / PC"}
                      </p>
                      <ul className="text-[10px] text-stone-700 space-y-1 font-medium list-disc list-inside">
                        {lang === "am" ? (
                          <>
                            <li>የAutocad, ArchiCAD ወይም የተቃኘ PDF ፋይል ያዘጋጁ</li>
                            <li>ፋይሉን በቀጥታ በመጎተት (Drag & Drop) ማስገባት ይችላሉ</li>
                            <li>ወይም ሳጥኑን በመጫን ከኮምፒውተርዎ ፎልደሮች ውስጥ ፋይሉን ይምረጡ</li>
                          </>
                        ) : (
                          <>
                            <li>Prepare any AutoCAD export, ArchiCAD PDF or scanned draw sheet</li>
                            <li>Drag and drop the drawing file directly onto the upload zone</li>
                            <li>Or click the dashed layout to browse your desktop file explorer</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Drag n Drop block explicitly highlighting PDF CAD Designs */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) { processFile(f); } }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 border-4 border-dashed rounded-none text-center cursor-pointer transition-all ${
                      isDragOver ? "border-[#F27D26] bg-[#F27D26]/10" : "border-[#141414] hover:bg-stone-50"
                    }`}
                  >
                    <input 
                      type="file" ref={fileInputRef} onChange={handleFileChange} accept=".png,.jpg,.jpeg,.pdf" className="hidden" 
                    />
                    <UploadCloud className="w-10 h-10 mx-auto text-[#F27D26] mb-2" />
                    <p className="font-black text-xs uppercase tracking-wider text-[#141414]">
                      {customFile 
                        ? (lang === "am" ? `የተጫነ ፒዲኤፍ ማህደር፡ ${customFile.name} (${customFile.size})` : `Uploaded: ${customFile.name} (${customFile.size})`)
                        : (lang === "am" ? "የፒዲኤፍ (PDF) ግንባታ ንድፍ ወይም CAD ፕላን ከስልክዎ/ኮምፒውተርዎ እዚህ ይጫኑ ወይም ይጎትቱ" : "CLICK TO CHOOSE FILE FROM YOUR PHONE / PC OR DRAG & DROP CODES")
                      }
                    </p>
                    <p className="text-[9px] text-stone-500 font-mono mt-1.5 uppercase tracking-widest bg-[#F27D26]/10 text-[#F27D26] px-2 py-0.5 inline-block font-extrabold">
                      {lang === "am" ? "★ የኢትዮጵያ ህንጻ ኮድ ስታንዳርድ (EBCS-2) ማስተካከያ" : "★ READY TO PROCESS ETHIOPIAN BUILDING CODE (EBCS)"}
                    </p>
                  </div>

                  {/* Trial samples options */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider block">
                      {lang === "am" ? "ወይም በናሙና ንድፎች ለመሞከር ከዚህ ይምረጡ፦" : "Or click to inspect pre-calibrated trial blueprints:"}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {samples.map(sample => {
                        const isActive = selectedSampleId === sample.id && !customFile;
                        return (
                          <button
                            key={sample.id}
                            onClick={() => { setSelectedSampleId(sample.id); setCustomFile(null); }}
                            className={`p-2.5 border-2 text-left shrink-0 transition-all cursor-pointer rounded-none flex gap-2 items-start ${
                              isActive ? "border-[#F27D26] bg-stone-100" : "border-stone-200 hover:bg-stone-50"
                            }`}
                          >
                            <div className="w-12 h-12 border bg-stone-300 flex-shrink-0 overflow-hidden relative">
                              <img src={sample.imageUrl} alt={sample.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-xs uppercase text-[#141414] truncate">{lang === "am" ? sample.nameAmh : sample.name}</p>
                              <p className="text-[9px] text-stone-500 line-clamp-1 truncate">{lang === "am" ? sample.descriptionAmh : sample.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Calibration Switch Panel for uploaded custom designs */}
                  {customFile && (
                    <div className="bg-stone-50 border-2 border-[#141414] p-3 space-y-3">
                      <p className="text-[10px] font-black uppercase text-[#141414] tracking-widest border-b pb-1 flex items-center justify-between">
                        <span>🎚️ {lang === "am" ? "የፒዲኤፍ ዲዛይን መለኪያዎች ማስተካከያ" : "PDF Blueprint Scale & Calibration"}</span>
                        <span className="text-stone-500 text-[9px] font-bold">CAD Rasterization Options</span>
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Scale Selector */}
                        <div>
                          <label className="block text-[9px] font-extrabold uppercase text-stone-600 mb-1">
                            📐 {lang === "am" ? "የስዕል መለኪያ ስኬል (Blueprints Scale)" : "Blueprint Scale"}
                          </label>
                          <select 
                            value={pdfScale}
                            onChange={(e) => setPdfScale(e.target.value)}
                            className="w-full p-1 bg-white text-xs font-bold border-2 border-[#141414] rounded-none focus:outline-none"
                          >
                            <option value="1:50">1:50 (Detailed Concrete/Rebar Schedule)</option>
                            <option value="1:100">1:100 (Substructure Foundation Layout)</option>
                            <option value="1:200">1:200 (General General Structural Keyplan)</option>
                          </select>
                        </div>

                        {/* Active Sheet Page Selector */}
                        <div>
                          <label className="block text-[9px] font-extrabold uppercase text-stone-600 mb-1">
                            📄 {lang === "am" ? "የሚቀነበብ ንድፍ ገጽ (Select Sheet to Parse)" : "Active Drawing Sheet"}
                          </label>
                          <select 
                            value={selectedSheetIndex}
                            onChange={(e) => setSelectedSheetIndex(Number(e.target.value))}
                            className="w-full p-1 bg-white text-xs font-bold border-2 border-[#141414] rounded-none focus:outline-none"
                          >
                            {pdfDetectedSheets.map((sheet, idx) => (
                              <option key={idx} value={idx}>{sheet}</option>
                            ))}
                          </select>
                        </div>

                        {/* Rebar Wastage Margin */}
                        <div>
                          <label className="block text-[9px] font-extrabold uppercase text-stone-600 mb-1">
                            🏗️ {lang === "am" ? "የብረት ቆረጣ ብክነት መከላከያ" : "Reinforcement Wastage Factor"}
                          </label>
                          <select 
                            value={rebarWastageFactor}
                            onChange={(e) => setRebarWastageFactor(e.target.value)}
                            className="w-full p-1 bg-white text-xs font-bold border-2 border-[#141414] rounded-none focus:outline-none"
                          >
                            <option value="5%">5% (Optimized Cutting Logs)</option>
                            <option value="10%">10% (Ethiopian Contractor Standard)</option>
                            <option value="15%">15% (Heavy Structural Multi-anchors)</option>
                          </select>
                        </div>

                        {/* Concrete Cast Wastage Margin */}
                        <div>
                          <label className="block text-[9px] font-extrabold uppercase text-stone-600 mb-1">
                            🪨 {lang === "am" ? "የኮንክሪት ሙሌት ብክነት መከላከያ" : "Concrete Casting Loss Allowance"}
                          </label>
                          <select 
                            value={concreteWastageFactor}
                            onChange={(e) => setConcreteWastageFactor(e.target.value)}
                            className="w-full p-1 bg-white text-xs font-bold border-2 border-[#141414] rounded-none focus:outline-none"
                          >
                            <option value="3%">3% (Site-mixed mechanical buckets)</option>
                            <option value="5%">5% (Ethiopian Building Standard avg)</option>
                            <option value="10%">10% (Challenging Soil casting)</option>
                          </select>
                        </div>
                      </div>

                      {/* strict EBCS specification checkbox */}
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input 
                          type="checkbox" 
                          checked={strictEbcsConcreteCover} 
                          onChange={(e) => setStrictEbcsConcreteCover(e.target.checked)}
                          className="accent-[#F27D26]" 
                        />
                        <span className="text-[10px] font-bold text-[#141414] uppercase">
                          {lang === "am" ? "✓ በEBCS-2 መሰረት የኮንክሪት መከላከያ ውፍረት (Concrete Cover: 50mm) በጥብቅ አስገድድ" : "✓ Enforce strict EBCS-2 Concrete Covers (Substructure: 50mm, Superstructure: 25mm)"}
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Viewport block */}
                  <div className="bg-[#141414] text-white p-3 border-2 border-[#141414] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                    
                    <div className="relative z-10 flex flex-col items-center">
                      {customFile ? (
                        <div className="w-full bg-[#1b261e] border-2 border-emerald-500/30 p-4 font-mono select-none relative">
                          {/* Simulated Oscilloscope CAD background lines */}
                          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:20px_20px]" />
                          
                          <div className="flex justify-between items-center text-emerald-400 text-[10px] border-b border-emerald-500/20 pb-1.5 mb-2 uppercase tracking-wider font-extrabold bg-emerald-500/10 px-2 py-0.5">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              ARCHIGEN CAD Rasterizer Online
                            </span>
                            <span>GRID REF: SUB_2026_ETH</span>
                          </div>

                          <div className="py-6 flex flex-col items-center text-center">
                            <FileCheck className="w-16 h-16 text-[#F27D26] mb-2 animate-pulse" />
                            <p className="text-xs font-extrabold text-[#f0efea] tracking-tight">{customFile.name}</p>
                            <p className="text-[10px] text-emerald-400 font-bold mt-1 uppercase">
                              Sheet Mode: {pdfDetectedSheets[selectedSheetIndex]}
                            </p>
                            <div className="mt-3 flex gap-4 text-[10px] bg-stone-900/40 px-3 py-1.5 border border-stone-800">
                              <div>
                                <span className="text-stone-500 uppercase block text-[8px]">Scale Code</span>
                                <span className="text-[#F27D26] font-bold">{pdfScale}</span>
                              </div>
                              <div className="border-l border-stone-800 pl-4">
                                <span className="text-stone-500 uppercase block text-[8px]">Enforce Cover</span>
                                <span className="text-emerald-400 font-bold">{strictEbcsConcreteCover ? "Strict (50mm)" : "None"}</span>
                              </div>
                              <div className="border-l border-stone-800 pl-4">
                                <span className="text-stone-500 uppercase block text-[8px]">Rebar Margin</span>
                                <span className="text-yellow-500 font-bold">{rebarWastageFactor}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex justify-between items-center text-[9px] text-emerald-500 border-t border-emerald-500/20 pt-2 opacity-80">
                            <span>X: 284.15 | Y: 948.33 | Z: 0.00</span>
                            <span>EBCS Calibration Succeeded</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full overflow-hidden relative group">
                          <img 
                            src={selectedSampleId === "sample_footing" ? footingImg : columnImg} 
                            alt="Active Blueprint" 
                            className="w-full h-auto object-contain max-h-[300px] border border-stone-800"
                          />
                          {/* Bounding box mock overlay to display AI logic precision */}
                          <div className="absolute top-[30%] left-[30%] w-[15%] h-[12%] border-2 border-dashed border-[#F27D26] bg-red-500/10 pointer-events-none">
                            <span className="absolute -top-4 left-0 bg-[#F27D26] text-[8px] font-mono text-white px-1 font-bold">PAD F1</span>
                          </div>
                          <div className="absolute top-[50%] left-[45%] w-[12%] h-[18%] border-2 border-dashed border-sky-500 bg-sky-500/10 pointer-events-none">
                            <span className="absolute -bottom-4 left-0 bg-sky-600 text-[8px] font-mono text-white px-1 font-bold">COLUMN CORE</span>
                          </div>
                        </div>
                      )}

                      <div className="w-full mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={handleGenerateBQ}
                          disabled={isLoading}
                          className="flex-1 bg-[#F27D26] hover:bg-white text-white hover:text-[#141414] py-3 transition-all font-extrabold text-sm uppercase italic tracking-tight shadow-[3px_3px_0px_rgba(0,0,0,0.85)] cursor-pointer flex items-center justify-center gap-2 border-2 border-transparent hover:border-[#141414]"
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Parsing details: {loadingStep}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>Generate EBCS Conforming BQ</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* PARAMETRIC ESTIMATION FORM WIZARD - NEW FEATURE ADDED FOR NO DESIGN FLOW */
                <div className="bg-white border-4 border-[#141414] p-5 shadow-[4px_4px_0px_#141414] space-y-4">
                  {/* Callout Header block */}
                  <div className="bg-[#141414] text-white p-4 border-b-4 border-[#F27D26]">
                    <h3 className="text-sm font-black uppercase tracking-wider text-stone-100 flex items-center gap-2">
                      📐 {lang === "am" ? "የፓራሜትሪክ ፈጣን ዲዛይን እና ግምት" : "Parametric Estimator (Design-Free Mode)"}
                    </h3>
                    <p className="text-[11px] text-stone-300 mt-1 leading-relaxed font-semibold">
                      {lang === "am"
                        ? "ምንም አይነት የፕላን ረቂቅ ከሌለዎት ከተመረጠው የግንባታ አይነት፣ ስፋት (ካሬ ሜትር) እና ፎቆች ብዛት በመነሳት የህንጻውን መዋቅር በሰከንዶች ውስጥ በኢትዮጵያ ህንጻ ኮድ ስታንዳርድ መሰረት አውቶማቲክ አሰልቶ ያወጣል።"
                        : "No blueprint file? Simply input your project built-up area floor plans, choice of building levels (G+0 to G+9), and country zone to automatically synthesize precise Bill of Quantities, Take-off sheets and Material breakdowns based on real-world engineering standards."
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Built up area (ስፋት በካሬ ሜትር) */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase text-[#141414] tracking-wide">
                        📐 {lang === "am" ? "የሚገነባበት ወለል ስፋት (Built-Up Area per Floor - m²)" : "Floor Built-Up Area (m²)"}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="custom_built_up_area_inp"
                          value={customBuiltUpArea}
                          onChange={(e) => setCustomBuiltUpArea(Math.max(1, Number(e.target.value)))}
                          className="w-full p-2.5 bg-stone-50 border-2 border-[#141414] font-mono font-bold text-xs rounded-none focus:outline-none focus:bg-white"
                          placeholder="e.g. 150"
                        />
                        <span className="absolute right-3 top-2.5 text-[10px] font-black text-stone-400">M²</span>
                      </div>
                      <p className="text-[9px] text-stone-500 font-medium leading-tight">
                        {lang === "am" ? "ማሳሰቢያ: ዝቅተኛ 20 ካሬ ሜትር፣ ከፍተኛ 25,000 ካሬ ሜትር" : "Suggested bounds: 20 to 25,000 square meters per level."}
                      </p>
                    </div>

                    {/* Construction Type (የግንባታ ዘውግ አይነት) */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase text-[#141414] tracking-wide">
                        🏢 {lang === "am" ? "የግንባታው ዘውግ አይነት (Construction Type)" : "Construction Classification"}
                      </label>
                      <select
                        id="construction_type_sel"
                        value={constructionType}
                        onChange={(e) => setConstructionType(e.target.value as any)}
                        className="w-full p-2.5 bg-white border-2 border-[#141414] text-xs font-bold rounded-none focus:outline-none"
                      >
                        <option value="residential">🏡 {lang === "am" ? "የመኖሪያ ህንፃ / ቪላ (Residential)" : "Residential Villa or Apartments"}</option>
                        <option value="commercial">🏬 {lang === "am" ? "የንግድ ህንፃ / ሱቆች / ቢሮ (Commercial)" : "Commercial Complex (Offices / Malls)"}</option>
                        <option value="institutional">🏫 {lang === "am" ? "የመንግስት ተቋማት / ት/ቤት / ክሊኒክ (Institutional)" : "Institutional (Schools / Clinic / Public)"}</option>
                      </select>
                      <p className="text-[9px] text-stone-500 font-medium leading-tight">
                        {lang === "am" ? "የህንፃው ዘውግ በአምድ ጥንካሬና በፓድ ስፋት ማባዣ ላይ ተጽዕኖ ያስከትላል" : "Structure type automatically alters steel reinforcement & concrete mix quotients."}
                      </p>
                    </div>

                    {/* Dynamic Story selector (G+0 to G+9) */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase text-[#141414] tracking-wide">
                        🪜 {lang === "am" ? "የህንፃው ከፍታ / ፎቅ ደረጃ (Building Levels - G+N)" : "Building Storey Levels (G+N)"}
                      </label>
                      <select
                        id="stories_levels_sel"
                        value={stories}
                        onChange={(e) => setStories(e.target.value)}
                        className="w-full p-2.5 bg-white border-2 border-[#141414] text-xs font-bold rounded-none focus:outline-none font-mono"
                      >
                        <option value="g+0">🏠 G+0 ({lang === "am" ? "ምድር ቤት ብቻ" : "Single Storey / Gr Floor Only"})</option>
                        <option value="g+1">🏢 G+1 ({lang === "am" ? "ባለ 1 ፎቅ ህንጻ" : "Ground + 1 Storey"})</option>
                        <option value="g+2">🏢 G+2 ({lang === "am" ? "ባለ 2 ፎቅ ህንጻ" : "Ground + 2 Stories"})</option>
                        <option value="g+3">🏢 G+3 ({lang === "am" ? "ባለ 3 ፎቅ ህንጻ" : "Ground + 3 Stories"})</option>
                        <option value="g+4">🏢 G+4 ({lang === "am" ? "ባለ 4 ፎቅ ህንጻ" : "Ground + 4 Stories"})</option>
                        <option value="g+5">🏢 G+5 ({lang === "am" ? "ባለ 5 ፎቅ ህንጻ" : "Ground + 5 Stories"})</option>
                        <option value="g+6">🏢 G+6 ({lang === "am" ? "ባለ 6 ፎቅ ህንጻ" : "Ground + 6 Stories"})</option>
                        <option value="g+7">🏢 G+7 ({lang === "am" ? "ባለ 7 ፎቅ ህንጻ" : "Ground + 7 Stories"})</option>
                        <option value="g+8">🏢 G+8 ({lang === "am" ? "ባለ 8 ፎቅ ህንጻ" : "Ground + 8 Stories"})</option>
                        <option value="g+9">🏢 G+9 ({lang === "am" ? "ባለ 9 ፎቅ ህንጻ" : "Ground + 9 Stories"})</option>
                      </select>
                      <p className="text-[9px] text-stone-500 font-medium leading-tight">
                        {lang === "am" ? "ከፍታው ህንፃ ውፍረቱን (Slab depth & beam levels) በEBCS ኮድ መሰረት ይወስናል" : "Determines foundations dimensions, column widths and upper-deck slab intervals."}
                      </p>
                    </div>

                    {/* Siting country selector (የሚገነባበት ሀገር) */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase text-[#141414] tracking-wide">
                        🌍 {lang === "am" ? "የሚገነባበት ሀገርና ክልል (Country / Region)" : "Country / Pricing Region"}
                      </label>
                      <select
                        id="country_region_sel"
                        value={countryRegion}
                        onChange={(e) => setCountryRegion(e.target.value)}
                        className="w-full p-2.5 bg-white border-2 border-[#141414] text-xs font-bold rounded-none focus:outline-none"
                      >
                        <option value="eth_addis">🇪🇹 ኢትዮጵያ - አዲስ አበባ (Ethiopia - Addis Standard)</option>
                        <option value="eth_hawassa">🇪🇹 ኢትዮጵያ - ሐዋሳ (Hawassa Region Index)</option>
                        <option value="eth_adama">🇪🇹 ኢትዮጵያ - አዳማ (Adama Industrial Zone)</option>
                        <option value="ken_nairobi">🇰🇪 ኬንያ - ናይሮቢ (Kenya - Nairobi Regional Base)</option>
                      </select>
                      <p className="text-[9px] text-stone-500 font-medium leading-tight">
                        {lang === "am" ? "የተመረጠው አካባቢ የአገር ውስጥ ጥሬ እቃዎች የመሸጫ ዋጋን ይወስናል" : "Adjusts unit costs for concrete bags, rebar iron and regional excavation margins."}
                      </p>
                    </div>
                  </div>

                  {/* Calibration info badges */}
                  <div className="bg-stone-50 border-2 border-stone-200 p-2.5 text-[10px] text-stone-600 font-semibold space-y-1">
                    <span className="font-extrabold uppercase text-[#141414] block">🏗️ EBCS Structural Sizing Framework Options:</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>• Concrete: <span className="font-bold text-[#F27D26]">C-25 Structural Mix</span></div>
                      <div>• Steel: <span className="font-bold text-[#F27D26]">Deformed S-400</span></div>
                      <div>• Excavation Depth: <span className="font-bold text-[#F27D26]">Avg 1.80m Pit Depth</span></div>
                      <div>• Formwork: <span className="font-bold text-[#F27D26]">Sawn Timber (2 coats reuse)</span></div>
                    </div>
                  </div>

                  {/* 3 ACTIONS ACTION BAR TRIGGERING DIFFERENT EXCEL GENERATORS */}
                  <div className="pt-2">
                    <span className="text-[10px] font-extrabold text-[#F27D26] uppercase block mb-2">
                      {lang === "am" ? "ዘገባዎችን አብራራና አስላ (Pick Report Output to Generate)" : "Select reports to calculate and populate downstream interactive grids:"}
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      
                      {/* Generates BoQ */}
                      <button
                        type="button"
                        onClick={() => generateParametricData("bq")}
                        disabled={isLoading}
                        className={`p-3 border-2 font-black uppercase text-xs transition-all flex flex-col items-center gap-1.5 cursor-pointer rounded-none group ${
                          generatedReportType === "bq" && takeoffData !== null
                            ? "bg-[#141414] text-[#F27D26] border-[#141414] shadow-[2px_2px_0px_#F27D26]"
                            : "bg-white text-stone-800 hover:bg-stone-50 border-[#141414]"
                        }`}
                      >
                        <span className="text-xl">📊</span>
                        <div className="text-center font-extrabold text-[10px] tracking-tight leading-none uppercase">
                          {lang === "am" ? "የዋጋ ዝርዝር (BoQ)" : "Generate BQ Sheets"} <br />
                          <span className="font-normal text-[8px] lowercase opacity-75">{lang === "am" ? "(ዋጋ በካሬ)" : "(cost items)"}</span>
                        </div>
                      </button>

                      {/* Generates Take-Off */}
                      <button
                        type="button"
                        onClick={() => generateParametricData("takeoff")}
                        disabled={isLoading}
                        className={`p-3 border-2 font-black uppercase text-xs transition-all flex flex-col items-center gap-1.5 cursor-pointer rounded-none group ${
                          generatedReportType === "takeoff"
                            ? "bg-[#141414] text-[#F27D26] border-[#141414] shadow-[2px_2px_0px_#F27D26]"
                            : "bg-white text-stone-800 hover:bg-stone-50 border-[#141414]"
                        }`}
                      >
                        <span className="text-xl">📐</span>
                        <div className="text-center font-extrabold text-[10px] tracking-tight leading-none uppercase">
                          {lang === "am" ? "ዝርዝር ስሌት (Take-off)" : "Generate Take-Off"} <br />
                          <span className="font-normal text-[8px] lowercase opacity-75">{lang === "am" ? "(ርዝመት * ስፋት)" : "(L * W * H formulas)"}</span>
                        </div>
                      </button>

                      {/* Generates Material Breakdown */}
                      <button
                        type="button"
                        onClick={() => generateParametricData("material")}
                        disabled={isLoading}
                        className={`p-3 border-2 font-black uppercase text-xs transition-all flex flex-col items-center gap-1.5 cursor-pointer rounded-none group ${
                          generatedReportType === "material"
                            ? "bg-[#141414] text-[#F27D26] border-[#141414] shadow-[2px_2px_0px_#F27D26]"
                            : "bg-white text-stone-800 hover:bg-stone-50 border-[#141414]"
                        }`}
                      >
                        <span className="text-xl">🧱</span>
                        <div className="text-center font-extrabold text-[10px] tracking-tight leading-none uppercase">
                          {lang === "am" ? "የቁሳቁስ መግለጫ (Materials)" : "Generate Material Bill"} <br />
                          <span className="font-normal text-[8px] lowercase opacity-75">{lang === "am" ? "(የሲሚንቶና አሸዋ ብዛት)" : "(cement, rebar count)"}</span>
                        </div>
                      </button>

                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SPREADSHEETS: TABLE LAYOUT ACCORDING TO MODEL SPECIFICATION */}
          {(appMode === "ai-vision" || (appMode === "haymi-project" && haymiSubTab === "sheet")) && (
            <div className="bg-white border-4 border-[#141414] p-3 md:p-5 shadow-[5px_5px_0px_#141414]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-4 border-[#141414] pb-4 mb-4">
              <div>
                <span className="bg-[#141414] text-white font-mono text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest inline-block mb-1">
                  EBCS CAD Automated Sheet
                </span>
                <h2 className="text-xl md:text-3xl font-black uppercase text-[#141414] tracking-tight">
                  {appMode === "haymi-project" 
                    ? (activeDivisionId === "all" ? tl.allDivs : (DIVISION_LANGS[activeDivisionId] ? (lang === "am" ? DIVISION_LANGS[activeDivisionId].am : DIVISION_LANGS[activeDivisionId].en) : "Division Sheet"))
                    : bqData.divisionTitle
                  }
                </h2>
              </div>

              {/* Export mechanisms */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto self-stretch sm:self-auto justify-end">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#ECEBE7] hover:bg-white text-black text-xs font-bold border-2 border-[#141414] cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{tl.addBtn}</span>
                </button>

                <button
                  onClick={appMode === "haymi-project" ? exportHaymiToCSV : handleExportCSV}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#141414] hover:bg-[#F27D26] hover:text-white text-white text-xs font-bold cursor-pointer transition-colors border border-transparent"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>CSV (Excel)</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-white text-black text-xs font-bold border-2 border-stone-300 cursor-pointer transition-all hover:border-[#141414]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF</span>
                </button>
              </div>
            </div>

            {/* ADD ROW TO SELECTED DIV INLINE DRAFT */}
            {showAddForm && (
              <div className="mb-4 bg-amber-50 p-4 border-2 border-[#141414] space-y-3 shadow-[2px_2px_0px_#141414]">
                <div className="flex justify-between items-center border-b pb-1">
                  <span className="text-xs font-bold text-[#141414] uppercase">➕ Add Item Parameters</span>
                  <button onClick={() => setShowAddForm(false)} className="text-xs text-stone-500 font-bold">X</button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {appMode === "haymi-project" && (
                    <div className="col-span-2">
                      <label className="block text-[9px] font-bold uppercase mb-0.5">Technical Division</label>
                      <select
                        value={addFormDivId}
                        onChange={(e) => setAddFormDivId(e.target.value)}
                        className="p-1 px-2 border border-[#141414] bg-white text-xs w-full font-bold"
                      >
                        {projectData.mainWorks.map(div => (
                          <option key={div.id} value={div.id}>{div.id}. {div.title}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className={appMode === "haymi-project" ? "col-span-2 text-stone-900" : "col-span-2"}>
                    <label className="block text-[9px] font-bold uppercase mb-0.5">{tl.itemCode}</label>
                    <input 
                      type="text" value={newRowDraft.item} onChange={(e) => setNewRowDraft({ ...newRowDraft, item: e.target.value })}
                      placeholder="e.g. 1.05" className="p-1 px-2 border border-[#141414] bg-white text-xs w-full font-mono"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-4">
                    <label className="block text-[9px] font-bold uppercase mb-0.5">{tl.desc}</label>
                    <input 
                      type="text" value={newRowDraft.desc} onChange={(e) => setNewRowDraft({ ...newRowDraft, desc: e.target.value })}
                      placeholder="Detailed concrete, masonry or rebar description..." className="p-1 px-2 border border-[#141414] bg-white text-xs w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase mb-0.5">{tl.unit}</label>
                    <input 
                      type="text" value={newRowDraft.unit} onChange={(e) => setNewRowDraft({ ...newRowDraft, unit: e.target.value })}
                      className="p-1 px-2 border border-[#141414] bg-white text-xs w-full font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase mb-0.5">{tl.qty}</label>
                    <input 
                      type="number" value={newRowDraft.qty || ""} onChange={(e) => setNewRowDraft({ ...newRowDraft, qty: parseFloat(e.target.value) || 0 })}
                      className="p-1 px-2 border border-[#141414] bg-white text-xs w-full font-mono text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase mb-0.5">{tl.price}</label>
                    <input 
                      type="number" value={newRowDraft.price || ""} onChange={(e) => setNewRowDraft({ ...newRowDraft, price: parseFloat(e.target.value) || 0 })}
                      className="p-1 px-2 border border-[#141414] bg-white text-xs w-full font-mono text-right"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-4">
                    <label className="block text-[9px] font-bold uppercase mb-0.5">{tl.remarks}</label>
                    <input 
                      type="text" value={newRowDraft.remarks} onChange={(e) => setNewRowDraft({ ...newRowDraft, remarks: e.target.value })}
                      placeholder="Formula breakdown..." className="p-1 px-2 border border-[#141414] bg-white text-xs w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowAddForm(false)} className="px-3 py-1 bg-stone-300 hover:bg-stone-400 text-xs font-bold uppercase cursor-pointer">
                    {tl.cancel}
                  </button>
                  <button onClick={addMainWorkItem} className="px-4 py-1 bg-[#F27D26] hover:bg-black hover:text-white text-white text-xs font-black uppercase cursor-pointer">
                    Add Block Row
                  </button>
                </div>
              </div>
            )}

            {/* THE BILL OF QUANTITIES DATA GRID MATRIX */}
            <div id="print-area" className="overflow-x-auto border-2 border-[#141414]">
              {/* TABLE OPTION A: STANDARD BQ SHEET (HAYMI AND AI-VISION BQ REPORT) */}
              {(appMode === "haymi-project" || (appMode === "ai-vision" && (estimationType === "drawing" || generatedReportType === "bq"))) && (
                <table className="w-full text-left border-collapse bg-white font-sans">
                  <thead className="bg-[#141414] text-white text-[10px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-2.5 border border-stone-800 text-center w-14 font-mono font-bold">{tl.itemCode}</th>
                      <th className="p-2.5 border border-stone-800 w-[45%]">{tl.desc}</th>
                      <th className="p-2.5 border border-stone-800 text-center w-14">{tl.unit}</th>
                      <th className="p-2.5 border border-stone-800 text-right w-24">{tl.qty}</th>
                      <th className="p-2.5 border border-stone-800 text-right w-28">{tl.price}</th>
                      <th className="p-2.5 border border-stone-800 text-right w-32">{tl.amt}</th>
                      <th className="p-2.5 border border-stone-800 text-center w-20 print:hidden">{tl.actions}</th>
                    </tr>
                  </thead>

                  <tbody className="text-xs font-mono select-all bg-white divide-y divide-stone-200">
                    {/* SCENARIO A: HAYMI AUTOMATED ENGINE (12 DIVISION STATE) */}
                    {appMode === "haymi-project" && projectData.mainWorks.map((div, dIdx) => {
                      const matchesDiv = activeDivisionId === "all" || activeDivisionId === div.id;
                      if (!matchesDiv) return null;

                      const divLang = DIVISION_LANGS[div.id] || { am: div.title, en: div.title };
                      const divTitle = lang === "am" ? divLang.am : divLang.en;

                      // Filtering items inside division based on search query
                      const filteredSubItems = div.subItems.filter(item => {
                        if (searchQuery === "") return true;
                        return item.desc.toLowerCase().includes(searchQuery.toLowerCase()) || 
                               item.item.toLowerCase().includes(searchQuery.toLowerCase());
                      });

                      if (filteredSubItems.length === 0 && searchQuery !== "") return null;

                      return (
                        <React.Fragment key={div.id}>
                          {/* Division Header Break line */}
                          <tr className="bg-stone-100/90 border-t-2 border-b-2 border-[#141414]">
                            <td colSpan={7} className="p-2.5 font-display text-[11px] font-black uppercase tracking-wider text-[#141414] select-none">
                              🧱 {div.id}. {divTitle}
                            </td>
                          </tr>

                          {filteredSubItems.map((sub, sIdx) => {
                            const originalIndex = div.subItems.findIndex(x => x.item === sub.item);
                            const isEditing = editingItemKey?.divId === div.id && editingItemKey?.itemIndex === originalIndex;

                            return (
                              <tr key={sub.item} className="hover:bg-amber-50/30 transition-colors">
                                {/* Item ID */}
                                <td className="p-2 border border-stone-200 text-center font-bold text-stone-700 bg-stone-50/50">
                                  {isEditing ? (
                                    <input 
                                      type="text" value={editingItemData?.item || ""}
                                      onChange={(e) => setEditingItemData({ ...editingItemData!, item: e.target.value })}
                                      className="p-1 px-1 border border-stone-400 bg-white text-xs w-full text-center"
                                    />
                                  ) : (
                                    sub.item
                                  )}
                                </td>

                                {/* Description */}
                                <td className="p-2 border border-stone-200 font-sans text-stone-900 leading-normal text-[11.5px]">
                                  {isEditing ? (
                                    <textarea 
                                      rows={2} value={editingItemData?.desc || ""}
                                      onChange={(e) => setEditingItemData({ ...editingItemData!, desc: e.target.value })}
                                      className="p-1 px-1.5 border border-stone-400 bg-white text-xs w-full font-sans"
                                    />
                                  ) : (
                                    sub.desc
                                  )}
                                </td>

                                {/* Unit */}
                                <td className="p-2 border border-stone-200 text-center bg-stone-50/30 font-bold">
                                  {isEditing ? (
                                    <input 
                                      type="text" value={editingItemData?.unit || ""}
                                      onChange={(e) => setEditingItemData({ ...editingItemData!, unit: e.target.value })}
                                      className="p-1 border border-stone-400 bg-white text-xs w-full text-center"
                                    />
                                  ) : (
                                    sub.unit
                                  )}
                                </td>

                                {/* Qty */}
                                <td className="p-2 border border-stone-200 text-right font-extrabold text-stone-950">
                                  {isEditing ? (
                                    <input 
                                      type="number" step="0.01" value={editingItemData?.qty || 0}
                                      onChange={(e) => setEditingItemData({ ...editingItemData!, qty: parseFloat(e.target.value) || 0 })}
                                      className="p-1 border border-stone-400 bg-white text-xs w-full text-right"
                                    />
                                  ) : (
                                    sub.qty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                  )}
                                </td>

                                {/* Price */}
                                <td className="p-2 border border-stone-200 text-right text-stone-600 font-semibold">
                                  {isEditing ? (
                                    <input 
                                      type="number" step="0.01" value={editingItemData?.price || 0}
                                      onChange={(e) => setEditingItemData({ ...editingItemData!, price: parseFloat(e.target.value) || 0 })}
                                      className="p-1 border border-stone-400 bg-white text-xs w-full text-right"
                                    />
                                  ) : (
                                    formatUnitPriceVal(sub.price)
                                  )}
                                </td>

                                {/* Amount */}
                                <td className="p-2 border border-stone-200 text-right font-bold text-[#141414] bg-stone-50">
                                  {formatVal(sub.qty * sub.price)}
                                </td>

                                {/* Actions */}
                                <td className="p-1 border border-stone-200 text-center print:hidden">
                                  {isEditing ? (
                                    <div className="flex gap-1 justify-center">
                                      <button onClick={saveMainWorkItem} className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-2 py-1 text-[9px] uppercase cursor-pointer">
                                        {tl.save}
                                      </button>
                                      <button onClick={() => { setEditingItemKey(null); setEditingItemData(null); }} className="bg-stone-500 hover:bg-stone-600 text-white font-extrabold px-2 py-1 text-[9px] uppercase cursor-pointer">
                                        {tl.cancel}
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex gap-1 justify-center">
                                      <button onClick={() => { setEditingItemKey({ divId: div.id, itemIndex: originalIndex }); setEditingItemData({ ...sub }); }} className="bg-stone-200 hover:bg-stone-300 text-[#141414] font-bold px-2 py-1 text-[9px] cursor-pointer">
                                        Edit
                                      </button>
                                      <button onClick={() => deleteMainWorkItem(div.id, originalIndex)} className="p-1 bg-red-500 hover:bg-red-600 text-white cursor-pointer inline-flex items-center">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}

                          {/* Division Subtotal display */}
                          <tr className="bg-amber-50/20 font-bold border-b-2 border-stone-300 select-none">
                            <td colSpan={5} className="p-2 border border-stone-200 text-right text-[11px] font-display uppercase tracking-tight text-stone-600 pr-4">
                              {div.title} Sub-Total:
                            </td>
                            <td className="p-2 border border-stone-200 text-right text-stone-900 bg-amber-50 font-black">
                              {formatVal(getDivisionTotal(div.id))}
                            </td>
                            <td className="print:hidden border border-stone-200"></td>
                          </tr>
                        </React.Fragment>
                      );
                    })}

                    {/* SCENARIO B: ORIGINAL AI PLAN SCANNING VIEW */}
                    {appMode === "ai-vision" && bqData.items.map((item, index) => {
                      const isEditing = editRowIndex === index;
                      return (
                        <tr key={index} className="hover:bg-sky-50/20">
                          {/* ID */}
                          <td className="p-2.5 border border-stone-200 text-center font-bold">
                            {isEditing ? (
                              <input 
                                type="text" value={editRowData?.id || ""} onChange={(e) => setEditRowData({ ...editRowData!, id: e.target.value })}
                                className="p-1 border border-stone-300 w-full text-center text-xs"
                              />
                            ) : (
                              item.id
                            )}
                          </td>

                          {/* Desc */}
                          <td className="p-2.5 border border-stone-200 font-sans text-stone-900 text-[11px]">
                            {isEditing ? (
                              <textarea 
                                rows={2} value={editRowData?.description || ""} onChange={(e) => setEditRowData({ ...editRowData!, description: e.target.value })}
                                className="p-1 border border-stone-300 w-full text-xs"
                              />
                            ) : (
                              item.description
                            )}
                            <p className="text-[9px] text-stone-500 italic mt-0.5 font-mono">{item.remarks}</p>
                          </td>

                          {/* Unit */}
                          <td className="p-2.5 border border-stone-200 text-center font-bold">
                            {isEditing ? (
                              <input 
                                type="text" value={editRowData?.unit || ""} onChange={(e) => setEditRowData({ ...editRowData!, unit: e.target.value })}
                                className="p-1 border border-stone-300 w-full text-center text-xs"
                              />
                            ) : (
                              item.unit
                            )}
                          </td>

                          {/* Qty */}
                          <td className="p-2.5 border border-stone-200 text-right font-extrabold text-stone-950">
                            {isEditing ? (
                              <input 
                                type="number" value={editRowData?.quantity || 0} onChange={(e) => setEditRowData({ ...editRowData!, quantity: parseFloat(e.target.value) || 0 })}
                                className="p-1 border border-stone-300 w-full text-right text-xs"
                              />
                            ) : (
                              item.quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            )}
                          </td>

                          {/* Price */}
                          <td className="p-2.5 border border-stone-200 text-right font-semibold text-stone-600">
                            {isEditing ? (
                              <input 
                                type="number" value={editRowData?.unitPrice || 0} onChange={(e) => setEditRowData({ ...editRowData!, unitPrice: parseFloat(e.target.value) || 0 })}
                                className="p-1 border border-stone-300 w-full text-right text-xs"
                              />
                            ) : (
                              formatUnitPriceVal(item.unitPrice)
                            )}
                          </td>

                          {/* Total Amount */}
                          <td className="p-2.5 border border-stone-200 text-right font-bold text-stone-950 bg-stone-50">
                            {formatVal(item.quantity * item.unitPrice)}
                          </td>

                          {/* Actions */}
                          <td className="p-2 border border-stone-200 text-center print:hidden">
                            {isEditing ? (
                              <div className="flex gap-1 justify-center">
                                <button onClick={saveEditAiRow} className="bg-emerald-600 text-white font-bold p-1 text-[9px] uppercase cursor-pointer">
                                  {tl.save}
                                </button>
                                <button onClick={() => { setEditRowIndex(null); setEditRowData(null); }} className="bg-stone-500 text-white font-bold p-1 text-[9px] uppercase cursor-pointer">
                                  {tl.cancel}
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-1 justify-center items-center">
                                <button onClick={() => startEditAiRow(index, item)} className="bg-stone-100 hover:bg-stone-200 text-black px-1.5 py-0.5 text-[9px] border">
                                  Edit
                                </button>
                                <button onClick={() => deleteAiRow(index)} className="p-1 bg-red-500 text-white cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* TABLE OPTION B: DETAILED TAKE-OFF DIMENSTIONS SHEET */}
              {appMode === "ai-vision" && estimationType === "parametric" && generatedReportType === "takeoff" && (
                <table className="w-full text-left border-collapse bg-white font-sans">
                  <thead className="bg-[#141414] text-white text-[10px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-2.5 border border-stone-800 text-center w-12 font-mono font-bold">No</th>
                      <th className="p-2.5 border border-stone-800 w-[20%]">{lang === "am" ? "የስራ ክፍል (Section)" : "Work Section"}</th>
                      <th className="p-2.5 border border-stone-800 w-[30%]">{lang === "am" ? "የአካል መግለጫ (Member Description)" : "Member Description"}</th>
                      <th className="p-2.5 border border-stone-800 text-center w-14">Mult</th>
                      <th className="p-2.5 border border-stone-800 text-right w-16">Length (m)</th>
                      <th className="p-2.5 border border-stone-800 text-right w-16">Width (m)</th>
                      <th className="p-2.5 border border-stone-800 text-right w-16">Height (m)</th>
                      <th className="p-2.5 border border-stone-800 w-[15%]">Formula</th>
                      <th className="p-2.5 border border-stone-800 text-right w-24">Output Qty</th>
                      <th className="p-2.5 border border-stone-800 text-center w-12">Unit</th>
                      <th className="p-2.5 border border-stone-800 text-center w-20 print:hidden">{tl.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-mono bg-white divide-y divide-stone-200">
                    {takeoffData ? takeoffData.map((item, index) => {
                      const isEditing = editTakeoffIndex === index;
                      return (
                        <tr key={index} className="hover:bg-orange-50/20">
                          {/* ID */}
                          <td className="p-2 border border-stone-200 text-center font-bold bg-stone-50/50">
                            {item.id}
                          </td>
                          
                          {/* Section */}
                          <td className="p-2 border border-stone-200 font-sans text-stone-700 font-bold">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editTakeoffData?.section || ""}
                                onChange={(e) => setEditTakeoffData({ ...editTakeoffData!, section: e.target.value })}
                                className="p-1 border border-stone-300 w-full text-xs font-semibold bg-amber-50"
                              />
                            ) : (
                                item.section
                            )}
                          </td>
                          
                          {/* Desc */}
                          <td className="p-2 border border-stone-200 font-sans text-stone-900 leading-normal">
                            {isEditing ? (
                              <textarea
                                rows={2}
                                value={editTakeoffData?.itemDescription || ""}
                                onChange={(e) => setEditTakeoffData({ ...editTakeoffData!, itemDescription: e.target.value })}
                                className="p-1 border border-stone-300 w-full text-xs bg-amber-50"
                              />
                            ) : (
                              item.itemDescription
                            )}
                          </td>
                          
                          {/* Mult */}
                          <td className="p-2 border border-stone-200 text-center font-bold">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editTakeoffData?.multiplier || 0}
                                onChange={(e) => setEditTakeoffData({ ...editTakeoffData!, multiplier: parseInt(e.target.value) || 0 })}
                                className="p-1 border border-stone-300 w-12 text-center text-xs font-bold bg-amber-50"
                              />
                            ) : (
                              item.multiplier
                            )}
                          </td>
                          
                          {/* Length */}
                          <td className="p-2 border border-stone-200 text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                value={editTakeoffData?.length || 0}
                                onChange={(e) => setEditTakeoffData({ ...editTakeoffData!, length: parseFloat(e.target.value) || 0 })}
                                className="p-1 border border-stone-300 w-16 text-right text-xs bg-amber-50"
                              />
                            ) : (
                              item.length.toFixed(2)
                            )}
                          </td>
                          
                          {/* Width */}
                          <td className="p-2 border border-stone-200 text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                value={editTakeoffData?.width || 0}
                                onChange={(e) => setEditTakeoffData({ ...editTakeoffData!, width: parseFloat(e.target.value) || 0 })}
                                className="p-1 border border-stone-300 w-16 text-right text-xs bg-amber-50"
                              />
                            ) : (
                              item.width ? item.width.toFixed(2) : "-"
                            )}
                          </td>
                          
                          {/* Height */}
                          <td className="p-2 border border-stone-200 text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                value={editTakeoffData?.height || 0}
                                onChange={(e) => setEditTakeoffData({ ...editTakeoffData!, height: parseFloat(e.target.value) || 0 })}
                                className="p-1 border border-stone-300 w-16 text-right text-xs bg-amber-50"
                              />
                            ) : (
                              item.height ? item.height.toFixed(2) : "-"
                            )}
                          </td>
                          
                          {/* Formula */}
                          <td className="p-2 border border-stone-200 text-stone-500 text-[10px]">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editTakeoffData?.formula || ""}
                                onChange={(e) => setEditTakeoffData({ ...editTakeoffData!, formula: e.target.value })}
                                className="p-1 border border-stone-300 w-full text-[10px] bg-amber-50"
                              />
                            ) : (
                              item.formula
                            )}
                          </td>
                          
                          {/* OutputQty */}
                          <td className="p-2 border border-stone-200 text-right font-black text-stone-950 bg-stone-50/50">
                            {item.outputQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          
                          {/* Unit */}
                          <td className="p-2 border border-stone-200 text-center font-bold bg-stone-50/35">
                            {item.unit}
                          </td>
                          
                          {/* Actions */}
                          <td className="p-2 border border-stone-200 text-center print:hidden">
                            {isEditing ? (
                              <div className="flex gap-1 justify-center">
                                <button onClick={saveEditTakeoff} className="bg-emerald-600 hover:bg-emerald-750 text-white font-bold px-1.5 py-0.5 text-[9px] uppercase cursor-pointer">
                                  {tl.save}
                                </button>
                                <button onClick={() => { setEditTakeoffIndex(null); setEditTakeoffData(null); }} className="bg-stone-505 hover:bg-stone-600 text-white font-bold px-1.5 py-0.5 text-[9px] uppercase cursor-pointer">
                                  {tl.cancel}
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-1 justify-center items-center">
                                <button onClick={() => startEditTakeoff(index, item)} className="bg-stone-100 hover:bg-stone-200 text-[#141414] px-1.5 py-0.5 text-[9px] border cursor-pointer">
                                  Edit
                                </button>
                                <button onClick={() => deleteTakeoffRow(index)} className="p-1 bg-red-500 text-white cursor-pointer rounded-none">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={11} className="p-6 text-center text-stone-400 font-bold">
                          {lang === "am" ? "ምንም አይነት ዝርዝር ስሌት (Take-off) አልተሰላም። እባክዎ ከላይ ያለውን አዝራር ይጫኑ።" : "No takeoff measurements generated. Click the action button above to synthesize."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* TABLE OPTION C: DETAILED MATERIAL INGREDIENTS BREAKDOWN LIST */}
              {appMode === "ai-vision" && estimationType === "parametric" && generatedReportType === "material" && (
                <table className="w-full text-left border-collapse bg-white font-sans">
                  <thead className="bg-[#141414] text-white text-[10px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-2.5 border border-stone-800 w-[30%]">{lang === "am" ? "የጥሬ እቃ ዝርዝር መግለጫ (Material Ingredient)" : "Material Ingredient Description"}</th>
                      <th className="p-2.5 border border-stone-800 w-[20%]">{lang === "am" ? "የስራ ዘርፍ (Category)" : "Work Category"}</th>
                      <th className="p-2.5 border border-stone-800 text-center w-16">Unit</th>
                      <th className="p-2.5 border border-stone-800 text-right w-24">Req. Quantity</th>
                      <th className="p-2.5 border border-stone-800 text-right w-28">Est. Rate</th>
                      <th className="p-2.5 border border-stone-800 text-right w-32">Total Cost</th>
                      <th className="p-2.5 border border-stone-800 text-center w-20 print:hidden">{tl.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-mono bg-white divide-y divide-stone-200">
                    {materialData ? materialData.map((item, index) => {
                      const isEditing = editMaterialIndex === index;
                      return (
                        <tr key={index} className="hover:bg-teal-50/20">
                          {/* Name */}
                          <td className="p-2 border border-stone-200 font-sans text-stone-900 text-[11.5px]">
                            {isEditing ? (
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  value={editMaterialData?.name || ""}
                                  onChange={(e) => setEditMaterialData({ ...editMaterialData!, name: e.target.value })}
                                  className="p-1 border border-stone-300 w-full text-xs font-bold bg-amber-50"
                                  placeholder="English structural name"
                                />
                                <input
                                  type="text"
                                  value={editMaterialData?.nameAm || ""}
                                  onChange={(e) => setEditMaterialData({ ...editMaterialData!, nameAm: e.target.value })}
                                  className="p-1 border border-stone-300 w-full text-xs text-[#F27D26] bg-amber-50"
                                  placeholder="Amharic literal translation"
                                />
                              </div>
                            ) : (
                              <div>
                                <div className="font-semibold text-stone-950">{item.name}</div>
                                <div className="text-[10px] text-stone-500 italic font-medium mt-0.5">🇪🇹 {item.nameAm}</div>
                              </div>
                            )}
                          </td>
                          
                          {/* Category */}
                          <td className="p-2 border border-stone-200 font-sans text-stone-500 text-[10px] uppercase font-bold">
                            {isEditing ? (
                              <input
                                  type="text"
                                  value={editMaterialData?.category || ""}
                                  onChange={(e) => setEditMaterialData({ ...editMaterialData!, category: e.target.value })}
                                  className="p-1 border border-stone-300 w-full text-xs bg-amber-55"
                              />
                            ) : (
                              item.category
                            )}
                          </td>
                          
                          {/* Unit */}
                          <td className="p-2 border border-stone-200 text-center font-bold bg-stone-50/30">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editMaterialData?.unit || ""}
                                onChange={(e) => setEditMaterialData({ ...editMaterialData!, unit: e.target.value })}
                                className="p-1 border border-stone-300 w-full text-center text-xs bg-amber-50"
                              />
                            ) : (
                              item.unit
                            )}
                          </td>
                          
                          {/* Quantity */}
                          <td className="p-2 border border-stone-200 text-right font-extrabold text-[#141414]">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editMaterialData?.quantity || 0}
                                onChange={(e) => setEditMaterialData({ ...editMaterialData!, quantity: parseFloat(e.target.value) || 0 })}
                                className="p-1 border border-stone-300 w-full text-right text-xs font-bold bg-amber-50"
                              />
                            ) : (
                              item.quantity.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                            )}
                          </td>
                          
                          {/* Rate */}
                          <td className="p-2 border border-stone-200 text-right text-stone-600 font-semibold">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editMaterialData?.rate || 0}
                                onChange={(e) => setEditMaterialData({ ...editMaterialData!, rate: parseFloat(e.target.value) || 0 })}
                                className="p-1 border border-stone-300 w-full text-right text-xs bg-amber-50"
                              />
                            ) : (
                              formatUnitPriceVal(item.rate)
                            )}
                          </td>
                          
                          {/* Total */}
                          <td className="p-2 border border-stone-200 text-right font-bold text-stone-950 bg-stone-50/50">
                            {formatVal(item.total)}
                          </td>
                          
                          {/* Actions */}
                          <td className="p-2 border border-stone-200 text-center print:hidden">
                            {isEditing ? (
                              <div className="flex gap-1 justify-center">
                                <button onClick={saveEditMaterial} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-1.5 py-0.5 text-[9px] uppercase cursor-pointer">
                                  {tl.save}
                                </button>
                                <button onClick={() => { setEditMaterialIndex(null); setEditMaterialData(null); }} className="bg-stone-500 text-white font-bold px-1.5 py-0.5 text-[9px] uppercase cursor-pointer">
                                  {tl.cancel}
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-1 justify-center items-center">
                                <button onClick={() => startEditMaterial(index, item)} className="bg-stone-100 hover:bg-stone-200 text-black px-1.5 py-0.5 text-[9px] border cursor-pointer">
                                  Edit
                                </button>
                                <button onClick={() => deleteMaterialRow(index)} className="p-1 bg-red-500 text-white cursor-pointer rounded-none">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-stone-400 font-bold">
                          {lang === "am" ? "ምንም አይነት የጥሬ እቃዎች ዝርዝር (Material bill) አልተሰላም። እባክዎ ከላይ ያለውን አዝራር ይጫኑ።" : "No material quantities generated. Click the action button above to estimate."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* No items query fallback screen */}
              {appMode === "haymi-project" && projectData.mainWorks.every(d => d.subItems.filter(item => searchQuery === "" || item.desc.toLowerCase().includes(searchQuery.toLowerCase()) || item.item.toLowerCase().includes(searchQuery.toLowerCase())).length === 0) && (
                <div className="p-8 text-center bg-stone-50 text-stone-500 font-bold font-sans">
                  <AlertCircle className="w-8 h-8 text-[#F27D26] mx-auto mb-2 animate-bounce" />
                  <p>{tl.noResults}</p>
                </div>
              )}
            </div>

            {/* GRAND SUMMARY DISPLAY */}
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-[#141414] text-white p-4 md:p-6 shadow-[4px_4px_0px_#F27D26] divide-y-2 sm:divide-y-0 divide-stone-800">
              <div className="pb-3 sm:pb-0">
                <h4 className="text-xs tracking-wider uppercase opacity-75 font-mono text-stone-400 font-bold">
                  {tl.grandTotalLabel}
                </h4>
                <p className="text-[10px] text-stone-500 font-mono mt-1">
                  * Evaluated on standard Addis Ababa construction averages.
                </p>
              </div>
              <div className="text-right pt-3 sm:pt-0">
                <span className="text-2xl md:text-4xl font-black italic tracking-tight text-[#F27D26] block">
                  {formatVal(appMode === "haymi-project" 
                    ? getProjectGrandTotal()
                    : bqData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
                  )}
                </span>
                <span className="text-[9px] font-mono text-stone-400 opacity-60">
                  {lang === "am" ? "* የምንዛሬ ተመን በፕሮጀክት መግለጫ (Profile) ማስተካከያ ገጽ ላይ መለወጥ ይችላሉ" : "* Adjust exchange rates inside the Project Profile tab."}
                </span>
              </div>
            </div>

            </div>
          )}
        </section>

        {/* COLUMN 3: AI SURVEYOR ASSISTANT & CHAT REMEDIES */}
        {((appMode === "ai-vision") || (appMode === "haymi-project" && haymiSubTab === "sheet")) && (
          <aside className="lg:col-span-3 bg-white border-4 border-[#141414] p-4 shadow-[4px_4px_0px_#141414] flex flex-col h-full self-stretch justify-between min-h-[480px] print:hidden">
            <div>
              <div className="border-b-2 border-stone-100 pb-2.5 mb-3.5">
                <span className="bg-[#141414] text-white text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-widest inline-block mb-1">
                  AI Surveying Unit v3.5
                </span>
                <h4 className="font-black text-lg text-[#141414] uppercase tracking-tight font-display">
                  {tl.aiAsst}
                </h4>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  Optimize rates, ask about calculations, or query quantities using natural language prompts.
                </p>
              </div>

              {/* Chat List */}
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 border border-stone-200 p-2.5 bg-stone-50 min-h-[260px]">
                {chatHistory.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`p-3 text-[11px] leading-relaxed relative rounded-none ${
                      msg.sender === "bot" 
                        ? "bg-white border-l-4 border-[#F27D26] text-[#141414] font-sans border border-stone-200" 
                        : "bg-[#141414] text-white font-mono self-end border border-transparent"
                    }`}
                  >
                    <p className="font-extrabold uppercase text-[9px] tracking-widest opacity-60 mb-1">
                      {msg.sender === "bot" ? "AI Quantity Surveyor" : "Estimator Agent"}
                    </p>
                    <p className="break-words leading-normal font-medium">{msg.text}</p>
                    <span className="absolute bottom-1 right-2 text-[8px] opacity-40 font-mono">
                      {msg.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleChatSubmit} className="mt-4 border-t-2 border-[#141414] pt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={tl.editPrompt}
                  className="flex-1 p-2 border-2 border-[#141414] text-xs font-mono bg-[#ECEBE7] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#F27D26]"
                />
                <button 
                  type="submit"
                  className="bg-[#141414] hover:bg-[#F27D26] text-white hover:text-white px-3 py-2 transition-colors cursor-pointer border-2 border-transparent"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[8px] text-stone-500 font-mono mt-2 text-center uppercase tracking-widest">
                Directly connected to the Bole Tower 12 works spreadsheet state.
              </p>
            </form>
          </aside>
        )}

      </main>

      {/* COMPACT ARCHIGEN SYSTEM FOOTER */}
      <footer className="mt-8 border-t-2 border-[#141414] py-4 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono font-bold text-[#141414]">
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>EBCS-2 STRUCTURAL CODE COMPLIANCE MET</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-stone-900 rounded-none"></div>
            <span>HAYMI CAD INTEGRITY: 100% SECURE</span>
          </div>
        </div>
        <div className="text-right mt-2 sm:mt-0 uppercase tracking-widest">
          DESIGN CONCEPT: <span className="text-[#F27D26]">SWISS BRUTALIST GRID</span> | 2026 ARCHIGEN ESTIMATOR
        </div>
      </footer>

      {/* PRINT STYLINGS TO EXPORT ENTIRE SPREADSHEETS CLEANLY */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          header, nav, aside, section > div:first-child, .print\\:hidden, button, footer, select, input, form {
            display: none !important;
          }
          #print-area {
            border: 2px solid black !important;
            width: 100% !important;
            overflow: visible !important;
          }
          #print-area table {
            font-size: 9.5pt !important;
            border-collapse: collapse !important;
          }
          #print-area th, #print-area td {
            border: 1px solid black !important;
            padding: 4px !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
        }
      `}</style>

    </div>
  );
}
