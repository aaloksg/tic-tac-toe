'use client';

import DropDownInput, { OptionProps } from '@/components/inputs/DropDown';
import { useCallback, useRef, useState } from 'react';
import { GrScorecard } from 'react-icons/gr';
import GameBoard, { COMPUTER_PLAYERS } from './GameBoard';
import {
    GameData,
    GameResult,
    Player,
    XOValues,
} from '@/definitions/interfaces';
import useLocalData from '@/hooks/useLocalData';
import CustomButton from './inputs/CustomButton';
import GameStats from './GameStats';
import CustomCheckbox from './inputs/CustomCheckbox';
import { Field, Label } from '@headlessui/react';
import { cn } from 'clsx-for-tailwind';

type XOKey = OptionProps & {
    value: XOValues;
};

const XO_KEYS: XOKey[] = [
    {
        value: 'X',
    },
    {
        value: 'O',
    },
];

let lastHumanName = 'Player 2';

const GameUI = () => {
    const [gameInProgress, setGameInProgress] = useState(false);

    const localData = useLocalData<GameData>();

    const computerPlayer = useRef<Pick<Player, 'name' | 'isComputer'>>({
        name: localData.value?.computerPlayer || '',
        isComputer: true,
    });

    const [vsComputer, setOpponentComputer] = useState(
        !!localData.value?.computerPlayer
    );

    const computerNames = Object.values(COMPUTER_PLAYERS).map((name) => ({
        value: name,
    }));

    const handleComputerNameChange = ({ value }: OptionProps): void => {
        computerPlayer.current.name = value;
        handlePlayer2NameChange(value);
    };

    const [isBoltMode, setBoltMode] = useState(!!localData.value?.isBoltMode);

    const playVsComputer = (enable: boolean): void => {
        setOpponentComputer(enable);
        if (!enable) {
            setPlayer2({
                ...player2,
                isComputer: false,
                name:
                    lastHumanName &&
                    lastHumanName !== computerPlayer.current.name
                        ? lastHumanName
                        : 'Player 2',
            });
            return;
        }
        lastHumanName = player2.name;
        computerPlayer.current.name = COMPUTER_PLAYERS.random;
        if (player1.name === computerPlayer.current.name) {
            setPlayer1({
                ...player1,
                name: `${computerPlayer.current.name} (1)`,
            });
        }
        setPlayer2({
            ...player2,
            ...computerPlayer.current,
        });
    };

    const [player1, setPlayer1] = useState<Player>({
        name: localData.value?.lastPlayer1 ?? 'Player 1',
        key: XO_KEYS[0].value,
    });
    const player2Name = localData.value?.computerPlayer
        ? localData.value.computerPlayer
        : localData.value?.lastPlayer2 &&
            localData.value?.lastPlayer2 !== computerPlayer.current.name
          ? localData.value?.lastPlayer2
          : 'Player 2';
    const [player2, setPlayer2] = useState<Player>({
        name: player2Name,
        key: XO_KEYS[1].value,
        isComputer: !!localData.value?.computerPlayer,
    });

    const handlePlayer1NameChange = (newName: string): void => {
        const name = newName.trim();
        if (name === player2.name) {
            setPlayer1({
                ...player1,
                name: `${name} (1)`,
            });
            return;
        }
        setPlayer1({
            ...player1,
            name,
        });
    };
    const handlePlayer2NameChange = (newName: string): void => {
        const name = newName.trim();
        if (name === player1.name) {
            setPlayer2({
                ...player2,
                name: `${name} (1)`,
            });
            return;
        }
        setPlayer2({
            ...player2,
            name,
        });
    };

    const handleSetPlayer1Key = (newKey: XOKey): void => {
        const otherKey = XO_KEYS.find((key) => key.value !== newKey.value);
        if (!otherKey) return;

        setPlayer1({
            ...player1,
            key: newKey.value,
        });
        setPlayer2({
            ...player2,
            key: otherKey.value,
        });
    };
    const handleSetPlayer2Key = (newKey: XOKey): void => {
        const otherKey = XO_KEYS.find((key) => key.value !== newKey.value);
        if (!otherKey) return;

        setPlayer1({
            ...player1,
            key: otherKey.value,
        });
        setPlayer2({
            ...player2,
            key: newKey.value,
        });
    };

    const onGameRestart = (): void => {
        handleSetPlayer1Key({ value: player2.key });
    };

    const [showStats, setShowStats] = useState(false);

    const onGameEnd = useCallback(
        (result: GameResult): void => {
            const gameData = {
                ...(localData.value ??
                    ({
                        lastPlayer1: '',
                        lastPlayer2: '',
                        h2h: [],
                    } as GameData)),
            };

            gameData.lastPlayer1 = player1.name;
            gameData.lastPlayer2 = player2.name;

            gameData.computerPlayer = player2.isComputer ? player2.name : '';
            gameData.isBoltMode = isBoltMode;

            let h2hData = gameData.h2h.find(
                (item) =>
                    item.players.includes(player1.name) &&
                    item.players.includes(player2.name)
            );

            if (!h2hData) {
                h2hData = {
                    players: [player1.name, player2.name],
                    games: [],
                };
                gameData.h2h.push(h2hData);
            }
            h2hData.games.push({
                [player1.key]: player1.name,
                [player2.key]: player2.name,
                result,
                isBoltMode,
            });

            localData.value = gameData;

            if (result === 0) {
                console.log('Game drawn!');
                return;
            }
            if (result === 'X') {
                console.log('X won!');
                return;
            }
            if (result === 'O') {
                console.log('O won!');
                return;
            }
            // result === '-1
            console.log('Game aborted!');
            return;
        },
        [player1.key, player1.name, player2.key, player2.name]
    );

    return (
        <div className="flex h-full w-full flex-col gap-4 overflow-hidden bg-green-200 p-4 text-black md:flex-row">
            <div className="flex h-auto w-full flex-col gap-4 md:h-full md:w-auto md:shrink">
                <div className="flex w-full justify-around gap-2 md:w-auto md:flex-col">
                    <div className="flex flex-col gap-2 overflow-x-hidden">
                        <input
                            className="rounded-xl bg-amber-300 p-2"
                            type="text"
                            placeholder="Enter player 1 name"
                            value={player1.name}
                            onChange={(event) =>
                                handlePlayer1NameChange(event.target.value)
                            }
                            disabled={gameInProgress}
                        ></input>
                        <DropDownInput
                            items={XO_KEYS}
                            selectedId={player1.key}
                            selectOption={handleSetPlayer1Key}
                            disabled={gameInProgress}
                        />
                    </div>
                    <div className="flex flex-col gap-2 overflow-x-hidden">
                        {vsComputer ? (
                            <DropDownInput
                                items={computerNames}
                                selectedId={computerPlayer.current.name}
                                selectOption={handleComputerNameChange}
                                disabled={gameInProgress}
                                class="h-10 rounded-xl bg-amber-300 whitespace-nowrap text-black sm:min-w-40 md:min-w-50"
                            />
                        ) : (
                            <input
                                className="rounded-xl bg-amber-300 p-2 text-black"
                                type="text"
                                placeholder="Enter player 2 name"
                                value={player2.name}
                                onChange={(event) =>
                                    handlePlayer2NameChange(event.target.value)
                                }
                                disabled={gameInProgress}
                            ></input>
                        )}

                        <DropDownInput
                            items={XO_KEYS}
                            selectedId={player2.key}
                            selectOption={handleSetPlayer2Key}
                            disabled={gameInProgress}
                        />
                    </div>
                </div>
                <div className="relative flex flex-col gap-3 self-center rounded-lg border border-black p-4">
                    <span className="absolute top-0 left-2 -translate-y-1/2 bg-green-200 px-1">
                        Settings:
                    </span>
                    <Field className="flex items-center gap-2">
                        <CustomCheckbox
                            value={vsComputer}
                            handleUpdate={playVsComputer}
                            disabled={gameInProgress}
                        />
                        <Label
                            className={cn('cursor-pointer text-base', {
                                'cursor-default': gameInProgress,
                            })}
                        >
                            Play against Comput
                            <sup>
                                <strong>ictacto</strong>
                            </sup>
                            er
                        </Label>
                    </Field>
                    <Field className="flex items-center gap-2">
                        <CustomCheckbox
                            value={isBoltMode}
                            handleUpdate={setBoltMode}
                            disabled={gameInProgress}
                        />
                        <Label
                            className={cn('cursor-pointer text-base', {
                                'cursor-default': gameInProgress,
                            })}
                        >
                            Play Tic-Tac-Toe Bolt
                        </Label>
                    </Field>
                </div>
                <div className="flex justify-between gap-3 md:flex-col-reverse">
                    <div className="flex flex-col gap-1">
                        <span className="text-lg font-light italic">
                            Note:{' '}
                        </span>
                        <span className="text-base font-light italic">
                            X always goes first.
                        </span>
                    </div>
                    <CustomButton
                        className="flex h-min items-center justify-end gap-2 md:w-min md:justify-start md:whitespace-nowrap"
                        onClick={() => setShowStats(true)}
                    >
                        <span>Admire Stats</span>
                        <GrScorecard className="h-5 w-5" />
                    </CustomButton>
                </div>
            </div>
            <div className="h-auto w-full grow overflow-hidden md:h-full md:w-auto md:shrink-0">
                <GameBoard
                    player1={player1}
                    player2={player2}
                    setGameInProgress={setGameInProgress}
                    onGameEnd={onGameEnd}
                    onGameRestart={onGameRestart}
                    isBoltMode={isBoltMode}
                />
            </div>
            <GameStats
                show={showStats}
                data={localData.value}
                close={() => setShowStats(false)}
            />
        </div>
    );
};

export default GameUI;
