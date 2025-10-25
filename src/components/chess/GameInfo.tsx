import type { ChessGame } from '@/types/chess';
import { Calendar, Clock, Trophy, Users } from 'lucide-react';

interface GameInfoProps {
  game: ChessGame;
  opening?: string;
}

export default function GameInfo({ game, opening }: GameInfoProps) {
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getResultDisplay = () => {
    if (game.white.result === 'win') return '1-0';
    if (game.black.result === 'win') return '0-1';
    return '½-½';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      {/* Players */}
      <div className="space-y-3">
        {/* White Player */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-bold">
              {game.white.username[0].toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-foreground">{game.white.username}</div>
              <div className="text-sm text-muted-foreground">{game.white.rating}</div>
            </div>
          </div>
          {game.white.result === 'win' && (
            <Trophy className="w-5 h-5 text-yellow-500" />
          )}
        </div>

        {/* Black Player */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold">
              {game.black.username[0].toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-foreground">{game.black.username}</div>
              <div className="text-sm text-muted-foreground">{game.black.rating}</div>
            </div>
          </div>
          {game.black.result === 'win' && (
            <Trophy className="w-5 h-5 text-yellow-500" />
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Game Info */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>Resultado:</span>
          <span className="font-semibold text-foreground">{getResultDisplay()}</span>
        </div>

        {opening && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>📖</span>
            <span>Abertura:</span>
            <span className="font-semibold text-foreground">{opening}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Controle de Tempo:</span>
          <span className="font-semibold text-foreground">{game.time_control}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Data:</span>
          <span className="font-semibold text-foreground">
            {formatDate(game.end_time)}
          </span>
        </div>
      </div>

      {/* Link to original game */}
      <a
        href={game.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-sm text-blue-500 hover:text-blue-400 transition-colors"
      >
        Ver no Chess.com →
      </a>
    </div>
  );
}
