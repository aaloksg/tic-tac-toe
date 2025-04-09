import { useLocalStorage } from 'react-use';

const KEY = 'tic-tac-toe-game-aaloksg';

const serializer = <T,>(data: T): string => {
    return JSON.stringify(data);
};

const deserializer = <T,>(value: string): T => {
    return JSON.parse(value);
};

type UseLocalDataReturn<T> = {
    value: T | undefined;
};

const useLocalData = <T,>(): UseLocalDataReturn<T> => {
    const [localDataString, setLocalDataString] = useLocalStorage<T>(
        KEY,
        undefined,
        {
            raw: false,
            serializer,
            deserializer,
        }
    );

    return {
        get value(): T | undefined {
            return localDataString;
        },
        set value(val: T) {
            setLocalDataString(val);
        },
    };
};

export default useLocalData;
