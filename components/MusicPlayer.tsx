import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { RetroButton, THEME } from './RetroUtils';

const DEFAULT_MUSIC_URL = 'https://www.youtube.com/watch?v=p7DVatZamOY';

// Workaround for ReactPlayer type issues
const SafeReactPlayer = ReactPlayer as any;

interface MusicPlayerProps {
  themeMode: 'mario' | 'minimalist' | 'neutral';
  neutralPalette?: 'classic' | 'warm' | 'cool' | 'dark';
}

export default function MusicPlayer({ themeMode , neutralPalette = 'classic' }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [musicUrl, setMusicUrl] = useState(DEFAULT_MUSIC_URL);
  const [inputUrl, setInputUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true); // Começa minimizado
  const [showPopup, setShowPopup] = useState(false);
  const playerRef = useRef<any>(null);

  const isMinimalist = themeMode === 'minimalist';
  const isNeutral = themeMode === 'neutral';

  // Carregar música e volume salvos ao iniciar (via localStorage)
  useEffect(() => {
    try {
      const savedUrl = localStorage.getItem('music:url');
      if (savedUrl) {
        setMusicUrl(savedUrl);
      }

      const savedVolume = localStorage.getItem('music:volume');
      if (savedVolume) {
        setVolume(Number(savedVolume));
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }

    setTimeout(() => setShowPopup(true), 1000);
  }, []);

  const handleUrlChange = () => {
    if (inputUrl.trim() && ReactPlayer.canPlay(inputUrl)) {
      setMusicUrl(inputUrl);
      try {
        localStorage.setItem('music:url', inputUrl);
      } catch (error) {
        console.log('Failed to save music URL:', error);
      }
      setInputUrl('');
      setShowSettings(false);
      playSound('powerup');
    }
  };

  const resetToDefault = () => {
    setMusicUrl(DEFAULT_MUSIC_URL);
    try {
      localStorage.removeItem('music:url');
    } catch (error) {
      console.log('Failed to reset URL:', error);
    }
    setShowSettings(false);
    playSound('coin');
  };

  const handleActivateMusic = () => {
    setIsPlaying(true);
    setIsMinimized(true);
    setShowPopup(false);
    playSound('powerup');
  };

  const handleDeclineMusic = () => {
    setShowPopup(false);
    playSound('coin');
  };

  const playSound = (type: 'coin' | 'jump' | 'powerup') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'coin') {
      oscillator.frequency.setValueAtTime(988, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1319, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } else if (type === 'jump') {
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } else if (type === 'powerup') {
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  // Funções de controle de volume
  const increaseVolume = () => {
    const newVolume = Math.min(1, volume + 0.1);
    setVolume(newVolume);
    try {
      localStorage.setItem('music:volume', newVolume.toString());
    } catch (error) {
      console.log('Failed to save volume:', error);
    }
    playSound('coin');
  };

  const decreaseVolume = () => {
    const newVolume = Math.max(0, volume - 0.1);
    setVolume(newVolume);
    try {
      localStorage.setItem('music:volume', newVolume.toString());
    } catch (error) {
      console.log('Failed to save volume:', error);
    }
    playSound('coin');
  };

  // Cores baseadas no tema
  const getPopupColors = () => {
    if (isMinimalist) {
      return {
        bg: '#000',
        border: '#FFF',
        shadow: '8px 8px 0px #FFF',
        headerBg: '#000',
        headerBorder: '#FFF',
        text: '#FFF'
      };
    } else if (isNeutral) {
      return {
        bg: '#F5F5F5',
        border: '#808080',
        shadow: '8px 8px 0px rgba(0,0,0,0.1)',
        headerBg: '#D0D0D0',
        headerBorder: '#808080',
        text: '#404040'
      };
    } else {
      return {
        bg: '#FFFFCE',
        border: '#000',
        shadow: '8px 8px 0px rgba(0,0,0,0.5)',
        headerBg: '#F8D878',
        headerBorder: '#000',
        text: '#000'
      };
    }
  };

  const getBlockColors = () => {
    if (isMinimalist) {
      return {
        bg: '#000',
        border: '#FFF',
        icon: '#FFF'
      };
    } else if (isNeutral) {
      return {
        bg: '#90B090',
        border: '#404040',
        icon: '#404040'
      };
    } else {
      return {
        bg: '#EAB308',
        border: '#000',
        icon: '#000'
      };
    }
  };

  const getPlayerColors = () => {
    if (isMinimalist) {
      return {
        mainBg: '#000',
        mainBorder: '#FFF',
        shadow: 'bg-white',
        innerBorder: 'border-white',
        panelBg: '#000',
        panelBorder: '#FFF',
        text: '#FFF',
        textGlow: 'none',
        ledOn: 'bg-white animate-pulse border-white',
        ledOff: 'bg-black border-white',
        ledGlow: '0 0 8px #FFF',
        button: 'bg-black border-white hover:bg-white hover:text-black',
        playBg: 'bg-white border-black',
        pauseBg: 'bg-black border-white',
        playIcon: 'border-l-black',
        pauseIcon: 'bg-white border-white',
        barFilled: 'bg-white border-white',
        barEmpty: 'bg-black border-white',
        visualizerFilled: 'bg-white border-black',
        visualizerEmpty: 'bg-gray-800 border-white'
      };
    } else if (isNeutral) {
      return {
        mainBg: '#D0D0D0',
        mainBorder: '#404040',
        shadow: 'bg-gray-400',
        innerBorder: 'border-gray-500',
        panelBg: '#808080',
        panelBorder: '#404040',
        text: '#404040',
        textGlow: 'none',
        ledOn: 'bg-green-600 animate-pulse border-black',
        ledOff: 'bg-red-800 border-black',
        ledGlow: '0 0 8px #10b981',
        button: 'bg-gray-600 border-black hover:bg-gray-500',
        playBg: 'bg-red-600 border-black',
        pauseBg: 'bg-red-500 border-black',
        playIcon: 'border-l-white',
        pauseIcon: 'bg-white border-black',
        barFilled: 'bg-green-600 border-black',
        barEmpty: 'bg-gray-400 border-black',
        visualizerFilled: 'bg-green-600 border-black',
        visualizerEmpty: 'bg-gray-500 border-black'
      };
    } else {
      return {
        mainBg: '#D1D5DB',
        mainBorder: '#000',
        shadow: 'bg-black/50',
        innerBorder: 'border-gray-500',
        panelBg: '#000',
        panelBorder: '#FFF',
        text: '#4ade80',
        textGlow: '0 0 4px #4ade80',
        ledOn: 'bg-green-400 animate-pulse border-black',
        ledOff: 'bg-red-600 border-black',
        ledGlow: '0 0 8px #4ade80',
        button: 'bg-gray-600 border-black hover:bg-gray-500',
        playBg: 'bg-red-600 border-black',
        pauseBg: 'bg-red-500 border-black',
        playIcon: 'border-l-white',
        pauseIcon: 'bg-white border-black',
        barFilled: 'bg-green-400 border-black',
        barEmpty: 'bg-gray-600 border-black',
        visualizerFilled: 'bg-green-400 border-black',
        visualizerEmpty: 'bg-gray-600 border-black'
      };
    }
  };

  const popupColors = getPopupColors();
  const blockColors = getBlockColors();
  const playerColors = getPlayerColors();

  // Renderização condicional
  if (isMinimized) {
    return (
      <>
        {/* Player invisível - SEMPRE MONTADO */}
        <div className="hidden">
          <SafeReactPlayer
            ref={playerRef}
            url={musicUrl}
            playing={isPlaying}
            volume={volume}
            loop
            width="0"
            height="0"
          />
        </div>

        {/* Popup Inicial */}
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
            <div className="relative w-[90%] max-w-[450px]">
              {/* Caixa Principal */}
              <div 
                className="relative p-1"
                style={{
                  backgroundColor: popupColors.bg, 
                  border: `4px solid ${popupColors.border}`,
                  boxShadow: popupColors.shadow,
                }}
              >
                 {/* Header */}
                 <div className="border-b-4 p-4 text-center" 
                      style={{ 
                          backgroundColor: popupColors.headerBg,
                          borderColor: popupColors.headerBorder
                      }}>
                    <h2 
                        className="text-2xl md:text-3xl tracking-wider font-bold"
                        style={{ 
                            fontFamily: THEME.font, 
                            textShadow: isMinimalist || isNeutral ? 'none' : '2px 2px 0 rgba(255,255,255,0.5)',
                            color: popupColors.text
                        }}
                    >
                        ♫ MUSIC ♫
                    </h2>
                 </div>

                 {/* Conteúdo */}
                 <div className="p-8 flex flex-col items-center gap-8">
                    
                    {/* Ícone Note Block Animado */}
                    <div className="relative group transform scale-125">
                        <div className="w-16 h-16 border-4 flex items-center justify-center animate-bounce"
                             style={{
                                 backgroundColor: popupColors.bg,
                                 borderColor: popupColors.border,
                                 boxShadow: isMinimalist ? '4px 4px 0 #FFF' : (isNeutral ? '4px 4px 0 rgba(0,0,0,0.1)' : '4px 4px 0 rgba(0,0,0,0.2)')
                             }}>
                             {/* Nota Musical Pixelada */}
                             <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ color: popupColors.text }}>
                                <path d="M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17C6 19.21 7.79 21 10 21C12.21 21 14 19.21 14 17V7H18V3H12Z" />
                             </svg>
                        </div>
                    </div>

                    <p className="text-center text-xs md:text-sm leading-relaxed" style={{ fontFamily: THEME.font, color: popupColors.text, lineHeight: '1.6' }}>
                        ENABLE BACKGROUND MUSIC?
                    </p>

                    <div className="flex gap-6 w-full justify-center">
                        <RetroButton onClick={handleActivateMusic} colorType="green" size="md" title="Yes" themeMode={themeMode}
                neutralPalette={neutralPalette}
            >
                            YES
                        </RetroButton>
                        <RetroButton onClick={handleDeclineMusic} colorType="red" size="md" title="No" themeMode={themeMode}
                neutralPalette={neutralPalette}
            >
                            NO
                        </RetroButton>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Botão minimizado - Bloco de Pergunta do Mario */}
        <div className="fixed bottom-6 left-6 z-30">
          <button
            onClick={() => {
              setIsMinimized(false);
              playSound('jump');
            }}
            className="group relative"
            title="Abrir Music Player"
          >
            {/* Sombra pixelada */}
            <div className={`absolute bottom-0 left-1 w-16 h-16 ${isMinimalist || isNeutral ? blockColors.border : 'bg-black/40'}`} style={{ transform: isMinimalist || isNeutral ? 'translate(4px, 4px)' : undefined, backgroundColor: isMinimalist || isNeutral ? blockColors.border : undefined }} />
            
            {/* Bloco principal - estilo bloco de pergunta */}
            <div className="relative w-16 h-16 transform transition-transform group-hover:scale-110 group-hover:-translate-y-1">
              {/* Fundo amarelo pixelado */}
              <div className="absolute inset-0 border-4"
                   style={{
                       backgroundColor: blockColors.bg,
                       borderColor: blockColors.border
                   }}>
                
                {/* Detalhes internos (somente se não minimalista/neutral) */}
                {!isMinimalist && !isNeutral && (
                    <>
                        <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-300" />
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-yellow-300" />
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-700" />
                        <div className="absolute top-0 right-0 bottom-0 w-1 bg-yellow-700" />
                    </>
                )}
                
                {/* Símbolo de interrogação ou nota musical */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {isPlaying ? (
                    // Nota musical pixelada
                    <div className="relative">
                      <div className={`w-2 h-8 absolute bottom-2 left-3`} style={{ backgroundColor: blockColors.icon }} />
                      <div className={`w-4 h-4 rounded-full absolute bottom-0 left-2`} style={{ backgroundColor: blockColors.icon }} />
                      <div className={`w-3 h-2 absolute top-0 left-4`} style={{ backgroundColor: blockColors.icon }} />
                      {/* Ondas sonoras */}
                      <div className="absolute -right-4 top-2 flex gap-1">
                        <div className={`w-1 animate-pulse`} style={{ height: '4px', backgroundColor: blockColors.icon }} />
                        <div className={`w-1 animate-pulse`} style={{ height: '6px', animationDelay: '0.1s', backgroundColor: blockColors.icon }} />
                        <div className={`w-1 animate-pulse`} style={{ height: '4px', animationDelay: '0.2s', backgroundColor: blockColors.icon }} />
                      </div>
                    </div>
                  ) : (
                    // Interrogação pixelada
                    <div className={`text-3xl font-bold`} style={{ fontFamily: '"Press Start 2P", cursive', color: blockColors.icon }}>
                      ?
                    </div>
                  )}
                </div>

                {!isMinimalist && !isNeutral && (
                    <>
                        <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-700" />
                        <div className="absolute top-2 right-2 w-1 h-1 bg-yellow-700" />
                        <div className="absolute bottom-2 left-2 w-1 h-1 bg-yellow-700" />
                        <div className="absolute bottom-2 right-2 w-1 h-1 bg-yellow-700" />
                    </>
                )}
              </div>
            </div>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Player invisível - SEMPRE MONTADO */}
      <div className="hidden">
        <SafeReactPlayer
          ref={playerRef}
          url={musicUrl}
          playing={isPlaying}
          volume={volume}
          loop
          width="0"
          height="0"
        />
      </div>

    <div className="fixed bottom-6 left-6 z-30">
      {/* Container principal estilo NES/SNES */}
      <div className="relative">
        {/* Sombra pixelada */}
        <div className={`absolute bottom-0 left-2 w-full h-full transform translate-y-1 ${playerColors.shadow}`} />
        
        {/* Player Box - Estilo console retrô */}
        <div className="relative border-4 p-1"
             style={{ 
                 imageRendering: 'pixelated',
                 backgroundColor: playerColors.mainBg,
                 borderColor: playerColors.mainBorder
             }}>
          
          {/* Borda interna */}
          <div className={`p-1 border-2 ${playerColors.innerBorder}`} style={{ backgroundColor: playerColors.mainBg }}>
            
            {/* Área principal */}
            <div className={`p-3 border-2 ${playerColors.innerBorder}`} style={{ backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#C0C0C0' : '#E5E7EB') }}>
              
              {/* Header pixelado */}
              <div className="p-2 mb-3" style={{ backgroundColor: playerColors.panelBg, border: `2px solid ${playerColors.panelBorder}` }}>
                <div className="flex items-center justify-between">
                  {/* Título com LED piscante */}
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 border-2 ${isPlaying ? playerColors.ledOn : playerColors.ledOff}`} style={{ boxShadow: isPlaying ? playerColors.ledGlow : 'none' }} />
                    <span className="text-[10px]" 
                          style={{ 
                              fontFamily: '"Press Start 2P", cursive', 
                              color: playerColors.text,
                              textShadow: playerColors.textGlow
                          }}>
                      MUSIC-BOX
                    </span>
                  </div>
                  
                  {/* Botões de controle */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setShowSettings(!showSettings);
                        playSound('coin');
                      }}
                      className={`w-6 h-6 border-2 flex items-center justify-center transition-all hover:-translate-y-0.5 ${playerColors.button}`}
                      title="Configurações"
                    >
                      <div className={`text-[10px]`} style={{ color: isMinimalist ? 'inherit' : (isNeutral ? '#404040' : '#fbbf24') }}>⚙</div>
                    </button>
                    <button
                      onClick={() => {
                        setIsMinimized(true);
                        playSound('jump');
                      }}
                      className={`w-6 h-6 border-2 flex items-center justify-center transition-all hover:-translate-y-0.5 ${playerColors.button}`}
                      title="Fechar (minimizar)"
                    >
                      <div className={`text-[10px]`} style={{ color: playerColors.text }}>−</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Painel de configurações */}
              {showSettings && (
                <div className="mb-3 p-2" style={{ backgroundColor: playerColors.panelBg, border: `2px solid ${playerColors.panelBorder}` }}>
                  <div className="text-[8px] mb-2" 
                       style={{ fontFamily: '"Press Start 2P", cursive', color: playerColors.text }}>
                    TROCAR URL:
                  </div>
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="YouTube URL..."
                    className="w-full px-2 py-1 text-[8px] border-2 focus:outline-none mb-1"
                    style={{ 
                        fontFamily: 'monospace',
                        backgroundColor: playerColors.panelBg,
                        color: playerColors.text,
                        borderColor: playerColors.panelBorder
                    }}
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={handleUrlChange}
                      className={`flex-1 px-2 py-1 text-[8px] border-2 transition-all hover:-translate-y-0.5`}
                      style={{ 
                          fontFamily: '"Press Start 2P", cursive',
                          backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#10b981' : '#16a34a'),
                          borderColor: isMinimalist ? '#FFF' : '#000',
                          color: isMinimalist ? '#FFF' : '#FFF'
                      }}
                    >
                      OK
                    </button>
                    <button
                      onClick={resetToDefault}
                      className={`flex-1 px-2 py-1 text-[8px] border-2 transition-all hover:-translate-y-0.5`}
                      style={{ 
                          fontFamily: '"Press Start 2P", cursive',
                          backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#3b82f6' : '#2563eb'),
                          borderColor: isMinimalist ? '#FFF' : '#000',
                          color: isMinimalist ? '#FFF' : '#FFF'
                      }}
                    >
                      RESET
                    </button>
                  </div>
                </div>
              )}

              {/* Display digital retro */}
              <div className="p-2 mb-3" style={{ backgroundColor: playerColors.panelBg, border: `2px solid ${playerColors.panelBorder}` }}>
                <div className="flex items-center gap-3">
                  {/* Botão Play/Pause estilo arcade */}
                  <button
                    onClick={() => {
                      setIsPlaying(!isPlaying);
                      playSound('coin');
                    }}
                    className="group relative flex-shrink-0"
                  >
                    {/* Sombra do botão */}
                    <div className={`absolute bottom-0 left-1 w-12 h-12 transform translate-y-1`} style={{ backgroundColor: isMinimalist ? '#FFF' : (isNeutral ? '#404040' : '#000') }} />
                    
                    {/* Botão principal */}
                    <div className={`relative w-12 h-12 border-4 transform transition-all group-hover:-translate-y-1 group-active:translate-y-0 ${
                      isPlaying ? playerColors.pauseBg : playerColors.playBg
                    }`}>
                      {/* Ícone */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {isPlaying ? (
                          <div className="flex gap-1">
                            <div className={`w-2 h-6 border ${playerColors.pauseIcon}`} />
                            <div className={`w-2 h-6 border ${playerColors.pauseIcon}`} />
                          </div>
                        ) : (
                          <div className={`w-0 h-0 border-l-[10px] border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1 ${playerColors.playIcon}`} />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Visualizador pixelado retro */}
                  <div className={`flex-1 flex items-end gap-1 h-12 p-1 border-2`} style={{ backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#808080' : '#1f2937'), borderColor: isMinimalist ? '#FFF' : (isNeutral ? '#404040' : '#111827') }}>
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1"
                        style={{
                          height: isPlaying ? `${30 + Math.random() * 70}%` : '20%',
                          transition: 'height 0.3s ease',
                        }}
                      >
                        <div className={`w-full h-full border-2 ${
                          isPlaying ? playerColors.visualizerFilled : playerColors.visualizerEmpty
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Controle de volume pixelado */}
              <div className={`p-2 border-2`} style={{ backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#909090' : '#374151'), borderColor: isMinimalist ? '#FFF' : '#000' }}>
                <div className="flex items-center gap-2 mb-1">
                  {/* Botão Diminuir Volume */}
                  <button
                    onClick={decreaseVolume}
                    disabled={volume <= 0}
                    className="group relative flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Diminuir Volume"
                  >
                    <div className={`absolute bottom-0 left-0.5 w-6 h-6 transform translate-y-0.5`} style={{ backgroundColor: isMinimalist ? '#FFF' : (isNeutral ? '#404040' : '#000') }} />
                    <div className={`relative w-6 h-6 border-2 flex items-center justify-center transform transition-all group-hover:-translate-y-0.5 group-active:translate-y-0 disabled:translate-y-0`}
                         style={{ 
                             backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#3b82f6' : '#2563eb'),
                             borderColor: isMinimalist ? '#FFF' : '#000',
                             color: isMinimalist ? '#FFF' : '#FFF'
                         }}>
                      <span className="text-sm font-bold" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                        −
                      </span>
                    </div>
                  </button>

                  <div className={`text-[10px] w-8`} 
                       style={{ fontFamily: '"Press Start 2P", cursive', color: playerColors.text }}>
                    VOL
                  </div>
                  
                  {/* Barra de volume pixelada */}
                  <div className={`flex-1 h-4 border-2 flex gap-0.5 p-0.5`} style={{ backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#606060' : '#111827'), borderColor: isMinimalist ? '#FFF' : '#000' }}>
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 border transition-colors ${
                          i < Math.floor(volume * 10) ? playerColors.barFilled : playerColors.barEmpty
                        }`}
                      />
                    ))}
                  </div>
                  
                  <div className={`text-[10px] w-8 text-right`} 
                       style={{ fontFamily: '"Press Start 2P", cursive', color: playerColors.text }}>
                    {Math.floor(volume * 10)}
                  </div>

                  {/* Botão Aumentar Volume */}
                  <button
                    onClick={increaseVolume}
                    disabled={volume >= 1}
                    className="group relative flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Aumentar Volume"
                  >
                    <div className={`absolute bottom-0 left-0.5 w-6 h-6 transform translate-y-0.5`} style={{ backgroundColor: isMinimalist ? '#FFF' : (isNeutral ? '#404040' : '#000') }} />
                    <div className={`relative w-6 h-6 border-2 flex items-center justify-center transform transition-all group-hover:-translate-y-0.5 group-active:translate-y-0 disabled:translate-y-0`}
                         style={{ 
                             backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#10b981' : '#16a34a'),
                             borderColor: isMinimalist ? '#FFF' : '#000',
                             color: isMinimalist ? '#FFF' : '#FFF'
                         }}>
                      <span className="text-sm font-bold" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                        +
                      </span>
                    </div>
                  </button>
                </div>
                
                {/* Slider invisível por cima */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => {
                    const newVolume = Number(e.target.value);
                    setVolume(newVolume);
                    try {
                      localStorage.setItem('music:volume', newVolume.toString());
                    } catch (error) {
                      console.log('Failed to save volume:', error);
                    }
                  }}
                  className="w-full h-4 opacity-0 absolute bottom-2 left-0 cursor-pointer"
                />
              </div>

            </div>
          </div>
        </div>

        {/* LED de power decorativo */}
        <div className={`absolute -top-2 left-2 w-3 h-3 border-2 ${
          isPlaying ? playerColors.ledOn : playerColors.ledOff
        }`} style={{ boxShadow: isPlaying ? playerColors.ledGlow : 'none' }} />
      </div>
    </div>
    </>
  );
}
