import { Chess } from 'chess.js';
import type { MoveClassification, MoveData, MoveStats } from '@/types/chess';

export const classifyMove = (
  prevEval: number,
  currentEval: number,
  moveWasBest: boolean,
  isBookMove: boolean = false,
  legalMovesCount: number = 1,
  playerColor: 'w' | 'b' = 'w'
): MoveClassification => {
  if (isBookMove) return 'book';
  if (legalMovesCount === 1) return 'forced';
  
  // Handle mate situations (evaluation capped at ±100)
  const isMatePosition = Math.abs(prevEval) >= 100 || Math.abs(currentEval) >= 100;
  
  // If position is already mate, all moves are forced/irrelevant
  if (Math.abs(prevEval) >= 100) {
    return 'forced';
  }
  
  // Evaluation is from white's perspective
  // Positive = white advantage, Negative = black advantage
  // We need to calculate the change from the player's perspective
  let evalLoss = 0;
  
  if (playerColor === 'w') {
    // For white, losing evaluation means currentEval < prevEval
    evalLoss = prevEval - currentEval;
  } else {
    // For black, losing evaluation means currentEval > prevEval (from black's perspective)
    // Since evals are from white's perspective, black wants more negative numbers
    evalLoss = currentEval - prevEval;
  }
  
  // If we reached mate, it's either brilliant (we mated) or blunder (we got mated)
  if (isMatePosition && !moveWasBest) {
    // If we're getting mated (eval going against us), it's a blunder
    if ((playerColor === 'w' && currentEval <= -100) || 
        (playerColor === 'b' && currentEval >= 100)) {
      return 'blunder';
    }
  }
  
  if (moveWasBest) {
    // Check if it's a brilliant move (sacrificing material for a better position)
    // Or finding the only winning move in a complex position
    if (evalLoss < -0.5 && Math.abs(currentEval) > 2) {
      return 'brilliant';
    }
    // Great move - one of the top moves
    if (Math.abs(currentEval) > 1.5 || evalLoss < -0.2) {
      return 'great';
    }
    return 'best';
  }

  // Inaccuracy: loses 0.3 to 1.0 pawns
  if (evalLoss >= 0.3 && evalLoss < 1.0) {
    return 'inaccuracy';
  }

  // Mistake: loses 1.0 to 3.0 pawns
  if (evalLoss >= 1.0 && evalLoss < 3.0) {
    return 'mistake';
  }

  // Blunder: loses 3.0+ pawns or allows mate
  if (evalLoss >= 3.0) {
    return 'blunder';
  }

  return 'good';
};

export const getClassificationIcon = (classification: MoveClassification): string => {
  const icons = {
    brilliant: '💎',
    great: '!',
    best: '✓',
    good: '',
    book: '📖',
    inaccuracy: '?!',
    mistake: '?',
    blunder: '??',
    forced: '⚡',
  };
  return icons[classification] || '';
};

export const getClassificationName = (classification: MoveClassification): string => {
  const names = {
    brilliant: 'Brilhante',
    great: 'Ótimo Lance',
    best: 'Melhor Lance',
    good: 'Bom',
    book: 'Teoria',
    inaccuracy: 'Imprecisão',
    mistake: 'Erro',
    blunder: 'Blunder',
    forced: 'Forçado',
  };
  return names[classification] || '';
};

export const getClassificationColor = (classification: MoveClassification): string => {
  const colors = {
    brilliant: 'text-cyan-400',
    great: 'text-green-500',
    best: 'text-green-400',
    good: 'text-gray-400',
    book: 'text-blue-400',
    inaccuracy: 'text-yellow-500',
    mistake: 'text-orange-500',
    blunder: 'text-red-500',
    forced: 'text-purple-400',
  };
  return colors[classification] || 'text-gray-400';
};

export const getClassificationBgColor = (classification: MoveClassification): string => {
  const colors = {
    brilliant: 'bg-cyan-500/10 border-cyan-500/30',
    great: 'bg-green-500/10 border-green-500/30',
    best: 'bg-green-400/10 border-green-400/30',
    good: 'bg-gray-400/10 border-gray-400/30',
    book: 'bg-blue-400/10 border-blue-400/30',
    inaccuracy: 'bg-yellow-500/10 border-yellow-500/30',
    mistake: 'bg-orange-500/10 border-orange-500/30',
    blunder: 'bg-red-500/10 border-red-500/30',
    forced: 'bg-purple-400/10 border-purple-400/30',
  };
  return colors[classification] || 'bg-gray-400/10 border-gray-400/30';
};

