import { Chessboard } from 'react-chessboard';

interface ChessBoardProps {
  fen: string;
  orientation?: 'white' | 'black';
  customSquareStyles?: Record<string, React.CSSProperties>;
}

export default function ChessBoard({
  fen,
  orientation = 'white',
  customSquareStyles = {},
}: ChessBoardProps) {
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
          allowDragging: false,
        }}
      />
    </div>
  );
}
