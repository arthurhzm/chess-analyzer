import type { MoveData } from '@/types/chess';
import { 
  getClassificationIcon, 
  getClassificationColor, 
  getClassificationBgColor,
  getClassificationExplanation,
  getClassificationName,
  formatEvaluation 
} from '@/utils/chess-analysis';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MoveAnalysisProps {
  move: MoveData;
  previousEval?: number;
  isAnalyzing: boolean;
}

export default function MoveAnalysis({ move, previousEval, isAnalyzing }: MoveAnalysisProps) {
  if (!move) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 text-center text-muted-foreground">
        Selecione um movimento para ver a análise
      </div>
    );
  }

  const evalChange = move.evaluation !== undefined && previousEval !== undefined
    ? move.evaluation - previousEval
    : 0;

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Análise do Movimento</h3>
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            Analisando...
          </div>
        )}
      </div>

      {/* Move Classification */}
      {move.classification && (
        <div className={`p-3 rounded-lg border ${getClassificationBgColor(move.classification)}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-2xl ${getClassificationColor(move.classification)}`}>
              {getClassificationIcon(move.classification)}
            </span>
            <span className={`font-semibold ${getClassificationColor(move.classification)}`}>
              {getClassificationName(move.classification)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {getClassificationExplanation(
              move.classification,
              Math.abs(evalChange),
              move.bestMove || ''
            )}
          </p>
        </div>
      )}

      {/* Evaluation Change */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Antes</div>
          <div className="text-lg font-mono font-bold text-foreground">
            {previousEval !== undefined ? formatEvaluation(previousEval) : '—'}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Depois</div>
          <div className="flex items-center gap-2">
            <div className="text-lg font-mono font-bold text-foreground">
              {move.evaluation !== undefined ? formatEvaluation(move.evaluation) : '—'}
            </div>
            {evalChange !== 0 && (
              <div className={`flex items-center text-sm ${
                evalChange > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {evalChange > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {Math.abs(evalChange).toFixed(1)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Best Move Alternative */}
      {move.bestMove && move.bestMove !== move.san && (
        <div className="border-t border-border pt-3">
          <div className="text-sm text-muted-foreground mb-1">Melhor lance</div>
          <div className="font-mono font-semibold text-foreground">{move.bestMove}</div>
        </div>
      )}

      {/* Principal Variation */}
      {move.pvLine && move.pvLine.length > 0 && (
        <div className="border-t border-border pt-3">
          <div className="text-sm text-muted-foreground mb-1">Linha sugerida pelo computador</div>
          <div className="font-mono text-sm text-foreground">
            {move.pvLine.slice(0, 4).join(' ')}
          </div>
        </div>
      )}

      {/* Depth */}
      {move.analysisDepth && (
        <div className="text-xs text-muted-foreground">
          Profundidade da análise: {move.analysisDepth}
        </div>
      )}
    </div>
  );
}
