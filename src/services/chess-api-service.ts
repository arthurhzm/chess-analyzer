import axios from "axios";

export class ChessApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = 'https://api.chess.com/pub';
    }

    async getPlayerProfile(username: string) {
        console.log('alo');
        const response = await axios.get(`${this.baseUrl}/player/${username}`);
        console.log(response);

        return response.data;
    }
}