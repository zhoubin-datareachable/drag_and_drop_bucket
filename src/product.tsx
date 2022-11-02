/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { useLayoutEffect, useRef } from "react";
import { stopSelect } from "./noSelected";
import { useMContext } from "./context";
import { getScrollValue } from "./getScrollValue";
import { DragData, HandleChangeFn, OptionProps, PointProps } from "./unit";

/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
export interface ProductProps {
    list: Array<OptionProps>;

    handleChange: HandleChangeFn;

    value?: DragData;

    placement: "warehouse" | "storageCabinet";

    index?: number;

    onUp: (res: OptionProps | undefined) => void;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
export const Product: React.FC<ProductProps> = ({
    list,
    handleChange,
    value,
    placement,
    index,
    onUp,
}) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/

    const { mouseUpOnStorage, isMobile, setPosition } = useMContext();

    const selectedFn = useRef<typeof document.onselectstart>(null);

    const point = useRef<PointProps>({
        pageX: 0,
        pageY: 0,
        clientX: 0,
        clientY: 0,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });

    const valRef = useRef(value ? { code: value.code, content: value.content } : undefined);

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    useLayoutEffect(() => {
        valRef.current = value ? { code: value.code, content: value.content } : undefined;
    }, [value]);

    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/

    // 当移动时
    const handleMove = (e: MouseEvent | React.TouchEvent<HTMLDivElement>) => {
        if (!valRef.current) return;
        let x = 0;
        let y = 0;
        let clientX = 0;
        let clientY = 0;

        if (e instanceof MouseEvent) {
            x = e.pageX;
            y = e.pageY;
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            const position = e.changedTouches[0];
            x = position.pageX;
            y = position.pageY;
            clientX = position.clientX;
            clientY = position.clientY;
        }
        const moveX = x - point.current.pageX;
        const moveY = y - point.current.pageY;

        point.current.x = moveX + point.current.x;
        point.current.y = moveY + point.current.y;
        point.current.pageX = x;
        point.current.pageY = y;
        point.current.clientX = clientX;
        point.current.clientY = clientY;

        setPosition({
            ...point.current,
        });
    };

    // 当鼠标 或者手 弹起时的通用事件
    const handleUp = () => {
        document.onselectstart = selectedFn.current;
        point.current = {
            x: 0,
            y: 0,
            pageX: 0,
            pageY: 0,
            width: 0,
            height: 0,
            clientX: 0,
            clientY: 0,
        };

        setPosition(undefined);
        onUp(valRef.current);
    };

    // 当鼠标弹起时
    const handleMouseUp = () => {
        handleUp();
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

    // 当手离开屏幕时
    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!valRef.current) return;

        const position = e.changedTouches[0];

        const els = document.elementsFromPoint(position.clientX, position.clientY);

        for (let i = 0; i < els.length; ) {
            const el = els[i];

            if (el.nodeName !== "HTML" && el.nodeName !== "BODY") {
                const className = el.getAttribute("class");
                if (className?.split(" ").includes("storageCabinet_item")) {
                    const n = el.getAttribute("data-i");
                    if (n) {
                        mouseUpOnStorage.current = {
                            index: Number(n),
                            val: {
                                ...valRef.current,
                            },
                        };
                    }
                    i = els.length;
                }
            }
            ++i;
        }

        handleUp();
    };

    // 手或者鼠标 按下的通用事件
    const handleDown = (
        item: OptionProps,
        e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>,
        position: {
            x: number;
            y: number;
            clientX: number;
            clientY: number;
        },
    ) => {
        handleChange({
            code: item.code,
            content: item.content,
            placement: placement === "warehouse" ? "warehouse" : { storageCabinet: index || 0 },
        });
        stopSelect(e, selectedFn, true);

        const scrollData = getScrollValue();
        const rect = e.currentTarget.getBoundingClientRect();
        const rectX = rect.left + scrollData.x;
        const rectY = rect.top + scrollData.y;

        point.current = {
            clientX: position.clientX,
            clientY: position.clientY,
            pageX: position.x,
            pageY: position.y,
            x: rectX,
            y: rectY,
            width: rect.width,
            height: rect.height,
        };
        setPosition({
            ...point.current,
        });

        mouseUpOnStorage.current = undefined;
    };

    // 当鼠标按下时
    const handleMouseDown = (
        item: OptionProps,
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        handleDown(item, e, {
            x: e.pageX,
            y: e.pageY,
            clientX: e.clientX,
            clientY: e.clientY,
        });
        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    //当手触摸时
    const handleTouchStart = (item: OptionProps, e: React.TouchEvent<HTMLDivElement>) => {
        const position = e.changedTouches[0];
        e.stopPropagation();
        handleDown(item, e, {
            x: position.pageX,
            y: position.pageY,
            clientX: position.clientX,
            clientY: position.clientY,
        });
    };

    let isGray = false;
    if (value) {
        if (placement === "warehouse" && value.placement === placement) {
            isGray = true;
        } else if (
            placement === "storageCabinet" &&
            JSON.stringify(value.placement) === JSON.stringify({ ["storageCabinet"]: index })
        ) {
            isGray = true;
        }
    }

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <>
            {list.map((item) => {
                return (
                    <div
                        className={`item${value?.code === item.code && isGray ? " gray" : ""}`}
                        key={item.code}
                        {...(isMobile
                            ? {
                                  onTouchStart: (e) => {
                                      handleTouchStart(item, e);
                                  },
                                  onTouchMove: handleMove,
                                  onTouchEnd: handleTouchEnd,
                              }
                            : {
                                  onMouseDown: (e) => {
                                      handleMouseDown(item, e);
                                  },
                              })}
                        dangerouslySetInnerHTML={{
                            __html: item.content,
                        }}
                    />
                );
            })}
        </>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
