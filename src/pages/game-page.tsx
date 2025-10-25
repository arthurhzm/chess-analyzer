import AppLayout from "@/components/ui/app-layout";
import { useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Chess } from "chess.js";
import type { ChessGame, MoveData, MoveStats, PositionAnalysis } from "@/types/chess";
import { 
  parsePGN, 
  classifyMove, 
  calculateAccuracy, 
  calculateMoveStats 
} from "@/utils/chess-analysis";
import { useStockfish } from "@/hooks/useStockfish";
import ChessBoard from "@/components/chess/ChessBoard";
import EvaluationBar from "@/components/chess/EvaluationBar";
import MoveList from "@/components/chess/MoveList";
import MoveAnalysis from "@/components/chess/MoveAnalysis";
import GameInfo from "@/components/chess/GameInfo";
import NavigationControls from "@/components/chess/NavigationControls";
import GameStats from "@/components/chess/GameStats";
import { Loader2 } from "lucide-react";

export default function GamePage() {
  const { state } = useLocation();
  const game = state?.game as ChessGame;
  console.log(game);
  

  const [moves, setMoves] = useState<MoveData[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [currentFen, setCurrentFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [currentEvaluation, setCurrentEvaluation] = useState(0);
  const [currentMate, setCurrentMate] = useState<number | undefined>(undefined);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [whiteStats, setWhiteStats] = useState<MoveStats>({
    brilliant: 0, great: 0, best: 0, good: 0, book: 0, forced: 0, inaccuracy: 0, mistake: 0, blunder: 0
  });
  const [blackStats, setBlackStats] = useState<MoveStats>({
    brilliant: 0, great: 0, best: 0, good: 0, book: 0, forced: 0, inaccuracy: 0, mistake: 0, blunder: 0
  });
  const [whiteAccuracy, setWhiteAccuracy] = useState(0);
  const [blackAccuracy, setBlackAccuracy] = useState(0);

  const { isReady, isAnalyzing, analyzePosition } = useStockfish();

  // Parse PGN on mount
  useEffect(() => {
    if (!game?.pgn) return;

    const parsedMoves = parsePGN(game.pgn);
    setMoves(parsedMoves);
    setHasAnalyzed(false); // Reset analysis flag for new game
  }, [game?.pgn]);

  // Start analysis when Stockfish is ready AND moves are loaded
  useEffect(() => {
    if (!isReady || moves.length === 0 || isLoadingAnalysis || hasAnalyzed) return;
    
    console.log('Stockfish pronto e movimentos carregados. Iniciando análise...');
    setHasAnalyzed(true);
    analyzeMoves(moves);
  }, [isReady, moves.length, isLoadingAnalysis, hasAnalyzed]);

  // Analyze all moves
  const analyzeMoves = useCallback(async (movesToAnalyze: MoveData[]) => {
    if (!isReady || movesToAnalyze.length === 0) {
      console.log('Aguardando Stockfish...', { isReady, movesCount: movesToAnalyze.length });
      return;
    }

    console.log('✅ Iniciando análise de', movesToAnalyze.length, 'movimentos');
    setIsLoadingAnalysis(true);
    setAnalysisProgress(0);

    const chess = new Chess();
    const analyzedMoves: MoveData[] = [];
    const positionCache = new Map<string, PositionAnalysis>();

    for (let i = 0; i < movesToAnalyze.length; i++) {
      const move = movesToAnalyze[i];
      
      // Get FEN before the move
      const fenBefore = chess.fen();
      
      // Analyze position before move if not cached
      let analysisBefore: PositionAnalysis;
      if (positionCache.has(fenBefore)) {
        analysisBefore = positionCache.get(fenBefore)!;
      } else {
        analysisBefore = await analyzePosition(fenBefore, 15);
        positionCache.set(fenBefore, analysisBefore);
      }

      // Make the move
      chess.move(move.san);
      const fenAfter = chess.fen();

      // Analyze position after move
      let analysisAfter: PositionAnalysis;
      if (positionCache.has(fenAfter)) {
        analysisAfter = positionCache.get(fenAfter)!;
      } else {
        analysisAfter = await analyzePosition(fenAfter, 15);
        positionCache.set(fenAfter, analysisAfter);
      }

      // Stockfish always gives evaluation from white's perspective
      // So we don't need to flip based on who moved
      const evalBefore = analysisBefore.evaluation;
      const evalAfter = analysisAfter.evaluation;

      console.log(`Movimento ${i + 1}: ${move.san}`, {
        color: move.color,
        evalBefore: evalBefore.toFixed(2),
        evalAfter: evalAfter.toFixed(2),
        bestMove: analysisBefore.bestMove,
        depth: analysisBefore.depth
      });

      // Check if move was best
      const moveWasBest = analysisBefore.bestMove === move.san || 
                          analysisBefore.bestMove === `${move.from}${move.to}${move.promotion || ''}`;

      // Get number of legal moves
      chess.undo();
      const legalMovesCount = chess.moves().length;
      chess.move(move.san);

      // Classify the move
      const classification = classifyMove(
        evalBefore,
        evalAfter,
        moveWasBest,
        i < 10, // First 10 moves are considered book moves
        legalMovesCount,
        move.color
      );

      analyzedMoves.push({
        ...move,
        evaluation: evalAfter,
        bestMove: analysisBefore.bestMove,
        classification,
        analysisDepth: analysisAfter.depth,
        pvLine: analysisAfter.pvLine,
      });

      setAnalysisProgress(Math.round(((i + 1) / movesToAnalyze.length) * 100));
    }

    console.log('Análise completa!');
    console.log('Movimentos analisados:', analyzedMoves);

    // Update moves with analysis
    setMoves(analyzedMoves);

    // Calculate statistics
    const whiteAcc = calculateAccuracy(analyzedMoves, 'w');
    const blackAcc = calculateAccuracy(analyzedMoves, 'b');
    const wStats = calculateMoveStats(analyzedMoves, 'w');
    const bStats = calculateMoveStats(analyzedMoves, 'b');

    console.log('Estatísticas:', {
      whiteAcc,
      blackAcc,
      whiteStats: wStats,
      blackStats: bStats
    });

    setWhiteAccuracy(whiteAcc);
    setBlackAccuracy(blackAcc);
    setWhiteStats(wStats);
    setBlackStats(bStats);

    setIsLoadingAnalysis(false);
  }, [analyzePosition]);

  // Navigation handlers
  const goToMove = useCallback((index: number) => {
    if (index < -1 || index >= moves.length) return;

    setCurrentMoveIndex(index);

    if (index === -1) {
      // Start position
      setCurrentFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
      setCurrentEvaluation(0);
      setCurrentMate(undefined);
    } else {
      const move = moves[index];
      setCurrentFen(move.fen);
      setCurrentEvaluation(move.evaluation || 0);
      setCurrentMate(undefined);
    }
  }, [moves]);

  const goToFirst = useCallback(() => goToMove(-1), [goToMove]);
  const goToPrevious = useCallback(() => goToMove(currentMoveIndex - 1), [currentMoveIndex, goToMove]);
  const goToNext = useCallback(() => goToMove(currentMoveIndex + 1), [currentMoveIndex, goToMove]);
  const goToLast = useCallback(() => goToMove(moves.length - 1), [moves.length, goToMove]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Home') goToFirst();
      if (e.key === 'End') goToLast();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToPrevious, goToNext, goToFirst, goToLast]);

  if (!game) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Sem dados da partida</h2>
            <p className="text-muted-foreground">Por favor, selecione uma partida para analisar</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-[1800px]">
        {/* Loading Analysis Overlay */}
        {isLoadingAnalysis && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card rounded-lg border border-border p-8 max-w-md w-full mx-4">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Analisando Partida</h3>
                <p className="text-muted-foreground text-center">
                  Executando análise do Stockfish em todos os movimentos...
                </p>
                <div className="w-full bg-accent rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{analysisProgress}% completo</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Game Info & Moves */}
          <div className="lg:col-span-3 space-y-6">
            <GameInfo game={game} />
            <MoveList
              moves={moves}
              currentMoveIndex={currentMoveIndex}
              onMoveClick={goToMove}
            />
            <GameStats
              whiteStats={whiteStats}
              blackStats={blackStats}
              whiteAccuracy={whiteAccuracy}
              blackAccuracy={blackAccuracy}
            />
          </div>

          {/* Center Column - Board & Navigation */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <ChessBoard fen={currentFen} />
              </div>
              <EvaluationBar evaluation={currentEvaluation} mate={currentMate} />
            </div>
            <NavigationControls
              currentMove={currentMoveIndex}
              totalMoves={moves.length}
              onFirst={goToFirst}
              onPrevious={goToPrevious}
              onNext={goToNext}
              onLast={goToLast}
            />
          </div>

          {/* Right Column - Move Analysis */}
          <div className="lg:col-span-3">
            <MoveAnalysis
              move={moves[currentMoveIndex]}
              previousEval={currentMoveIndex > 0 ? moves[currentMoveIndex - 1]?.evaluation : 0}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
