import { cn } from 'clsx-for-tailwind';
import { MdClose } from 'react-icons/md';
import CustomButton from './inputs/CustomButton';

type GameModalProps = {
    show: boolean;
    close: () => void;
    className?: string | string[];
};

const GameModal = ({
    children,
    show,
    close,
    className,
}: React.PropsWithChildren<GameModalProps>) => {
    return (
        show && (
            <div
                className={cn(
                    'absolute inset-0 h-full w-full overflow-hidden bg-black/85 p-4',
                    'modal transition-all duration-700',
                    className
                )}
            >
                <CustomButton
                    className="absolute top-3 right-10"
                    onClick={close}
                >
                    <MdClose className="h-5 w-5" />
                </CustomButton>
                {children}
            </div>
        )
    );
};

export default GameModal;
