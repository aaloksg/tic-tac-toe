'use client';

import { GameResult, Player, XOValues } from '@/definitions/interfaces';
import { useEffect, useState } from 'react';
import GameCell from './GameCell';
import { cn } from 'clsx-for-tailwind';
import CustomButton from './inputs/CustomButton';

const GAME_STARTS_WITH: XOValues = 'X';
const MAX_MOVES = 9;

type WinSequence = [number, number, number];
const WINNING_SEQUENCES: WinSequence[] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

type GameBoardProps = {
    player1: Player;
    player2: Player;
    setGameInProgress: (progress: boolean) => void;
    onGameEnd?: (gameResult: GameResult) => void;
    onGameRestart: () => void;
};

type GameCell = {
    player: Player | undefined;
    index: number;
};

const GameBoard = ({
    player1,
    player2,
    setGameInProgress,
    onGameEnd,
    onGameRestart,
}: GameBoardProps) => {
    const [cells, setCells] = useState<GameCell[]>([]);
    const [isPlayer1, setIsPlayer1] = useState<boolean>();
    const [moveNo, setMoveNo] = useState(0);
    const [isDraw, setIsDraw] = useState<boolean>(false);
    const [winner, setWinner] = useState<Player>();
    const [winningSequence, setWinningSequence] = useState<WinSequence>();

    useEffect(() => {
        if (moveNo > 0) {
            return;
        }
        setIsPlayer1(player1.key === GAME_STARTS_WITH);
        setCells(
            Array(9)
                .fill(1)
                .map((_, index) => ({
                    player: undefined,
                    index,
                }))
        );
    }, [player1.key, moveNo]);

    useEffect(() => {
        if (winner) {
            setGameInProgress(false);
            onGameEnd?.(winner.key);
            return;
        }
        if (moveNo === MAX_MOVES) {
            setGameInProgress(false);
            setIsDraw(true);
            onGameEnd?.(0);
            return;
        }
        setGameInProgress(moveNo > 0);
    }, [moveNo, winner, onGameEnd, setGameInProgress]);

    const resetGame = () => {
        setWinner(undefined);
        setIsDraw(false);
        setWinningSequence(undefined);
        setMoveNo(0);
        onGameRestart();
    };

    const checkSequence = (seq: WinSequence): boolean => {
        const [a, b, c] = seq;
        return (
            !!cells[a].player &&
            cells[a].player === cells[b].player &&
            cells[b].player === cells[c].player
        );
    };

    const calculateWinner = () => {
        const winningSequence = WINNING_SEQUENCES.find((seq) =>
            checkSequence(seq)
        );
        if (!winningSequence) return;

        setWinningSequence(winningSequence);
        setWinner(cells[winningSequence[0]].player);
        return;
    };

    const setNextPlayer = (): void => {
        setIsPlayer1(!isPlayer1);
    };

    const handleOnClick = (index: number): void => {
        const currentCell = cells[index];
        if (!currentCell) return;

        const updatedCells = cells.slice();
        updatedCells[index].player = isPlayer1 ? player1 : player2;

        setCells(updatedCells);
        setMoveNo(moveNo + 1);
        setNextPlayer();
        calculateWinner();
    };

    return (
        <div className="flex h-full w-full flex-col gap-3 overflow-hidden">
            {!winner && !isDraw && (
                <div className="flex w-full items-center justify-center">
                    <span className="text-xl font-bold text-amber-950">{`${isPlayer1 ? player1.name : player2.name} to play...`}</span>
                </div>
            )}
            <div className="relative w-full grow overflow-hidden">
                <div className="flex h-full w-full flex-col items-center">
                    <div className="flex aspect-square h-min max-h-full max-w-full flex-wrap gap-0 rounded-xl border-4 border-solid border-black sm:grow">
                        {cells.map((cell) => (
                            <GameCell
                                key={`cell-${cell.index}`}
                                player={cell.player}
                                className={cn('max-h-1/3 max-w-1/3', {
                                    'bg-amber-300': winningSequence?.includes(
                                        cell.index
                                    ),
                                })}
                                onClick={() => handleOnClick(cell.index)}
                            />
                        ))}
                    </div>
                </div>
                {(winner || isDraw) && (
                    <div
                        className={cn(
                            'absolute inset-0 flex h-full w-full flex-col items-center justify-center p-4',
                            'pointer-events-none rounded-lg bg-black/75',
                            'text-center text-5xl font-bold text-amber-700 uppercase md:text-6xl lg:text-7xl'
                        )}
                    >
                        <span>
                            {winner ? `${winner.name} wins!!` : `It's a DRAW!`}
                        </span>
                        <CustomButton
                            className="absolute top-3 right-3 text-sm"
                            onClick={resetGame}
                        >
                            Play again!
                        </CustomButton>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameBoard;
