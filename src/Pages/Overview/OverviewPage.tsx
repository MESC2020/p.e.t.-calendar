import React, { useEffect, useRef, useState } from 'react';
import FullCalendar, { EventSourceInput } from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SwitchButton from '../../views/partials/switchButton';
import ExternalEvent from './partials/ExternalEvent';
import VerticalGraph from './partials/verticalGraphs';
import { Button } from '../../views/partials/Button';
import TaskForm from './partials/TaskForm';
import moment from 'moment';
import { PlanGenerator } from '../../db/PlanGenerator';

export interface IOverviewPageProps {}

export enum colorPalettes {
    deadlineWarning = '#F56853',
    deadlineWarningStroke = '#DE6C40',
    deadlineTooLate = '#DE4047',
    deadlineTooLateStroke = '#AB3238',
    calendarBlue = '#3788d8'
}

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
    const calendarRef = useRef<any>();
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

    async function editEventsInCalendar(event: EventObject | EventObject[], mode: Mode) {
        const eventsInCalendar: EventObject[] = state.events;
        const externalEvents: EventObject[] = state.externalEvents;
        let alreadyChanged = false;
        const toEdit = Array.isArray(event) ? event : [event]; //make it an array, in case it's not one

        for (let event of toEdit) {
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
        }
        if (mode === Mode.deleting) window.api.deleteEvents(event);
        else window.api.updateEvents(event);

        await setIsUpdating(true);
        setState(() => {
            return {
                events: eventsInCalendar,
                externalEvents: externalEvents
            };
        });
        setIsUpdating(false);
    }
    async function calculateDeadline(eventObject: EventObject) {
        const sameDay = 23 * 60 * 60 * 1000;
        let toCompare;
        //Event is in external pool - thus has no date yet - compare deadline with today
        if (eventObject?.end === undefined && eventObject?.deadline !== undefined && eventObject.deadline !== null) {
            const todayIsoString = moment().seconds(0).milliseconds(0).toISOString(); //instead of new Date to avoid seconds and milliseconds
            toCompare = new Date(todayIsoString).getTime();
        }

        //Event is in calendar - thus has a date - compare deadline with end date
        else if (eventObject.end !== undefined && eventObject.deadline !== undefined && eventObject.deadline !== null) {
            toCompare = new Date(eventObject.end).getTime();
        }

        //Event has no deadline
        else {
            eventObject.backgroundColor = colorPalettes.calendarBlue;
            eventObject.borderColor = colorPalettes.calendarBlue;
        }

        //calculate if Deadline is close or has passed
        if (toCompare !== undefined && eventObject.deadline !== undefined && eventObject.deadline !== null) {
            const deadline = new Date(eventObject.deadline).getTime();
            const timeDifference = deadline - toCompare;
            //Deadline is close
            if (timeDifference <= sameDay && timeDifference > 0) {
                eventObject.backgroundColor = colorPalettes.deadlineWarning;
                eventObject.borderColor = colorPalettes.deadlineWarning;
            }
            //Deadline is passed
            else if (timeDifference <= sameDay && timeDifference <= 0) {
                eventObject.backgroundColor = colorPalettes.deadlineTooLate;
                eventObject.borderColor = colorPalettes.deadlineTooLate;
            }
            //still enought time
            else {
                eventObject.backgroundColor = colorPalettes.calendarBlue;
                eventObject.borderColor = colorPalettes.calendarBlue;
            }
        }
    }

    function sortData(events: EventObject[]) {
        const eventsInCalendar: EventObject[] = [];
        const externalEvents: EventObject[] = [];
        events.forEach((event) => {
            const { demand, ...eventWithoutDemand } = event;
            const newEvent = { ...eventWithoutDemand, classNames: ['demand', `demand-${demand}`] };

            calculateDeadline(newEvent);

            if (newEvent.start !== undefined && newEvent.start !== null) {
                eventsInCalendar.push(newEvent);
            } else if (event.deadline !== undefined) {
                externalEvents.push(newEvent);
            }
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
        const toEdit = Array.isArray(arg) ? arg : [arg]; //make an array
        let formatedEdit: EventObject[] = [];
        toEdit.forEach((event) => {
            let currentEvent: EventObject = fcEventToReactEvent(event);
            formatedEdit.push(currentEvent);
        });

        if (!flags.demandToggle) {
            setFlags((flags) => {
                return { ...flags, showAnimation: false };
            });
        }
        await editEventsInCalendar(formatedEdit, mode); //update and forcing refresh of component "FullCalendar"
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

    /*
    Created by the task pool
    */
    async function handleNewOrEditEvent(eventInWork: EventObject) {
        //if already existing
        console.log(eventInWork);
        if (eventInWork.id !== undefined) updateData(eventInWork, Mode.updating);
        //otherwise create new Task
        else {
            const currentExternalEvents = state.externalEvents;
            const id = await saveData([eventInWork]);
            eventInWork.id = id.value;
            currentExternalEvents.push(eventInWork);
            console.log(currentExternalEvents);

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

    async function openTaskMenu() {
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
                classNames: arg.event.classNames,
                duration: arg.event.extendedProps?.duration
            };
        } else if (arg.id) event = arg;
        else event = emptyEventObject;
        calculateDeadline(event);

        return event;
    }

    /*
       Content injection - add deadline information if necessary
    */
    function handleEventContent(arg: any) {
        let timeLeft;
        if (arg.event.extendedProps.deadline) {
            const endDateHours = new Date(arg.event.end).getTime();
            const deadlineHours = new Date(arg.event.extendedProps.deadline).getTime();
            timeLeft = deadlineHours - endDateHours;
            timeLeft = new Date(timeLeft).getHours();
        }

        if (arg.event.backgroundColor === colorPalettes.deadlineWarning) {
            const newDiv = document.createElement('div');
            const text = `${arg.event.title}:` + ' Deadline in ' + `${timeLeft}${timeLeft !== 1 ? 'hrs' : 'hr'}`;
            const newContent = document.createTextNode(text);
            newDiv.appendChild(newContent);
            newDiv.style.overflow = 'hidden';
            return {
                domNodes: [newDiv]
            };
        }
        if (arg.event.backgroundColor === colorPalettes.deadlineTooLate) {
            const newDiv = document.createElement('div');
            const text = `${arg.event.title}: ` + 'Passed Deadline';
            const newContent = document.createTextNode(text);
            newDiv.appendChild(newContent);
            newDiv.style.overflow = 'hidden';
            return {
                domNodes: [newDiv]
            };
        }
        return;
    }

    async function autoAssignTasks() {
        const assignedExternalEvents: EventObject[] = await window.api.getProposedPlan(state.externalEvents);
        updateData(assignedExternalEvents, Mode.dragAndDrop);
    }

    return (
        <>
            {isLoading || isUpdating ? (
                ''
            ) : (
                <div className="flex mr-5 mb-5 min-size">
                    <div style={{ position: 'fixed', zIndex: 10 }} className="ml-5">
                        <div>
                            <Button
                                color={'white'}
                                backgroundColor={'#1e2b3'}
                                disabled={false}
                                onClick={() => {
                                    openTaskMenu();
                                }}
                                className={'mt-20 ml-auto mr-auto'}
                            >
                                Add Task
                            </Button>
                            <Button
                                color={'white'}
                                backgroundColor={'#1e2b3'}
                                disabled={false}
                                onClick={() => {
                                    autoAssignTasks();
                                }}
                                className={'mt-20 ml-auto mr-auto'}
                            >
                                Auto-Assign Tasks
                            </Button>
                        </div>
                        <div className="flex flex-grow flex-col min-height max-height bg-slate-100 border-2 rounded-lg w-52 mt-2 h-1/2 relative p-2">
                            {state.externalEvents.map((event) => (
                                <ExternalEvent onClick={handleLeftclick} event={event} />
                            ))}
                        </div>
                    </div>
                    <div className="w-full flex justify-center">
                        <div className="flex pl-60 flex-col">
                            <div className="flex justify-end">
                                <p className="mr-2">Demanding Level</p>
                                <SwitchButton defaultMode={flags.demandToggle} onChange={toggleDemandOnOff} />
                            </div>
                            <div className="container-overview">
                                <div className=" bg-blue-50 box border-blue-100 border-2 rounded-lg drop-shadow-2xl">
                                    <FullCalendar
                                        ref={calendarRef}
                                        plugins={[timeGridPlugin, interactionPlugin]}
                                        initialView="timeGridWeek"
                                        allDaySlot={false}
                                        slotMinTime="0:00:00"
                                        slotMaxTime="23:59:59"
                                        nowIndicator={true}
                                        height="1600px"
                                        contentHeight="100px"
                                        expandRows={true}
                                        editable={true}
                                        droppable={true}
                                        forceEventDuration={false}
                                        events={state.events as EventSourceInput}
                                        eventContent={handleEventContent}
                                        eventDragStart={handleDragStart}
                                        eventDragStop={handleDragStop}
                                        eventDrop={handleDrop}
                                        eventReceive={handleEventReceive}
                                        eventLeave={handleExternalEventLeave}
                                        eventClick={handleLeftclick}
                                        snapDuration={'00:15:00'}
                                        businessHours={{
                                            daysOfWeek: [1, 2, 3, 4, 5],
                                            startTime: '08:00',
                                            endTime: '18:00'
                                        }}
                                        firstDay={1} //Monday
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
                                            onDeadline={calculateDeadline}
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
                </div>
            )}
        </>
    );
};

export default OverviewPage;
