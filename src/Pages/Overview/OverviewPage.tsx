import React, { useEffect, useRef, useState } from 'react';
import FullCalendar, { elementClosest, EventContentArg, EventSourceInput } from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SwitchButton from '../../views/partials/switchButton';
import ExternalEvent from './partials/ExternalEvent';
import VerticalGraph from './partials/verticalGraphs';
import { Button } from '../../views/partials/Button';
import TaskForm from './partials/TaskForm';
export interface IOverviewPageProps {}

interface State {
    externalEvents: EventObject[];
    events: EventObject[];
}
export enum Mode {
    updating = 'updating',
    deleting = 'deleting',
    dragAndDrop = 'dragAndDrop'
}
const OverviewPage: React.FunctionComponent<IOverviewPageProps> = (props) => {
    let onlyOnce = true;
    const calendarRef = useRef<any>();
    const [calendarApi, setCalendarApi] = useState<any>();
    const [isUpdating, setIsUpdating] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [displayTaskForm, setDisplayTaskForm] = useState(false);
    const [flags, setFlags] = useState({
        showAnimation: true,
        demandToggle: true,
        showGraphs: true
    });

    const [currentEvent, setCurrentEvent] = useState<EventObject>(emptyEventObject);

    const [state, setState] = useState<State>({
        externalEvents: [],
        events: []
    });
    useEffect(() => {
        handlingResizeOfEvents();

        async function getData() {
            const events = await window.api.getAllEvents();
            setIsLoading(!isLoading);
            sortData(events);
        }

        if (isLoading) {
            getData();
        }
    });

    async function saveData(event: EventObject[]) {
        const id = await window.api.saveEvents(event);
        return id;
    }

    async function editEventsInCalendar(event: EventObject, mode: Mode) {
        const eventsInCalendar: EventObject[] = state.events;
        const externalEvents: EventObject[] = state.externalEvents;
        let alreadyChanged = false;

        for (let eventCalendar of eventsInCalendar) {
            if (eventCalendar.id === event.id) {
                let index = eventsInCalendar.indexOf(eventCalendar);
                if (mode === Mode.updating) eventsInCalendar.splice(index, 1, event);
                else eventsInCalendar.splice(eventsInCalendar.indexOf(eventCalendar), 1);
                alreadyChanged = true;
                break;
            }
        }
        if (!alreadyChanged) {
            for (let externalEvent of externalEvents) {
                if (externalEvent.id === event.id) {
                    let index = externalEvents.indexOf(externalEvent);
                    if (mode === Mode.updating) externalEvents.splice(index, 1, event);
                    else externalEvents.splice(externalEvents.indexOf(externalEvent), 1);
                    break;
                }
            }
        }
        if (mode === Mode.dragAndDrop) eventsInCalendar.push(event);

        if (mode === Mode.deleting) window.api.deleteEvents([event]);
        else window.api.updateEvents([event]);
        if (eventsInCalendar.length !== 0 || externalEvents.length !== 0) {
            await setIsUpdating(true);
            setState(() => {
                return {
                    events: eventsInCalendar,
                    externalEvents: externalEvents
                };
            });
            setIsUpdating(false);
        }
    }

    function sortData(events: EventObject[]) {
        const eventsInCalendar: EventObject[] = [];
        const externalEvents: EventObject[] = [];
        events.forEach((event) => {
            const { demand, ...eventWithoutDemand } = event;
            const newEvent = { ...eventWithoutDemand, classNames: ['demand', `demand-${demand}`] };
            if (newEvent.start !== undefined && newEvent.start !== null) {
                eventsInCalendar.push(newEvent);
            } else externalEvents.push(newEvent);
        });
        if (eventsInCalendar.length !== 0 || externalEvents.length !== 0)
            setState(() => {
                return {
                    events: eventsInCalendar,
                    externalEvents: externalEvents
                };
            });
    }

    async function updateData(arg: any, mode: Mode) {
        let currentEvent: EventObject = fcEventToReactEvent(arg);
        setFlags((flags) => {
            return { ...flags, showAnimation: false };
        });
        await editEventsInCalendar(currentEvent, mode); //update and forcing refresh of component "FullCalendar"
    }

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

    /*
    When Task is dropped from task pool into the calendar
     */
    function handleEventReceive(eventInfo: any) {
        updateData(eventInfo, Mode.dragAndDrop);
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
        updateData(arg, Mode.updating);
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

    function deleteEvents(events: EventObject[]) {
        const externalEvents = state.externalEvents;
        const calendarEvents = state.events;
        let notFound = true;
        for (let event of events) {
            for (let storedEvent of externalEvents) {
                if (event.id === storedEvent.id) {
                    externalEvents.splice(externalEvents.indexOf(storedEvent), 1);
                    notFound = false;
                    break;
                }
            }
            if (notFound) {
                //only continue search if element hasn't been found yet
                for (let storedCalendarEvents of calendarEvents) {
                    if (event.id === storedCalendarEvents.id) {
                        console.log(calendarEvents);

                        calendarEvents.splice(calendarEvents.indexOf(storedCalendarEvents), 1);
                        console.log(calendarEvents);
                        break;
                    }
                }
            }
            notFound = true;
        }
        setState(() => {
            return {
                events: calendarEvents,
                externalEvents: externalEvents
            };
        });
        window.api.deleteEvents(events);
    }

    /*
    Created by the task pool
    */
    async function handleNewOrEditEvent(eventInWork: EventObject) {
        //if already existing
        if (eventInWork.id !== undefined) updateData(eventInWork, Mode.updating);
        //otherwise create new Task
        else {
            const currentExternalEvents = state.externalEvents;
            const id = await saveData([eventInWork]);
            eventInWork.id = id.value;
            currentExternalEvents.push(eventInWork);

            setState((state) => {
                return {
                    ...state,
                    externalEvents: currentExternalEvents
                };
            });
        }
    }

    function handleLeftclick(arg: any) {
        const currentEvent = fcEventToReactEvent(arg);
        setCurrentEvent(currentEvent); //callback set back to undefined) TODO
        openTaskMenu();
    }

    function openTaskMenu() {
        document!.getElementById('overlay')!.style.display = 'block';
        setDisplayTaskForm(!displayTaskForm);
    }

    function fcEventToReactEvent(arg: any): EventObject {
        let event;
        if (arg.event !== undefined) {
            event = {
                id: parseInt(arg.event.id),
                title: arg.event.title,
                deadline: arg.event.extendedProps.deadline,
                start: arg.event.startStr,
                end: arg.event.endStr,
                classNames: arg.event.classNames
            };
        } else if (arg.id) event = arg;
        else event = emptyEventObject;

        return event;
    }

    return (
        <>
            {isLoading || isUpdating ? (
                ''
            ) : (
                <div className="flex">
                    <div className="flex flex-grow flex-col max-height bg-slate-100 border-2 rounded-lg w-52 mr-10 top-9 h-1/2 relative p-2">
                        {state.externalEvents.map((event) => (
                            <ExternalEvent onClick={handleLeftclick} event={event} />
                        ))}
                        <Button
                            color={'white'}
                            backgroundColor={'#1e2b3'}
                            disabled={false}
                            onClick={() => {
                                openTaskMenu();
                            }}
                            className={'mr-auto ml-auto mt-auto'}
                        >
                            Add Task
                        </Button>
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
                                    editable={true}
                                    droppable={true}
                                    forceEventDuration={true}
                                    events={state.events as EventSourceInput}
                                    eventDragStart={handleDragStart}
                                    eventDragStop={handleDragStop}
                                    eventDrop={handleDrop}
                                    eventReceive={handleEventReceive}
                                    eventLeave={handleExternalEventLeave}
                                    eventClick={handleLeftclick}
                                />
                            </div>
                            {flags.showGraphs ? <VerticalGraph showAnimation={flags.showAnimation} className="box z-20" /> : ''}
                            <div id="overlay" className="">
                                {displayTaskForm ? (
                                    <TaskForm
                                        className="mt-10 ml-14"
                                        onChange={handleNewOrEditEvent}
                                        display={() => {
                                            document!.getElementById('overlay')!.style.display = 'none';
                                            setDisplayTaskForm(!displayTaskForm);
                                        }}
                                        data={currentEvent}
                                        onDelete={editEventsInCalendar}
                                        callback={setCurrentEvent}
                                    />
                                ) : (
                                    ''
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OverviewPage;
/*   async function fetchData() {
            const result = await window.api.getNames();
            console.log(result);
            setName(result);
        }
        fetchData();*/

/*
         {
                id: 'unstored5',
                title: 'This is just an example',
                start: '2022-03-28T12:30:00',
                end: '2022-03-28T13:30:00',
                backgroundColor: '#74AAEB',
                textColor: 'white',
                classNames: ['demand', 'demand-5']
            },
            {
                id: 'unstored6',
                title: 'This is another example',
                start: '2022-03-29T08:00:00',
                end: '2022-03-29T11:30:00',
                backgroundColor: '#74AAEB',
                textColor: 'white',
                classNames: ['demand', 'demand-2']
            }

             { id: 'unstored1', title: 'Task 1', backgroundColor: '#74AAEB', textColor: 'white', classNames: ['demand', 'demand-7'] },
            { id: 'unstored2', title: 'Task 2', backgroundColor: '#91BEEB', textColor: 'black', classNames: ['demand', 'demand-3'] },
            { id: 'unstored3', title: 'Task 3', backgroundColor: '#91BEEB', textColor: 'black', classNames: ['demand', 'demand-2'] },
            { id: 'unstored4', title: 'Task 4', backgroundColor: '#74AAEB', textColor: 'white', classNames: ['demand', 'demand-6'] }
            */
