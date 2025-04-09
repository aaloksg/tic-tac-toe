import React from 'react';
import { PiMaskSadLight } from 'react-icons/pi';

const DEFAULT_ELEMENTS_TYPE = 'results';

type EmptyProps = {
    elementsType?: string;
};

const Empty = ({
    elementsType,
    children,
}: React.PropsWithChildren<EmptyProps>) => {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center text-amber-500">
            <PiMaskSadLight className="size-24 animate-bounce" />
            <p className="text-center text-lg">
                {children ??
                    `No ${elementsType || DEFAULT_ELEMENTS_TYPE} available.`}
            </p>
        </div>
    );
};

export default Empty;
