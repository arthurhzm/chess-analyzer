import AppLayout from "@/components/ui/app-layout";
import { ChessApiService } from "@/services/chess-api-service";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function UserPage() {
    const { username } = useParams();
    const _chessApiService = new ChessApiService();
    const navigate = useNavigate();

    const [archives, setArchives] = useState<{ archives: string[] }>({ archives: [] });
    const [games, setGames] = useState<{ games: any[] }>({ games: [] });

    useEffect(() => {
        if (!username) return;
        const fetchUserArchives = async () => {
            try {
                const archives = await _chessApiService.getPlayerArchives(username);
                setArchives(archives);
            } catch (error) {
                console.error('Error fetching player archives:', error);
            }
        }

        fetchUserArchives();

    }, [username])

    const handleMonthSelect = async (archiveUrl: string) => {
        try {
            const { year, month } = getMonthAndYearFromArchiveUrl(archiveUrl);
            const games = await _chessApiService.getGamesByMonth(username!, year, month);
            console.log(games);
            
            setGames(games);
        } catch (error) {
            console.error('Error fetching games for selected month:', error);
        }
    }

    return (
        <AppLayout>
            <div>User Page: {username}</div>
            <Select onValueChange={(value) => handleMonthSelect(value)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione um mês" />
                </SelectTrigger>
                <SelectContent>
                    {archives.archives.map((archiveUrl) => {
                        const { year, month } = getMonthAndYearFromArchiveUrl(archiveUrl);
                        const monthName = new Date(year, month - 1).toLocaleString('pt-BR', { month: 'long' });
                        return (
                            <SelectItem key={archiveUrl} value={archiveUrl}>
                                {`${monthName} ${year}`}
                            </SelectItem>
                        )
                    })}
                </SelectContent>
            </Select>
            {games && games.games.length > 0 && (
                <div>
                    <h2>Histórico de partidas ({games.games.length})</h2>
                    <ul>
                        {games.games.map((game, index) => (
                            <li
                                key={index}
                                onClick={() => navigate(`/${username}/game/${btoa(game.uuid)}`, { state: { game } })}
                            >
                                {game.white.username} vs {game.black.username} - Result: {game.white.result}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </AppLayout>
    )
}

const getMonthAndYearFromArchiveUrl = (archiveUrl: string) => {
    const urlParts = archiveUrl.split('/');
    const year = parseInt(urlParts[urlParts.length - 2]);
    const month = parseInt(urlParts[urlParts.length - 1]);
    return { year, month };
}