import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useListenPosition } from "../useListenPosition";
import { useMContext } from "../context";
import { Item } from "../item";
import { DeskProps } from "./desk";
import { ListItemProps } from "../storageCabinet";
import { OptionProps } from "../unit";

export const Mobile: React.FC<DeskProps> = ({ colors, handleChange, value, handleColorChange }) => {
    const listRef = useRef([...colors]);

    const { mouseUpOnStorage } = useMContext();

    const ref = useRef<HTMLDivElement | null>(null);

    const handleUp = (item: ListItemProps, n: number, res: OptionProps | undefined) => {
        const data = mouseUpOnStorage.current;
        handleChange(undefined);
        if (n === data?.index) {
            return;
        }

        const index = item.values.findIndex((val) => val.code === res?.code);
        if (index >= 0) {
            item.values.splice(index, 1);
        }

        handleColorChange([...listRef.current]);
    };

    useLayoutEffect(() => {
        listRef.current = [...colors];
    }, [colors]);
    /**
     * touch 事件的穿透处理
     * 本无穿透
     * 做穿透处理
     */
    useEffect(() => {
        const fn = () => {
            if (mouseUpOnStorage.current) {
                const data = mouseUpOnStorage.current;
                const n = data.index;
                const values = listRef.current[n].values;
                const val = data.val;
                const status = values.some((item) => item.code === val.code);

                if (!status) {
                    values.push(val);
                }
                const arr = [...listRef.current];
                arr[n].values = [...values];
                listRef.current = [...arr];

                handleColorChange([...listRef.current]);
            }
        };
        document.addEventListener("touchend", fn);

        return () => {
            document.removeEventListener("touchend", fn);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mouseUpOnStorage]);

    useListenPosition(ref);

    return (
        <div className="mobile_colorWrap">
            <div className="mobile_colorContainer" ref={ref}>
                {colors.map((item, n) => {
                    return (
                        <div className="storageCabinet_item" key={item.code} data-i={n}>
                            <div className="storageCabinet_itemTitle">{item.content}</div>
                            <div className="storageCabinet_itemValues">
                                <Item
                                    values={item.values}
                                    handleChange={handleChange}
                                    onUp={(res) => handleUp(item, n, res)}
                                    index={n}
                                    value={value}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
