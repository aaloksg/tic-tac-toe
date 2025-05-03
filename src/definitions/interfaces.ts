export type XOValues = 'X' | 'O';

export type Player = {
    name: string;
    key: XOValues;
    isComputer?: boolean;
};

// -1: Game aborted
// 0: Game ended in draw.
// 1: Player 1 won.
// 2: Player 2 won.
export type GameResult = -1 | 0 | XOValues;

type PeerGame = Partial<Record<XOValues, string>> & {
    result: GameResult;
    isBoltMode?: boolean;
};

type H2HData = {
    players: [string, string];
    games: PeerGame[];
};

export type GameData = {
    lastPlayer1: string;
    lastPlayer2: string;
    h2h: H2HData[];
};
