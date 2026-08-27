import React, { useState, useEffect } from "react";

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 z-50 max-w-sm bg-black text-white p-4 rounded-2xl shadow-2xl border border-gray-800 flex items-center justify-between gap-3 animate-slide-up">
      <div className="flex items-center gap-3">
        <img src="https://download.logo.wine/logo/Uber/Uber-Logo.wine.png" alt="Uber" className="w-10 h-10 object-contain bg-white rounded-xl p-1" />
        <div>
          <h4 className="font-bold text-sm leading-tight">Install Uber App</h4>
          <p className="text-xs text-gray-400">Add to home screen for faster access</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="bg-white text-black text-xs font-bold px-3 py-2 rounded-xl hover:bg-gray-200 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          Install
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-gray-400 hover:text-white p-1 text-sm shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
