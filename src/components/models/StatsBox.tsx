import React from 'react';

export interface IStatsBoxProps {
    className?: string;
    text?: string;
    children: any;
}

const StatsBox: React.FunctionComponent<IStatsBoxProps> = (props) => {
    return (
        <div className={props?.className + ' border-2s p-5 m-5 rounded-xl shadow-lg bg-white'}>
            <div className="flex justify-center">{props?.text}</div>
            {props.children}
        </div>
    );
};

export default StatsBox;
