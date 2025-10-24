import { LoaderCircle } from "lucide-react";
import { Button } from "./button";

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    loading?: boolean;
    children: React.ReactNode;
}

export function AppButton({ className, children, loading = false, ...props }: AppButtonProps) {
    return (
        <Button
            className={`cursor-pointer w-full md:w-auto ${className}`}
            disabled={loading || props.disabled}
            {...props}
        >
            <span className="font-bold text-md flex flex-row gap-2">
                {loading ? <><LoaderCircle className="animate-spin" />Carregando</> : children}
            </span>
        </Button >
    );
}