import React, { useRef, useState } from "react";
import { ProjectBoQ, BQMainWork } from "../types";
import { Briefcase, Trash2, FolderOpen, Copy, Plus, FileSpreadsheet, FileUp, FileDown, CheckCircle2 } from "lucide-react";

interface ProjectListManagerProps {
  lang: "am" | "en";
  projectsList: ProjectBoQ[];
  activeProjId: string;
  onActivateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onCloneProject: (id: string) => void;
  onCreateNewProject: (name: string) => void;
  onImportProject: (imported: ProjectBoQ) => void;
  activeProject: ProjectBoQ;
}

export default function ProjectListManager({
  lang,
  projectsList,
  activeProjId,
  onActivateProject,
  onDeleteProject,
  onCloneProject,
  onCreateNewProject,
  onImportProject,
  activeProject,
}: ProjectListManagerProps) {
  const [newProjName, setNewProjName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    onCreateNewProject(newProjName.trim());
    setNewProjName("");
    setSuccessMsg(lang === "am" ? "አዲስ ፕሮጀክት በተሳካ ሁኔታ ተፈጥሯል!" : "New project folder created successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeProject, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeProject.projectName.replace(/\s+/g, "_")}_EBCS_BoQ_Backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as ProjectBoQ;
        if (parsed && typeof parsed.projectName === "string" && Array.isArray(parsed.mainWorks)) {
          // ensure a unique project id
          parsed.id = "proj_" + Date.now();
          onImportProject(parsed);
          setSuccessMsg(lang === "am" ? "የኮንትራት ባክአፕ በተሳካ ሁኔታ ገብቷል!" : "Project backup imported and loaded successfully!");
          setTimeout(() => setSuccessMsg(""), 3000);
        } else {
          alert(lang === "am" ? "ልክ ያልሆነ የፋይል ፎርማት። እባክዎ Archigen የጀነሬተር ፋይል ይጠቀሙ።" : "Invalid project structure. Please upload a standard ArchiGen JSON backup.");
        }
      } catch (err) {
        alert(lang === "am" ? "ፋይሉን ማንበብ አልተቻለም።" : "Error parsing backup file. Please ensure it is a valid JSON document.");
      }
    };
    reader.readAsText(file);
  };

  const getProjCost = (proj: ProjectBoQ) => {
    return proj.mainWorks.reduce((acc, div) => {
      return acc + div.subItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      
      {/* SUCCESS POPUP BANNER */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border-4 border-emerald-500 text-emerald-900 text-xs font-bold font-sans flex items-center gap-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 animate-bounce" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: PRIMARY PROFILE CARDS */}
        <div className="lg:col-span-8 bg-white border-4 border-[#141414] p-4 shadow-[4px_4px_0px_#141414] space-y-4">
          <div className="flex justify-between items-center border-b-2 pb-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#141414] flex items-center gap-1.5 font-display">
              📂 {lang === "am" ? "የተቀመጡ የእቅድ መግለጫዎች" : "My Stored Estimation Projects"}
            </span>
            <span className="bg-[#141414] text-white font-mono text-[9px] px-2 py-0.5 uppercase font-bold">
              {projectsList.length} PROJECTS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[460px] pr-1">
            {projectsList.map((proj) => {
              const isActive = activeProjId === proj.id;
              const totalCost = getProjCost(proj);
              const itemsCount = proj.mainWorks.reduce((sum, d) => sum + d.subItems.length, 0);

              return (
                <div 
                  key={proj.id}
                  className={`border-2 p-3.5 transition-all flex flex-col justify-between rounded-none space-y-3 relative ${
                    isActive 
                      ? "border-[#F27D26] bg-[#F27D26]/5 shadow-[3px_3px_0px_#F27D26]" 
                      : "border-stone-200 hover:border-[#141414] bg-white hover:shadow-[3px_3px_0px_#141414]"
                  }`}
                >
                  {isActive && (
                    <span className="absolute -top-2 px-1.5 py-0.5 right-3 text-[8px] bg-[#F27D26] text-white font-mono uppercase font-black tracking-wider">
                      {lang === "am" ? "ገባሪ (ACTIVE)" : "ACTIVE"}
                    </span>
                  )}

                  <div className="space-y-1">
                    <h3 className="font-black text-xs uppercase text-[#141414] py-0.5 pr-8 leading-tight">
                      💼 {proj.projectName}
                    </h3>
                    <p className="text-[10px] text-stone-500 font-bold truncate">
                      {lang === "am" ? "ደንበኛ፦ " : "Client: "} {proj.clientName || "Unknown Client"}
                    </p>
                    <p className="text-[9px] font-mono text-stone-400">
                      📅 {proj.location || "Addis Ababa"} | {proj.revisionNo || "Rev. 01"}
                    </p>
                  </div>

                  {/* PRICE INDICATORS */}
                  <div className="bg-stone-50 border border-stone-200 p-2 font-mono text-[10px]">
                    <div className="flex justify-between font-bold text-stone-600">
                      <span>{lang === "am" ? "የስራ መስመሮች (Rows):" : "Total Item Lines:"}</span>
                      <span className="text-[#141414]">{itemsCount}</span>
                    </div>
                    <div className="flex justify-between items-end border-t border-stone-150 mt-1 pt-1 font-extrabold text-[#141414]">
                      <span>{lang === "am" ? "ጠቅላላ ወጪ (Cost):" : "Total Value:"}</span>
                      <span className="text-[#F27D26] text-[12px] font-black">
                        {totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} ETB
                      </span>
                    </div>
                  </div>

                  {/* CONTROL TOOL ACTIONS */}
                  <div className="flex gap-2 pt-1">
                    {!isActive ? (
                      <button
                        onClick={() => onActivateProject(proj.id || "")}
                        className="flex-1 bg-[#141414] hover:bg-[#F27D26] text-white font-extrabold text-[10px] py-1.5 uppercase transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>{lang === "am" ? "ክፈት" : "Open"}</span>
                      </button>
                    ) : (
                      <span className="flex-1 bg-stone-100 text-[#141414] font-bold text-[10px] py-1.5 uppercase select-none text-center block">
                        ✓ Loaded
                      </span>
                    )}

                    <button
                      onClick={() => onCloneProject(proj.id || "")}
                      className="bg-stone-100 hover:bg-stone-200 text-[#141414] border border-stone-300 font-extrabold text-[10px] px-2 py-1.5 uppercase transition-colors cursor-pointer flex items-center"
                      title="Clone/Duplicate Project"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      disabled={projectsList.length <= 1}
                      onClick={() => onDeleteProject(proj.id || "")}
                      className={`font-extrabold text-[10px] px-2 py-1.5 uppercase transition-colors flex items-center ${
                        projectsList.length <= 1
                          ? "bg-stone-100 text-stone-300 cursor-not-allowed border-stone-200 border"
                          : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white cursor-pointer"
                      }`}
                      title="Delete Project Folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION BLOCK & COOPERATION BACKUP */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* CREATE NEW PROJECT */}
          <div className="bg-white border-4 border-[#141414] p-4 shadow-[4px_4px_0px_#141414] space-y-3">
            <h4 className="font-black text-xs text-[#141414] uppercase tracking-wider border-b pb-1.5 font-display flex items-center gap-1">
              <Plus className="w-4 h-4 text-[#F27D26]" />
              {lang === "am" ? "አዲስ ፕሮጀክት ፍጠር" : "Create New Project Template"}
            </h4>
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold uppercase text-stone-500 mb-1">
                  {lang === "am" ? "የፕሮጀክቱ ስም (New Project Title)" : "Project Name"}
                </label>
                <input
                  type="text"
                  required
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Bole commercial G+5 Building"
                  className="p-1 px-2 border-2 border-[#141414] bg-[#ECEBE7] focus:bg-white text-xs w-full focus:outline-none placeholder-stone-400 font-mono font-bold text-stone-900"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#141414] hover:bg-[#F27D26] text-white transition-all font-black text-xs py-2 uppercase cursor-pointer"
              >
                {lang === "am" ? "ባዶ ፎልደር ፍጠር (Create Blank BQ)" : "Initialize Project Folder"}
              </button>
            </form>
          </div>

          {/* BACKUP EXPORTER & IMPORTER ACCORDING TO REALISTIC SPECS */}
          <div className="bg-white border-4 border-[#141414] p-4 shadow-[4px_4px_0px_#141414] space-y-3">
            <h4 className="font-black text-xs text-[#141414] uppercase tracking-wider border-b pb-1.5 font-display">
              💾 {lang === "am" ? "የመረጃ ማስቀመጫ እና ማስተላለፊያ" : "Cloud Sync & JSON Backups"}
            </h4>

            <p className="text-[10px] leading-relaxed text-stone-600">
              {lang === "am"
                ? "ስራዎችን ወደ ሌላ ኮምፒውተር ለማዛወር ወይንም ባክአፕ ለማስቀመጥ ይህንን ምድብ ይጠቀሙ።"
                : "Secure local offline files. Share estimation worksheets by backing up projects into JSON documents or loading them back into database instantly."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {/* EXPORT BUTTON */}
              <button
                onClick={handleExportBackup}
                className="w-full bg-[#141414] hover:bg-amber-600 text-white font-extrabold text-[10px] py-2 uppercase cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <FileDown className="w-4 h-4" />
                <span>{lang === "am" ? "ባክአፕ አውርድ (Export JSON)" : "Download Backup"}</span>
              </button>

              {/* IMPORT TRIGER */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-stone-100 hover:bg-stone-200 border border-stone-300 text-[#141414] font-extrabold text-[10px] py-2 uppercase cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <FileUp className="w-4 h-4 text-[#F27D26]" />
                <span>{lang === "am" ? "ባክአፕ አስገባ (Import JSON)" : "Upload Backup"}</span>
              </button>
              
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleImportBackup}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
