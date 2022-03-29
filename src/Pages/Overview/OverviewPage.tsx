import React, { useEffect, useRef, useState } from 'react';
import FullCalendar, { elementClosest, EventContentArg, EventSourceInput } from '@fullcalendar/react';
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
    const [flags, setFlags] = useState({
        showAnimation: true,
        demandToggle: true,
        showGraphs: true
    });

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
        handlingResizeOfEvents();
        return storeEvents();
    });

    function handlingResizeOfEvents() {
        const demand = document.querySelectorAll('.demand');

        demand.forEach((el) => {
            if (!flags.demandToggle && !flags.showGraphs) {
                // Case 1: when toggle has been turned Off
                if (!el.classList.contains('full-width')) {
                    el.classList.add('full-width');
                }
                if (el.classList.contains('demand-no-animation')) el.classList.remove('demand-no-animation');
                // Case 2: when Event is beeing dragged
            } else if (!flags.demandToggle && flags.showGraphs) {
                if (el.classList.contains('full-width')) {
                    el.classList.remove('full-width');
                    el.classList.add('demand-no-animation');
                }
                // Case 3: when toggle is turned on or dragging stopped
            } else {
                if (el.classList.contains('full-width')) {
                    el.classList.remove('full-width');
                    if (el.classList.contains('demand-no-animation')) el.classList.remove('demand-no-animation');
                }
            }
        });
    }

    function handleEventReceive(eventInfo: any) {
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
    }

    function toggleDemandOnOff() {
        let currentDemandToggle = flags.demandToggle;
        let currentShowAnimation = flags.showAnimation;
        let currentShowGraphs = flags.showGraphs;

        if (!currentDemandToggle) {
            currentDemandToggle = true;
            currentShowGraphs = true;
            if (!currentShowAnimation) currentShowAnimation = true;
        } else {
            currentDemandToggle = false;
            currentShowGraphs = false;
        }
        setFlags((flags) => {
            return {
                ...flags, //if more flags are to be added in the future
                showGraphs: currentShowGraphs,
                demandToggle: currentDemandToggle,
                showAnimation: currentShowAnimation
            };
        });
    }

    function handleDragStart() {
        if (!flags.showGraphs) {
            setFlags((flags) => {
                return {
                    ...flags,
                    showGraphs: true,
                    showAnimation: false
                };
            });
        }
    }
    /*
    Triggered when dragging stops. It's always triggered - before eventDrop
    */
    function handleDragStop(eventInfo: any) {
        if (!flags.demandToggle) {
            setFlags((flags) => {
                return {
                    ...flags,
                    showGraphs: false,
                    showAnimation: true
                };
            });
        }
    }
    /*
    Triggered when dragging stops AND event has moved to a different day/time
    */
    function handleDrop(arg: any) {
        const demand = document.querySelectorAll('.demand') as any;
        //fixes the bug that the event, which was dragged, would go back into full width (if toggle turned off)
        if (!flags.demandToggle) {
            for (let el of demand) {
                if (el.fcSeg.eventRange.def.publicId == arg.event.id) {
                    if (!el.classList.contains('full-width')) el.classList.add('full-width');
                    break;
                }
            }
        }
    }
    function storeEvents() {
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
    }
    function handleExternalEventLeave() {
        if (!flags.showGraphs) {
            setFlags((flags) => {
                return {
                    ...flags,
                    showGraphs: true,
                    showAnimation: false
                };
            });
        }
    }

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
                        <SwitchButton defaultMode={true} onChange={toggleDemandOnOff} />
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
                                eventDragStart={handleDragStart}
                                eventDragStop={handleDragStop}
                                eventDrop={handleDrop}
                                eventReceive={handleEventReceive}
                                eventLeave={handleExternalEventLeave}
                            />
                        </div>
                        {flags.showGraphs ? <VerticalGraph showAnimation={flags.showAnimation} className="box z-20" /> : ''}
                    </div>
                </div>
            </div>
        </>
    );
};

export default OverviewPage;
