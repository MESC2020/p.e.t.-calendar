import { Draggable } from '@fullcalendar/interaction';
import React, { memo, useEffect, useRef } from 'react';

export interface IExternalEventProps {
    event: any;
    onClick: any;
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
                </div>
            </div>
        </div>
    );
});

export default ExternalEvent;
