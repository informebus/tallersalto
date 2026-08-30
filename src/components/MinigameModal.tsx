import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, RotateCcw, Trophy, ArrowLeft, ArrowRight, Shield, Sparkles, Flame, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MinigameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Pozo {
  lane: number;
  x: number;
  y: number;
  radio: number;
}

const TOTAL_LANES = 5;
const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 420;
const ROAD_MARGIN = 10;
const LANE_WIDTH = (CANVAS_WIDTH - ROAD_MARGIN * 2) / TOTAL_LANES; // 60px per lane

export const MinigameModal: React.FC<MinigameModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('salto_bus_highscore') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [currentLane, setCurrentLane] = useState(2); // Start in middle lane (0, 1, 2, 3, 4)
  const [speedLevel, setSpeedLevel] = useState(1);

  const gameState = useRef({
    lane: 2,
    targetX: ROAD_MARGIN + 2 * LANE_WIDTH + LANE_WIDTH / 2 - 19,
    currentX: ROAD_MARGIN + 2 * LANE_WIDTH + LANE_WIDTH / 2 - 19,
    y: CANVAS_HEIGHT - 85,
    width: 38,
    height: 66,
    pozos: [] as Pozo[],
    roadOffset: 0,
    score: 0,
    speed: 3.6,
    animId: 0,
    isGameOver: false,
    spawnCooldown: 0,
  });

  const getLaneCenterX = (laneIndex: number) => {
    return ROAD_MARGIN + laneIndex * LANE_WIDTH + LANE_WIDTH / 2;
  };

  const getBusTargetX = (laneIndex: number) => {
    return getLaneCenterX(laneIndex) - gameState.current.width / 2;
  };

  // Move Bus to adjacent lane
  const changeLane = useCallback((direction: -1 | 1) => {
    if (gameState.current.isGameOver) return;
    const newLane = Math.max(0, Math.min(TOTAL_LANES - 1, gameState.current.lane + direction));
    gameState.current.lane = newLane;
    gameState.current.targetX = getBusTargetX(newLane);
    setCurrentLane(newLane);
  }, []);

  // Jump directly to specific lane (by clicking lane)
  const setDirectLane = useCallback((targetLane: number) => {
    if (gameState.current.isGameOver) return;
    const safeLane = Math.max(0, Math.min(TOTAL_LANES - 1, targetLane));
    gameState.current.lane = safeLane;
    gameState.current.targetX = getBusTargetX(safeLane);
    setCurrentLane(safeLane);
  }, []);

  // Start / restart game loop
  const startNewGame = useCallback(() => {
    if (gameState.current.animId) {
      cancelAnimationFrame(gameState.current.animId);
    }

    const startLane = 2;
    const initialTargetX = ROAD_MARGIN + startLane * LANE_WIDTH + LANE_WIDTH / 2 - 19;

    gameState.current = {
      lane: startLane,
      targetX: initialTargetX,
      currentX: initialTargetX,
      y: CANVAS_HEIGHT - 85,
      width: 38,
      height: 66,
      pozos: [],
      roadOffset: 0,
      score: 0,
      speed: 3.6,
      animId: 0,
      isGameOver: false,
      spawnCooldown: 30,
    };

    setScore(0);
    setCurrentLane(startLane);
    setSpeedLevel(1);
    setGameOver(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const state = gameState.current;
      if (state.isGameOver) return;

      // 1. Update Bus position with smooth lerp
      state.currentX += (state.targetX - state.currentX) * 0.35;

      // 2. Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 3. Draw Road Grass/Curbs
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Road asphalt
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(ROAD_MARGIN, 0, CANVAS_WIDTH - ROAD_MARGIN * 2, CANVAS_HEIGHT);

      // Yellow outer shoulder lines
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(ROAD_MARGIN, 0, 4, CANVAS_HEIGHT);
      ctx.fillRect(CANVAS_WIDTH - ROAD_MARGIN - 4, 0, 4, CANVAS_HEIGHT);

      // 4. Draw Dashed Lane Dividers (4 divider lines for 5 lanes)
      state.roadOffset = (state.roadOffset + state.speed) % 36;
      ctx.fillStyle = 'rgba(241, 245, 249, 0.45)';

      for (let l = 1; l < TOTAL_LANES; l++) {
        const dividerX = ROAD_MARGIN + l * LANE_WIDTH;
        for (let y = -36 + state.roadOffset; y < CANVAS_HEIGHT; y += 36) {
          ctx.fillRect(dividerX - 1.5, y, 3, 18);
        }
      }

      // 5. Spawn Potholes (Ensuring at least 2 lanes are free at any wave)
      state.spawnCooldown--;
      if (state.spawnCooldown <= 0) {
        // Decide how many potholes to spawn (1 or 2 max)
        const count = state.score > 25 && Math.random() < 0.35 ? 2 : 1;
        const availableLanes = [0, 1, 2, 3, 4];
        
        for (let c = 0; c < count; c++) {
          if (availableLanes.length === 0) break;
          const randomIndex = Math.floor(Math.random() * availableLanes.length);
          const chosenLane = availableLanes.splice(randomIndex, 1)[0];
          
          state.pozos.push({
            lane: chosenLane,
            x: getLaneCenterX(chosenLane),
            y: -35 - (c * 20),
            radio: 14 + Math.random() * 5,
          });
        }

        // Set next spawn cooldown inversely proportional to speed
        state.spawnCooldown = Math.max(22, Math.floor(48 - state.score * 0.45));
      }

      // 6. Draw and Update Potholes
      for (let i = state.pozos.length - 1; i >= 0; i--) {
        const p = state.pozos[i];
        p.y += state.speed;

        // Draw pothole
        // Outer dark crater
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
        ctx.fill();

        // Inner asphalt depth
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(p.x - 2, p.y - 2, p.radio * 0.65, 0, Math.PI * 2);
        ctx.fill();

        // Crack highlights
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x - 4, p.y - 2);
        ctx.lineTo(p.x + p.radio + 2, p.y + 3);
        ctx.stroke();

        // Collision Check (Circle vs Bus Bounding Box)
        const closestX = Math.max(state.currentX, Math.min(p.x, state.currentX + state.width));
        const closestY = Math.max(state.y, Math.min(p.y, state.y + state.height));
        const dx = p.x - closestX;
        const dy = p.y - closestY;
        const distSq = dx * dx + dy * dy;

        // Hit detected!
        if (distSq < (p.radio * 0.72) * (p.radio * 0.72)) {
          state.isGameOver = true;
          setGameOver(true);
          const finalScore = state.score;
          setHighScore((prev) => {
            const next = Math.max(prev, finalScore);
            localStorage.setItem('salto_bus_highscore', next.toString());
            return next;
          });
          return; // Stop animation loop
        }

        // Passed safely past the bottom
        if (p.y > CANVAS_HEIGHT + 40) {
          state.pozos.splice(i, 1);
          state.score += 1;
          const currentScore = state.score;
          setScore(currentScore);

          // Speed step up every 8 points
          if (currentScore % 8 === 0) {
            state.speed = Math.min(7.5, state.speed + 0.35);
            setSpeedLevel(Math.floor(state.speed - 2.5));
          }
        }
      }

      // 7. Draw Ómnibus (Salto Municipal Bus)
      const busX = state.currentX;
      const busY = state.y;

      // Bus Soft Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.roundRect(busX + 3, busY + 5, state.width, state.height, 8);
      ctx.fill();

      // Bus Main Body (Municipal Cyan / Sky Blue)
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(busX, busY, state.width, state.height, 7);
      ctx.fill();

      // Bus Front & Rear Bumpers
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(busX, busY + state.height - 5, state.width, 5);
      ctx.fillRect(busX, busY, state.width, 4);

      // Windshield (Front top)
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.roundRect(busX + 3, busY + 5, state.width - 6, 16, 3);
      ctx.fill();

      // Destination Board (Cartel luminoso LED)
      ctx.fillStyle = '#022c22';
      ctx.fillRect(busX + 6, busY + 7, state.width - 12, 4);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(busX + 8, busY + 8, state.width - 16, 2);

      // Roof Air/Vent details
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(busX + 8, busY + 25, state.width - 16, 18);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(busX + 12, busY + 46, state.width - 24, 10);

      // Headlights (Front - bottom of sprite facing down)
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(busX + 3, busY + state.height - 3, 6, 3);
      ctx.fillRect(busX + state.width - 9, busY + state.height - 3, 6, 3);

      // Taillights (Rear - top)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(busX + 3, busY, 5, 2);
      ctx.fillRect(busX + state.width - 8, busY, 5, 2);

      state.animId = requestAnimationFrame(gameLoop);
    };

    gameState.current.animId = requestAnimationFrame(gameLoop);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) {
      if (gameState.current.animId) {
        cancelAnimationFrame(gameState.current.animId);
      }
      return;
    }

    startNewGame();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        changeLane(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        changeLane(1);
      } else if (e.key === '1') {
        setDirectLane(0);
      } else if (e.key === '2') {
        setDirectLane(1);
      } else if (e.key === '3') {
        setDirectLane(2);
      } else if (e.key === '4') {
        setDirectLane(3);
      } else if (e.key === '5') {
        setDirectLane(4);
      } else if (e.key === 'r' || e.key === 'R' || e.key === 'Enter') {
        if (gameState.current.isGameOver) {
          startNewGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gameState.current.animId) {
        cancelAnimationFrame(gameState.current.animId);
      }
    };
  }, [isOpen, startNewGame, changeLane, setDirectLane]);

  // Handle click on canvas to jump directly to clicked lane
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState.current.isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    
    // Calculate lane (0 to 4)
    const lane = Math.floor((clickX - ROAD_MARGIN) / LANE_WIDTH);
    if (lane >= 0 && lane < TOTAL_LANES) {
      setDirectLane(lane);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col items-center relative text-slate-100"
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-xl">
                🚌
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                  Esquiva los Pozos (5 Carriles)
                </h3>
                <p className="text-[10px] text-sky-400 font-semibold tracking-wider uppercase">
                  Salto Bus Driver
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="w-full grid grid-cols-3 gap-2 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 mb-3 text-xs">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 font-medium uppercase">Puntaje</span>
              <span className="text-sky-400 font-mono font-bold text-base leading-tight">{score}</span>
            </div>
            <div className="flex flex-col items-center border-x border-slate-800">
              <span className="text-[10px] text-amber-400 font-medium uppercase flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Récord
              </span>
              <span className="text-amber-400 font-mono font-bold text-base leading-tight">{highScore}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-emerald-400 font-medium uppercase flex items-center gap-1">
                <Flame className="w-3 h-3" /> Nivel
              </span>
              <span className="text-emerald-400 font-mono font-bold text-base leading-tight">{speedLevel}</span>
            </div>
          </div>

          {/* Game Canvas Box */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950 select-none">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onClick={handleCanvasClick}
              className="block cursor-pointer touch-none"
              title="Toca cualquier carril para moverte rápidamente"
            />

            {/* Game Over Overlay with Working Reset */}
            {gameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-5 text-center z-10"
              >
                <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3 border border-rose-500/30 animate-bounce">
                  <Shield className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-rose-400 tracking-wide">¡CAÍSTE EN UN POZO!</h4>
                <p className="text-xs text-slate-300 mt-1 mb-4">
                  Lograste esquivar <b className="text-sky-300 font-mono text-sm">{score} pozos</b> en las calles de Salto.
                </p>
                <button
                  type="button"
                  onClick={startNewGame}
                  className="py-3 px-6 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                  <span>JUGAR DE NUEVO</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* 5-Lane Quick Switcher Buttons */}
          <div className="w-full mt-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 px-1 font-medium">
              <span>Carril actual:</span>
              <span className="text-sky-400 font-bold">Carril {currentLane + 1} de 5</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 mb-2.5">
              {[0, 1, 2, 3, 4].map((laneIndex) => (
                <button
                  key={laneIndex}
                  onClick={() => setDirectLane(laneIndex)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentLane === laneIndex
                      ? 'bg-sky-500 text-slate-950 shadow-md scale-105'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title={`Ir al carril ${laneIndex + 1}`}
                >
                  C{laneIndex + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Steering Controls */}
          <div className="w-full grid grid-cols-2 gap-2.5">
            <button
              onClick={() => changeLane(-1)}
              disabled={currentLane === 0}
              className="py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-35 active:bg-sky-500 active:text-slate-950 rounded-xl text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700/80 transition active:scale-95 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Izquierda</span>
            </button>
            <button
              onClick={() => changeLane(1)}
              disabled={currentLane === TOTAL_LANES - 1}
              className="py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-35 active:bg-sky-500 active:text-slate-950 rounded-xl text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700/80 transition active:scale-95 shadow-sm cursor-pointer"
            >
              <span>Derecha</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Instructions note */}
          <p className="text-[10px] text-slate-500 text-center mt-3">
            Usa las flechas ◀ ▶ del teclado, las teclas A/D, 1-5, o toca directamente el carril en pantalla.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
