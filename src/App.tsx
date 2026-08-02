import React, { useState } from 'react';
import { CameraView } from './components/CameraView';
import { AssetTable } from './components/AssetTable';
import { AssetForm } from './components/AssetForm';
import { ItamReport } from './components/ItamReport';
import { AdminResetModal } from './components/AdminResetModal';
import { analyzeHardwareImage, generateITAMReport } from './lib/gemini';
import { AssetItem, VisionExtraction } from './types';
import { Scan, ShieldCheck } from 'lucide-react';

const MAX_ATTEMPTS = 5;

export default function App() {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentExtraction, setCurrentExtraction] = useState<VisionExtraction | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const [attemptsUsed, setAttemptsUsed] = useState<number>(() => {
    const saved = localStorage.getItem('itam_audit_attempts');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);

  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - attemptsUsed);

  const handleCapture = async (base64Image: string) => {
    if (attemptsLeft <= 0) {
      alert(`Has alcanzado el límite de ${MAX_ATTEMPTS} pruebas para la demostración de esta aplicación.`);
      return;
    }

    setIsProcessing(true);
    setCurrentExtraction(null);
    try {
      const extraction = await analyzeHardwareImage(base64Image);
      
      // Increment attempt counter upon successful API call
      const newAttempts = attemptsUsed + 1;
      setAttemptsUsed(newAttempts);
      localStorage.setItem('itam_audit_attempts', String(newAttempts));

      // Check for duplicate serial before showing form initially
      if (extraction.serial) {
        const isDuplicate = assets.some(a => a.serial.toLowerCase() === extraction.serial?.toLowerCase());
        if (isDuplicate) {
          alert(`El Serial / Service Tag "${extraction.serial}" ya está registrado en el inventario.`);
          setIsProcessing(false);
          return;
        }
      }
      setCurrentExtraction(extraction);
    } catch (e) {
      alert("Error procesando la imagen. Intenta de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAttemptsConfirmed = () => {
    setAttemptsUsed(0);
    localStorage.setItem('itam_audit_attempts', '0');
  };

  const handleConfirmAsset = (assetData: Omit<AssetItem, 'id' | 'timestamp'>) => {
    // Re-check duplicate on submit
    const isDuplicate = assets.some(a => a.serial.toLowerCase() === assetData.serial.toLowerCase());
    if (isDuplicate) {
        alert(`El Serial / Service Tag "${assetData.serial}" ya está registrado en el inventario.`);
        return;
    }
    
    const newAsset: AssetItem = {
      ...assetData,
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString(),
    };
    
    setAssets(prev => [newAsset, ...prev]);
    setCurrentExtraction(null);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateITAMReport(assets);
      setReportContent(report);
    } catch (e) {
      alert("Error generando el informe.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none text-gray-900">Vision ITAM</h1>
              <p className="text-xs text-gray-500 font-medium mt-1">Audit Assets via AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border ${attemptsLeft === 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
              <span className={`w-2 h-2 rounded-full ${attemptsLeft === 0 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`} />
              Pruebas Demo: {attemptsUsed}/{MAX_ATTEMPTS}
            </div>
            <button
              onClick={() => setShowAdminModal(true)}
              title="Acceso de Administrador (Selene Jiménez)"
              className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 font-medium cursor-pointer border border-gray-200 px-2.5 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full pb-8">
          
          {/* Left Column: Camera and AI Form */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">1. Capturar Dispositivo</h2>
              <CameraView 
                onCapture={handleCapture} 
                isProcessing={isProcessing}
                attemptsLeft={attemptsLeft}
                maxAttempts={MAX_ATTEMPTS}
                onResetAttempts={() => setShowAdminModal(true)}
              />
            </div>
            
            {currentExtraction && (
              <div className="animate-in slide-in-from-bottom-4 duration-300">
                <AssetForm 
                  extraction={currentExtraction} 
                  onConfirm={handleConfirmAsset}
                  onCancel={() => setCurrentExtraction(null)}
                />
              </div>
            )}
          </div>

          {/* Right Column: Inventory Table */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-0">
             <div className="flex-1 min-h-0">
                <AssetTable 
                  assets={assets}
                  onGenerateReport={handleGenerateReport}
                  isGeneratingReport={isGeneratingReport}
                />
             </div>
          </div>
        </div>
      </main>

      {reportContent && (
        <ItamReport 
          reportContent={reportContent} 
          onClose={() => setReportContent(null)} 
        />
      )}

      {showAdminModal && (
        <AdminResetModal
          onClose={() => setShowAdminModal(false)}
          onSuccess={handleResetAttemptsConfirmed}
        />
      )}
    </div>
  );
}
