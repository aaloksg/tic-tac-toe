import { cn } from 'clsx-for-tailwind';
import { MouseEventHandler } from 'react';

type CustomButtonProps = {
    onClick: MouseEventHandler<HTMLButtonElement>;
    className?: string | string[];
    disabled?: boolean;
};
const CustomButton = ({
    onClick,
    className,
    disabled = false,
    children,
}: React.PropsWithChildren<CustomButtonProps>) => {
    return (
        <button
            className={cn(
                'rounded-lg p-2',
                'active:scale-95 enabled:hover:scale-105 enabled:active:opacity-80',
                'bg-yellow-400 text-black disabled:bg-yellow-800/80',
                'pointer-events-auto cursor-pointer disabled:cursor-not-allowed',
                className
            )}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default CustomButton;
