import { Draggable } from '@fullcalendar/interaction';
import React, { memo, useEffect, useRef } from 'react';
import { colorPalettes } from '../OverviewPage';

export interface IExternalEventProps {
    event: any;
    onClick: any;
}

const ExternalEvent: React.FunctionComponent<IExternalEventProps> = memo((props) => {
    let elRef = useRef(null);
    let textColor = props.event?.textColor || 'white';

    useEffect(() => {
        console.log(props.event.backgroundColor);
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
            id="divBox"
            ref={elRef}
            className="fc-event fc-h-event mb-1 fc-daygrid-event fc-daygrid-block-event p-2"
            title={props.event.title}
            style={{
                backgroundColor: props.event.backgroundColor,
                borderColor: props.event.backgroundColor,
                cursor: 'pointer'
            }}
        >
            <div className="fc-event-main">
                <div>
                    <strong style={{ color: textColor }}>{props.event.title}</strong>
                    <p>{props.event.deadline ? displayDeadlineText() : ''}</p>
                </div>
            </div>
        </div>
    );
});

export default ExternalEvent;
