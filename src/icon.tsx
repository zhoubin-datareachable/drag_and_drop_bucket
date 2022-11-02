import React from 'react';

import './icon.scss';
/* <------------------------------------ **** DEPENDENCE IMPORT END **** ------------------------------------ */
/* <------------------------------------ **** INTERFACE START **** ------------------------------------ */
/** This section will include all the interface for this tsx file */

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
    /**
     * color of this component
     */
    color?: string;
    /**
     * fontSize of this component
     */
    fontSize?: string;
    /**
     * title of this component
     */
    title?: string;
}

export const Icon: React.FC<IconProps> = ({
    color,
    fontSize,
    style,
    className,
    title,
    ...props
}) => {
    const classNameStr = `icon_wrap${className ? ` ${className}` : ''}`;

    return (
        <svg
            focusable="false"
            aria-hidden="true"
            className={classNameStr}
            viewBox={`0 0 17 12`}
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            style={Object.assign(
                {},
                style,
                fontSize && {
                    fontSize,
                },
                color && {
                    color,
                },
            )}
            {...props}
        >
            {title && <title>{title}</title>}
            <path
                fill="currentColor"
                d="M11.3945 0.163494C11.1765 -0.054498 10.8231 -0.0544979 10.6051 0.163494C10.3871 0.381485 10.3871 0.73492 10.6051 0.952911L15.1647 5.51251L1.25107 5.51251C0.942787 5.51251 0.692871 5.76242 0.692871 6.07071C0.692871 6.379 0.942787 6.62891 1.25107 6.62891L15.0233 6.62891L10.6051 11.0471C10.3871 11.2651 10.3871 11.6185 10.6051 11.8365C10.8231 12.0545 11.1765 12.0545 11.3945 11.8365L16.8363 6.39471C17.0543 6.17672 17.0543 5.82328 16.8363 5.60529L11.3945 0.163494Z"
            />
        </svg>
    );
};
