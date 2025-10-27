import { useEffect, useRef, useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import type { PositionAnalysis } from '@/types/chess';

export const useStockfish = () => {
  const [isReady, setIsReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const engineRef = useRef<any>(null);
  const analysisCallbackRef = useRef<((analysis: PositionAnalysis) => void) | null>(null);
  const currentAnalysisRef = useRef<Partial<PositionAnalysis>>({});

  useEffect(() => {
    // Initialize Stockfish
    const initStockfish = async () => {
      try {
        console.log('Tentando inicializar Stockfish...');

        // Create Web Worker from public folder
        const engine = new Worker(new URL('/stockfish.js', import.meta.url), { type: 'classic' });
        engineRef.current = engine;

        engine.addEventListener('message', (event: MessageEvent) => {
          const message = event.data;
          if (typeof message === 'string') {
            console.log('Stockfish diz:', message);
            handleEngineMessage(message);
          }
        });

        engine.addEventListener('error', (error) => {
          console.error('Erro no Web Worker:', error);
        });

        // Initialize engine
        console.log('Enviando comandos UCI...');
        engine.postMessage('uci');

        // Wait a bit before sending more commands
        setTimeout(() => {
          engine.postMessage('setoption name MultiPV value 1');
          engine.postMessage('setoption name Hash value 128');
          engine.postMessage('ucinewgame');
          engine.postMessage('isready');
        }, 500);

      } catch (error) {
        console.error('Failed to initialize Stockfish:', error);
      }
    };

    initStockfish();

    return () => {
      if (engineRef.current) {
        engineRef.current.terminate();
      }
    };
  }, []); const handleEngineMessage = (message: string) => {
    if (typeof message !== 'string') return;

    if (message === 'readyok') {
      console.log('✅ Stockfish está pronto!');
      setIsReady(true);
      return;
    }

    if (message === 'uciok') {
      console.log('✅ UCI protocolo OK');
      return;
    }

    if (message.startsWith('info')) {
      parseInfoMessage(message);
    }

    if (message.startsWith('bestmove')) {
      setIsAnalyzing(false);
      if (analysisCallbackRef.current && currentAnalysisRef.current.fen) {
        const analysis: PositionAnalysis = {
          fen: currentAnalysisRef.current.fen!,
          evaluation: currentAnalysisRef.current.evaluation || 0,
          bestMove: currentAnalysisRef.current.bestMove || '',
          pvLine: currentAnalysisRef.current.pvLine || [],
          depth: currentAnalysisRef.current.depth || 0,
          mate: currentAnalysisRef.current.mate,
        };
        console.log('Análise concluída:', analysis);
        analysisCallbackRef.current(analysis);
      }
      currentAnalysisRef.current = {};
    }
  };

  const parseInfoMessage = (message: string) => {
    const parts = message.split(' ');

    // Parse depth
    const depthIndex = parts.indexOf('depth');
    if (depthIndex !== -1 && parts[depthIndex + 1]) {
      const depth = parseInt(parts[depthIndex + 1]);
      // Ignore depth 0 messages (game over positions)
      if (depth === 0) {
        return;
      }
      currentAnalysisRef.current.depth = depth;
    }

    // Parse score
    const scoreIndex = parts.indexOf('score');
    if (scoreIndex !== -1) {
      const scoreType = parts[scoreIndex + 1];
      const scoreValue = parts[scoreIndex + 2];

      if (scoreType === 'cp' && scoreValue) {
        // Centipawn score (convert to pawns)
        currentAnalysisRef.current.evaluation = parseInt(scoreValue) / 100;
        currentAnalysisRef.current.mate = undefined;
      } else if (scoreType === 'mate' && scoreValue) {
        // Mate score
        const mateIn = parseInt(scoreValue);
        // mate 0 means game is already over
        if (mateIn === 0) {
          return;
        }
        currentAnalysisRef.current.mate = mateIn;
        currentAnalysisRef.current.evaluation = mateIn > 0 ? 100 : -100;
      }
    }

    // Parse PV (principal variation)
    const pvIndex = parts.indexOf('pv');
    if (pvIndex !== -1) {
      const pvMoves = parts.slice(pvIndex + 1);
      currentAnalysisRef.current.pvLine = pvMoves.slice(0, 5); // Take first 5 moves
      if (pvMoves.length > 0) {
        currentAnalysisRef.current.bestMove = pvMoves[0];
      }
    }
  };

  const analyzePosition = useCallback(
    (fen: string, depth: number = 18): Promise<PositionAnalysis> => {
      return new Promise((resolve) => {
        if (!engineRef.current || !isReady) {
          resolve({
            fen,
            evaluation: 0,
            bestMove: '',
            pvLine: [],
            depth: 0,
          });
          return;
        }

        // Check if game is over (checkmate, stalemate, etc)
        const chess = new Chess(fen);
        if (chess.isGameOver()) {
          let evaluation = 0;

          if (chess.isCheckmate()) {
            // If white is in checkmate, black won (eval = -100)
            // If black is in checkmate, white won (eval = +100)
            evaluation = chess.turn() === 'w' ? -100 : 100;
          }
          // For stalemate, draw, etc, evaluation stays 0

          resolve({
            fen,
            evaluation,
            bestMove: '',
            pvLine: [],
            depth: 0,
            mate: chess.isCheckmate() ? 0 : undefined,
          });
          return;
        }

        currentAnalysisRef.current = { fen };
        analysisCallbackRef.current = resolve;
        setIsAnalyzing(true);

        // Set timeout to prevent hanging (30 seconds max per position)
        const timeoutId = setTimeout(() => {
          console.warn('Analysis timeout for position:', fen);
          setIsAnalyzing(false);
          if (currentAnalysisRef.current.fen === fen) {
            resolve({
              fen,
              evaluation: currentAnalysisRef.current.evaluation || 0,
              bestMove: currentAnalysisRef.current.bestMove || '',
              pvLine: currentAnalysisRef.current.pvLine || [],
              depth: currentAnalysisRef.current.depth || 0,
              mate: currentAnalysisRef.current.mate,
            });
            currentAnalysisRef.current = {};
          }
        }, 30000);

        // Store timeout ID to clear it later
        const originalCallback = analysisCallbackRef.current;
        analysisCallbackRef.current = (analysis: PositionAnalysis) => {
          clearTimeout(timeoutId);
          if (originalCallback) {
            originalCallback(analysis);
          }
        };

        engineRef.current.postMessage('stop');
        engineRef.current.postMessage(`position fen ${fen}`);
        engineRef.current.postMessage(`go depth ${depth}`);
      });
    },
    [isReady]
  );

  const stopAnalysis = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.postMessage('stop');
      setIsAnalyzing(false);
    }
  }, []);

  return {
    isReady,
    isAnalyzing,
    analyzePosition,
    stopAnalysis,
  };
};
