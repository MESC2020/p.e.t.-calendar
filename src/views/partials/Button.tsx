import React from 'react';

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
