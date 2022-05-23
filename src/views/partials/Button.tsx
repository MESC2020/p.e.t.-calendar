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
    id?: string;
    isButtonPressed?: boolean;
    rounded?: string;
}

export const Button = (props: IbuttonProps) => {
    return (
        <button
            style={{ background: props.backgroundColor ? props.backgroundColor : '#2c3e50' }}
            id={props?.id}
            disabled={props.disabled}
            onClick={props.onClick}
            color={props.textColor ? props.textColor : 'white'}
            className={
                (props.isButtonPressed ? 'ring-2 ring-calendar-blue/50 ring-offset-2 ' : '') +
                (props.rounded ? `${props.rounded} ` : 'rounded-xl ') +
                (props.fullWidth ? 'w-full' : '') +
                ' focus:ring-calendar-blue/50 ' +
                (props.className ?? '')
            }
        >
            {props.children}
        </button>
    );
};

/*'from-' + props.color + '-500 to-' + props.color + '-100 focus:ring-' + props.color + '-500' : 'from-blue-500 to-blue-100 focus:ring-blue-500') */
