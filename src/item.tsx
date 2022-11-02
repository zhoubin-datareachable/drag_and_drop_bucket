/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */
import React from "react";
import { useMContext } from "./context";
import { Product } from "./product";
import { ScrollComponent } from "./Scroll";
import { deepCloneData, DragData, HandleChangeFn, OptionProps } from "./unit";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */
export interface ItemProps {
    handleChange: HandleChangeFn;
    value?: DragData;
    values: OptionProps[];
    onUp: (res: OptionProps | undefined) => void;
    index: number;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
export const Item: React.FC<ItemProps> = ({ handleChange, value, values, onUp, index }) => {
    /* <------------------------------------ **** STATE START **** ------------------------------------ */
    /************* This section will include this component HOOK function *************/

    const { isMobile } = useMContext();

    /* <------------------------------------ **** FUNCTION END **** ------------------------------------ */
    return isMobile ? (
        <div className="mobileScroll">
            <div className="scrollBody">
                <Product
                    list={deepCloneData(values)}
                    handleChange={handleChange}
                    value={deepCloneData(value)}
                    index={index}
                    onUp={onUp}
                    placement="storageCabinet"
                />
            </div>
        </div>
    ) : (
        <ScrollComponent hidden={{ x: true, y: false }}>
            <div className="scrollBody">
                <Product
                    list={deepCloneData(values)}
                    handleChange={handleChange}
                    value={deepCloneData(value)}
                    index={index}
                    onUp={onUp}
                    placement="storageCabinet"
                />
            </div>
        </ScrollComponent>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
