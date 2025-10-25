import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationControlsProps {
  currentMove: number;
  totalMoves: number;
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
}

export default function NavigationControls({
  currentMove,
  totalMoves,
  onFirst,
  onPrevious,
  onNext,
  onLast,
}: NavigationControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      {/* Position indicator */}
      <div className="text-sm text-muted-foreground font-mono">
        {currentMove + 1} / {totalMoves}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onFirst}
          disabled={currentMove === -1}
          className="p-2 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="First move"
        >
          <ChevronsLeft className="w-5 h-5" />
        </button>

        <button
          onClick={onPrevious}
          disabled={currentMove === -1}
          className="p-2 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Previous move"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={onNext}
          disabled={currentMove >= totalMoves - 1}
          className="p-2 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Next move"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={onLast}
          disabled={currentMove >= totalMoves - 1}
          className="p-2 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Last move"
        >
          <ChevronsRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
