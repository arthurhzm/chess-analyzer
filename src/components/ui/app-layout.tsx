export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className='p-2 bg-[#302e2b] min-h-screen h-screen w-screen min-w-screen max-w-full max-h-full'>
            {children}
        </div>
    )
}