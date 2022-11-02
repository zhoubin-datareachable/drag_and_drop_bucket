import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Item } from "../item";
import { useMContext } from "../context";
import { ListItemProps, StorageCabinetProps } from "../storageCabinet";
import { useListenPosition } from "../useListenPosition";
import { OptionProps } from "../unit";
import jt from "../icon_jt.png";
import { ScrollComponent } from "../Scroll";

export interface DeskProps extends StorageCabinetProps {
    colors: Array<ListItemProps>;
    handleColorChange: (res: ListItemProps[]) => void;
}

export const Desk: React.FC<DeskProps> = ({ colors, handleChange, value, handleColorChange }) => {
    const listRef = useRef([...colors]);

    const { mouseUpOnStorage, position } = useMContext();

    const ref = useRef<HTMLDivElement | null>(null);

    const [showTop, setShowTop] = useState(false);
    const [showBottom, setShowBottom] = useState(false);

    const scrollBodyRef = useRef<HTMLElement>();

    const timer = useRef<number>();

    const enterInScrollTime = useRef<number>();

    useLayoutEffect(() => {
        listRef.current = [...colors];
    }, [colors]);

    useListenPosition(ref);

    useEffect(() => {
        if (!value) {
            setShowTop(false);
            setShowBottom(false);
            scrollBodyRef.current = undefined;
        }
    }, [value]);

    useEffect(() => {
        () => {
            timer.current && window.clearTimeout(timer.current);
        };
    }, []);

    const handleMouseUpOnScroll = () => {
        if (!value || !position) return;
        const els = document.elementsFromPoint(position.clientX, position.clientY);
        let n = -1;
        for (let i = 0; i < els.length; ) {
            const el = els[i];
            const classAttr = el.getAttribute("class")?.split(" ");
            if (classAttr?.includes("storageCabinet_item")) {
                n = Number(el.getAttribute("data-i")) ?? -1;
                i = els.length;
            } else {
                ++i;
            }
        }

        const arr = [...listRef.current];

        const values = arr[n]?.values;
        if (!values) {
            return;
        }
        const status = values.some((val) => val.code === value.code);
        if (!status) {
            values.push({
                code: value.code,
                content: value.content,
            });
        }

        listRef.current = [...arr];

        handleColorChange([...listRef.current]);

        mouseUpOnStorage.current = {
            index: n,
            val: {
                code: value.code,
                content: value.content,
            },
        };
    };

    /**
     * 当  松开item时
     */
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

    const watchScrollStatus = (scrollBody: HTMLElement) => {
        const rect = scrollBody.getBoundingClientRect();
        setShowTop(scrollBody.scrollTop > 0);
        setShowBottom(scrollBody.scrollTop + rect.height < scrollBody.scrollHeight);
    };

    /**
     * 当鼠标进入滚动容器时
     */
    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!value) {
            return;
        }
        enterInScrollTime.current = Date.now();

        const scrollWrap = e.currentTarget;
        let scrollBody: HTMLElement | null = null;
        for (let i = 0; i < scrollWrap.children.length; ) {
            const item = scrollWrap.children[i];
            if (item instanceof HTMLElement) {
                const classAttr = item.getAttribute("class");
                if (classAttr?.includes("scroll_scrollBody")) {
                    i = scrollWrap.children.length;
                    scrollBody = item;
                } else {
                    ++i;
                }
            } else {
                ++i;
            }
        }

        if (!scrollBody) {
            return;
        }
        scrollBodyRef.current = scrollBody;
        watchScrollStatus(scrollBody);
    };
    /**
     * 当鼠标离开滚动容器时
     */
    const handleMouseLeave = () => {
        if (!value) {
            return;
        }
        setShowTop(false);
        setShowBottom(false);
        scrollBodyRef.current = undefined;
    };

    const startScroll = (status: 1 | -1) => {
        const el = scrollBodyRef.current;
        timer.current && window.clearTimeout(timer.current);
        if (!el) {
            return;
        }

        const rect = el.getBoundingClientRect();
        switch (status) {
            case 1:
                if (el.scrollTop + rect.height < el.scrollHeight) {
                    el.scrollTop = el.scrollTop + 1;
                    timer.current = window.setTimeout(() => startScroll(status));
                }
                break;
            case -1:
                if (el.scrollTop > 0) {
                    el.scrollTop = el.scrollTop - 1;
                    timer.current = window.setTimeout(() => startScroll(status));
                }

                break;
        }
    };

    const handleScrollChange = () => {
        const el = scrollBodyRef.current;
        if (!el) {
            return;
        }
        watchScrollStatus(el);
    };

    /**
     * 上
     */
    const handleMouseEnterOnTop = () => {
        timer.current && window.clearTimeout(timer.current);
        let delay = 1;
        if (enterInScrollTime.current && Date.now() - enterInScrollTime.current <= 201) {
            delay = 200;
        }

        timer.current = window.setTimeout(() => startScroll(-1), delay);
    };

    const handleMouseLeaveOnTop = () => {
        timer.current && window.clearTimeout(timer.current);
    };

    const handleMouseEnterOnBottom = () => {
        timer.current && window.clearTimeout(timer.current);
        let delay = 1;
        if (enterInScrollTime.current && Date.now() - enterInScrollTime.current <= 201) {
            delay = 200;
        }

        timer.current = window.setTimeout(() => startScroll(1), delay);
    };

    const handleMouseLeaveOnBottom = () => {
        timer.current && window.clearTimeout(timer.current);
    };

    return (
        <ScrollComponent
            className="storageCabinet_deskScrollWrap"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            handleBarChange={handleScrollChange}
            onMouseUp={handleMouseUpOnScroll}
        >
            <div
                className="storageCabinet_deskTopTips"
                style={{
                    opacity: showTop ? 1 : 0,
                    pointerEvents: showTop ? "auto" : "none",
                }}
                onMouseEnter={handleMouseEnterOnTop}
                onMouseLeave={handleMouseLeaveOnTop}
            >
                <img src={jt} className="storageCabinet_img" />
            </div>
            <div
                className="storageCabinet_deskBottomTips"
                style={{
                    opacity: showBottom ? 1 : 0,
                    pointerEvents: showBottom ? "auto" : "none",
                }}
                onMouseEnter={handleMouseEnterOnBottom}
                onMouseLeave={handleMouseLeaveOnBottom}
            >
                <img src={jt} className="storageCabinet_img" />
            </div>

            <div className="storageCabinet_row" ref={ref}>
                {colors.map((item, n) => {
                    return (
                        <div className="storageCabinet_item" key={`${item.code}`} data-i={n}>
                            <div className="storageCabinet_itemTitle">{item.content}</div>
                            <div className="storageCabinet_itemValues">
                                <Item
                                    values={item.values}
                                    handleChange={handleChange}
                                    onUp={(res) => handleUp(item, n, res)}
                                    index={n}
                                    value={value ? JSON.parse(JSON.stringify(value)) : undefined}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollComponent>
    );
};
