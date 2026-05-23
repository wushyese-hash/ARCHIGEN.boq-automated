import React, { useState } from "react";
import { BQSubItem } from "../types";
import { Calculator, Sparkles, Plus, CheckCircle2 } from "lucide-react";

interface BbsVolumeCalculatorsProps {
  lang: "am" | "en";
  activeRates: {
    excavation: number;
    leanConcrete: number;
    concreteC25: number;
    formwork: number;
    rebar: number;
    stoneMasonry: number;
    hcbWall150: number;
    hcbWall200: number;
    plastering: number;
    painting: number;
  };
  divisions: Array<{ id: string; title: string }>;
  onAppendItem: (divId: string, item: BQSubItem) => void;
}

// Weight conversions conforming to EBCS standards
const REBAR_WEIGHTS: Record<string, { kgPerM: number; desc: string }> = {
  "Ø6": { kgPerM: 0.222, desc: "Ø6 Structural anchor wire / stirrups" },
  "Ø8": { kgPerM: 0.395, desc: "Ø8 Standard Column lateral stirrups" },
  "Ø10": { kgPerM: 0.617, desc: "Ø10 Light slab distribution / ties" },
  "Ø12": { kgPerM: 0.888, desc: "Ø12 Footing mesh / foundation beams" },
  "Ø14": { kgPerM: 1.208, desc: "Ø14 Heavy partition beams / columns" },
  "Ø16": { kgPerM: 1.578, desc: "Ø16 Main longitudinal columns (G+4 EBCS)" },
  "Ø20": { kgPerM: 2.466, desc: "Ø20 Heavy foundation high-load anchors" },
  "Ø24": { kgPerM: 3.551, desc: "Ø24 Heavy structural tie girders" },
  "Ø32": { kgPerM: 6.313, desc: "Ø32 Special pre-cast bridge blocks" },
};

