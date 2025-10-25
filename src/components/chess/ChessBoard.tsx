import { Chessboard } from 'react-chessboard';
import type { Square } from 'chess.js';

interface ChessBoardProps {
  fen: string;
  orientation?: 'white' | 'black';
  customSquareStyles?: Record<string, React.CSSProperties>;
  onPieceDrop?: (sourceSquare: Square, targetSquare: Square) => boolean;
  allowMoves?: boolean;
}

export default function ChessBoard({
  fen,
  orientation = 'white',
  customSquareStyles = {},
  onPieceDrop,
  allowMoves = false,
}: ChessBoardProps) {
  const handlePieceDrop = ({ sourceSquare, targetSquare }: any): boolean => {
    if (!onPieceDrop) return false;
    return onPieceDrop(sourceSquare, targetSquare);
  };

  return (
    <div className="w-full aspect-square rounded-lg overflow-hidden shadow-xl border-2 border-border">
      <Chessboard
        options={{
          position: fen,
          boardOrientation: orientation,
          squareStyles: customSquareStyles,
          darkSquareStyle: {
            backgroundColor: '#769656',
          },
          lightSquareStyle: {
            backgroundColor: '#eeeed2',
          },
          allowDragging: allowMoves,
          onPieceDrop: handlePieceDrop,
        }}
      />
    </div>
  );
}
