import { useEffect, useRef, useState, useCallback } from 'react';
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
  }, []);  const handleEngineMessage = (message: string) => {
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
      currentAnalysisRef.current.depth = parseInt(parts[depthIndex + 1]);
    }

    // Parse score
    const scoreIndex = parts.indexOf('score');
    if (scoreIndex !== -1) {
      const scoreType = parts[scoreIndex + 1];
      const scoreValue = parts[scoreIndex + 2];

      if (scoreType === 'cp' && scoreValue) {
        // Centipawn score (convert to pawns)
        currentAnalysisRef.current.evaluation = parseInt(scoreValue) / 100;
      } else if (scoreType === 'mate' && scoreValue) {
        // Mate score
        currentAnalysisRef.current.mate = parseInt(scoreValue);
        currentAnalysisRef.current.evaluation = parseInt(scoreValue) > 0 ? 100 : -100;
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

        currentAnalysisRef.current = { fen };
        analysisCallbackRef.current = resolve;
        setIsAnalyzing(true);

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
