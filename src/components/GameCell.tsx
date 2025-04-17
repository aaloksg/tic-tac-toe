'use client';

import { Player } from '@/definitions/interfaces';
import { cn } from 'clsx-for-tailwind';

type GameCellProps = {
    player: Player | undefined;
    className?: string | string[];
    onClick: () => void;
    disabled?: boolean;
};

const GameCell = ({
    player,
    className,
    onClick,
    disabled = false,
}: GameCellProps) => {
    return (
        <div
            className={cn(
                'flex aspect-square h-auto w-full items-center justify-center p-4',
                'border-2 border-solid border-emerald-950 transition-all duration-1000',
                'text-3xl font-bold capitalize',
                player?.key === 'X'
                    ? 'bg-black text-white'
                    : player?.key === 'O'
                      ? 'bg-white text-black'
                      : '',
                className
            )}
        >
            <button
                className="h-full w-full transition-all duration-500 enabled:cursor-pointer"
                onClick={() => onClick()}
                disabled={player !== undefined || disabled}
            >
                {player?.key || ''}
            </button>
        </div>
    );
};

export default GameCell;
