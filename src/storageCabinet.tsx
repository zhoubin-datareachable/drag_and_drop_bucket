/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React, { useEffect, useState } from "react";
import { useMContext } from "./context";
import { comms } from ".";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */

// const colors = options.map(item => { const key = Object.keys(item)[0]; return item[key] });

// import { colors } from './defaultData';
import { Desk } from "./ColorItems/desk";
import { SmallDesk } from "./ColorItems/smallDesk";
import { Tablet } from "./ColorItems/tablet";
import { Mobile } from "./ColorItems/mobile";
import { deepCloneData, DragData, OptionProps } from "./unit";
export interface StorageCabinetProps {
    handleChange: (res: DragData | undefined) => void;
    value?: DragData;
}

export interface ListItemProps {
    code: string;
    content: string;
    values: OptionProps[];
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
export const StorageCabinet: React.FC<StorageCabinetProps> = ({ handleChange, value }) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/

    const { isMobile } = useMContext();

    const [is1024, setIs1024] = useState(window.matchMedia("(max-width: 1000px)").matches);

    const [is375, setIs375] = useState(window.matchMedia("(max-width: 703px)").matches);

    const [list, setList] = useState<Array<ListItemProps>>(
        deepCloneData(comms.config.options?.[0] ?? []).map((item) => ({
            code: item.code,
            content: item.content,
            values: [],
        })),
    );

    /* <------------------------------------ **** STATE END **** ------------------------------------ */
    /* <------------------------------------ **** PARAMETER START **** ------------------------------------ */
    /************* This section will include this component parameter *************/

    useEffect(() => {
        const fn = () => {
            setIs1024(window.matchMedia("(max-width: 1000px)").matches);
            setIs375(window.matchMedia("(max-width: 703px)").matches);
        };
        window.addEventListener("resize", fn);
        return () => {
            window.removeEventListener("resize", fn);
        };
    }, []);


    useEffect(() => {
        const data: Record<string, Record<string, 0 | 1>> = {};

        const rows = comms.config.options?.[0] ?? [];
        const cols = comms.config.options?.[1] ?? [];

        for (let i = 0; i < rows.length; i++) {
            const subData: Record<string, 0 | 1> = {};


            for (let j = 0; j < cols.length; j++) {
                const item = cols[j];
                let val: 0 | 1 = 0;
                const selectData = list.find(a => a.code === rows[i].code);

                if (selectData?.values.some(a => a.code === item.code)) {
                    val = 1;
                }
                subData[item.code] = val;


            }
            data[rows[i].code] = subData;
        }


        comms.state = data;

    }, [list])
    /* <------------------------------------ **** PARAMETER END **** ------------------------------------ */
    /* <------------------------------------ **** FUNCTION START **** ------------------------------------ */
    /************* This section will include this component general function *************/

    const handleColorChange = (res: ListItemProps[]) => {
        setList([...res]);

    };

    let classStr = "storageCabinet_wrap";

    let mainEl = <></>;

    const valueData = deepCloneData(value);

    if (isMobile) {
        mainEl = is375 ? (
            <Mobile
                value={valueData}
                handleChange={handleChange}
                handleColorChange={handleColorChange}
                colors={list}
            />
        ) : (
            <Tablet
                value={valueData}
                handleChange={handleChange}
                handleColorChange={handleColorChange}
                colors={list}
            />
        );
    } else {
        mainEl = is1024 ? (
            <SmallDesk
                value={valueData}
                handleChange={handleChange}
                handleColorChange={handleColorChange}
                colors={list}
            />
        ) : (
            <Desk
                value={valueData}
                handleChange={handleChange}
                handleColorChange={handleColorChange}
                colors={list}
            />
        );
    }

    if (isMobile) {
        classStr += is375 ? " mobile" : " tablet";
    } else if (is1024) {
        classStr += " small_desk";
    } else {
        classStr += " desk";
    }
    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return (
        <div className={classStr}>
            <div className="storageCabinet_total">
                共<span>{list.length}</span>
                个分类
            </div>
            {mainEl}
        </div>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
