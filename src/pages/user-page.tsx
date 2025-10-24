import AppLayout from "@/components/ui/app-layout";
import { useParams } from "react-router-dom";

export default function UserPage() {
    const { username } = useParams();

    return (
        <AppLayout>
            <div>User Page: {username}</div>
        </AppLayout>
    )
}