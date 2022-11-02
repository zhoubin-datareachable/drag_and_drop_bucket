import { createContext, useContext } from "react";
import { OptionProps, PointProps } from "./unit";

interface ContextDataProps {
    mouseUpOnStorage: React.MutableRefObject<
        | {
              index: number;
              val: OptionProps;
          }
        | undefined
    >;
    isMobile: boolean;
    position?: PointProps;
    setPosition: React.Dispatch<React.SetStateAction<PointProps | undefined>>;
}

const contextData = (): ContextDataProps => ({
    mouseUpOnStorage: { current: undefined },
    isMobile: false,
    position: undefined,
    setPosition: () => undefined,
});

export const Context = createContext(contextData());

export const useMContext = (): ContextDataProps => useContext(Context);
