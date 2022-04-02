import React from 'react';
/**
 * Main Button that is used across our platform
 * @function
 */

interface IbuttonProps {
    disabled: boolean;
    onClick: any;
    className: string;
    color?: string;
    fullWidth?: any;
    children?: any;
    backgroundColor?: string;
    textColor?: string;
}

export const Button = (props: IbuttonProps) => {
    return (
        <button
            disabled={props.disabled}
            onClick={props.onClick}
            background-color={props.backgroundColor ? props.backgroundColor : '#2c3e50'}
            color={props.textColor ? props.textColor : 'white'}
            className={(props.fullWidth ? 'w-full' : '') + ' focus:ring-blue-500 ' + (props.className ?? '')}
        >
            {props.children}
        </button>
    );
};

/*'from-' + props.color + '-500 to-' + props.color + '-100 focus:ring-' + props.color + '-500' : 'from-blue-500 to-blue-100 focus:ring-blue-500') */
