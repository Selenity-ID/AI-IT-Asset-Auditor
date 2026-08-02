import React, { useState, useEffect } from 'react';
import { Lock, X, CheckCircle, ShieldAlert, ShieldCheck } from 'lucide-react';

interface AdminResetModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminResetModal({ onClose, onSuccess }: AdminResetModalProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    // Listen for OAuth messages from the popup window
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        setIsAuthenticating(false);
        setAdminEmail(event.data.email);
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        setIsAuthenticating(false);
        setError(event.data.error || 'No se pudo verificar la identidad.');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onClose]);

  const handleGoogleLogin = () => {
    setError(null);
    setIsAuthenticating(true);

    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      '/api/auth/google/login',
      'GoogleAuthPopup',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      setIsAuthenticating(false);
      setError('El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes para iniciar sesión con Google.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400 border border-blue-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Autenticación Administradora</h3>
              <p className="text-xs text-slate-400">Verificación mediante Google OAuth</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce mb-3" />
            <h4 className="font-bold text-slate-900 text-lg">¡Acceso Autorizado!</h4>
            <p className="text-xs text-slate-600 mt-1">
              Sesión verificada como <strong className="text-slate-800">{adminEmail}</strong>.
            </p>
            <p className="text-xs text-emerald-700 font-medium mt-2">
              Se ha restablecido el contador de pruebas a 0/5.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                Para garantizar la seguridad de tu portafolio, solo la cuenta de Google registrada como administradora puede autorizar el reinicio de los intentos.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isAuthenticating}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-3 shadow-xs transition-all hover:border-slate-400 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isAuthenticating ? 'Esperando inicio de sesión con Google...' : 'Iniciar Sesión con Google'}</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
