import React, { useEffect, useRef } from 'react';

export default function DarkNeutralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };

    const draw = () => {
      // Base color - very dark gray
      ctx.fillStyle = '#0F0F0F';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle gradient overlay
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, 
        canvas.height / 2, 
        0,
        canvas.width / 2, 
        canvas.height / 2, 
        Math.max(canvas.width, canvas.height) / 1.5
      );
      gradient.addColorStop(0, 'rgba(40, 40, 40, 0.3)');
      gradient.addColorStop(1, 'rgba(10, 10, 10, 0.8)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle noise/grain texture
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      for (let i = 0; i < pixels.length; i += 4) {
        // Add subtle random noise
        const noise = (Math.random() - 0.5) * 8;
        pixels[i] += noise;     // Red
        pixels[i + 1] += noise; // Green
        pixels[i + 2] += noise; // Blue
      }
      
      ctx.putImageData(imageData, 0, 0);

      // Add subtle grid pattern
      ctx.strokeStyle = 'rgba(64, 64, 64, 0.05)';
      ctx.lineWidth = 1;
      
      const gridSize = 40;
      
      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
