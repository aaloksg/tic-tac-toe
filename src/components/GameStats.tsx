import { GameData } from '@/definitions/interfaces';
import { cn } from 'clsx-for-tailwind';
import CustomButton from './inputs/CustomButton';
import Empty from './Empty';
import { useMemo, useState } from 'react';
import PlayerStats from './PlayerStats';
import GameModal from './GameModal';
import InfoStatSpan from './stats/InfoStat';

type GameStatsProps = {
    data: GameData | undefined;
    show: boolean;
    close: () => void;
};

const GameStats = ({ data, show, close }: GameStatsProps) => {
    const [players, setPlayers] = useState<string[]>([]);
    const [playerStats, setPlayerStats] = useState<GameData['h2h']>([]);

    const [totalGames, setTotalGames] = useState<number>(0);
    const [xWonGames, setXWonGames] = useState<number>(0);
    const [oWonGames, setOWonGames] = useState<number>(0);
    const [drawnGames, setDrawnGames] = useState<number>(0);

    const [selectedPlayer, selectPlayer] = useState<string>();

    useMemo(() => {
        if (!selectedPlayer || !data) {
            setPlayerStats([]);
            return;
        }
        setPlayerStats(
            data.h2h.filter((h2h) => h2h.players.includes(selectedPlayer))
        );
    }, [selectedPlayer, data]);

    useMemo(() => {
        if (!data) return;

        setPlayers(
            data.h2h.reduce((arr: string[], h2h) => {
                h2h.players.forEach((player) => {
                    if (!arr.includes(player)) {
                        arr.push(player);
                    }
                });
                return arr;
            }, [])
        );

        const [totalGames, xWon, oWon, drawn] = data.h2h.reduce(
            (sum: [number, number, number, number], h2h) => {
                const total = sum[0] + h2h.games.length;
                const x =
                    sum[1] +
                    h2h.games.filter((game) => game.result === 'X').length;
                const o =
                    sum[2] +
                    h2h.games.filter((game) => game.result === 'O').length;
                const drawn =
                    sum[3] +
                    h2h.games.filter((game) => game.result === 0).length;
                return [total, x, o, drawn];
            },
            [0, 0, 0, 0]
        );

        setTotalGames(totalGames);
        setXWonGames(xWon);
        setOWonGames(oWon);
        setDrawnGames(drawn);
    }, [data]);

    return (
        <GameModal show={show} close={close}>
            {(data && (
                <div className="flex h-full w-full flex-col gap-5 overflow-y-auto pt-5">
                    <div className="flex w-full flex-col items-center gap-2 text-lg text-amber-500">
                        <span>Total games played - {totalGames}</span>
                        <div className="flex w-full flex-wrap items-center justify-center gap-4">
                            <InfoStatSpan>
                                Games won by X - {xWonGames}
                            </InfoStatSpan>
                            <InfoStatSpan>
                                Games won by O - {oWonGames}
                            </InfoStatSpan>
                            <InfoStatSpan>
                                Games drawn - {drawnGames}
                            </InfoStatSpan>
                            <InfoStatSpan>
                                {`Games aborted - ${totalGames - xWonGames - oWonGames - drawnGames}`}
                            </InfoStatSpan>
                        </div>
                    </div>
                    <div className="flex w-full flex-col items-center gap-2 text-lg text-amber-500">
                        <span>Total number of players - {players.length}</span>
                        <div className="flex w-full flex-wrap items-center justify-center gap-3">
                            {players.map((player) => (
                                <CustomButton
                                    key={`button-${player}`}
                                    className={cn('text-sm text-black', {
                                        'opacity-80 outline-4 outline-white':
                                            player === selectedPlayer,
                                    })}
                                    onClick={() =>
                                        selectPlayer(
                                            player === selectedPlayer
                                                ? undefined
                                                : player
                                        )
                                    }
                                >
                                    {player}
                                </CustomButton>
                            ))}
                        </div>
                        {selectedPlayer && (
                            <PlayerStats
                                player={selectedPlayer}
                                data={playerStats}
                            />
                        )}
                    </div>
                </div>
            )) || <Empty elementsType="data">No data available.</Empty>}
        </GameModal>
    );
};

export default GameStats;
