import styled from '@emotion/styled';
import { Draggable } from '@fullcalendar/interaction';
import React, { memo, useEffect, useRef } from 'react';
import { colorPalettes } from '../OverviewPage';

export interface IExternalEventProps {
    event: any;
    onClick: any;
    onMousePress: any;
}

const ExternalEvent: React.FunctionComponent<IExternalEventProps> = memo((props) => {
    let elRef = useRef(null);
    let textColor = props.event?.textColor || 'white';

    useEffect(() => {
        if (elRef.current != null) {
            let draggable = new Draggable(elRef.current, {
                eventData: function () {
                    return { ...props.event, create: true };
                }
            });

            // a cleanup function
            return () => draggable.destroy();
        }
    });
    function displayDeadlineText() {
        const todayTime = new Date().getTime();
        const deadlineTime = new Date(props.event.deadline).getTime();
        let timeLeft = deadlineTime - todayTime;
        timeLeft = new Date(timeLeft).getHours();
        if (props.event.backgroundColor === colorPalettes.deadlineWarning) {
            return `Deadline in ${timeLeft} ${timeLeft > 1 ? 'hrs' : 'hr'}`;
        } else if (props.event.backgroundColor === colorPalettes.deadlineTooLate) {
            return `Passed Deadline`;
        }
    }

    return (
        <div
            onClick={() => {
                props.onClick(props.event);
            }}
            style={{ cursor: 'pointer' }}
            ref={elRef}
            className="w-ful "
        >
            <div style={{ backgroundColor: props.event.backgroundColor }} className="rounded-md text-white w-full flex justify-between p-2">
                <div style={{ maxWidth: '80%' }} className="flex flex-col">
                    <p className="font-bold overflow-hidden">{props.event.title}</p>
                    <p>{displayDeadlineText()}</p>
                </div>
                <div style={{ minWidth: '20%' }} className="w-1/5 rounded-sm  bg-white flex justify-center items-center">
                    <p className="font-bold" style={{ color: props.event.backgroundColor }}>
                        {retrieveDemandLevel(props.event)}
                    </p>
                </div>
            </div>
        </div>
    );
});

export default ExternalEvent;
export function retrieveDemandLevel(event: any) {
    for (let className of event.classNames) {
        if (className.includes('-')) return parseInt(className.slice(-1));
    }
}
