'use client';

import { GameResult, Player, XOValues } from '@/definitions/interfaces';
import { useCallback, useEffect, useMemo, useState } from 'react';
import GameCell from './GameCell';
import { cn } from 'clsx-for-tailwind';
import CustomButton from './inputs/CustomButton';

const GAME_STARTS_WITH: XOValues = 'X';

export const COMPUTER_PLAYERS = {
    random: 'Mick',
    attack: 'Mack',
    smart: 'Moe',
};

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
        if (cells.length && cells.every((cell) => cell.player !== undefined)) {
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

    const getComputerMoves = (): [number, number, number] => {
        let winningIndex = -1;
        let defensiveIndex = -1;
        let attackingIndex = -1;
        WINNING_SEQUENCES.find((seq) => {
            const includes: number[] = [];
            const freeCells: number[] = [];
            const player1Includes: number[] = [];
            seq.forEach((index) => {
                if (player2Turns.includes(index)) {
                    includes.push(index);
                } else if (player1Turns.includes(index)) {
                    player1Includes.push(index);
                } else {
                    freeCells.push(index);
                }
            });
            if (includes.length === 2 && freeCells.length === 1) {
                winningIndex = freeCells[0];
                return true;
            }
            if (
                defensiveIndex === -1 &&
                player1Includes.length === 2 &&
                freeCells.length === 1
            ) {
                defensiveIndex = freeCells[0];
            } else if (
                attackingIndex === -1 &&
                includes.length === 1 &&
                freeCells.length === 2
            ) {
                attackingIndex = freeCells[0];
            }
            return false;
        });
        return [winningIndex, defensiveIndex, attackingIndex];
    };

    const makeRandomMove = (): number | undefined => {
        const freeCellIndices = cells.flatMap((cell) =>
            cell.player ? [] : [cell.index]
        );

        if (!freeCellIndices.length) return undefined;

        return freeCellIndices[
            Math.floor(Math.random() * freeCellIndices.length)
        ];
    };

    const makeAttackingMove = (): number | undefined => {
        const [winningIndex, , attackingIndex] = getComputerMoves();
        if (winningIndex !== -1) return winningIndex;

        if (attackingIndex !== -1) return attackingIndex;

        return makeRandomMove();
    };

    const makeSmartMove = (): number | undefined => {
        const [winningIndex, defensiveIndex, attackingIndex] =
            getComputerMoves();
        if (winningIndex !== -1) return winningIndex;

        if (defensiveIndex !== -1) return defensiveIndex;

        if (attackingIndex !== -1) return attackingIndex;

        return makeRandomMove();
    };

    const makeComputerMove = useCallback(() => {
        if (winner || isDraw || !isComputerTurn || !_computerTurnPending) {
            return;
        }

        const nextMove =
            player2.name === COMPUTER_PLAYERS.random
                ? makeRandomMove()
                : player2.name === COMPUTER_PLAYERS.attack
                  ? makeAttackingMove()
                  : makeSmartMove();

        if (nextMove === undefined) return;

        handleOnClick(nextMove);
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
        <div className="flex h-full w-full flex-col justify-center gap-3 overflow-hidden">
            {!winner && !isDraw && (
                <div className="flex w-full items-center justify-center">
                    <span className="text-xl font-bold text-amber-950">{`${isPlayer1 ? player1.name : player2.name} to play...`}</span>
                </div>
            )}
            <div className="relative w-full overflow-hidden md:grow">
                <div className="flex h-full w-full flex-col items-center justify-center">
                    <div className="flex aspect-square max-h-full max-w-full flex-wrap gap-0 rounded-xl border-4 border-solid border-black sm:grow">
                        {cells.map((cell) => (
                            <GameCell
                                key={`cell-${cell.index}`}
                                player={cell.player}
                                className="max-h-1/3 max-w-1/3"
                                fade={
                                    isBoltMode &&
                                    (isPlayer1
                                        ? cell.player === player1 &&
                                          player1Turns.length > 2 &&
                                          player1Turns[0] === cell.index
                                        : cell.player === player2 &&
                                          player2Turns.length > 2 &&
                                          player2Turns[0] === cell.index)
                                }
                                winningCell={winningSequence?.includes(
                                    cell.index
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
            {!winner && !isDraw && (
                <div className="flex w-full items-center justify-center lg:hidden">
                    <span className="-rotate-180 text-xl font-bold text-amber-950">{`${isPlayer1 ? player1.name : player2.name} to play...`}</span>
                </div>
            )}
        </div>
    );
};

export default GameBoard;
