import { Button } from "./button";

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
}

export function AppButton({ onClick, className, children, ...props }: AppButtonProps) {
    return (
        <Button
            className={`cursor-pointer w-full md:w-auto ${className}`}
            {...props}
        >
            <span className="font-bold text-md">
                {children}
            </span>
        </Button>
    );
}