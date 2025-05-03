'use client';

import { GameResult, Player, XOValues } from '@/definitions/interfaces';
import { useCallback, useEffect, useMemo, useState } from 'react';
import GameCell from './GameCell';
import { cn } from 'clsx-for-tailwind';
import CustomButton from './inputs/CustomButton';

const GAME_STARTS_WITH: XOValues = 'X';

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
    isBoltMode?: boolean;
};

type GameCell = {
    player: Player | undefined;
    index: number;
};

let _computerTurnPending = false;

const GameBoard = ({
    player1,
    player2,
    setGameInProgress,
    onGameEnd,
    onGameRestart,
    isBoltMode,
}: GameBoardProps) => {
    const [cells, setCells] = useState<GameCell[]>([]);
    const [isPlayer1, setIsPlayer1] = useState<boolean>();
    const [moveNo, setMoveNo] = useState(0);
    const [isDraw, setIsDraw] = useState<boolean>(false);
    const [winner, setWinner] = useState<Player>();
    const [winningSequence, setWinningSequence] = useState<WinSequence>();

    const [isComputerTurn, setComputerTurn] = useState(false);

    const [player1Turns, setPlayer1Turns] = useState<number[]>([]);
    const [player2Turns, setPlayer2Turns] = useState<number[]>([]);

    useEffect(() => {
        if (moveNo > 0) {
            return;
        }
        setIsPlayer1(player1.key === GAME_STARTS_WITH);
        const nextPlayer = player1.key === GAME_STARTS_WITH ? player1 : player2;
        _computerTurnPending = !!nextPlayer.isComputer;
        setComputerTurn(_computerTurnPending);

        setCells(
            Array(9)
                .fill(1)
                .map((_, index) => ({
                    player: undefined,
                    index,
                }))
        );
    }, [player1.key, player1.isComputer, player2.isComputer, moveNo]);

    useEffect(() => {
        if (winner) {
            setGameInProgress(false);
            onGameEnd?.(winner.key);
            return;
        }
        if (cells.every((cell) => cell.player !== undefined)) {
            setGameInProgress(false);
            setIsDraw(true);
            onGameEnd?.(0);
            return;
        }
        setGameInProgress(moveNo > 0);
    }, [moveNo, winner, setGameInProgress]);

    const resetGame = () => {
        setWinner(undefined);
        setIsDraw(false);
        setWinningSequence(undefined);
        setComputerTurn(false);
        setMoveNo(0);
        setPlayer1Turns([]);
        setPlayer2Turns([]);
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
    };

    const setNextPlayer = (): void => {
        const nextPlayer = isPlayer1 ? player2 : player1;
        setIsPlayer1(!isPlayer1);
        _computerTurnPending = !!nextPlayer.isComputer;
        setComputerTurn(_computerTurnPending);
    };

    const makeComputerMove = useCallback(() => {
        if (winner || isDraw || !isComputerTurn || !_computerTurnPending) {
            return;
        }
        const freeCellIndices = cells.flatMap((cell) =>
            cell.player ? [] : [cell.index]
        );

        if (!freeCellIndices.length) return;

        const randomIndex = Math.floor(Math.random() * freeCellIndices.length);

        handleOnClick(freeCellIndices[randomIndex]);
        _computerTurnPending = false;
    }, [isComputerTurn]);

    const handleOnClick = (index: number): void => {
        const currentCell = cells[index];
        if (!currentCell) return;

        const updatedCells = cells.slice();
        updatedCells[index].player = isPlayer1 ? player1 : player2;

        if (isPlayer1) {
            if (isBoltMode && player1Turns.length > 2) {
                updatedCells[player1Turns[0]].player = undefined;
                setPlayer1Turns([...player1Turns.slice(1), index]);
            } else {
                setPlayer1Turns([...player1Turns, index]);
            }
        } else {
            if (isBoltMode && player2Turns.length > 2) {
                updatedCells[player2Turns[0]].player = undefined;
                setPlayer2Turns([...player2Turns.slice(1), index]);
            } else {
                setPlayer2Turns([...player2Turns, index]);
            }
        }

        setCells(updatedCells);
        setMoveNo(moveNo + 1);
        setNextPlayer();
        calculateWinner();
    };

    useMemo(() => {
        if (!isComputerTurn) return;

        setTimeout(makeComputerMove, 1500);
    }, [isComputerTurn]);

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
                                className={cn(
                                    'max-h-1/3 max-w-1/3',
                                    {
                                        'bg-amber-300':
                                            winningSequence?.includes(
                                                cell.index
                                            ),
                                    },
                                    {
                                        'opacity-75':
                                            isBoltMode &&
                                            (isPlayer1
                                                ? cell.player === player1 &&
                                                  player1Turns.length > 2 &&
                                                  player1Turns[0] === cell.index
                                                : cell.player === player2 &&
                                                  player2Turns.length > 2 &&
                                                  player2Turns[0] ===
                                                      cell.index),
                                    }
                                )}
                                disabled={isComputerTurn}
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
