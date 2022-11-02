import "./font";
import "./style.scss";

import { Warehouse } from "./warehouse";
import React, { useEffect, useRef, useState } from "react";
import { StorageCabinet } from "./storageCabinet";
import { Context } from "./context";
import { isMobile } from "./isMobile";
import { deepCloneData, DragData, OptionProps, PointProps } from "./unit";

import { PluginComms, ConfigYML } from "@possie-engine/dr-plugin-sdk";

export const comms = new PluginComms({
    defaultConfig: new ConfigYML(),
}) as {
    config: {
        question?: string;
        instruction?: string;
        options?: Array<Array<{ code: string; content: string }>>;
    };
    state: unknown;
    renderOnReady: (res: React.ReactNode) => void;
};
const Main: React.FC = () => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/
    const [selectItem, setSelectItem] = useState<DragData>();

    const status = useRef<{ index: number; val: OptionProps }>();

    const [mobileStatus, setMobileStatus] = useState(isMobile);

    const [position, setPosition] = useState<PointProps>();

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    useEffect(() => {
        const fn = () => {
            setMobileStatus(isMobile);
        };
        window.addEventListener("resize", fn);
        return () => {
            window.removeEventListener("resize", fn);
        };
    }, []);

    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/
    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <div className={`wrapper${mobileStatus ? ` mobile` : ""}`}>
            <div className="question">
                <div
                    className="questionContent"
                    dangerouslySetInnerHTML={{
                        __html: comms.config.question ?? "",
                    }}
                />
                <div
                    className="questionDes"
                    dangerouslySetInnerHTML={{
                        __html: `(${comms.config.instruction ?? ""})`,
                    }}
                />
            </div>
            <Context.Provider
                value={{
                    mouseUpOnStorage: status,
                    isMobile: mobileStatus,
                    position,
                    setPosition,
                }}
            >
                <Warehouse
                    handleChange={(res) => {
                        setSelectItem(deepCloneData(res));
                    }}
                    value={deepCloneData(selectItem)}
                />
                <StorageCabinet
                    handleChange={(res) => {
                        setSelectItem(deepCloneData(res));
                    }}
                    value={deepCloneData(selectItem)}
                />
                {!!position && (
                    <div
                        className="floating"
                        style={{
                            left: `${position.x}px`,
                            top: `${position.y}px`,
                            width: `${position.width}px`,
                            height: `${position.height}px`,
                        }}
                        dangerouslySetInnerHTML={{
                            __html: selectItem?.content ?? "",
                        }}
                    />
                )}
            </Context.Provider>
        </div>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */

void comms.renderOnReady(<Main />);
