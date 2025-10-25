import type { MoveStats } from '@/types/chess';
import { 
  getClassificationIcon, 
  getClassificationColor,
  getClassificationName
} from '@/utils/chess-analysis';

interface GameStatsProps {
  whiteStats: MoveStats;
  blackStats: MoveStats;
  whiteAccuracy: number;
  blackAccuracy: number;
}

export default function GameStats({
  whiteStats,
  blackStats,
  whiteAccuracy,
  blackAccuracy,
}: GameStatsProps) {
  const StatRow = ({ 
    label, 
    whiteCount, 
    blackCount, 
    icon, 
    colorClass 
  }: { 
    label: string; 
    whiteCount: number; 
    blackCount: number; 
    icon: string; 
    colorClass: string;
  }) => {
    if (whiteCount === 0 && blackCount === 0) return null;

    return (
      <div className="flex items-center justify-between text-sm py-1">
        <div className="flex items-center gap-2">
          <span className={colorClass}>{icon}</span>
          <span className="text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-foreground font-mono w-8 text-center">{whiteCount}</span>
          <span className="text-foreground font-mono w-8 text-center">{blackCount}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <h3 className="font-semibold text-foreground">Estatísticas da Partida</h3>

      {/* Accuracy */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Precisão</span>
          <div className="flex items-center gap-4">
            <span className="text-foreground font-mono w-8 text-center">⬜</span>
            <span className="text-foreground font-mono w-8 text-center">⬛</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Desempenho</span>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-foreground">{whiteAccuracy}%</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-foreground">{blackAccuracy}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Move Classifications */}
      <div className="space-y-1">
        <StatRow
          label={getClassificationName('brilliant')}
          whiteCount={whiteStats.brilliant}
          blackCount={blackStats.brilliant}
          icon={getClassificationIcon('brilliant')}
          colorClass={getClassificationColor('brilliant')}
        />
        <StatRow
          label={getClassificationName('great')}
          whiteCount={whiteStats.great}
          blackCount={blackStats.great}
          icon={getClassificationIcon('great')}
          colorClass={getClassificationColor('great')}
        />
        <StatRow
          label={getClassificationName('best')}
          whiteCount={whiteStats.best}
          blackCount={blackStats.best}
          icon={getClassificationIcon('best')}
          colorClass={getClassificationColor('best')}
        />
        <StatRow
          label={getClassificationName('book')}
          whiteCount={whiteStats.book}
          blackCount={blackStats.book}
          icon={getClassificationIcon('book')}
          colorClass={getClassificationColor('book')}
        />
        <StatRow
          label={getClassificationName('inaccuracy')}
          whiteCount={whiteStats.inaccuracy}
          blackCount={blackStats.inaccuracy}
          icon={getClassificationIcon('inaccuracy')}
          colorClass={getClassificationColor('inaccuracy')}
        />
        <StatRow
          label={getClassificationName('mistake')}
          whiteCount={whiteStats.mistake}
          blackCount={blackStats.mistake}
          icon={getClassificationIcon('mistake')}
          colorClass={getClassificationColor('mistake')}
        />
        <StatRow
          label={getClassificationName('blunder')}
          whiteCount={whiteStats.blunder}
          blackCount={blackStats.blunder}
          icon={getClassificationIcon('blunder')}
          colorClass={getClassificationColor('blunder')}
        />
      </div>
    </div>
  );
}
