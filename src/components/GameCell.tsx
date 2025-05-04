'use client';

import { Player, XOValues } from '@/definitions/interfaces';
import { cn } from 'clsx-for-tailwind';

type GameCellProps = {
    player: Player | undefined;
    className?: string | string[];
    onClick: () => void;
    disabled?: boolean;
    fade?: boolean;
    winningCell?: boolean;
};

const CELL_COLORS: Record<XOValues | 'none', string> = {
    X: 'bg-black text-white',
    O: 'bg-white text-black',
    none: '',
};
const CELL_COLORS_FADED: Record<XOValues | 'none', string> = {
    X: 'bg-black/50 text-white/50 animate-pulse',
    O: 'bg-white/50 text-black/50 animate-pulse',
    none: '',
};

const GameCell = ({
    player,
    className,
    onClick,
    disabled = false,
    fade = false,
    winningCell = false,
}: GameCellProps) => {
    return (
        <div
            className={cn(
                'flex aspect-square h-auto w-full items-center justify-center',
                'border-2 border-solid border-emerald-950 transition-all duration-1000',
                'text-3xl font-bold capitalize',
                className
            )}
        >
            <button
                className={cn(
                    'h-full w-full p-4 transition-all duration-500 enabled:cursor-pointer',
                    (fade ? CELL_COLORS_FADED : CELL_COLORS)[
                        player?.key || 'none'
                    ],
                    { 'bg-amber-300': winningCell }
                )}
                onClick={() => onClick()}
                disabled={player !== undefined || disabled}
            >
                {player?.key || ''}
            </button>
        </div>
    );
};

export default GameCell;
