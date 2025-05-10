import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { cn } from 'clsx-for-tailwind';
import { useEffect, useState } from 'react';
import { IoChevronDownOutline } from 'react-icons/io5';
import { Fragment } from 'react';

export type OptionProps = {
    value: string;
    id?: string;
    disabled?: string;
};

type DropDownOption<T> = T & Required<OptionProps>;

type DropDownInputProps<T> = {
    items: T[];
    selectedId?: string;
    class?: string | string[];
    selectOption: (option: T) => void;
    placeholder?: string;
    disabled?: boolean;
};

const DEFAULT_PLACEHOLDER = 'Select a value';

const DropDownInput = <T extends OptionProps>({
    items,
    selectedId,
    selectOption,
    class: classValue,
    placeholder,
    disabled = false,
}: DropDownInputProps<T>) => {
    const [selectedOption, setSelectedOption] = useState<
        DropDownOption<T> | undefined
    >();

    const [options, setOptions] = useState<DropDownOption<T>[]>([]);

    const handleSelectOption = (option: DropDownOption<T>): void => {
        setSelectedOption(option);
        selectOption(option);
    };

    useEffect(() => {
        const opts = items.map((item) => ({
            ...item,
            value: item.value,
            id: item.id || item.value,
            disabled: item.disabled ?? false,
        }));

        setOptions(opts);

        if (!selectedId) return;

        setSelectedOption(opts.find((option) => option.id === selectedId));
    }, [items, setOptions, selectedId]);

    return (
        <Menu>
            <MenuButton as={Fragment}>
                {({ open }) => (
                    <button
                        className={cn(
                            'flex items-center justify-between gap-2 rounded-lg bg-gray-800 px-3 py-1.5',
                            'text-sm/6 font-semibold text-white shadow-inner shadow-white/10',
                            'focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white enabled:data-[hover]:opacity-75 data-[open]:opacity-90',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            classValue
                        )}
                        disabled={disabled}
                    >
                        {selectedOption?.value ??
                            placeholder ??
                            DEFAULT_PLACEHOLDER}
                        <IoChevronDownOutline
                            className={cn(
                                'size-4 transition-all duration-200',
                                open ? 'rotate-0' : 'rotate-180'
                            )}
                        />
                    </button>
                )}
            </MenuButton>
            <MenuItems
                anchor="bottom"
                className={cn(
                    'w-52 origin-top-right rounded-lg border border-white/5 bg-gray-800 p-2 text-sm/6 text-white',
                    'transition ease-out',
                    '[--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0',
                    '[--anchor-gap:4px] [--anchor-padding:4px]'
                )}
            >
                {options.map((option) => (
                    <MenuItem key={option.id}>
                        <button
                            className="w-full rounded-md p-2 text-start text-white data-[focus]:bg-gray-500"
                            value={option.value}
                            onClick={() => handleSelectOption(option)}
                        >
                            {option.value}
                        </button>
                    </MenuItem>
                ))}
            </MenuItems>
        </Menu>
    );
};

export default DropDownInput;
