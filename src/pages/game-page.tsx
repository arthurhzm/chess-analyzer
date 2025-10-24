import AppLayout from "@/components/ui/app-layout";
import { useLocation } from "react-router-dom";

export default function GamePage() {

    const { game } = useLocation().state;
    console.log(game);
    
    return (
        <AppLayout>
            fodase
        </AppLayout>
    )
}