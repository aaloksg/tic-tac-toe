import { GameData } from '@/definitions/interfaces';
import { cn } from 'clsx-for-tailwind';
import CustomButton from './inputs/CustomButton';
import { useMemo, useState } from 'react';
import GameModal from './GameModal';
import ModernPieChart, {
    ModernPieChartProps,
} from './visualizations/ModernPieChart';
import PlayerStatRow from './stats/PlayerStatRow';
import InfoStatSpan from './stats/InfoStat';

type PlayerStatsProps = {
    player: string;
    data: GameData['h2h'];
};

type H2HStat = [number, number];

type StatsVsOpponent = {
    games: number;
    won: H2HStat;
    wonAsX: H2HStat;
    wonAsO: H2HStat;
    lost: H2HStat;
    lostAsX: H2HStat;
    lostAsO: H2HStat;
    drawn: number;
    drawnAsX: H2HStat;
    drawnAsO: H2HStat;
    aborted: number;
};

const PlayerStats = ({ data, player }: PlayerStatsProps) => {
    const [opponents, setOpponents] = useState<string[]>([]);

    const [totalGames, setTotalGames] = useState<number>(0);
    const [gamesWon, setGamesWon] = useState<number>(0);
    const [gamesLost, setGamesLost] = useState<number>(0);
    const [gamesDrawn, setGamesDrawn] = useState<number>(0);

    const [selectedOpponent, selectOpponent] = useState<string>();

    const [statsVs, setStatsVs] = useState<StatsVsOpponent>();

    useMemo(() => {
        if (!selectedOpponent || !data) {
            setStatsVs(undefined);
            return;
        }

        if (!opponents.includes(selectedOpponent)) {
            selectOpponent(undefined);
            return;
        }

        const games = data
            .filter((h2h) => h2h.players.includes(selectedOpponent))
            .flatMap((h2h) => h2h.games);
        const totalGames = games.length;
        const gamesWon = games.filter(
            (game) =>
                (game.result === 'X' || game.result === 'O') &&
                game[game.result] === player
        );
        const gamesWonAsX = gamesWon.filter(
            (game) => game.result === 'X'
        ).length;
        const gamesWonAsO = gamesWon.filter(
            (game) => game.result === 'O'
        ).length;

        const gamesLost = games.filter(
            (game) =>
                (game.result === 'X' || game.result === 'O') &&
                game[game.result] === selectedOpponent
        );
        const gamesLostAsX = gamesLost.filter(
            (game) => game.result === 'X'
        ).length;
        const gamesLostAsO = gamesLost.filter(
            (game) => game.result === 'O'
        ).length;

        const gamesDrawn = games.filter((game) => game.result === 0);

        const gamesDrawnAsX = gamesDrawn.filter(
            (game) => game['X'] === player
        ).length;
        const gamesDrawnAsO = gamesDrawn.filter(
            (game) => game['O'] === player
        ).length;

        const gamesAborted =
            totalGames - gamesDrawn.length - gamesWon.length - gamesLost.length;

        setStatsVs({
            games: totalGames,
            won: [gamesWon.length, gamesLost.length],
            wonAsX: [gamesWonAsX, gamesLostAsO],
            wonAsO: [gamesWonAsO, gamesLostAsX],
            lost: [gamesLost.length, gamesWon.length],
            lostAsX: [gamesLostAsX, gamesWonAsO],
            lostAsO: [gamesLostAsO, gamesWonAsX],
            drawn: gamesDrawn.length,
            drawnAsX: [gamesDrawnAsX, gamesDrawnAsO],
            drawnAsO: [gamesDrawnAsO, gamesDrawnAsX],
            aborted: gamesAborted,
        });
    }, [player, selectedOpponent, data, opponents]);

    useMemo(() => {
        if (!data) return;

        setOpponents(
            data.reduce((arr: string[], h2h) => {
                h2h.players.forEach((opponent) => {
                    if (!arr.includes(opponent) && opponent !== player) {
                        arr.push(opponent);
                    }
                });
                return arr;
            }, [])
        );

        const [totalGames, won, lost, drawn] = data.reduce(
            (sum: [number, number, number, number], h2h) => {
                const total = sum[0] + h2h.games.length;
                const won =
                    sum[1] +
                    h2h.games.filter(
                        (game) =>
                            (game.result === 'X' || game.result === 'O') &&
                            game[game.result] === player
                    ).length;
                const lost =
                    sum[2] +
                    h2h.games.filter(
                        (game) =>
                            (game.result === 'X' || game.result === 'O') &&
                            game[game.result] !== player
                    ).length;
                const drawn =
                    sum[3] +
                    h2h.games.filter((game) => game.result === 0).length;
                return [total, won, lost, drawn];
            },
            [0, 0, 0, 0]
        );

        setTotalGames(totalGames);
        setGamesWon(won);
        setGamesLost(lost);
        setGamesDrawn(drawn);
    }, [data, player]);

    const [attributeStat, setAttributeStat] = useState<ModernPieChartProps>();

    return (
        <div className="flex w-full flex-col items-center gap-4 p-4 text-lg text-amber-500">
            <span className="self-start text-2xl font-light">{`${player}'s stats:`}</span>
            <div className="flex w-full flex-col items-center gap-2">
                <span>Total games played - {totalGames}</span>
                <div className="flex w-full flex-wrap items-center justify-center gap-4">
                    <InfoStatSpan>Games won - {gamesWon}</InfoStatSpan>
                    <InfoStatSpan>Games lost - {gamesLost}</InfoStatSpan>
                    <InfoStatSpan>Games drawn - {gamesDrawn}</InfoStatSpan>
                    <InfoStatSpan>
                        {`Games aborted - ${totalGames - gamesWon - gamesLost - gamesDrawn}`}
                    </InfoStatSpan>
                </div>
            </div>
            <div className="flex w-full flex-col items-center gap-2">
                <span>Total number of opponents - {opponents.length}</span>
                <div className="flex w-full flex-wrap items-center justify-center gap-3">
                    {opponents.map((opponent) => (
                        <CustomButton
                            key={`button-${opponent}`}
                            className={cn('bg-white text-sm text-black', {
                                'opacity-80 outline-4 outline-yellow-400':
                                    opponent === selectedOpponent,
                            })}
                            onClick={() =>
                                selectOpponent(
                                    opponent === selectedOpponent
                                        ? undefined
                                        : opponent
                                )
                            }
                        >
                            {opponent}
                        </CustomButton>
                    ))}
                </div>
                {selectedOpponent && statsVs && (
                    <div className="grid grid-cols-3 items-center gap-x-3 gap-y-3 pt-4 text-center text-sm">
                        <span>Total Games: {statsVs.games}</span>
                        <span className="text-lg">{player}</span>
                        <span className="text-lg">{selectedOpponent}</span>
                        <PlayerStatRow
                            attribute="Games won"
                            values={statsVs.won}
                            onClick={(props) =>
                                setAttributeStat({
                                    ...props,
                                    entities: [player, selectedOpponent],
                                })
                            }
                        />
                        <PlayerStatRow
                            attribute="Games won as X"
                            values={statsVs.wonAsX}
                            onClick={(props) =>
                                setAttributeStat({
                                    ...props,
                                    entities: [player, selectedOpponent],
                                })
                            }
                        />
                        <PlayerStatRow
                            attribute="Games won as O"
                            values={statsVs.wonAsO}
                            onClick={(props) =>
                                setAttributeStat({
                                    ...props,
                                    entities: [player, selectedOpponent],
                                })
                            }
                        />
                        <PlayerStatRow
                            attribute="Games lost"
                            values={statsVs.lost}
                            onClick={(props) =>
                                setAttributeStat({
                                    ...props,
                                    entities: [player, selectedOpponent],
                                })
                            }
                        />
                        <PlayerStatRow
                            attribute="Games lost as X"
                            values={statsVs.lostAsX}
                            onClick={(props) =>
                                setAttributeStat({
                                    ...props,
                                    entities: [player, selectedOpponent],
                                })
                            }
                        />
                        <PlayerStatRow
                            attribute="Games lost as O"
                            values={statsVs.lostAsO}
                            onClick={(props) =>
                                setAttributeStat({
                                    ...props,
                                    entities: [player, selectedOpponent],
                                })
                            }
                        />
                        <span>Games drawn</span>
                        <span>{statsVs.drawn}</span>
                        <span>{statsVs.drawn}</span>
                        <PlayerStatRow
                            attribute="Games drawn as X"
                            values={statsVs.drawnAsX}
                            onClick={(props) =>
                                setAttributeStat({
                                    ...props,
                                    entities: [player, selectedOpponent],
                                })
                            }
                        />
                        <PlayerStatRow
                            attribute="Games drawn as O"
                            values={statsVs.drawnAsO}
                            onClick={(props) =>
                                setAttributeStat({
                                    ...props,
                                    entities: [player, selectedOpponent],
                                })
                            }
                        />
                        <span>Games aborted</span>
                        <span>{statsVs.aborted}</span>
                        <span>{statsVs.aborted}</span>
                    </div>
                )}
            </div>
            <GameModal
                show={!!attributeStat}
                close={() => setAttributeStat(undefined)}
            >
                {attributeStat && (
                    <ModernPieChart
                        entities={attributeStat.entities}
                        attribute={attributeStat.attribute}
                        values={attributeStat.values}
                    />
                )}
            </GameModal>
        </div>
    );
};

export default PlayerStats;
