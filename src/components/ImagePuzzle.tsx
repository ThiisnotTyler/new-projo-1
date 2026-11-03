import React, { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { playTileSwapSound, playPuzzleSolvedSound, playClickSound, triggerHaptic } from '../utils/audio';

interface ImagePuzzleProps {
  imageUrl: string;
  gridSize: 2 | 3;
  isSolved: boolean;
  onSolve: () => void;
  disabled?: boolean;
}

function getShuffledTiles(count: number): number[] {
  const arr = Array.from({ length: count }, (_, i) => i);
  let isSorted = true;
  let attempts = 0;
  while (isSorted && attempts < 50) {
    attempts++;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    let matchCount = 0;
    for (let i = 0; i < count; i++) {
      if (arr[i] === i) matchCount++;
    }
    if (matchCount < count - 1) {
      isSorted = false;
    }
  }
  return arr;
}

export const ImagePuzzle: React.FC<ImagePuzzleProps> = ({
  imageUrl,
  gridSize,
  isSolved,
  onSolve,
  disabled = false,
}) => {
  const totalTiles = gridSize * gridSize;
  const [tiles, setTiles] = useState<number[]>(() => getShuffledTiles(totalTiles));
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [movesCount, setMovesCount] = useState(0);

  // Re-shuffle when image or grid size changes
  useEffect(() => {
    setTiles(getShuffledTiles(totalTiles));
    setSelectedSlot(null);
    setMovesCount(0);
  }, [imageUrl, gridSize, totalTiles]);

  const handleTileClick = (slotIndex: number) => {
    if (isSolved || disabled) return;

    if (selectedSlot === null) {
      setSelectedSlot(slotIndex);
      playClickSound();
      triggerHaptic('light');
    } else if (selectedSlot === slotIndex) {
      setSelectedSlot(null);
    } else {
      // Swap tiles
      const nextTiles = [...tiles];
      [nextTiles[selectedSlot], nextTiles[slotIndex]] = [nextTiles[slotIndex], nextTiles[selectedSlot]];
      setTiles(nextTiles);
      setSelectedSlot(null);
      setMovesCount(m => m + 1);
      playTileSwapSound();
      triggerHaptic('medium');

      // Check if solved
      const solved = nextTiles.every((val, idx) => val === idx);
      if (solved) {
        playPuzzleSolvedSound();
        triggerHaptic('success');
        onSolve();
      }
    }
  };

  const handleReset = () => {
    playClickSound();
    setTiles(getShuffledTiles(totalTiles));
    setSelectedSlot(null);
    setMovesCount(0);
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Puzzle Status & Controls Bar */}
      <div className="w-full flex items-center justify-between mb-2.5 px-1 text-xs">
        <div className="flex items-center gap-2">
          {isSolved ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/80 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Puzzle Assembled!</span>
            </span>
          ) : (
            <span className="text-zinc-600 dark:text-zinc-300 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span>Tap 2 tiles to swap · {gridSize === 2 ? '4 Squares' : '9 Squares'}</span>
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!isSolved && (
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold px-2.5"
              title="Reshuffle pieces"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reshuffle</span>
            </button>
          )}

          {movesCount > 0 && !isSolved && (
            <span className="text-[11px] text-zinc-400 font-medium pl-0.5">
              {movesCount} {movesCount === 1 ? 'swap' : 'swaps'}
            </span>
          )}
        </div>
      </div>

      {/* Main Puzzle Box */}
      <div
        className={`relative w-full aspect-square max-w-[420px] max-h-[50vh] rounded-3xl overflow-hidden border-2 transition-all duration-300 shadow-md ${
          isSolved
            ? 'border-emerald-500 ring-4 ring-emerald-500/20'
            : 'border-zinc-300 dark:border-zinc-700 bg-zinc-950'
        }`}
      >
        {isSolved ? (
          /* Seamless Full Image When Solved */
          <div className="relative w-full h-full animate-fade-in bg-black">
            <img
              src={imageUrl}
              referrerPolicy="no-referrer"
              alt="Solved puzzle"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-600 text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Assembled</span>
            </div>
          </div>
        ) : (
          /* Grid of Chopped Tiles using native <img> with referrerPolicy for 100% reliable rendering */
          <div
            className="w-full h-full grid gap-1.5 p-1.5 bg-zinc-950"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
            }}
          >
            {tiles.map((pieceOriginalIndex, slotIdx) => {
              const isSelected = selectedSlot === slotIdx;

              // Compute offset coordinates for slice
              const origCol = pieceOriginalIndex % gridSize;
              const origRow = Math.floor(pieceOriginalIndex / gridSize);

              return (
                <button
                  key={`slot-${slotIdx}`}
                  type="button"
                  onClick={() => handleTileClick(slotIdx)}
                  className={`relative w-full h-full rounded-2xl overflow-hidden transition-all duration-150 cursor-pointer active:scale-95 bg-zinc-900 ${
                    isSelected
                      ? 'ring-4 ring-purple-500 scale-95 z-20 shadow-2xl brightness-110'
                      : 'hover:brightness-105 ring-1 ring-white/15'
                  }`}
                  aria-label={`Tile at slot ${slotIdx + 1}`}
                >
                  {/* Real <img> element cropped via container bounds and offset */}
                  <img
                    src={imageUrl}
                    referrerPolicy="no-referrer"
                    alt=""
                    className="absolute pointer-events-none select-none max-w-none"
                    style={{
                      width: `${gridSize * 100}%`,
                      height: `${gridSize * 100}%`,
                      top: `-${origRow * 100}%`,
                      left: `-${origCol * 100}%`,
                      objectFit: 'cover',
                    }}
                  />

                  {/* Active selection glow ring */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-purple-500/25 border-2 border-purple-400 rounded-2xl pointer-events-none animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
