import AppLayout from "@/components/ui/app-layout";
import { ChessApiService } from "@/services/chess-api-service";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Clock, TrendingUp, Swords, Crown, Target } from "lucide-react";

interface PlayerProfile {
    username: string;
    avatar?: string;
    name?: string;
    title?: string;
    followers?: number;
    country?: string;
    joined?: number;
    '@id'?: string;
}

export default function UserPage() {
    const { username } = useParams();
    const _chessApiService = new ChessApiService();
    const navigate = useNavigate();

    const [archives, setArchives] = useState<{ archives: string[] }>({ archives: [] });
    const [games, setGames] = useState<{ games: any[] }>({ games: [] });
    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!username) return;

        const fetchUserData = async () => {
            try {
                const [profileData, archivesData] = await Promise.all([
                    _chessApiService.getPlayerProfile(username),
                    _chessApiService.getPlayerArchives(username)
                ]);

                setProfile(profileData);
                setArchives(archivesData);
                setSelectedMonth(archivesData.archives[archivesData.archives.length - 1] || "");
                handleMonthSelect(archivesData.archives[archivesData.archives.length - 1] || "");
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }

        fetchUserData();
    }, [username])

    const handleMonthSelect = async (archiveUrl: string) => {
        setSelectedMonth(archiveUrl);
        setLoading(true);
        try {
            const { year, month } = getMonthAndYearFromArchiveUrl(archiveUrl);
            const gamesData = await _chessApiService.getGamesByMonth(username!, year, month);
            gamesData.games = gamesData.games.sort((a: any, b: any) => b.end_time - a.end_time);
            setGames(gamesData);
        } catch (error) {
            console.error('Error fetching games for selected month:', error);
        } finally {
            setLoading(false);
        }
    }

    const getGameResult = (game: any, perspective: 'white' | 'black') => {
        const result = game[perspective].result;

        // Resultados que indicam vitória
        if (result === 'win') return 'vitória';

        // Resultados que indicam derrota
        if (['checkmated', 'resigned', 'timeout', 'abandoned', 'lose'].includes(result)) {
            return 'derrota';
        }

        // Resultados que indicam empate
        if (['agreed', 'stalemate', 'repetition', 'insufficient', '50move', 'timevsinsufficient'].includes(result)) {
            return 'empate';
        }

        return 'outro';
    }

    const getResultBadgeVariant = (result: string) => {
        if (result === 'win') return 'default';

        if (['checkmated', 'resigned', 'timeout', 'abandoned', 'lose'].includes(result)) {
            return 'destructive';
        }

        return 'secondary';
    }

    const getCountryCode = (countryUrl?: string) => {
        if (!countryUrl) return undefined;
        const parts = countryUrl.split('/');
        return parts[parts.length - 1];
    }

    const getCountryFlag = (countryCode?: string) => {
        if (!countryCode) return '🌍';
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const getGameStats = () => {
        const stats = {
            total: games.games.length,
            wins: 0,
            losses: 0,
            draws: 0
        };

        games.games.forEach(game => {
            const isWhite = game.white.username.toLowerCase() === username?.toLowerCase();
            const result = isWhite ? game.white.result : game.black.result;

            if (result === 'win') {
                stats.wins++;
            } else if (['checkmated', 'resigned', 'timeout', 'abandoned', 'lose'].includes(result)) {
                stats.losses++;
            } else if (['agreed', 'stalemate', 'repetition', 'insufficient', '50move', 'timevsinsufficient'].includes(result)) {
                stats.draws++;
            }
        });

        return stats;
    }

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header do Perfil */}
                <Card className="mb-8 bg-linear-to-br from-[#3d3a35] to-[#302e2b] border-[#4a4744]">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <Avatar className="h-24 w-24 border-4 border-primary">
                                <AvatarImage src={profile?.avatar} alt={username} />
                                <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                                    {username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-2">
                                    <CardTitle className="text-4xl text-white font-bold">
                                        {username}
                                    </CardTitle>
                                    {profile?.title && (
                                        <Badge variant="default" className="bg-amber-500 text-black hover:bg-amber-600">
                                            <Crown className="w-4 h-4 mr-1" />
                                            {profile.title}
                                        </Badge>
                                    )}
                                </div>
                                {profile?.name && (
                                    <CardDescription className="text-lg text-gray-300">
                                        {profile.name}
                                    </CardDescription>
                                )}
                                <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                                    {profile?.country && (
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <span className="text-2xl">{getCountryFlag(getCountryCode(profile.country))}</span>
                                            <span>{getCountryCode(profile.country)}</span>
                                        </div>
                                    )}
                                    {profile?.joined && (
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Calendar className="w-5 h-5" />
                                            <span>Desde {new Date(profile.joined * 1000).getFullYear()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Seletor de Período */}
                <Card className="mb-8 bg-[#3d3a35] border-[#4a4744]">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-primary" />
                            Análise de Partidas
                        </CardTitle>
                        <CardDescription className="text-gray-300">
                            Selecione um período para analisar suas partidas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Select onValueChange={handleMonthSelect} value={selectedMonth}>
                            <SelectTrigger className="w-full md:w-[280px] bg-[#302e2b] border-[#4a4744] text-white">
                                <SelectValue placeholder="📅 Selecione um mês" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#302e2b] border-[#4a4744]">
                                {archives.archives.map((archiveUrl) => {
                                    const { year, month } = getMonthAndYearFromArchiveUrl(archiveUrl);
                                    const monthName = new Date(year, month - 1).toLocaleString('pt-BR', { month: 'long' });
                                    return (
                                        <SelectItem
                                            key={archiveUrl}
                                            value={archiveUrl}
                                            className="text-white hover:bg-[#4a4744]"
                                        >
                                            {`${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`}
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* Estatísticas e Partidas */}
                {games && games.games.length > 0 && (
                    <div className="space-y-8">
                        {/* Cards de Estatísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {(() => {
                                const stats = getGameStats();
                                return (
                                    <>
                                        <Card className="bg-[#3d3a35] border-[#4a4744]">
                                            <CardHeader className="pb-3">
                                                <CardDescription className="text-gray-400 flex items-center gap-2">
                                                    <Target className="w-4 h-4" />
                                                    Total de Partidas
                                                </CardDescription>
                                                <CardTitle className="text-4xl text-white">{stats.total}</CardTitle>
                                            </CardHeader>
                                        </Card>

                                        <Card className="bg-linear-to-br from-green-900/40 to-[#3d3a35] border-green-700/50">
                                            <CardHeader className="pb-3">
                                                <CardDescription className="text-green-300 flex items-center gap-2">
                                                    <Trophy className="w-4 h-4" />
                                                    Vitórias
                                                </CardDescription>
                                                <CardTitle className="text-4xl text-green-400">{stats.wins}</CardTitle>
                                            </CardHeader>
                                        </Card>

                                        <Card className="bg-linear-to-br from-red-900/40 to-[#3d3a35] border-red-700/50">
                                            <CardHeader className="pb-3">
                                                <CardDescription className="text-red-300 flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4 rotate-180" />
                                                    Derrotas
                                                </CardDescription>
                                                <CardTitle className="text-4xl text-red-400">{stats.losses}</CardTitle>
                                            </CardHeader>
                                        </Card>

                                        <Card className="bg-linear-to-br from-gray-700/40 to-[#3d3a35] border-gray-600/50">
                                            <CardHeader className="pb-3">
                                                <CardDescription className="text-gray-300 flex items-center gap-2">
                                                    <Swords className="w-4 h-4" />
                                                    Empates
                                                </CardDescription>
                                                <CardTitle className="text-4xl text-gray-400">{stats.draws}</CardTitle>
                                            </CardHeader>
                                        </Card>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Lista de Partidas */}
                        <Card className="bg-[#3d3a35] border-[#4a4744]">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Swords className="w-6 h-6 text-primary" />
                                    Histórico de Partidas ({games.games.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-8 text-gray-400">
                                        Carregando partidas...
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {games.games.map((game, index) => {
                                            const isWhite = game.white.username.toLowerCase() === username?.toLowerCase();
                                            const playerSide = isWhite ? 'white' : 'black';
                                            const opponentSide = isWhite ? 'black' : 'white';
                                            const result = game[playerSide].result;

                                            return (
                                                <Card
                                                    key={index}
                                                    className="bg-[#302e2b] border-[#4a4744] hover:bg-[#3d3a35] transition-all cursor-pointer hover:border-primary"
                                                    onClick={() => navigate(`/${username}/game/${btoa(game.uuid)}`, { state: { game } })}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex items-center gap-3 flex-wrap">
                                                                    <Badge variant={getResultBadgeVariant(result)} className="font-bold">
                                                                        {getGameResult(game, playerSide).toUpperCase()}
                                                                    </Badge>
                                                                    <span className="text-white font-semibold">
                                                                        vs {game[opponentSide].username}
                                                                    </span>
                                                                    {game.time_class && (
                                                                        <Badge variant="outline" className="text-gray-300 border-gray-600">
                                                                            {game.time_class}
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-4 h-4" />
                                                                        {formatDate(game.end_time)}
                                                                    </span>
                                                                    <span>
                                                                        {isWhite ? '⚪ Brancas' : '⚫ Pretas'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="text-right">
                                                                <div className="text-2xl font-bold text-white">
                                                                    {game.white.rating} - {game.black.rating}
                                                                </div>
                                                                <div className="text-xs text-gray-400">
                                                                    Rating
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Mensagem quando nenhum mês está selecionado */}
                {!games.games.length && !loading && (
                    <Card className="bg-[#3d3a35] border-[#4a4744]">
                        <CardContent className="py-16 text-center">
                            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <CardTitle className="text-2xl text-gray-400 mb-2">
                                Selecione um período
                            </CardTitle>
                            <CardDescription className="text-gray-500">
                                Escolha um mês acima para visualizar e analisar suas partidas
                            </CardDescription>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    )
}

const getMonthAndYearFromArchiveUrl = (archiveUrl: string) => {
    const urlParts = archiveUrl.split('/');
    const year = parseInt(urlParts[urlParts.length - 2]);
    const month = parseInt(urlParts[urlParts.length - 1]);
    return { year, month };
}