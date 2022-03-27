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
`;

type EventObject = {
    id: string | number;
    title: string;
    start: string;
    end: string;
    backgroundColor: string;
    textColor: string;
    demanding: number;
};
type ExternalEventObject = {
    id: string | number;
    title: string;
    backgroundColor: string;
    textColor: string;
    demanding: number;
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
            { id: 'd', title: 'Task 1', backgroundColor: '#74AAEB', textColor: 'white', demanding: 3 },
            { id: 'e', title: 'Task 2', backgroundColor: '#E7EDFB', textColor: 'black', demanding: 5 },
            { id: 'f', title: 'Task 3', backgroundColor: '#E7EDFB', textColor: 'black', demanding: 1 },
            { id: 'g', title: 'Task 4', backgroundColor: '#74AAEB', textColor: 'white', demanding: 7 }
        ],
        events: [
            {
                id: 'a',
                title: 'This is just an example',
                start: '2022-03-28T12:30:00',
                end: '2022-03-28T16:30:00',
                backgroundColor: '#74AAEB',
                textColor: 'white',
                demanding: 5
            },
            {
                id: 'b',
                title: 'This is another example',
                start: '2022-03-29T08:00:00',
                end: '2022-03-29T11:30:00',
                backgroundColor: '#74AAEB',
                textColor: 'white',
                demanding: 5
            },
            {
                id: 'c',
                title: 'I wonder if you can have line seperator:\n Did this work? ',
                start: '2022-03-30T14:00:00',
                end: '2022-03-30T16:00:00',
                backgroundColor: '#E7EDFB',
                textColor: 'black',
                demanding: 5
            }
        ]
    });
    useEffect(() => {
        return storeEvents();
    });

    const handleEventReceive = (eventInfo: any) => {
        const newEvent = {
            id: eventInfo.event.id
        };
        const externalEvents: ExternalEventObject[] = state.externalEvents;
        let updatedExternalEvents: ExternalEventObject[] = [];
        for (let externalEvent of externalEvents) {
            //remove Event if already dropped into calendar
            if (externalEvent.id == newEvent.id) {
                const index = externalEvents.indexOf(externalEvent);
                updatedExternalEvents = index > -1 ? externalEvents.splice(index) : externalEvents;
                break;
            }
        }

        if (updatedExternalEvents.length != 0) {
            setState((state) => {
                return {
                    ...state,
                    externalEvents: updatedExternalEvents
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
        storeEvents();
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
                    demanding: event.demanding
                };
                storeAllEvents.push(newEvent);
            });
            console.log('data stored temporarly');
            window.sessionStorage.setItem('events', JSON.stringify(storeAllEvents));
        }
    };

    return (
        <>
            <StyleWrapper>
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
                                    eventClassNames={eventChangeWidth}
                                    droppable={true}
                                    forceEventDuration={true}
                                    eventDrop={handleEventChange}
                                    eventReceive={handleEventReceive}
                                />
                            </div>
                            {showDemandLevel ? <VerticalGraph className="box z-20" /> : ''}
                        </div>
                    </div>
                </div>
            </StyleWrapper>
        </>
    );
};

export default OverviewPage;
