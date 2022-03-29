import React, { useEffect, useRef, useState } from 'react';
import FullCalendar, { EventContentArg, EventSourceInput } from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SwitchButton from '../../views/partials/switchButton';
import ExternalEvent from './partials/ExternalEvent';
import VerticalGraph from './partials/verticalGraphs';
import styled from '@emotion/styled';
export interface IOverviewPageProps {}

export const StyleWrapper = styled.div`
    .fc-event {
        z-index: 500 !important;
        position: absolute !important;
    }
    .fc {
        position: relative !important;
    }
`;

type EventObject = {
    id: string | number;
    title: string;
    start: string;
    end: string;
    backgroundColor: string;
    textColor: string;
    classNames: string[];
};
type ExternalEventObject = {
    id: string | number;
    title: string;
    backgroundColor: string;
    textColor: string;
    classNames: string[];
};
interface State {
    externalEvents: ExternalEventObject[];
    events: EventObject[];
}
const OverviewPage: React.FunctionComponent<IOverviewPageProps> = (props) => {
    const calendarRef = useRef<any>();
    const [showDemandLevel, setShowDemandLevel] = useState(false);
    const [firstTime, setFirstTime] = useState(true);
    const [state, setState] = useState<State>({
        externalEvents: [
            { id: 'd', title: 'Task 1', backgroundColor: '#74AAEB', textColor: 'white', classNames: ['demand', 'demand-7'] },
            { id: 'e', title: 'Task 2', backgroundColor: '#E7EDFB', textColor: 'black', classNames: ['demand', 'demand-3'] },
            { id: 'f', title: 'Task 3', backgroundColor: '#E7EDFB', textColor: 'black', classNames: ['demand', 'demand-2'] },
            { id: 'g', title: 'Task 4', backgroundColor: '#74AAEB', textColor: 'white', classNames: ['demand', 'demand-6'] }
        ],
        events: [
            {
                id: 'a',
                title: 'This is just an example',
                start: '2022-03-28T12:30:00',
                end: '2022-03-28T13:30:00',
                backgroundColor: '#74AAEB',
                textColor: 'white',
                classNames: ['demand', 'demand-5']
            },
            {
                id: 'b',
                title: 'This is another example',
                start: '2022-03-29T08:00:00',
                end: '2022-03-29T11:30:00',
                backgroundColor: '#74AAEB',
                textColor: 'white',
                classNames: ['demand', 'demand-2']
            }
        ]
    });
    useEffect(() => {
        return storeEvents();
    });

    const handleEventReceive = (eventInfo: any) => {
        let changedExternalEvents: boolean = false;
        const newEvent = {
            id: eventInfo.event.id
        };
        const externalEvents: ExternalEventObject[] = state.externalEvents;
        for (let externalEvent of externalEvents) {
            //remove Event if already dropped into calendar
            if (externalEvent.id == newEvent.id) {
                const index = externalEvents.indexOf(externalEvent);
                if (index > -1) {
                    externalEvents.splice(index, 1);
                    changedExternalEvents = true;
                }
                break;
            }
        }

        if (changedExternalEvents) {
            setState((state) => {
                return {
                    ...state,
                    externalEvents: externalEvents
                };
            });
        }
    };

    const toggleDemandOnOff = () => {
        if (firstTime) setFirstTime(false);
        let newValue;
        if (showDemandLevel) newValue = false;
        else newValue = true;
        setShowDemandLevel(newValue);
        let demand = document.querySelectorAll('.demand');
        demand.forEach((el) => {
            if (el.classList.contains('full-width')) el.classList.remove('full-width');
            else el.classList.add('full-width');
        });
    };
    function handleEventChange(eventInfo: any) {}

    function eventChangeWidth(arg: EventContentArg) {
        const demandingLevel = arg.event.extendedProps.demanding;
        const classNames = [''];
        if (arg.isDragging) {
            classNames.push('demand-' + `${demandingLevel}`);
            return classNames;
        }

        if (showDemandLevel && !firstTime) {
            classNames.push('demand-' + `${demandingLevel}`);
        }
        if (showDemandLevel && !firstTime) {
            classNames.push('maxLevelOn');
        } else if (!showDemandLevel && !firstTime) {
            classNames.push('maxLevelOff');
        }
        return classNames;
    }
    const storeEvents = () => {
        const calendarApi = calendarRef.current.getApi();
        if (calendarApi != null) {
            const currentEvents = calendarApi.getEvents();
            const storeAllEvents: EventObject[] = [];
            currentEvents.map((event: any) => {
                const newEvent: EventObject = {
                    id: event.id,
                    title: event.title,
                    start: event.start,
                    end: event.end,
                    backgroundColor: event.backgroundColor,
                    textColor: event.textColor,
                    classNames: event.classNames
                };
                storeAllEvents.push(newEvent);
            });
            console.log('data stored temporarly');
            window.sessionStorage.setItem('events', JSON.stringify(storeAllEvents));
        }
    };

    const handleEventContent = () => {};

    return (
        <>
            <div className="flex">
                <div className="bg-green-50 border-2 rounded-lg w-52 mr-10 top-9 h-1/2 relative p-2">
                    {state.externalEvents.map((event) => (
                        <ExternalEvent key={event.id} event={event} />
                    ))}
                </div>
                <div className="flex flex-col">
                    <div className="flex justify-end">
                        <p className="mr-2">Demanding Level</p>
                        <SwitchButton onChange={toggleDemandOnOff} />
                    </div>
                    <div className="container-overview overflow-hidden">
                        <div className=" bg-blue-50 box border-blue-100 border-2 rounded-lg drop-shadow-2xl">
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[timeGridPlugin, interactionPlugin]}
                                initialView="timeGridWeek"
                                allDaySlot={false}
                                slotMinTime="08:00:00"
                                slotMaxTime="17:00:00"
                                nowIndicator={true}
                                height="800px"
                                contentHeight="100px"
                                expandRows={true}
                                events={state.events as EventSourceInput}
                                editable={true}
                                droppable={true}
                                forceEventDuration={true}
                                eventDrop={handleEventChange}
                                eventReceive={handleEventReceive}
                                eventContent={handleEventContent}
                            />
                        </div>
                        {showDemandLevel ? <VerticalGraph className="box z-20" /> : ''}
                    </div>
                </div>
            </div>
        </>
    );
};

export default OverviewPage;
