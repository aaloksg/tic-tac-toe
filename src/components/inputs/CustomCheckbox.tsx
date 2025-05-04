import { Checkbox } from '@headlessui/react';
import { MdCheckBox } from 'react-icons/md';
import { MdCheckBoxOutlineBlank } from 'react-icons/md';
import { useState } from 'react';
import { cn } from 'clsx-for-tailwind';

type CustomCheckboxProps = {
    value?: boolean;
    className?: string | string[];
    handleUpdate?: (val: boolean) => void;
    disabled?: boolean;
};

const CustomCheckbox = ({
    value = false,
    disabled = false,
    className,
    handleUpdate,
}: CustomCheckboxProps) => {
    const [enabled, setEnabled] = useState(value);

    const onChange = (val: boolean): void => {
        setEnabled(val);
        handleUpdate?.(val);
    };

    return (
        <Checkbox
            checked={enabled}
            onChange={onChange}
            className={cn(
                'group flex h-6 w-6 cursor-pointer rounded-md p-0',
                'ring-0 ring-transparent outline-0 outline-transparent',
                { 'cursor-default opacity-50': disabled, 'bg-black': enabled },
                className
            )}
            disabled={disabled}
        >
            {(enabled && (
                <MdCheckBox
                    className={cn(
                        'h-full w-full rounded-md fill-amber-300 p-0 ring-0'
                    )}
                />
            )) || (
                <MdCheckBoxOutlineBlank
                    className={cn('h-full w-full rounded-md p-0 ring-0')}
                />
            )}
        </Checkbox>
    );
};

export default CustomCheckbox;
