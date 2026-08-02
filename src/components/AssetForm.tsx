import React, { useState, useEffect } from 'react';
import { VisionExtraction, AssetItem } from '../types';
import { Check, AlertCircle, X } from 'lucide-react';

interface AssetFormProps {
  extraction: VisionExtraction;
  onConfirm: (asset: Omit<AssetItem, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
}

export function AssetForm({ extraction, onConfirm, onCancel }: AssetFormProps) {
  const [serial, setSerial] = useState(extraction.serial || '');
  const [category, setCategory] = useState(extraction.category || '');
  const [manufacturer, setManufacturer] = useState(extraction.manufacturer || '');
  const [model, setModel] = useState(extraction.model || '');
  const [modelNumber, setModelNumber] = useState(extraction.modelNumber || '');
  const [state, setState] = useState<AssetItem['state']>('Operativo');
  const [location, setLocation] = useState('HQ-Main');

  useEffect(() => {
    setSerial(extraction.serial || '');
    setCategory(extraction.category || '');
    setManufacturer(extraction.manufacturer || '');
    setModel(extraction.model || '');
    setModelNumber(extraction.modelNumber || '');
  }, [extraction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial) {
      alert("El Serial / Service Tag es obligatorio.");
      return;
    }
    onConfirm({
      serial,
      category,
      manufacturer,
      model,
      modelNumber,
      state,
      location,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-4">
      <div className="bg-blue-50 border-b border-blue-100 p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Validación de Activo</h3>
            {extraction.needsClarification && (
              <p className="text-sm text-blue-700 mt-1">{extraction.messageToUser}</p>
            )}
            {!extraction.needsClarification && (
              <p className="text-sm text-blue-700 mt-1">
                He procesado la imagen. Por favor confirma los datos e indica el estado del equipo.
              </p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serial / Service Tag <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="Ej. ABC123XYZ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="Ej. Estación de trabajo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fabricante</label>
            <input
              type="text"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="Ej. Dell"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="Ej. XPS 15"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Modelo</label>
            <input
              type="text"
              value={modelNumber}
              onChange={(e) => setModelNumber(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="Ej. 9500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="Ej. Oficina 101"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado del Equipo <span className="text-red-500">*</span></label>
          <div className="flex gap-3">
            {(['Operativo', 'Dañado', 'Obsoleto'] as const).map((s) => (
              <label key={s} className={`flex-1 cursor-pointer rounded-md border ${state === s ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'} p-3 flex items-center justify-center transition-all`}>
                <input
                  type="radio"
                  name="state"
                  value={s}
                  checked={state === s}
                  onChange={(e) => setState(e.target.value as any)}
                  className="sr-only"
                />
                <span className={`text-sm font-medium ${state === s ? 'text-blue-900' : 'text-gray-700'}`}>{s}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            <Check className="w-4 h-4" />
            Confirmar y Registrar
          </button>
        </div>
      </form>
    </div>
  );
}
