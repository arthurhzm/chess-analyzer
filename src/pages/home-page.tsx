import { AppButton } from '@/components/ui/app-button'
import AppLayout from '@/components/ui/app-layout'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import chess_pieces from '../assets/images/chess-pieces.png'
import { ChessApiService } from '@/services/chess-api-service'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, TrendingUp, Target, Zap, Search, Trophy, BarChart3, Sparkles } from 'lucide-react'

export default function HomePage() {
    const _chessApiService = new ChessApiService();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUserSearch = async () => {
        if (!username) return;
        setLoading(true);
        try {
            const profile = await _chessApiService.getPlayerProfile(username);
            navigate(`/${profile.username}`);
        } catch (error) {
            console.error('Error fetching player profile:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleUserSearch();
        }
    }

    return (
        <AppLayout>
            {/* Chess Pattern Background */}
            <div className="fixed inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0" />
            </div>

            <div className="w-full min-h-screen flex flex-col relative">
                {/* Hero Section */}
                <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-4 py-8 lg:py-12 max-w-7xl mx-auto">
                    {/* Left Side - Image */}
                    <div className="w-full lg:w-1/2 max-w-xl">
                        <div className="relative">
                            <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-blue-500/20 blur-3xl rounded-full" />
                            <img
                                src={chess_pieces}
                                alt="Chess Pieces"
                                className="relative h-auto w-full drop-shadow-2xl animate-in fade-in slide-in-from-left-10 duration-700"
                            />
                        </div>
                    </div>

                    {/* Right Side - Search Card */}
                    <div className="w-full lg:w-1/2 max-w-xl animate-in fade-in slide-in-from-right-10 duration-700">
                        <div className="relative">
                            {/* Glow effect with animation */}
                            <div className="absolute -inset-1 bg-linear-to-r from-primary to-blue-500 rounded-2xl blur-xl opacity-20 animate-pulse" />

                            <Card className="relative bg-card/80 backdrop-blur-md border-2 border-border/50 shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                                <CardHeader className="space-y-4 pb-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                                            </div>
                                            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                                                Chess Analyzer
                                            </CardTitle>
                                        </div>
                                        <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 text-xs">
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            Grátis
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-base sm:text-lg text-muted-foreground">
                                        Análise avançada de partidas com Stockfish
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                                <Search className="w-4 h-4" />
                                                Digite seu username do Chess.com
                                            </label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="ex: magnuscarlsen"
                                                    className="flex-1 h-12 text-base bg-background/50 border-2 border-border focus:border-primary transition-all"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.currentTarget.value)}
                                                    onKeyPress={handleKeyPress}
                                                />
                                                <AppButton
                                                    onClick={handleUserSearch}
                                                    loading={loading}
                                                    className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 hover:scale-105"
                                                >
                                                    {loading ? 'Buscando...' : 'Analisar'}
                                                </AppButton>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            💡 Acesse análises profundas de suas partidas gratuitamente
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-3 gap-3 mt-6">
                            <FeatureCard
                                icon={<Zap className="w-5 h-5" />}
                                title="Stockfish"
                                description="Motor profissional"
                            />
                            <FeatureCard
                                icon={<BarChart3 className="w-5 h-5" />}
                                title="Estatísticas"
                                description="Detalhadas"
                            />
                            <FeatureCard
                                icon={<Trophy className="w-5 h-5" />}
                                title="Análise"
                                description="Movimento a movimento"
                            />
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="bg-card/30 backdrop-blur-sm border-t border-border/50 py-12 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12 space-y-3">
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                                Por que usar o Chess Analyzer?
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Ferramentas profissionais de análise ao seu alcance
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InfoCard
                                icon={<Target className="w-10 h-10 text-primary" />}
                                title="Precisão Máxima"
                                description="Análise com Stockfish, o motor de xadrez mais forte do mundo"
                            />
                            <InfoCard
                                icon={<TrendingUp className="w-10 h-10 text-primary" />}
                                title="Evolua seu Jogo"
                                description="Identifique erros, aprenda com os melhores movimentos"
                            />
                            <InfoCard
                                icon={<BarChart3 className="w-10 h-10 text-primary" />}
                                title="Estatísticas Completas"
                                description="Veja accuracy, classificação de movimentos e muito mais"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="py-6 px-4 text-center border-t border-border/30">
                    <p className="text-sm text-muted-foreground">
                        Desenvolvido com ♟️ para jogadores de xadrez
                    </p>
                </div>
            </div>
        </AppLayout>
    )
}

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
    return (
        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 text-center hover:bg-card/90 transition-all hover:scale-105 hover:shadow-lg hover:border-primary/30 group">
            <div className="flex justify-center mb-1 text-primary group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xs font-semibold text-foreground">{title}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
        </div>
    )
}

const InfoCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
    return (
        <Card className="bg-card/60 backdrop-blur-sm border border-border/50 hover:bg-card/90 transition-all hover:scale-105 hover:shadow-2xl hover:border-primary/30 group cursor-pointer">
            <CardHeader>
                <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-all group-hover:scale-110">
                    {icon}
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">{title}</CardTitle>
                <CardDescription className="text-base">
                    {description}
                </CardDescription>
            </CardHeader>
        </Card>
    )
}