import React, { useState } from 'react';

export default function ImageBackground({ url }: { url: string }) {
  const [error, setError] = useState(false);

  // Se houver erro ou não tiver URL, mostra um fallback bonito
  if (error || !url) {
    return (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-indigo-900 to-black flex items-center justify-center">
        <div className="text-white/20 font-bold text-xs">BACKGROUND LOADING...</div>
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 10px)' }} 
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <img 
        src={url} 
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ imageRendering: 'pixelated' }}
        onError={() => setError(true)}
      />
      {/* Overlay para garantir legibilidade */}
      <div className="absolute inset-0 bg-black/40" /> 
    </div>
  );
}