export const parsePGN = (pgn: string): MoveData[] => {
  const chess = new Chess();
  
  try {
    chess.loadPgn(pgn);
  } catch (error) {
    console.error('Failed to parse PGN:', error);
    return [];
  }

  const moves: MoveData[] = [];
  const history = chess.history({ verbose: true });

  chess.reset();

  history.forEach((move, index) => {
    chess.move(move.san);
    
    const moveNumber = Math.floor(index / 2) + 1;
    
    moves.push({
      moveNumber,
      move: move.san,
      san: move.san,
      fen: chess.fen(),
      from: move.from,
      to: move.to,
      piece: move.piece,
      color: move.color,
      captured: move.captured,
      promotion: move.promotion,
    });
  });

  return moves;
};

export const formatEvaluation = (evaluation: number, mate?: number): string => {
  if (mate !== undefined) {
    return `M${Math.abs(mate)}`;
  }
  
  const sign = evaluation >= 0 ? '+' : '';
  return `${sign}${evaluation.toFixed(1)}`;
};

export const evaluationToPercentage = (evaluation: number, mate?: number): number => {
  if (mate !== undefined) {
    return mate > 0 ? 100 : 0;
  }

  // Convert evaluation to percentage (0-100)
  // Using a sigmoid-like function to map eval to percentage
  // At eval=0, percentage=50
  // At eval=+5, percentage~95
  // At eval=-5, percentage~5
  
  const normalized = Math.max(-10, Math.min(10, evaluation));
  const percentage = 50 + (normalized / 10) * 45;
  
  return Math.max(0, Math.min(100, percentage));
};

export const calculateAccuracy = (moves: MoveData[], color: 'w' | 'b'): number => {
  const playerMoves = moves.filter(m => m.color === color);
  
  if (playerMoves.length === 0) return 0;

  let accuracySum = 0;
  
  playerMoves.forEach(move => {
    if (!move.classification) {
      accuracySum += 100;
      return;
    }

    const accuracyMap = {
      brilliant: 100,
      great: 95,
      best: 100,
      good: 90,
      book: 100,
      forced: 100,
      inaccuracy: 75,
      mistake: 50,
      blunder: 25,
    };

    accuracySum += accuracyMap[move.classification] || 80;
  });

  return Math.round(accuracySum / playerMoves.length);
};

export const calculateMoveStats = (moves: MoveData[], color: 'w' | 'b'): MoveStats => {
  const stats: MoveStats = {
    brilliant: 0,
    great: 0,
    best: 0,
    good: 0,
    book: 0,
    forced: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
  };

  moves
    .filter(m => m.color === color)
    .forEach(move => {
      if (move.classification) {
        stats[move.classification]++;
      }
    });

  return stats;
};

export const getOpeningName = (_fen: string): string | null => {
  // This is a simplified version - in production, you'd use an opening database
  // For now, return null to indicate we need to fetch from API or use a proper database
  return null;
};

export const formatMoveNumber = (moveNumber: number, color: 'w' | 'b'): string => {
  if (color === 'w') {
    return `${moveNumber}.`;
  }
  return `${moveNumber}...`;
};

export const getClassificationExplanation = (
  classification: MoveClassification,
  evalLoss: number,
  bestMove: string
): string => {
  switch (classification) {
    case 'brilliant':
      return 'Um lance excepcional e criativo que supera outras boas alternativas!';
    case 'great':
      return 'Um lance muito forte que mantém ou aumenta sua vantagem.';
    case 'best':
      return 'O melhor lance nesta posição de acordo com o computador.';
    case 'good':
      return 'Um lance sólido que mantém a posição.';
    case 'book':
      return 'Um lance teórico bem conhecido da abertura.';
    case 'forced':
      return 'O único lance legal nesta posição.';
    case 'inaccuracy':
      return `Este lance perde ${evalLoss.toFixed(1)} peões. Considere ${bestMove} ao invés.`;
    case 'mistake':
      return `Este lance perde ${evalLoss.toFixed(1)} peões, dando ao seu oponente uma posição melhor. ${bestMove} seria mais forte.`;
    case 'blunder':
      return `Este é um erro crítico que perde ${evalLoss.toFixed(1)} peões! ${bestMove} teria sido muito melhor.`;
    default:
      return '';
  }
};
