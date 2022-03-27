import { Draggable } from '@fullcalendar/interaction';
import React, { memo, useEffect, useRef } from 'react';

export interface IExternalEventProps {
    event: any;
}

const ExternalEvent: React.FunctionComponent<IExternalEventProps> = memo(({ event }) => {
    let elRef = useRef(null);
    let textColor = event?.textColor || 'white';

    useEffect(() => {
        if (elRef.current != null) {
            let draggable = new Draggable(elRef.current, {
                eventData: function () {
                    return { ...event, create: true };
                }
            });

            // a cleanup function
            return () => draggable.destroy();
        }
    });

    return (
        <div
            ref={elRef}
            className="fc-event fc-h-event mb-1 fc-daygrid-event fc-daygrid-block-event p-2"
            title={event.title}
            style={{
                backgroundColor: event.backgroundColor,
                borderColor: event.backgroundColor,
                cursor: 'pointer'
            }}
        >
            <div className="fc-event-main">
                <div>
                    <strong style={{ color: textColor }}>{event.title}</strong>
                </div>
            </div>
        </div>
    );
});

export default ExternalEvent;
