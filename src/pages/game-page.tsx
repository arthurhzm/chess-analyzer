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
import { Loader2, RotateCcw, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GamePage() {
  const { state } = useLocation();
  const game = state?.game as ChessGame;
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
  const [isExploringVariation, setIsExploringVariation] = useState(false);
  const [explorationChess] = useState(() => new Chess());
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [pendingMove, setPendingMove] = useState<{ from: string; to: string } | null>(null);

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
        depth: analysisBefore.depth,
        mateBefore: analysisBefore.mate,
        mateAfter: analysisAfter.mate
      });

      // Check if move was best
      // Compare both UCI format (e2e4) and also check if it's the same move
      const moveUCI = `${move.from}${move.to}${move.promotion || ''}`;
      let moveWasBest = analysisBefore.bestMove === moveUCI;
      
      // If not matched directly, try to convert best move to SAN and compare
      if (!moveWasBest && analysisBefore.bestMove) {
        chess.undo();
        try {
          const bestMoveObj = chess.move({
            from: analysisBefore.bestMove.slice(0, 2),
            to: analysisBefore.bestMove.slice(2, 4),
            promotion: analysisBefore.bestMove[4] as 'q' | 'r' | 'b' | 'n' | undefined,
          });
          if (bestMoveObj) {
            moveWasBest = bestMoveObj.san === move.san;
            chess.undo();
          }
        } catch {
          // Invalid move format, ignore
        }
        chess.move(move.san);
      }

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
    setIsExploringVariation(false);

    if (index === -1) {
      // Start position
      const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      setCurrentFen(startFen);
      setCurrentEvaluation(0);
      setCurrentMate(undefined);
      explorationChess.load(startFen);
    } else {
      const move = moves[index];
      setCurrentFen(move.fen);
      setCurrentEvaluation(move.evaluation || 0);
      setCurrentMate(undefined);
      explorationChess.load(move.fen);
    }
  }, [moves, explorationChess]);

  const goToFirst = useCallback(() => goToMove(-1), [goToMove]);
  const goToPrevious = useCallback(() => goToMove(currentMoveIndex - 1), [currentMoveIndex, goToMove]);
  const goToNext = useCallback(() => {
    if (isExploringVariation) {
      // Se estiver explorando, volta para a linha principal
      setIsExploringVariation(false);
      goToMove(currentMoveIndex);
    } else {
      goToMove(currentMoveIndex + 1);
    }
  }, [currentMoveIndex, goToMove, isExploringVariation]);
  const goToLast = useCallback(() => {
    setIsExploringVariation(false);
    goToMove(moves.length - 1);
  }, [moves.length, goToMove]);

  // Handle piece drop on board
  const handlePieceDrop = useCallback((sourceSquare: string, targetSquare: string): boolean => {
    try {
      // Verifica se é uma promoção de peão
      const piece = explorationChess.get(sourceSquare as any);
      const isPromotion = piece?.type === 'p' &&
        ((piece.color === 'w' && targetSquare[1] === '8') ||
          (piece.color === 'b' && targetSquare[1] === '1'));

      if (isPromotion) {
        // Salva o movimento pendente e mostra o diálogo
        setPendingMove({ from: sourceSquare, to: targetSquare });
        setShowPromotionDialog(true);
        return false; // Não completa o movimento ainda
      }

      // Tenta fazer o movimento normal
      const move = explorationChess.move({
        from: sourceSquare,
        to: targetSquare,
      });

      if (move === null) {
        return false; // Movimento ilegal
      }

      // Movimento válido - atualiza o estado
      setCurrentFen(explorationChess.fen());
      setIsExploringVariation(true);

      return true;
    } catch (error) {
      console.error('Erro ao fazer movimento:', error);
      return false;
    }
  }, [explorationChess]);

  // Handle promotion piece selection
  const handlePromotion = useCallback((piece: 'q' | 'r' | 'b' | 'n') => {
    if (!pendingMove) return;

    try {
      const move = explorationChess.move({
        from: pendingMove.from,
        to: pendingMove.to,
        promotion: piece,
      });

      if (move !== null) {
        setCurrentFen(explorationChess.fen());
        setIsExploringVariation(true);
      }
    } catch (error) {
      console.error('Erro na promoção:', error);
    } finally {
      setShowPromotionDialog(false);
      setPendingMove(null);
    }
  }, [pendingMove, explorationChess]);

  // Reset exploration when clicking on a move from the list
  const handleMoveClick = useCallback((index: number) => {
    setIsExploringVariation(false);
    goToMove(index);
  }, [goToMove]);

  // Undo last exploration move
  const handleUndoExploration = useCallback(() => {
    if (!isExploringVariation) return;

    try {
      explorationChess.undo();
      const newFen = explorationChess.fen();
      setCurrentFen(newFen);

      // Se voltar à posição original, desativa modo de exploração
      const originalFen = currentMoveIndex === -1
        ? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        : moves[currentMoveIndex].fen;

      if (newFen === originalFen) {
        setIsExploringVariation(false);
      }
    } catch (error) {
      console.error('Erro ao desfazer movimento:', error);
    }
  }, [explorationChess, isExploringVariation, currentMoveIndex, moves]);

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
              onMoveClick={handleMoveClick}
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
                <ChessBoard
                  fen={currentFen}
                  onPieceDrop={handlePieceDrop}
                  allowMoves={true}
                />
                {isExploringVariation && (
                  <div className="mt-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-md flex items-center justify-between gap-2">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                      🔍 Explorando variação
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleUndoExploration}
                        className="h-7"
                      >
                        <Undo className="w-3 h-3 mr-1" />
                        Desfazer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsExploringVariation(false);
                          goToMove(currentMoveIndex);
                        }}
                        className="h-7"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Resetar
                      </Button>
                    </div>
                  </div>
                )}
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

        {/* Promotion Dialog */}
        {showPromotionDialog && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card rounded-lg border border-border p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Escolha a peça de promoção</h3>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => handlePromotion('q')}
                  className="aspect-square bg-accent hover:bg-accent/80 rounded-lg flex items-center justify-center text-4xl transition-colors"
                  title="Rainha"
                >
                  ♛
                </button>
                <button
                  onClick={() => handlePromotion('r')}
                  className="aspect-square bg-accent hover:bg-accent/80 rounded-lg flex items-center justify-center text-4xl transition-colors"
                  title="Torre"
                >
                  ♜
                </button>
                <button
                  onClick={() => handlePromotion('b')}
                  className="aspect-square bg-accent hover:bg-accent/80 rounded-lg flex items-center justify-center text-4xl transition-colors"
                  title="Bispo"
                >
                  ♝
                </button>
                <button
                  onClick={() => handlePromotion('n')}
                  className="aspect-square bg-accent hover:bg-accent/80 rounded-lg flex items-center justify-center text-4xl transition-colors"
                  title="Cavalo"
                >
                  ♞
                </button>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  setShowPromotionDialog(false);
                  setPendingMove(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
