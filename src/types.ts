export interface BQItem {
  id: string;
  description: string;
  unit: "m³" | "m²" | "m" | "kg" | "Pcs" | "Ls" | "m2" | "m3" | "lm" | "No" | "ml" | "set" | string;
  quantity: number;
  unitPrice: number;
  remarks: string;
}

export interface BQData {
  divisionTitle: string;
  engineeringAssumptions: string[];
  items: BQItem[];
}

export interface BQSubItem {
  item: string;
  desc: string;
  unit: string;
  qty: number;
  price: number;
  amount: number;
  remarks?: string;
}

export interface BQMainWork {
  id: string;
  title: string;
  subItems: BQSubItem[];
}

export interface ProjectBoQ {
  id?: string;
  projectName: string;
  currency: string;
  mainWorks: BQMainWork[];
  clientName?: string;
  engineerName?: string;
  location?: string;
  dateCreated?: string;
  revisionNo?: string;
  contractorName?: string;
  totalFloorArea?: number;
}

export type EBCSDivisionCode = "substructure_excavation" | "substructure_concrete" | "superstructure_concrete" | "superstructure_masonry" | "finishing";

export interface DefaultPrices {
  excavation: number; // per m³
  leanConcrete: number; // per m²
  concreteC25: number; // per m³
  formwork: number; // per m²
  rebar: number; // per kg
  stoneMasonry: number; // per m³
  hcbWall150: number; // per m²
  hcbWall200: number; // per m²
  plastering: number; // per m²
  painting: number; // per m²
}

export interface SampleDrawing {
  id: string;
  name: string;
  nameAmh: string;
  imageUrl: string;
  mimeType: string;
  description: string;
  descriptionAmh: string;
  defaultDivision: EBCSDivisionCode;
  prices: Partial<DefaultPrices>;
  sampleBq: BQData; // fallbacks or initial values
}

export interface TakeoffItem {
  id: string;
  section: string;
  itemDescription: string;
  multiplier: number;
  length: number;
  width: number;
  height: number;
  outputQty: number;
  unit: string;
  formula: string;
}

export interface MaterialItem {
  name: string;
  nameAm: string;
  category: string;
  unit: string;
  quantity: number;
  rate: number;
  total: number;
}

