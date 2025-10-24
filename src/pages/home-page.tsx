import { AppButton } from '@/components/ui/app-button'
import AppLayout from '@/components/ui/app-layout'
import { Input } from '@/components/ui/input'
import chess_pieces from '../assets/images/chess-pieces.png'

export default function HomePage() {
    return (
        <AppLayout>
            <div className="w-full h-full flex flex-col md:flex-row gap-2 justify-center items-center">
                <div className="w-full md:w-1/3">
                    <img src={chess_pieces} alt="Chess Pieces" className="h-auto" />
                </div>
                <div className='w-full md:w-1/3 flex flex-col gap-4 items-center'>
                    <SpanGetStarted>Vamos começar!</SpanGetStarted>
                    <SpanGetStarted>Informe seu username</SpanGetStarted>
                    <div className="w-full flex flex-col gap-4 md:gap-0 md:flex-row items-center ">
                        <Input
                            placeholder="Digite seu username do chess.com"
                            className="w-full md:w-11/12 md:rounded-r-none"
                        />
                        <AppButton className='md:rounded-l-none'>
                            Começar
                        </AppButton>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

const SpanGetStarted = ({ children }: { children: React.ReactNode }) => {
    return (
        <span className='text-3xl md:text-4xl text-white font-bold'>
            {children}
        </span>
    )
}