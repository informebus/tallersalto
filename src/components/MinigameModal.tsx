import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, RotateCcw, Trophy, ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MinigameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Pozo {
  x: number;
  y: number;
  radio: number;
}

export const MinigameModal: React.FC<MinigameModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('salto_bus_highscore') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(3.5);

  const gameState = useRef({
    coche: { x: 130, y: 320, width: 44, height: 70 },
    pozos: [] as Pozo[],
    roadOffset: 0,
    score: 0,
    speed: 3.5,
    animId: 0,
    gameOver: false,
  });

  const resetGame = useCallback(() => {
    gameState.current = {
      coche: { x: 130, y: 320, width: 44, height: 70 },
      pozos: [],
      roadOffset: 0,
      score: 0,
      speed: 3.5,
      animId: 0,
      gameOver: false,
    };
    setScore(0);
    setSpeed(3.5);
    setGameOver(false);
  }, []);

  const moveCar = useCallback((delta: number) => {
    if (gameState.current.gameOver) return;
    const { coche } = gameState.current;
    const canvasWidth = 300;
    coche.x = Math.max(15, Math.min(canvasWidth - coche.width - 15, coche.x + delta));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (gameState.current.animId) cancelAnimationFrame(gameState.current.animId);
      return;
    }

    resetGame();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveCar(-45);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveCar(45);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const loop = () => {
      if (gameState.current.gameOver) return;

      const { coche, pozos } = gameState.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw asphalt road
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Road borders
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(4, 0, 6, canvas.height);
      ctx.fillRect(canvas.width - 10, 0, 6, canvas.height);

      // Dashed center lines
      gameState.current.roadOffset = (gameState.current.roadOffset + gameState.current.speed) % 40;
      ctx.fillStyle = '#f8fafc';
      for (let y = -40 + gameState.current.roadOffset; y < canvas.height; y += 40) {
        ctx.fillRect(canvas.width / 2 - 2.5, y, 5, 20);
      }

      // Spawn potholes
      if (Math.random() < 0.038) {
        pozos.push({
          x: 35 + Math.random() * (canvas.width - 70),
          y: -30,
          radio: 14 + Math.random() * 10,
        });
      }

      // Draw Potholes
      for (let i = 0; i < pozos.length; i++) {
        const p = pozos[i];
        // Outer dark crater
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
        ctx.fill();

        // Inner asphalt depth
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(p.x - 2, p.y - 2, p.radio * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Crack accents
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.radio + 4, p.y + 2);
        ctx.stroke();
      }

      // Draw Ómnibus (Salto Municipal Bus)
      // Bus Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.roundRect(coche.x + 3, coche.y + 5, coche.width, coche.height, 8);
      ctx.fill();

      // Bus Body (Cyan/Sky)
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(coche.x, coche.y, coche.width, coche.height, 8);
      ctx.fill();

      // Front & Rear Bumpers
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(coche.x, coche.y + coche.height - 6, coche.width, 6);
      ctx.fillRect(coche.x, coche.y, coche.width, 4);

      // Windshield & Windows
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.roundRect(coche.x + 4, coche.y + 6, coche.width - 8, 18, 4);
      ctx.fill();

      // Roof details
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(coche.x + 12, coche.y + 28, coche.width - 24, 16);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(coche.x + 18, coche.y + 48, coche.width - 36, 12);

      // Headlights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(coche.x + 3, coche.y + coche.height - 3, 7, 3);
      ctx.fillRect(coche.x + coche.width - 10, coche.y + coche.height - 3, 7, 3);

      // Taillights
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(coche.x + 4, coche.y, 6, 2);
      ctx.fillRect(coche.x + coche.width - 10, coche.y, 6, 2);

      // Update positions & collision check
      for (let i = pozos.length - 1; i >= 0; i--) {
        const p = pozos[i];
        p.y += gameState.current.speed;

        // Collision logic
        const closestX = Math.max(coche.x, Math.min(p.x, coche.x + coche.width));
        const closestY = Math.max(coche.y, Math.min(p.y, coche.y + coche.height));
        const distanceX = p.x - closestX;
        const distanceY = p.y - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;

        if (distanceSquared < (p.radio * 0.8) * (p.radio * 0.8)) {
          gameState.current.gameOver = true;
          setGameOver(true);
          const finalScore = Math.floor(gameState.current.score);
          setHighScore((prev) => {
            const next = Math.max(prev, finalScore);
            localStorage.setItem('salto_bus_highscore', next.toString());
            return next;
          });
          return;
        }

        // Passed safely
        if (p.y > canvas.height + 40) {
          pozos.splice(i, 1);
          gameState.current.score += 1;
          const currentScore = gameState.current.score;
          setScore(currentScore);

          if (currentScore % 10 === 0) {
            gameState.current.speed += 0.4;
            setSpeed(gameState.current.speed);
          }
        }
      }

      gameState.current.animId = requestAnimationFrame(loop);
    };

    gameState.current.animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(gameState.current.animId);
    };
  }, [isOpen, moveCar, resetGame]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-xs bg-white border border-slate-200 rounded-2xl p-5 shadow-xl flex flex-col items-center relative"
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚌</span>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">Esquiva los Pozos</h3>
                <p className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase">Salto Bus Runner</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="w-full flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 mb-3 text-xs">
            <div className="text-slate-600 flex items-center gap-1.5 font-medium">
              <span>Puntos:</span>
              <span className="text-blue-600 font-mono font-bold text-sm">{score}</span>
            </div>
            <div className="text-slate-600 flex items-center gap-1.5 font-medium">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-amber-600 font-mono font-bold text-sm">{highScore}</span>
            </div>
            <div className="text-slate-600 flex items-center gap-1 text-[11px] font-medium">
              <span>Vel:</span>
              <span className="font-mono text-emerald-600 font-bold">{speed.toFixed(1)}x</span>
            </div>
          </div>

          {/* Game Canvas Box */}
          <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-950">
            <canvas ref={canvasRef} width={300} height={400} className="block select-none touch-none" />

            {gameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2 border border-rose-500/30">
                  <Shield className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-rose-400">¡CAÍSTE EN UN POZO!</h4>
                <p className="text-xs text-slate-300 mt-1 mb-3">
                  Puntaje: <b className="text-white font-mono">{score} pozos</b> esquivados
                </p>
                <button
                  onClick={resetGame}
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs shadow-sm flex items-center gap-2 transition active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  Jugar de Nuevo
                </button>
              </motion.div>
            )}
          </div>

          {/* Controls */}
          <div className="w-full grid grid-cols-2 gap-3 mt-3">
            <button
              onClick={() => moveCar(-45)}
              className="py-3 bg-slate-100 hover:bg-slate-200 active:bg-blue-600 active:text-white rounded-xl text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition active:scale-95 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Izquierda
            </button>
            <button
              onClick={() => moveCar(45)}
              className="py-3 bg-slate-100 hover:bg-slate-200 active:bg-blue-600 active:text-white rounded-xl text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition active:scale-95 shadow-xs"
            >
              Derecha
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
