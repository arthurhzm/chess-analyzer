import axios from "axios";

export class ChessApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = 'https://api.chess.com/pub';
    }

    async getPlayerProfile(username: string) {
        const response = await axios.get(`${this.baseUrl}/player/${username}`);
        return response.data;
    }

    async getPlayerArchives(username: string) {
        const response = await axios.get(`${this.baseUrl}/player/${username}/games/archives`);
        return response.data;
    }

    async getGamesByMonth(username: string, year: number, month: number) {
        const response = await axios.get(`${this.baseUrl}/player/${username}/games/${year}/${month.toString().padStart(2, '0')}`);
        return response.data;
    }
}