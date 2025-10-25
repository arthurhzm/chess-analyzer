export interface ChessGame {
  pgn: string;
  fen?: string;
  white: {
    username: string;
    rating: number;
    result: string;
  };
  black: {
    username: string;
    rating: number;
    result: string;
  };
  url: string;
  time_control: string;
  end_time?: number;
  rated?: boolean;
  accuracies?: {
    white: number;
    black: number;
  };
  tcn?: string;
  uuid?: string;
  initial_setup?: string;
  fen_initial?: string;
  time_class?: string;
  rules?: string;
  eco?: string;
}

export interface MoveData {
  moveNumber: number;
  move: string;
  san: string;
  fen: string;
  from: string;
  to: string;
  piece: string;
  color: 'w' | 'b';
  captured?: string;
  promotion?: string;
  evaluation?: number;
  bestMove?: string;
  classification?: MoveClassification;
  analysisDepth?: number;
  pvLine?: string[];
}

export type MoveClassification = 
  | 'brilliant'
  | 'great'
  | 'best'
  | 'book'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'forced';

export interface MoveAnalysis {
  evaluation: number;
  bestMove: string;
  pvLine: string[];
  depth: number;
  mate?: number;
}

export interface PositionAnalysis {
  fen: string;
  evaluation: number;
  bestMove: string;
  pvLine: string[];
  depth: number;
  mate?: number;
}

export interface GameAnalysis {
  moves: MoveData[];
  positions: Map<string, PositionAnalysis>;
  whiteAccuracy: number;
  blackAccuracy: number;
  stats: {
    white: MoveStats;
    black: MoveStats;
  };
}

export interface MoveStats {
  brilliant: number;
  great: number;
  best: number;
  good: number;
  inaccuracy: number;
  mistake: number;
  blunder: number;
  book: number;
  forced: number;
}
