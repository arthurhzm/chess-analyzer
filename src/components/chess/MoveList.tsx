import type { MoveData } from '@/types/chess';
import { 
  getClassificationIcon, 
  getClassificationColor,
} from '@/utils/chess-analysis';
import { useEffect, useRef } from 'react';

interface MoveListProps {
  moves: MoveData[];
  currentMoveIndex: number;
  onMoveClick: (index: number) => void;
}

export default function MoveList({ moves, currentMoveIndex, onMoveClick }: MoveListProps) {
  const currentMoveRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Auto-scroll to current move
    if (currentMoveRef.current) {
      currentMoveRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentMoveIndex]);

  // Group moves in pairs (white, black)
  const movePairs: (MoveData | null)[][] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push([moves[i], moves[i + 1] || null]);
  }

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h3 className="font-semibold text-foreground mb-3">Movimentos</h3>
      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {movePairs.map((pair, pairIndex) => {
          const whiteMove = pair[0];
          const blackMove = pair[1];
          const moveNumber = whiteMove?.moveNumber || pairIndex + 1;

          return (
            <div key={pairIndex} className="flex items-center gap-2 text-sm">
              {/* Move number */}
              <span className="text-muted-foreground font-mono w-8 text-right">
                {moveNumber}.
              </span>

              {/* White move */}
              {whiteMove && (
                <button
                  ref={moves.indexOf(whiteMove) === currentMoveIndex ? currentMoveRef : null}
                  onClick={() => onMoveClick(moves.indexOf(whiteMove))}
                  className={`flex items-center gap-1 px-2 py-1 rounded transition-colors flex-1 ${
                    moves.indexOf(whiteMove) === currentMoveIndex
                      ? 'bg-primary/20 text-foreground font-semibold'
                      : 'hover:bg-accent text-foreground'
                  }`}
                >
                  <span>{whiteMove.san}</span>
                  {whiteMove.classification && (
                    <span className={getClassificationColor(whiteMove.classification)}>
                      {getClassificationIcon(whiteMove.classification)}
                    </span>
                  )}
                </button>
              )}

              {/* Black move */}
              {blackMove ? (
                <button
                  ref={moves.indexOf(blackMove) === currentMoveIndex ? currentMoveRef : null}
                  onClick={() => onMoveClick(moves.indexOf(blackMove))}
                  className={`flex items-center gap-1 px-2 py-1 rounded transition-colors flex-1 ${
                    moves.indexOf(blackMove) === currentMoveIndex
                      ? 'bg-primary/20 text-foreground font-semibold'
                      : 'hover:bg-accent text-foreground'
                  }`}
                >
                  <span>{blackMove.san}</span>
                  {blackMove.classification && (
                    <span className={getClassificationColor(blackMove.classification)}>
                      {getClassificationIcon(blackMove.classification)}
                    </span>
                  )}
                </button>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
