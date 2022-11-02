/* <------------------------------------ **** DEPENDENCE IMPORT START **** ------------------------------------ */
/** This section will include all the necessary dependence for this tsx file */

import React from "react";
import { Product } from "./product";
import { deepCloneData, DragData, HandleChangeFn } from "./unit";
import { comms } from ".";
import { useMContext } from "./context";
import { ScrollComponent } from "./Scroll";
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */

// const fruits = options.map(item => { const key = Object.keys(item)[0]; return item[key] });

/** This section will include all the interface for this tsx file */
export interface WarehouseProps {
    handleChange: HandleChangeFn;
    value?: DragData;
}
/* <------------------------------------ **** INTERFACE END **** ------------------------------------ */
/* <------------------------------------ **** FUNCTION COMPONENT START **** ------------------------------------ */
export const Warehouse: React.FC<WarehouseProps> = ({ handleChange, value }) => {
    const { isMobile } = useMContext();

    const params = comms.config.options?.[1] ?? [];

    const handleUp = () => {
        handleChange(undefined);
    };

    return (
        <div className="warehouse_wrap">
            <div className="warehouse_total">
                共
                <span className={`warehouse_totalVal${params.length ? "" : " red"}`}>
                    {params.length}
                </span>
                项
            </div>

            {isMobile ? (
                <div className="warehouse_items">
                    <div className="warehouse_body">
                        <Product
                            list={params}
                            placement="warehouse"
                            handleChange={handleChange}
                            value={deepCloneData(value)}
                            onUp={handleUp}
                        />
                    </div>
                </div>
            ) : (
                <ScrollComponent
                    className="warehouse_scrollWrap"
                    bodyClassName="warehouse_scrollBody"
                    hidden={{
                        x: true,
                    }}
                >
                    <div className="warehouse_body">
                        <Product
                            list={params}
                            placement="warehouse"
                            handleChange={handleChange}
                            value={deepCloneData(value)}
                            onUp={handleUp}
                        />
                    </div>
                </ScrollComponent>
            )}
        </div>
    );
};
/* <------------------------------------ **** FUNCTION COMPONENT END **** ------------------------------------ */
