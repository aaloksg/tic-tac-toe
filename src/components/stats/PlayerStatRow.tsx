import CustomButton from '../inputs/CustomButton';

type PlayerStatRowProps = {
    attribute: string;
    values: [number, number];
    onClick: (props: Pick<PlayerStatRowProps, 'attribute' | 'values'>) => void;
};

const PlayerStatRow = ({ attribute, values, onClick }: PlayerStatRowProps) => {
    return (
        <>
            <CustomButton
                className="text-black"
                onClick={() =>
                    onClick({
                        attribute,
                        values,
                    })
                }
            >
                {attribute}
            </CustomButton>
            <span>{values[0]}</span>
            <span>{values[1]}</span>
        </>
    );
};

export default PlayerStatRow;
