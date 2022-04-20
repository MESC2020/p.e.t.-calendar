import React from 'react';

export interface IStatsBoxProps {
    className?: string;
    text?: string;
    children: any;
    id?: string;
}

const StatsBox: React.FunctionComponent<IStatsBoxProps> = (props) => {
    return (
        <div id={props?.id} className={props?.className + ' border-2s p-5 rounded-xl shadow-lg bg-white'}>
            <div className="flex justify-center">{props?.text}</div>
            {props.children}
        </div>
    );
};

export default StatsBox;
