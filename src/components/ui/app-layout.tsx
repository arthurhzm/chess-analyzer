export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className='p-2 bg-[#302e2b] min-h-screen h-full max-h-full w-screen min-w-screen max-w-full'>
            {children}
        </div>
    )
}