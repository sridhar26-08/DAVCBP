import React, { useEffect, useRef, useState } from 'react';
import { NgramItem } from '../../lib/api';

interface WordCloudCanvasProps {
  words: NgramItem[];
  type: 'positive' | 'negative';
  width?: number;
  height?: number;
}

interface PlacedWord {
  text: string;
  count: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fontSize: number;
}

export const WordCloudCanvas: React.FC<WordCloudCanvasProps> = ({
  words,
  type,
  height = 340
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredWord, setHoveredWord] = useState<PlacedWord | null>(null);
  const placedWordsRef = useRef<PlacedWord[]>([]);

  const colors = type === 'positive' 
    ? ['#059669', '#10b981', '#34d399', '#047857', '#065f46', '#22c55e', '#16a34a']
    : ['#dc2626', '#ef4444', '#f87171', '#b91c1c', '#991b1b', '#e11d48', '#be123c'];

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !words.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clientWidth = container.clientWidth || 500;
    const clientHeight = height;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = clientWidth * dpr;
    canvas.height = clientHeight * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, clientWidth, clientHeight);

    const counts = words.map(w => w.count);
    const minCount = Math.min(...counts, 1);
    const maxCount = Math.max(...counts, 2);

    const placed: PlacedWord[] = [];
    const centerX = clientWidth / 2;
    const centerY = clientHeight / 2;

    // Sort words by frequency
    const sortedWords = [...words].sort((a, b) => b.count - a.count).slice(0, 45);

    sortedWords.forEach((item, index) => {
      // Calculate font size (14px to 38px)
      const ratio = (item.count - minCount) / Math.max(1, maxCount - minCount);
      const fontSize = Math.floor(14 + ratio * 24);
      const color = colors[index % colors.length];

      ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
      const metrics = ctx.measureText(item.term);
      const textWidth = metrics.width;
      const textHeight = fontSize * 1.1;

      // Archimedean spiral search for collision-free spot
      let placedSuccessfully = false;
      let angle = (index * 2.4);
      let radius = 0;
      const step = 4;
      const maxRadius = Math.max(clientWidth, clientHeight) * 0.7;

      while (radius < maxRadius) {
        const x = centerX + radius * Math.cos(angle) - textWidth / 2;
        const y = centerY + radius * Math.sin(angle) + textHeight / 3;

        // Check canvas boundary
        if (x > 10 && x + textWidth < clientWidth - 10 && y - textHeight > 10 && y < clientHeight - 10) {
          // Check collision with already placed words
          const intersects = placed.some(other => {
            const pad = 4;
            return !(
              x + textWidth + pad < other.x ||
              x - pad > other.x + other.width ||
              y < other.y - other.height - pad ||
              y - textHeight - pad > other.y
            );
          });

          if (!intersects) {
            placed.push({
              text: item.term,
              count: item.count,
              x,
              y,
              width: textWidth,
              height: textHeight,
              color,
              fontSize
            });
            placedSuccessfully = true;
            break;
          }
        }

        angle += 0.35;
        radius += 1.8;
      }
    });

    // Render placed words
    placed.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.font = `bold ${p.fontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
      ctx.fillText(p.text, p.x, p.y);
    });

    placedWordsRef.current = placed;
  }, [words, type, height]);

  // Handle canvas mouse move for interactive tooltips
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const hit = placedWordsRef.current.find(w => {
      return (
        mouseX >= w.x &&
        mouseX <= w.x + w.width &&
        mouseY <= w.y - w.height + 4 &&
        mouseY >= w.y - w.height - 4
      ) || (
        mouseX >= w.x &&
        mouseX <= w.x + w.width &&
        mouseY >= w.y - w.height &&
        mouseY <= w.y + 4
      );
    });

    setHoveredWord(hit || null);
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden flex flex-col items-center">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredWord(null)}
        style={{ width: '100%', height: `${height}px`, cursor: hoveredWord ? 'pointer' : 'default' }}
      />
      {hoveredWord && (
        <div
          className="absolute z-10 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 pointer-events-none transition-all"
          style={{
            left: `${Math.min(hoveredWord.x + hoveredWord.width / 2, (containerRef.current?.clientWidth || 300) - 100)}px`,
            top: `${Math.max(10, hoveredWord.y - hoveredWord.height - 25)}px`,
          }}
        >
          <span className="font-bold text-white">"{hoveredWord.text}"</span>: {hoveredWord.count} occurrences
        </div>
      )}
    </div>
  );
};
