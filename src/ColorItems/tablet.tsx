import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ListItemProps } from "../storageCabinet";
import { useMContext } from "../context";
import { Item } from "../item";
import { addClass, getMatrixAttr, getTransitionAttr, OptionProps, removeClass } from "../unit";
import { DeskProps } from "./desk";
import { useListenPosition } from "../useListenPosition";

export const Tablet: React.FC<DeskProps> = ({ colors, handleChange, value, handleColorChange }) => {
    const listRef = useRef([...colors]);

    const { mouseUpOnStorage } = useMContext();

    const [currentPage, setCurrentPage] = useState(0);

    const ref = useRef<HTMLDivElement | null>(null);

    const transitionData = useRef({
        count: 0,
        timeout: 0,
        active: "",
        propCount: 0,
    });

    const timeOut = useRef<number | null>(null);

    const tracks = useRef<Array<number>>();

    const touchData = useRef<{
        val: number;
        x: number;
        y: number | null;
        startTime: number;
        status: null | 1 | -1;
        startX: number;
    }>({
        val: 0,
        x: 0,
        y: null,
        startTime: 0,
        status: null,
        startX: 0,
    });

    const colorFn = useRef(handleColorChange);

    useLayoutEffect(() => {
        listRef.current = [...colors];
    }, [colors]);

    useLayoutEffect(() => {
        colorFn.current = handleColorChange;
    }, [handleColorChange]);

    useListenPosition(ref, "tablet");

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
                const { values } = listRef.current[n];
                const { val } = data;
                const status = values.some((item) => item.code === val.code);

                if (!status) {
                    values.push(val);
                }
                const arr = [...listRef.current];
                arr[n].values = [...values];
                listRef.current = [...arr];

                colorFn.current([...listRef.current]);
            }
        };
        document.addEventListener("touchend", fn);

        return () => {
            document.removeEventListener("touchend", fn);
        };
    }, [mouseUpOnStorage]);

    useEffect(() => {
        return () => {
            timeOut.current && window.clearTimeout(timeOut.current);
        };
    }, []);

    useEffect(() => {
        const fn = () => {
            const el = ref.current;
            if (!el) return;
            el.style.transform = `translateX(${
                (currentPage ? -currentPage : currentPage) * el.offsetWidth
            }px)`;
        };
        window.addEventListener("resize", fn);
        return () => {
            window.removeEventListener("resize", fn);
        };
    }, [currentPage]);

    /**
     * 滑块功能 start
     */
    /**
     * 触摸时
     */
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        const el = ref.current;
        if (!el) return;

        const touchVal = e.changedTouches[0];

        touchData.current = {
            val: 0,
            x: touchVal.pageX,
            y: touchVal.pageY,
            startTime: Date.now(),
            status: null,
            startX: touchVal.pageX,
        };

        tracks.current = undefined;
        timeOut.current && window.clearTimeout(timeOut.current);

        document.addEventListener("touchmove", handleTouchMove);
        document.addEventListener("touchend", handleTouchEnd);
        document.addEventListener("touchcancel", handleTouchCancel);
    };

    /**
     * 还原数据
     */
    const rest = () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
        document.removeEventListener("touchcancel", handleTouchCancel);

        touchData.current = {
            val: 0,
            x: 0,
            y: null,
            startTime: 0,
            status: null,
            startX: 0,
        };

        tracks.current = undefined;
    };
    /**
     * 同意 执行手势
     */
    const executionGestures = () => {
        const el = ref.current;
        if (!el) return;

        const total = Math.ceil(listRef.current.length / 6) - 1;
        let value = currentPage;
        if (touchData.current.status === 1) {
            value -= 1;
        } else {
            value += 1;
        }
        if (value < 0) {
            value = 0;
        } else if (value > total) {
            value = total;
        }
        el.style.transform = `translateX(${(value ? -value : value) * el.offsetWidth}px)`;
        setCurrentPage(value);
        addClassName("transition");
    };
    /**
     * 触摸结束后
     */
    const handleTouchEnd = (e: TouchEvent) => {
        const el = ref.current;
        if (!el) return;

        if (Math.abs(e.changedTouches[0].pageX - touchData.current.startX) > el.offsetWidth / 3) {
            executionGestures();
        } else {
            const arr = tracks.current?.slice(tracks.current.length - 3, tracks.current.length);
            const v = (arr?.reduce((a, b) => a + b) || 0) / (arr?.length || 0);

            if (Math.abs(v) > 0.5 && v !== 0) {
                executionGestures();
            } else {
                el.style.transform = `translateX(${
                    (currentPage ? -currentPage : currentPage) * el.offsetWidth
                }px)`;
                addClassName("transition");
            }
        }

        rest();
    };

    /**
     * 轨迹测速
     */
    const setTracks = (x: number) => {
        const nowTime = Date.now();

        const d = x - touchData.current.x;
        const s = nowTime - touchData.current.startTime;
        const v = d / s;

        touchData.current.startTime = nowTime;
        if (!v) return;
        if (tracks.current) {
            tracks.current.push(v);
        } else {
            tracks.current = [v];
        }
    };

    /**
     * 触摸移动中
     */
    const handleTouchMove = (e: TouchEvent) => {
        const el = ref.current;
        if (!el) return;

        const touchVal = e.changedTouches[0];
        const x = touchVal.pageX;
        const y = touchVal.pageY;

        if (
            typeof touchData.current.y === "number" &&
            Math.abs(y - touchData.current.y) > Math.abs(x - touchData.current.x)
        ) {
            handleTouchCancel();

            return;
        }

        /**
         * 第一次 执行Move
         */
        if (touchData.current.status === null) {
            const attr = getMatrixAttr(el);
            const val = Number(attr?.translateX) || 0;
            touchData.current.val = val;
            removeClass(el, "transition");
        }

        touchData.current.y = null;

        const moveVal = x - touchData.current.x;

        if (moveVal > 0) {
            if (touchData.current.status === -1) {
                tracks.current = undefined;
            }
            touchData.current.status = 1;
        } else if (moveVal < 0) {
            if (touchData.current.status === 1) {
                tracks.current = undefined;
            }
            touchData.current.status = -1;
        }
        setTracks(x);

        touchData.current.x = x;

        let val = touchData.current.val + moveVal;

        const total = Math.ceil(listRef.current.length / 6) - 1;

        if (val > 0) {
            val = 0;
        } else if (val < -total * el.offsetWidth) {
            val = -total * el.offsetWidth;
        }

        touchData.current.val = val;

        el.style.transform = `translateX(${val}px)`;
    };

    /**
     * 触摸取消
     */
    const handleTouchCancel = () => {
        const el = ref.current;
        if (!el) return;

        el.style.transform = `translateX(-${currentPage * el.offsetWidth}px);`;
        addClassName("transition");
        rest();
    };
    /**
     * 赋值过渡动画的class name
     */
    const addClassName = (name: string) => {
        const el = ref.current;
        if (!el) return;
        addClass(el, name);
        transitionData.current = {
            count: 0,
            active: name,
            ...getTransitionAttr(el),
        };
        el.addEventListener("transitionend", handleTransitionEnd);
        timeOut.current = window.setTimeout(transitionendFn, transitionData.current.timeout + 1);
    };
    /**
     *
     * 当过渡动画执行完成后
     */
    const handleTransitionEnd = () => {
        const el = ref.current;
        if (!el) return;

        ++transitionData.current.count;
        if (transitionData.current.count >= transitionData.current.propCount) {
            transitionendFn();
        }
    };

    const transitionendFn = () => {
        const el = ref.current;
        if (!el) return;
        removeClass(el, transitionData.current.active);
        transitionData.current = {
            count: 0,
            timeout: 0,
            active: "",
            propCount: 0,
        };
        el.removeEventListener("transitionend", handleTransitionEnd);
    };

    /**
     * 滑块功能 end
     */

    /**
     * 页码点击事件
     */
    const handlePageClick = (index: number) => {
        timeOut.current && window.clearTimeout(timeOut.current);
        const el = ref.current;
        if (!el) return;

        setCurrentPage(index);
        const val = -index * el.offsetWidth;
        el.style.transform = `translateX(${val}px)`;
        addClassName("transition");
    };

    /**
     * list的预处理
     * 每6个一组
     */
    const colorList: Array<Array<ListItemProps>> = [];

    let start = -1;
    colors.map((item, n) => {
        if (n % 6) {
            colorList[start].push({
                ...item,
            });
        } else {
            ++start;
            colorList[start] = [{ ...item }];
        }
    });

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
        <div className="tablet_colorWrap">
            <div className="tablet_colorContainer" onTouchStart={handleTouchStart}>
                <div className="tablet_colorContent" ref={ref}>
                    {colorList.map((colorArr, n) => {
                        return (
                            <ul key={n} className="tablet_colorList">
                                {colorArr.map((item, index) => {
                                    return (
                                        <li
                                            className="storageCabinet_item"
                                            key={item.code}
                                            data-i={n * 6 + index}
                                        >
                                            <div className="storageCabinet_itemTitle">
                                                {item.content}
                                            </div>
                                            <div className="storageCabinet_itemValues">
                                                <Item
                                                    values={item.values}
                                                    handleChange={handleChange}
                                                    onUp={(res) =>
                                                        handleUp(item, n * 6 + index, res)
                                                    }
                                                    index={n * 6 + index}
                                                    value={value}
                                                />
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        );
                    })}
                </div>
            </div>
            <div className="tablet_page">
                <div className="tablet_row">
                    {colorList.map((_, n) => {
                        return (
                            <span
                                className={`tablet_pageItem${currentPage === n ? " active" : ""}`}
                                key={`page${n}`}
                                onTouchStart={(e) => e.stopPropagation()}
                                onClick={() => {
                                    handlePageClick(n);
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