export default function BbsVolumeCalculators({
  lang,
  activeRates,
  divisions,
  onAppendItem,
}: BbsVolumeCalculatorsProps) {
  // BBS States
  const [bbsMark, setBbsMark] = useState("C1 Column Main Rebar");
  const [bbsSize, setBbsSize] = useState("Ø16");
  const [bbsCount, setBbsCount] = useState(6); // columns
  const [bbsBars, setBbsBars] = useState(8); // bars per column
  const [bbsLength, setBbsLength] = useState(4.2); // cut length in meters
  const [bbsTargetDiv, setBbsTargetDiv] = useState("4"); // default division 4 (concrete)
  const [bbsSuccessMsg, setBbsSuccessMsg] = useState("");

  const selectedClass = REBAR_WEIGHTS[bbsSize] || { kgPerM: 1.578, desc: "Default Ø16" };
  const totalLinearMtrs = parseFloat((bbsCount * bbsBars * bbsLength).toFixed(2));
  const totalBbsWeightKg = parseFloat((totalLinearMtrs * selectedClass.kgPerM).toFixed(2));
  const bbsRate = activeRates.rebar || 145;
  const computedBbsCost = parseFloat((totalBbsWeightKg * bbsRate).toFixed(2));

  // Concrete Dimension States
  const [concreteLabel, setConcreteLabel] = useState("F1 Isolated Footing Pads");
  const [concreteTask, setConcreteTask] = useState<"excavation" | "lean" | "c25" | "masonry" | "hcb150" | "hcb200" | "plaster" | "paint">("c25");
  const [concreteCount, setConcreteCount] = useState(6);
  const [concreteLength, setConcreteLength] = useState(1.2);
  const [concreteWidth, setConcreteWidth] = useState(1.2);
  const [concreteHeight, setConcreteHeight] = useState(0.4);
  const [concreteTargetDiv, setConcreteTargetDiv] = useState("2"); // default division 2 (concrete)
  const [concreteSuccessMsg, setConcreteSuccessMsg] = useState("");

  // Auto assign unit rate
  const getTaskRateAndUnit = () => {
    switch (concreteTask) {
      case "excavation":
        return { rate: activeRates.excavation, unit: "m3", title: "Excavation Vol (ቁፋሮ)", titleAm: "ቁፋሮ ስራ" };
      case "lean":
        return { rate: activeRates.leanConcrete, unit: "m2", title: "Lean Concrete (ሊን ኮንክሪት)", titleAm: "ሊን ኮንክሪት" };
      case "c25":
        return { rate: activeRates.concreteC25, unit: "m3", title: "C-25 Concrete (ኮንክሪት)", titleAm: "ሲ-25 ኮንክሪት ስራ" };
      case "masonry":
        return { rate: activeRates.stoneMasonry, unit: "m3", title: "Stone Masonry Foundation (የድንጋይ መሠረት)", titleAm: "የመሠረት ድንጋይ ግንባታ" };
      case "hcb150":
        return { rate: activeRates.hcbWall150, unit: "m2", title: "15cm HCB Wall (ብሎኬት ግድግዳ)", titleAm: "15cm ብሎኬት ግንባታ" };
      case "hcb200":
        return { rate: activeRates.hcbWall200, unit: "m2", title: "20cm HCB Wall (ብሎኬት ግድግዳ)", titleAm: "20cm ብሎኬት ግንባታ" };
      case "plaster":
        return { rate: activeRates.plastering, unit: "m2", title: "Wall Plastering (ለጠፈ/ለሰነገ)", titleAm: "ባለ 2 እጅ ልስን ስራ" };
      case "paint":
        return { rate: activeRates.painting, unit: "m2", title: "Wall Painting (ቀለም ስራ)", titleAm: "ቀለም ስራ (3 እጅ)" };
      default:
        return { rate: activeRates.concreteC25, unit: "m3", title: "C-25 Concrete", titleAm: "ሲ-25 ኮንክሪት ስራ" };
    }
  };

  const { rate: taskRate, unit: taskUnit, title: taskTitle } = getTaskRateAndUnit();
  const calculatedSquareMtrs = parseFloat((concreteCount * concreteLength * concreteWidth).toFixed(2));
  const calculatedCubicMtrs = parseFloat((calculatedSquareMtrs * concreteHeight).toFixed(2));
  const activeQuantity = taskUnit === "m3" ? calculatedCubicMtrs : calculatedSquareMtrs;
  const computedConcreteCost = parseFloat((activeQuantity * taskRate).toFixed(2));

  const handleBbsSubmit = () => {
    const formattedItem: BQSubItem = {
      item: `BBS-${bbsSize}`,
      desc: lang === "am"
        ? `የአርማታ ብረት ስራ ${bbsSize} (${selectedClass.desc})፦ ለ '${bbsMark}' የተዘጋጀ መዋቅራዊ ብረት። ብዛት፦ ${bbsCount} መዋቅሮች * ${bbsBars} ዘንጎች * ${bbsLength}ሜ ርዝመት።`
        : `Deformed rebar ${bbsSize} reinforcement: Structural steel for '${bbsMark}' - fabricated, bent and wired according to EBCS. Details: ${bbsCount} members * ${bbsBars} bar count * ${bbsLength}m cut length.`,
      unit: "kg",
      qty: totalBbsWeightKg,
      price: bbsRate,
      amount: computedBbsCost,
      remarks: `Formula: ${bbsCount} * ${bbsBars} * ${bbsLength}m * ${selectedClass.kgPerM} kg/m = ${totalBbsWeightKg} kg`
    };

    onAppendItem(bbsTargetDiv, formattedItem);
    setBbsSuccessMsg(
      lang === "am"
        ? `ባለ ${bbsSize} ብረት (${totalBbsWeightKg} ኪሎ) በተሳካ ሁኔታ ወደ ክፍል ${bbsTargetDiv} ገብቷል!`
        : `Successfully appended ${totalBbsWeightKg} kg of ${bbsSize} steel to Division ${bbsTargetDiv}!`
    );
    setTimeout(() => setBbsSuccessMsg(""), 4000);
  };

  const handleConcreteSubmit = () => {
    const info = getTaskRateAndUnit();
    const localizedTaskTitle = lang === "am" ? info.titleAm : info.title;
    
    const formattedItem: BQSubItem = {
      item: `QUANT-${concreteTask.substring(0, 4).toUpperCase()}`,
      desc: lang === "am"
        ? `${localizedTaskTitle} ለ '${concreteLabel}' የተሰላ። መጠኖች፦ ${concreteCount} መዋቅር * ${concreteLength}ሜ * ${concreteWidth}ሜ ${taskUnit === "m3" ? `* ${concreteHeight}ሜ` : ""}።`
        : `${localizedTaskTitle} for '${concreteLabel}'. Calculation dimensions: ${concreteCount} units * ${concreteLength}m width * ${concreteWidth}m length ${taskUnit === "m3" ? `* ${concreteHeight}m depth` : ""}.`,
      unit: taskUnit,
      qty: activeQuantity,
      price: taskRate,
      amount: computedConcreteCost,
      remarks: taskUnit === "m3"
        ? `Formula: ${concreteCount} * ${concreteLength} * ${concreteWidth} * ${concreteHeight} = ${activeQuantity} m³`
        : `Formula: ${concreteCount} * ${concreteLength} * ${concreteWidth} = ${activeQuantity} m²`
    };

    onAppendItem(concreteTargetDiv, formattedItem);
    setConcreteSuccessMsg(
      lang === "am"
        ? `የ${localizedTaskTitle} መጠን (${activeQuantity} ${taskUnit}) በተሳካ ሁኔታ ወደ ክፍል ${concreteTargetDiv} ተጨምሯል!`
        : `Successfully appended ${activeQuantity} ${taskUnit} of ${localizedTaskTitle} to Division ${concreteTargetDiv}!`
    );
    setTimeout(() => setConcreteSuccessMsg(""), 4000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      
      {/* COLUMN 1: BAR BENDING SCHEDULE BBS CALCULATOR */}
      <div className="bg-white border-4 border-[#141414] p-4 shadow-[4px_4px_0px_#141414] space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#141414] flex items-center gap-1.5 font-display">
            ⛓️ {lang === "am" ? "የአርማታ ብረት መቁረጫና ክብደት ማስያ (BBS)" : "Bar Bending Weight Calculator"}
          </span>
          <span className="bg-[#F27D26] text-white font-mono text-[9px] px-1.5 py-0.5 uppercase font-bold">
            EBCS Weight Logs
          </span>
        </div>

        <p className="text-[11px] leading-relaxed text-stone-600 font-sans">
          {lang === "am"
            ? "የመሰረት የብረት ወንፊት፣ የአምድ ርዝመት ዘንጎች ወይም አጫጭር ማሰሪያዎች (Stirrups) ዲያሜትርና ርዝመት በማስገባት ትክክለኛውን ክብደት በኪሎግራም በEBCS-2 ስታንዳርድ መሰረት ለማስላት ይጠቀሙ።"
            : "Quickly compute exact reinforcement tonnages from structural details. Enter bar lengths and spacings to apply the standard metric mass per meter and generate row inputs."}
        </p>

        {bbsSuccessMsg && (
          <div className="p-2.5 bg-emerald-50 border-2 border-emerald-500 text-emerald-800 text-xs font-bold font-sans flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{bbsSuccessMsg}</span>
          </div>
        )}

        {/* INPUT LAYOUT */}
        <div className="space-y-3 font-mono text-xs text-stone-900">
          <div>
            <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
              {lang === "am" ? "የብረት ስራ መገለጫ ስም (Bar Mark / ID)" : "Bar Mark ID / Label"}
            </label>
            <input
              type="text"
              value={bbsMark}
              onChange={(e) => setBbsMark(e.target.value)}
              className="p-1 px-2 border-2 border-[#141414] bg-[#ECEBE7] focus:bg-white text-xs w-full font-bold focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                {lang === "am" ? "የብረት ርዝመት ዲያሜትር (Rebar Size)" : "Nominal Diameter"}
              </label>
              <select
                value={bbsSize}
                onChange={(e) => setBbsSize(e.target.value)}
                className="p-1 px-1 border-2 border-[#141414] bg-white text-xs w-full font-bold focus:outline-none"
              >
                {Object.keys(REBAR_WEIGHTS).map((size) => (
                  <option key={size} value={size}>
                    {size} ({REBAR_WEIGHTS[size].kgPerM} kg/m)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                {lang === "am" ? "የኮንክሪት መዋቅር ብዛት (Concrete Members)" : "No. of Members"}
              </label>
              <input
                type="number"
                min="1"
                value={bbsCount}
                onChange={(e) => setBbsCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="p-1 px-2 border-2 border-[#141414] bg-white text-xs w-full text-right font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                {lang === "am" ? "በአንድ መዋቅር ውስጥ ያሉ ዘንጎች" : "Bars in each Member"}
              </label>
              <input
                type="number"
                min="1"
                value={bbsBars}
                onChange={(e) => setBbsBars(Math.max(1, parseInt(e.target.value) || 1))}
                className="p-1 px-2 border-2 border-[#141414] bg-white text-xs w-full text-right font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                {lang === "am" ? "የአንድ ብረት ቆረጣ ርዝመት (ሜ)" : "Bar Cut Length (m)"}
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={bbsLength}
                onChange={(e) => setBbsLength(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                className="p-1 px-2 border-2 border-[#141414] bg-white text-xs w-full text-right font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-stone-100 p-2.5 border border-stone-300 font-mono text-[10px] text-stone-700 leading-normal space-y-1">
            <p className="font-extrabold uppercase text-[#F27D26] text-[9px] tracking-widest">{lang === "am" ? "★ የEBCS-2 ብረት ቀመር" : "★ EBCS-2 Conversion Formula"}</p>
            <p className="font-bold flex justify-between">
              <span>{lang === "am" ? "ጠቅላላ ርዝመት (Total Length):" : "Total Linear Length:"}</span>
              <span className="text-black font-extrabold">{totalLinearMtrs.toLocaleString()} m</span>
            </p>
            <p className="font-bold flex justify-between">
              <span>{lang === "am" ? "የክብደት የዕቃ ተመን (Unit Mass):" : "Unit Mass Ratio:"}</span>
              <span className="text-black font-extrabold">{selectedClass.kgPerM} kg/m ({bbsSize})</span>
            </p>
            <p className="font-bold border-t pt-1 border-stone-200 mt-1 text-[11px] text-[#141414] flex justify-between">
              <span>{lang === "am" ? "የተሰላ ጠቅላላ ክብደት (Total Weight):" : "Total Steel Mass:"}</span>
              <span className="font-black text-[#F27D26]">{totalBbsWeightKg.toLocaleString()} Kg</span>
            </p>
            <p className="font-bold flex justify-between">
              <span>{lang === "am" ? "የአንድ ኪሎ ዋጋ ተመን:" : "Steel Unit Rate:"}</span>
              <span className="text-stone-800">{bbsRate} ETB</span>
            </p>
            <p className="font-bold text-xs text-black pt-1 flex justify-between border-t border-dashed border-stone-300">
              <span>{lang === "am" ? "የብረት ጠቅላላ ግምት ዋጋ:" : "Estimated Steel Cost:"}</span>
              <span className="font-black">{(totalBbsWeightKg * bbsRate).toLocaleString(undefined, { maximumFractionDigits: 2 })} ETB</span>
            </p>
          </div>

          <div className="border-t pt-3 flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <label className="block text-[9px] font-bold uppercase text-stone-500 mb-0.5">
                {lang === "am" ? "የሚቀነበብበት የስራ ክፍል (Target Div)" : "Append Location"}
              </label>
              <select
                value={bbsTargetDiv}
                onChange={(e) => setBbsTargetDiv(e.target.value)}
                className="p-1 px-1 border-2 border-[#141414] bg-white text-xs w-full font-bold focus:outline-none"
              >
                {divisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.id}. {div.title.replace(/Division \d+\s*-\s*|ክፍል \d+\s*-\s*/, "")}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleBbsSubmit}
              type="button"
              className="sm:self-end bg-[#F27D26] hover:bg-[#141414] hover:text-[#f0efea] text-white py-1.5 px-3 border-2 border-transparent hover:border-[#F27D26] font-extrabold uppercase mt-1 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "am" ? "አስገባ (Add to BQ)" : "Add to BQ"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* COLUMN 2: CONCRETE VOLUME & MASONRY DIMENSION ESTIMATOR */}
      <div className="bg-white border-4 border-[#141414] p-4 shadow-[4px_4px_0px_#141414] space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#141414] flex items-center gap-1.5 font-display">
            🪨 {lang === "am" ? "የኮንክሪት መጠን እና የግድግዳ ስፋት ማስያ" : "Concrete Volume & Masonry Estimator"}
          </span>
          <span className="bg-[#141414] text-white font-mono text-[9px] px-1.5 py-0.5 uppercase font-bold">
            EBCS Vol Codes
          </span>
        </div>

        <p className="text-[11px] leading-relaxed text-stone-600 font-sans">
          {lang === "am"
            ? "የግንባታ መዋቅሮችን ርዝመት፣ ወርድ እና ቁመት በመስጠት ኮንክሪት በ m³ ወይም የብሎኬት ግድግዳና ลስን ስራዎችን በ ስኩዌር ሜትር (m²) በፍጥነት አስልተው ወደ BQ መዝገብ ያስገቡ።"
            : "Quickly scale areas or volumes of columns, slabs, footings or wall layers. Standard market unit rates will be dynamically applied for instant localized estimates."}
        </p>

        {concreteSuccessMsg && (
          <div className="p-2.5 bg-sky-50 border-2 border-sky-400 text-sky-800 text-xs font-bold font-sans flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{concreteSuccessMsg}</span>
          </div>
        )}

        {/* INPUT LAYOUT */}
        <div className="space-y-3 font-mono text-xs text-stone-900">
          <div>
            <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
              {lang === "am" ? "የሚሰላበት የስራ መለያ ስም (Member Label)" : "Concrete/Masonry member Name"}
            </label>
            <input
              type="text"
              value={concreteLabel}
              onChange={(e) => setConcreteLabel(e.target.value)}
              className="p-1 px-2 border-2 border-[#141414] bg-[#ECEBE7] focus:bg-white text-xs w-full font-bold focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                {lang === "am" ? "የስራ አይነት ምድብ (Structural Element Category)" : "Structural Task Estimator"}
              </label>
              <select
                value={concreteTask}
                onChange={(e) => {
                  const task = e.target.value as any;
                  setConcreteTask(task);
                  // Dynamic target assignment to simplify workflow
                  if (task === "excavation") setConcreteTargetDiv("1");
                  else if (task === "lean" || task === "masonry") setConcreteTargetDiv("2");
                  else if (task === "c25" && concreteTargetDiv === "1") setConcreteTargetDiv("2");
                  else if (task === "hcb150" || task === "hcb200") setConcreteTargetDiv("5");
                  else if (task === "plaster" || task === "paint") setConcreteTargetDiv("9");
                }}
                className="p-1 px-1 border-2 border-[#141414] bg-white text-xs w-full font-bold focus:outline-none"
              >
                <option value="excavation">{lang === "am" ? "የመሰረት አፈር ቁፋሮ (m³)" : "Excavation Works (m³)"}</option>
                <option value="lean">{lang === "am" ? "ሲ-15 ሊን ኮንክሪት ንጣፍ (m²)" : "C-15 Lean Concrete Screed (m²)"}</option>
                <option value="c25">{lang === "am" ? "ሲ-25 አርማታ ኮንክሪት ስራ (m³)" : "C-25 Structural Concrete (m³)"}</option>
                <option value="masonry">{lang === "am" ? "የመሰረት የድንጋይ ግንባታ (m³)" : "Stone Masonry Substructure (m³)"}</option>
                <option value="hcb150">{lang === "am" ? "የ15ሳሜ ብሎኬት ግድግዳ ግንባታ (m²)" : "HCB Wall 150mm Thickness (m²)"}</option>
                <option value="hcb200">{lang === "am" ? "የ20ሳሜ ብሎኬት ግድግዳ ግንባታ (m²)" : "HCB Wall 200mm Thickness (m²)"}</option>
                <option value="plaster">{lang === "am" ? "ለግድግዳ የሚለጠፍ ሲሚንቶ ልስን (m²)" : "Two-coat Wall Plastering (m²)"}</option>
                <option value="paint">{lang === "am" ? "የግድግዳ ቀለም ስራ (m²)" : "Emulsion Paint 3 Coats (m²)"}</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                {lang === "am" ? "የመዋቅር አባላት ብዛት (Count)" : "Multiplier / Count"}
              </label>
              <input
                type="number"
                min="1"
                value={concreteCount}
                onChange={(e) => setConcreteCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="p-1 px-2 border-2 border-[#141414] bg-white text-xs w-full text-right font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                {lang === "am" ? "ርዝመት (ሜ)" : "Length (m)"}
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={concreteLength}
                onChange={(e) => setConcreteLength(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                className="p-1 px-2 border-2 border-[#141414] bg-white text-xs w-full text-right focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                {lang === "am" ? "ወርድ (ሜ)" : "Width / Thickness (m)"}
              </label>
              <input
                type="number"
                step="0.05"
                min="0.01"
                value={concreteWidth}
                onChange={(e) => setConcreteWidth(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                className="p-1 px-2 border-2 border-[#141414] bg-white text-xs w-full text-right focus:outline-none"
              />
            </div>

            {taskUnit === "m3" && (
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#F27D26] mb-1">
                  {lang === "am" ? "ቁመት / ጥልቀት (ሜ)" : "Height / Depth (m)"}
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  value={concreteHeight}
                  onChange={(e) => setConcreteHeight(Math.max(0.05, parseFloat(e.target.value) || 0.05))}
                  className="p-1 px-2 border-2 border-[#F27D26] bg-white text-xs w-full text-right font-extrabold focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="bg-stone-50 p-2.5 border border-stone-200 font-mono text-[10px] text-stone-700 leading-normal space-y-1">
            <p className="font-extrabold uppercase text-[#141414] text-[9px] tracking-widest">{lang === "am" ? "★ የምህንድስና መነሻ ዝርዝር" : "★ Calculation Metrics"}</p>
            <p className="font-bold flex justify-between">
              <span>{lang === "am" ? "የተገኘው ጠቅላላ ግልጋሎት ስፋት:" : "Surface Footprint Area:"}</span>
              <span className="text-black font-extrabold">{calculatedSquareMtrs.toLocaleString()} m²</span>
            </p>
            {taskUnit === "m3" && (
              <p className="font-bold flex justify-between">
                <span>{lang === "am" ? "የተሰላው ጠቅላላ ይዘት (Volume):" : "Calculated Volume cubic:"}</span>
                <span className="text-black font-extrabold">{calculatedCubicMtrs.toLocaleString()} m³</span>
              </p>
            )}
            <p className="font-bold border-t pt-1 border-stone-200 mt-1 text-[11px] text-[#141414] flex justify-between">
              <span>{lang === "am" ? "የተመዘገበዉ ጠቋሚ ብዛት:" : "Active Output Qty:"}</span>
              <span className="font-black text-[#F27D26]">{activeQuantity.toLocaleString()} {taskUnit}</span>
            </p>
            <p className="font-bold flex justify-between">
              <span>{lang === "am" ? "ለመደብ የተቀመጠ የገበያ ተመን:" : "Standard Rate (Index):"}</span>
              <span className="text-stone-800">{taskRate.toLocaleString()} ETB / {taskUnit}</span>
            </p>
            <p className="font-bold text-xs text-black pt-1 flex justify-between border-t border-dashed border-stone-300">
              <span>{lang === "am" ? "ጠቅላላ የተገመተው የግንባታ ወጪ:" : "Total Computed Cost:"}</span>
              <span className="font-black">{(activeQuantity * taskRate).toLocaleString(undefined, { maximumFractionDigits: 2 })} ETB</span>
            </p>
          </div>

          <div className="border-t pt-3 flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <label className="block text-[9px] font-bold uppercase text-stone-500 mb-0.5">
                {lang === "am" ? "የሚቀነበብበት የስራ ክፍል (Target Div)" : "Append Location"}
              </label>
              <select
                value={concreteTargetDiv}
                onChange={(e) => setConcreteTargetDiv(e.target.value)}
                className="p-1 px-1 border-2 border-[#141414] bg-white text-xs w-full font-bold focus:outline-none"
              >
                {divisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.id}. {div.title.replace(/Division \d+\s*-\s*|ክፍል \d+\s*-\s*/, "")}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleConcreteSubmit}
              type="button"
              className="sm:self-end bg-[#141414] hover:bg-[#F27D26] hover:text-white text-[#f0efea] py-1.5 px-3 border-2 border-transparent hover:border-[#F27D26] font-extrabold uppercase mt-1 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "am" ? "አስገባ (Add to BQ)" : "Add to BQ"}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
