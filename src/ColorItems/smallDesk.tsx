import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMContext } from "../context";
import { Item } from "../item";
import { ScrollComponent } from "../Scroll";
import { Icon } from "../icon";
import { DeskProps } from "./desk";
import { useListenPosition } from "../useListenPosition";
import { ListItemProps } from "../storageCabinet";
import { OptionProps } from "../unit";

export const SmallDesk: React.FC<DeskProps> = ({
    colors,
    handleChange,
    value,
    handleColorChange,
}) => {
    const listRef = useRef([...colors]);

    const { mouseUpOnStorage } = useMContext();

    const ref = useRef<HTMLDivElement | null>(null);

    const scrollEl = useRef<HTMLDivElement | null>(null);

    const [showBtn, setShowBtn] = useState(false);

    /**
     * 0 起点
     * 1 终点
     * 2 在起点或终点之间
     */
    const [scrollStatus, setScrollStatus] = useState<0 | 1 | 2>(0);

    useListenPosition(ref);

    useLayoutEffect(() => {
        listRef.current = [...colors];
    }, [colors]);

    useEffect(() => {
        const fn = () => {
            const el = ref.current;

            if (!el) return;
            setShowBtn(el.scrollWidth > el.offsetWidth);
        };

        window.addEventListener("resize", fn);
        fn();
        return () => {
            window.removeEventListener("resize", fn);
        };
    }, []);

    const getScrollEl = () => {
        const el = scrollEl.current;
        if (!el) return;
        let node: null | Element = null;
        for (let i = 0; i < el.children.length; ) {
            const item = el.children[i];
            if (
                item
                    .getAttribute("class")
                    ?.split(" ")
                    .some((val) => val === "scroll_scrollBody")
            ) {
                i = el.children.length;

                node = item;
            } else {
                ++i;
            }
        }
        return node;
    };

    const toLeft = () => {
        if (scrollStatus === 0) return;
        const node = getScrollEl();
        if (!node) return;
        node.scrollTo({
            left: node.scrollLeft - 165,
            behavior: "smooth",
        });
    };
    const toRight = () => {
        if (scrollStatus === 1) return;
        const node = getScrollEl();
        if (!node) return;
        node.scrollTo({
            left: node.scrollLeft + 164,
            behavior: "smooth",
        });
    };

    const handleMouseUp = ({ values }: ListItemProps, n: number) => {
        if (!value) return;
        const status = values.some((val) => val.code === value.code);
        if (!status) {
            values.push(value);
        }

        const arr = [...listRef.current];
        arr[n].values = [...values];
        listRef.current = [...arr];
        handleColorChange([...listRef.current]);

        mouseUpOnStorage.current = {
            index: n,
            val: value,
        };
    };

    const handleScroll = ({
        left,
        scrollWidth,
        clientWidth,
    }: {
        left: number;
        top: number;
        scrollHeight: number;
        scrollWidth: number;
        offsetHeight: number;
        offsetWidth: number;
        clientHeight: number;
        clientWidth: number;
    }) => {
        if (Math.ceil(left + clientWidth) >= scrollWidth) {
            setScrollStatus(1);
        } else if (left <= 0) {
            setScrollStatus(0);
        } else {
            setScrollStatus(2);
        }
    };

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

    return (
        <>
            {showBtn && (
                <div className="arrowContainer">
                    <div
                        className={`arrowContainer_pre${scrollStatus === 0 ? " gray" : ""}`}
                        onClick={toLeft}
                    >
                        <Icon className="arrowContainer_icon" />
                    </div>
                    <div
                        className={`arrowContainer_next${scrollStatus === 1 ? " gray" : ""}`}
                        onClick={toRight}
                    >
                        <Icon className="arrowContainer_icon" />
                    </div>
                </div>
            )}
            <ScrollComponent
                height="220px"
                className="smallDesk_scrollWrap"
                bodyClassName="smallDesk_scrollBody"
                handleBarChange={handleScroll}
                ref={scrollEl}
            >
                <div className="storageCabinet_smallDeskRow" ref={ref}>
                    {colors.map((item, n) => {
                        return (
                            <div
                                className="storageCabinet_item"
                                key={item.code}
                                data-i={n}
                                onMouseUp={() => handleMouseUp(item, n)}
                            >
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
            </ScrollComponent>
        </>
    );
};
