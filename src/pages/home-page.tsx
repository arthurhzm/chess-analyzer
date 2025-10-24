import chess_pieces from '../assets/images/chess-pieces.png'

export default function HomePage() {
    return (
        <div className="bg-[#302e2b] min-h-screen flex items-center justify-center">
            <img src={chess_pieces} alt="Chess Pieces" className="w- h-auto" />
            <div>
                <span className='text-4xl text-white font-bold'>Informe seu username</span>
                <div>

                </div>
            </div>
        </div>
    )
}