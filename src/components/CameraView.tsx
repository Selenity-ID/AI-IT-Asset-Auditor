import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw } from 'lucide-react';

interface CameraViewProps {
  onCapture: (base64Image: string) => void;
  isProcessing: boolean;
  attemptsLeft: number;
  maxAttempts: number;
  onResetAttempts?: () => void;
}

export function CameraView({ onCapture, isProcessing, attemptsLeft, maxAttempts, onResetAttempts }: CameraViewProps) {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    if (attemptsLeft <= 0) return;
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture, attemptsLeft]);

  const limitReached = attemptsLeft <= 0;

  return (
    <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-sm">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: 'environment' }}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm transition-opacity">
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {limitReached && (
        <div className="mt-4 w-full bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-xs flex flex-col items-center gap-2 text-center">
          <p className="font-medium">
            ⚠️ Has alcanzado el límite de {maxAttempts} auditorías de prueba para esta demo del portafolio.
          </p>
          {onResetAttempts && (
            <button
              onClick={onResetAttempts}
              className="text-xs text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
            >
              Reiniciar contador de pruebas
            </button>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          onClick={capture}
          disabled={isProcessing || limitReached}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Camera className="w-5 h-5" />
          {limitReached ? 'Límite alcanzado (0/5)' : 'Audit'}
        </button>
        <span className="text-xs text-gray-500 font-medium">
          Intentos disponibles: <strong className={attemptsLeft === 0 ? "text-red-600 font-bold" : "text-gray-700"}>{attemptsLeft} de {maxAttempts}</strong>
        </span>
      </div>
    </div>
  );
}
