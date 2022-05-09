import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SwitchButton from '../../views/partials/switchButton';
import ExternalEvent, { retrieveDemandLevel } from './partials/ExternalEvent';
import VerticalGraph from './partials/verticalGraphs';
import { Button } from '../../views/partials/Button';
import TaskForm from './partials/TaskForm';
import moment from 'moment';
import AIpopup from './partials/AIpopup';
import LockScreen from './partials/LockScreen';

import Tooltip from '@mui/material/Tooltip';

import ContextMenu from '../../views/partials/ContextMenu';

export interface IOverviewPageProps {
    lockStatus: boolean;
    reloadPage: any;
}

export enum colorPalettes {
    deadlineWarning = '#F56853',
    deadlineTooLate = '#DE4047',
    calendarBlue = '#3788d8',
    greenButton = '#00B36B',
    redButton = '#F56853'
}

//db has its own enum :/ TODO
export enum logOptions {
    isLocked = 'isLocked',
    lookedAtStats = 'lookedAtStats',
    usedDemandToggle = 'usedDemandToggle',
    amountEventsDidNotGetAssignedAuto = 'amountEventsDidNotGetAssignedAuto'
}
type aiPopupContent = { message: string; data: number | undefined; hasCancelButton: boolean; hasOkayButton: boolean; hasContinueButton: boolean };

interface State {
    externalEvents: EventObject[];
    events: EventObject[];
}
export enum Mode {
    updating = 'updating',
    deleting = 'deleting',
    dragAndDrop = 'dragAndDrop',
    assigning = 'assigning',
    movingBackToPool = 'movingBackToPool'
}

const OverviewPage: React.FunctionComponent<IOverviewPageProps> = (props) => {
    const calendarRef = useRef<any>();
    const [autoAIislocked, setAutoAIislocked] = useState(true);
    const [aiPopup, setAiPopup] = useState<aiPopupContent>({
        message: '',
        data: undefined,
        hasCancelButton: false,
        hasOkayButton: true,
        hasContinueButton: false
    });

    const [isLoading, setIsLoading] = useState(true);

    const [displayTaskForm, setDisplayTaskForm] = useState(false);
    const [displayAutoAI, setDisplayAutoAI] = useState(false);
    const [displayUnlock, setDisplayUnlock] = useState(false);
    const [flags, setFlags] = useState({
        showAnimation: true,
        demandToggle: true,
        showGraphs: true,
        justSwitched: false
    });
    const [sourceAPI, setSourceAPI] = useState<any>(undefined);
    const [currentEvent, setCurrentEvent] = useState<EventObject>(emptyEventObject);
    const [state, setState] = useState<State>({
        externalEvents: [],
        events: []
    });

    useEffect(() => {
        if (sourceAPI === undefined && calendarRef.current !== undefined) {
            const calendarApi = calendarRef.current.getApi();
            const id = calendarApi.addEventSource(state.events);
            setSourceAPI(id);
        } else if (sourceAPI !== undefined) {
            if (!props.lockStatus) handlingResizeOfEvents(flags.demandToggle, flags.showGraphs);
        }
    });

    useEffect(() => {
        /*
        async function checkIfLocked() {
            if (isLocked) {
                const isLocked = await window.api.retrieveLockStatus(logOptions.isLocked);
                if (isLocked.data === 'false') setIsLocked(false);
            }
        }*/

        async function getData() {
            const events = await window.api.getAllEvents();
            setIsLoading(!isLoading);
            sortData(events);
            document.getElementById('scroll-box')!.scrollTop = 506;
        }
        //if (isLocked) checkIfLocked();

        if (isLoading) {
            getData();
        }
    });

    useEffect(() => {
        async function fetch() {
            if (sourceAPI !== undefined) {
                await sourceAPI.refetch();
                if (!props.lockStatus) handlingResizeOfEvents(flags.demandToggle, flags.showGraphs);
                console.log('fetching');
            }
        }
        fetch();
    }, [state]);

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
                    if (mode === Mode.updating) {
                        eventsInCalendar.splice(index, 1);
                        eventsInCalendar.push(event);
                    } else eventsInCalendar.splice(eventsInCalendar.indexOf(eventCalendar), 1);
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
            if (mode === Mode.movingBackToPool) externalEvents.push(event);
        }
        if (mode === Mode.deleting) window.api.deleteEvents(toEdit);
        else window.api.updateEvents(toEdit);

        setState(() => {
            return {
                events: eventsInCalendar,
                externalEvents: externalEvents
            };
        });
    }
    async function calculateDeadline(eventObject: EventObject) {
        const sameDay = 23 * 60 * 60 * 1000;
        let toCompare;

        //Event is in external pool - thus has no date yet - compare deadline with today
        if ((eventObject?.end === undefined || eventObject.end === null) && eventObject?.deadline !== undefined && eventObject.deadline !== null) {
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

    async function sortData(events: EventObject[], alertIfExternalEvents = false) {
        const eventsInCalendar: EventObject[] = state.events;
        const externalEvents: EventObject[] = [];

        //const isLocked = (await window.api.retrieveLockStatus(logOptions.isLocked).data) !== 'false' ? true : false;

        emptyArray(eventsInCalendar);
        events.forEach((event) => {
            const { demand, ...eventWithoutDemand } = event;
            const newEvent = { ...eventWithoutDemand, classNames: ['demand', `demand-${demand}`, props.lockStatus ? 'full-width' : '', 'demand-no-animation'], duration: event.durationTime };

            calculateDeadline(newEvent);

            if (newEvent.start !== undefined && newEvent.start !== null) {
                eventsInCalendar.push(newEvent);
            } else if (event.deadline !== undefined) {
                externalEvents.push(newEvent);
            }
        });
        if (eventsInCalendar.length !== 0 || externalEvents.length !== 0) {
            setState(() => {
                return {
                    events: eventsInCalendar,
                    externalEvents: externalEvents
                };
            });
        }

        if (alertIfExternalEvents) {
            alertIfNotAllTasksWereAssigned(externalEvents.length);
            await window.api.updateLogs([{ information: logOptions.amountEventsDidNotGetAssignedAuto, data: externalEvents.length }]);
        }

        return eventsInCalendar;
    }

    /*
     * empties array but keeps the original reference
     */
    function emptyArray(array: any[]) {
        while (array.length !== 0) {
            array.pop();
        }
    }

    async function updateData(arg: any, mode: Mode) {
        const toEdit = Array.isArray(arg) ? arg : [arg]; //make an array
        let formatedEdit: EventObject[] = [];
        toEdit.forEach((event) => {
            let currentEvent: EventObject = fcEventToReactEvent(event, mode);
            formatedEdit.push(currentEvent);
        });

        await editEventsInCalendar(formatedEdit, mode); //update and forcing refresh of component "FullCalendar"
    }

    function handlingResizeOfEvents(demandToggle: boolean, showGraphs: boolean, vip: boolean = false) {
        const demand = document.querySelectorAll('.demand');

        demand.forEach((el) => {
            if (!demandToggle && !showGraphs) {
                // Case 1: when toggle has been turned Off
                if (!el.classList.contains('full-width')) {
                    el.classList.add('full-width');
                }
                if (el.classList.contains('demand-no-animation') && vip) el.classList.remove('demand-no-animation');
                // Case 2: when Event is beeing dragged
            } else if (!demandToggle && showGraphs && !props.lockStatus) {
                if (el.classList.contains('full-width')) {
                    el.classList.remove('full-width');
                    if (!el.classList.contains('demand-no-animation')) el.classList.add('demand-no-animation');
                }
                // Case 3: when toggle is turned on or dragging stopped
            } else if (!props.lockStatus) {
                if (el.classList.contains('full-width')) {
                    el.classList.remove('full-width');
                    if (el.classList.contains('demand-no-animation') && vip) el.classList.remove('demand-no-animation');
                }
            }
        });

        /*
        setFlags((flags) => {
            return {
                ...flags,
                justSwitched: false
            };
        });*/
    }

    /*
    When Task is dropped from task pool into the calendar
     */
    function handleEventReceive(eventInfo: any) {
        eventInfo.revert();
        updateData(eventInfo, Mode.dragAndDrop);
    }

    function toggleDemandOnOff() {
        window.api.updateLogs([{ information: logOptions.usedDemandToggle, data: 1 }]);
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
                showAnimation: currentShowAnimation,
                justSwitched: true
            };
        });
        handlingResizeOfEvents(currentDemandToggle, currentShowGraphs, true);
    }

    function handleDragStart(args: any) {
        handlingResizeOfEvents(false, true);
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
        handlingResizeOfEvents(flags.demandToggle, false);
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
    async function handleNewOrEditEvent(eventInWork: EventObject, mode?: Mode) {
        //if already existing
        if (eventInWork.id !== undefined) updateData(eventInWork, mode !== undefined ? mode : Mode.updating);
        //otherwise create new Task
        else {
            const currentExternalEvents = state.externalEvents;
            const id = await saveData([eventInWork]);
            eventInWork.id = id.value;
            /*if (!flags.demandToggle) eventInWork.classNames.push('full-width');
            eventInWork.classNames.push('demand-no-animation');*/
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

    async function openTaskMenu() {
        document!.getElementById('overlay')!.style.display = 'block';
        //noScroll(true);
        setDisplayTaskForm(!displayTaskForm);
    }

    function fcEventToReactEvent(arg: any, mode?: Mode): EventObject {
        let event;
        if (arg.event !== undefined) {
            const dur = arg.event.endStr !== null && arg.event.endStr !== undefined ? timeDifference(arg.event.startStr, arg.event.endStr) : arg.event.extendedProps.durationTime;

            event = {
                id: parseInt(arg.event.id),
                title: arg.event.title,
                deadline: arg.event.extendedProps.deadline,
                start: mode !== undefined && mode === Mode.movingBackToPool ? undefined : arg.event.startStr,
                end:
                    arg.event.endStr !== null && arg.event.endStr !== undefined
                        ? mode !== undefined && mode === Mode.movingBackToPool
                            ? undefined
                            : arg.event.endStr
                        : calculateEndDate(arg.event.extendedProps.durationTime, arg.event.startStr),
                classNames: props.lockStatus ? [...arg.event.classNames, 'full-width'] : arg.event.classNames,
                durationTime: dur,
                duration: dur
            };
        } else if (arg.id) {
            if (mode === Mode.movingBackToPool) {
                event = { ...arg, start: undefined, end: undefined };
            } else event = arg;
        } else event = emptyEventObject;

        calculateDeadline(event);

        return event;
    }
    const timeDifference = (start: string, end: string) => {
        const [startHour, startMinute] = new Date(start).toLocaleTimeString('en-de', { hour: '2-digit', minute: '2-digit' }).split(':');
        const [endHour, endMinute] = new Date(end).toLocaleTimeString('en-de', { hour: '2-digit', minute: '2-digit' }).split(':');

        const difHour = (parseInt(endHour) - parseInt(startHour)) * 60; //in minutes
        const difMinute = parseInt(endMinute) - parseInt(startMinute);
        const result = (difHour + difMinute) / 60;
        const format = difMinute === 0 ? formatNumber(result) : formatNumber(Math.floor(result), (parseFloat(`0.${result.toString().split('.')[1]}`) * 60).toString());

        return format;
    };

    const formatNumber = (hour: number, minute: string = '00') => {
        return hour >= 10 ? `${hour}:${minute}` : `0${hour}:${minute}`;
    };

    function calculateEndDate(duration: string, startDate: string) {
        const startDateMilliseconds = new Date(startDate).getTime();
        const [hours, minutes] = duration.split(':');
        const durationMilliseconds = parseInt(hours) * 60 * 60 * 1000 + parseInt(minutes) * 60 * 1000;
        return new Date(startDateMilliseconds + durationMilliseconds).toISOString();
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

        /*
        if (arg.event.extendedProps.durationTime > 2) {
            const newButton = document.createElement('button');
            const text = `Press`;
            const newContent = document.createTextNode(text);
            newButton.appendChild(newContent);
            newButton.style.overflow = 'hidden';
            return {
                domNodes: [newButton]
            };
        }*/

        if (arg.event.backgroundColor === colorPalettes.deadlineWarning) {
            const newDiv = document.createElement('div');
            const text = `${arg.event.title}:` + ' Deadline in ' + `${timeLeft === 0 ? 24 : timeLeft}${timeLeft !== 1 ? 'hrs' : 'hr'}`;
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
    function getWeek() {
        const today = new Date();
        const d = today.getDay(); //get the current day
        const weekStart = today; //rewind to start day
        const weekStartMidnight = new Date(moment().hours(0).minutes(0).seconds(0).milliseconds(0).toISOString());
        const weekEnd = new Date(weekStartMidnight.getTime() + (7 - d) * 86400000 + 23 * 60 * 60 * 1000 + 59 * 60 * 1000); //add 6 days 23 hrs and 59 minutes
        return [weekStart, weekEnd];
    }

    function areEventsInCalendarEffected() {
        const [weekStart, weekEnd] = getWeek();

        for (let event of state.events) {
            if (new Date(event.start as string).getTime() > weekStart.getTime() && new Date(event.end as string).getTime() <= weekEnd.getTime()) {
                return true;
            }
        }
        return false;
    }

    async function autoAssignTasks(includeEventsInCalendar: boolean = false) {
        let externalEvents = [...state.externalEvents];
        let ifEventsInCalendarPermission = false;

        //warning
        if (areEventsInCalendarEffected()) {
            if (includeEventsInCalendar) {
                ifEventsInCalendarPermission = areEventsInCalendarEffected();
            } else {
                const popup = aiPopup;
                popup.message = 'There are Tasks already scheduled in the current calendar week. This action will replan these Tasks. Are you sure you want to continue?';
                popup.hasCancelButton = true;
                popup.hasContinueButton = true;
                popup.hasOkayButton = false;
                displayAIpopup(popup);
                return;
            }
        }
        const assignedExternalEvents: EventObject[] = await window.api.getProposedPlan(ifEventsInCalendarPermission);

        /*
        assignedExternalEvents.forEach((event) => {
            if (event.start !== undefined && event.start !== null) {
                actuallyToUpdate.push(event);
            }
        });*/
        sortData(assignedExternalEvents, true);
    }
    function alertIfNotAllTasksWereAssigned(amountOfExternalEvents: number) {
        if (amountOfExternalEvents > 0) {
            const aipopup: aiPopupContent = aiPopup;
            const text = amountOfExternalEvents > 1 ? `${amountOfExternalEvents} tasks` : `${amountOfExternalEvents} task`;
            aipopup.message = [`Did not find appropriate slot for `, `${text}`] as any;
            aipopup.hasOkayButton = true;
            aipopup.hasCancelButton = false;
            aipopup.hasContinueButton = false;

            displayAIpopup(aipopup);
        }
    }

    function displayAIpopup(content: aiPopupContent) {
        setAiPopup(content);
        document!.getElementById('overlay')!.style.display = 'block';
        //noScroll(true);

        setDisplayAutoAI(true);
    }
    function handleDisplayUnlock() {
        document!.getElementById('overlay')!.style.display = 'block';
        //noScroll(true);
        setDisplayUnlock(true);
    }

    function unlockAI(unlock: boolean) {
        if (unlock && autoAIislocked) {
            setAutoAIislocked(!autoAIislocked);
        } else if (!unlock && !autoAIislocked) {
            setAutoAIislocked(!autoAIislocked);
        }
    }

    function returnAIpopup() {
        return (
            <AIpopup
                message={aiPopup.message}
                hasCancelButton={aiPopup.hasCancelButton}
                hasOkayButton={aiPopup.hasContinueButton}
                hasContinueButton={aiPopup.hasContinueButton}
                autoAssignTasks={autoAssignTasks}
                className="mt-10 ml-14"
                noScroll={noScroll}
                display={() => {
                    document!.getElementById('overlay')!.style.display = 'none';
                    setDisplayAutoAI(false);
                }}
                data={state.externalEvents.length}
            />
        );
    }

    function handleEventResize(args: any) {
        updateData(args, Mode.updating);
    }

    async function handleUnlockApp() {
        await window.api.updateLogs([{ information: logOptions.isLocked, data: 'false' }]);
        props.reloadPage(true);
    }
    function noScroll(addProperty: boolean) {
        const root = document.querySelector('body');
        if (addProperty) root!.style.overflow = 'hidden';
        else {
            root!.style.overflow = 'scroll';
        }
    }

    function handleMouseHover(arg: any) {
        const parent = arg.el.parentNode;
        const demand = retrieveDemandLevel(arg.event);
        const hour = parseInt(arg.event.extendedProps.durationTime.split(':')[0]);
        function showButtons(e: any) {
            if (parent.childNodes.length === 1) {
                const div = document.createElement('div');
                div.className = 'injected-container';
                div.style.display = 'block';
                const width = div.classList.contains('full-width') || props.lockStatus ? 123 : arg.el.offsetWidth;
                div.style.marginLeft = (demand as number) <= 6 ? `${width + 5}px` : '128px';

                //minus Button
                let minusButton = document.createElement('button');
                minusButton.className = 'injected-buttons';
                const img = document.createElement('img');
                img.style.width = '100%';
                img.style.height = '100%';
                minusButton.appendChild(img).src = `${process.env.PUBLIC_URL + '/someIcons/minus.png'}`;

                minusButton.onclick = function (e) {
                    e.stopPropagation();
                    updateData(arg, Mode.movingBackToPool);
                };

                //trash Button
                let deleteButton = document.createElement('button');
                deleteButton.className = 'injected-buttons';
                const deleteImg = document.createElement('img');
                img.style.width = '100%';
                img.style.height = '100%';
                deleteButton.appendChild(deleteImg).src = `${process.env.PUBLIC_URL + '/someIcons/trash.png'}`;

                deleteButton.onclick = function (e) {
                    e.stopPropagation();
                    updateData(arg, Mode.deleting);
                };
                div.appendChild(minusButton);
                div.appendChild(deleteButton);

                parent.appendChild(div);
            }
            if (parent.childNodes.length === 2) {
                const button = parent.childNodes[1];
                const width = !flags.demandToggle ? 123 : arg.el.offsetWidth;
                button.style.marginLeft = (demand as number) <= 6 && !props.lockStatus ? `${width + 5}px` : '128px';
                button.style.display = 'block';
            }
            //parent.setPointerCapture(e.pointerId);
        }
        function disableButtons(event: any) {
            const size = parent.getBoundingClientRect();

            if (parent.childNodes.length === 2) {
                const button = parent.childNodes[1];
                if (event.clientX < size.left || event.clientX > size.right || event.clientY < size.top || event.clientY > size.bottom) {
                    button.style.display = 'none';
                }
            }
            //parent.releasePointerCapture(event.pointerId);
        }
        if (hour >= 1) {
            parent.onmouseenter = showButtons;
            parent.onmouseleave = disableButtons;
        }
    }

    return (
        <>
            {isLoading ? (
                ''
            ) : (
                <>
                    <div className="flex ml-5 mr-5  w-full min-size h-full">
                        <div id="pool" style={{ minWidth: '165px', maxWidth: '20%' }} className="mr-3 w-full pool">
                            <div className="flex gap-x-2 w-full">
                                <Button
                                    color={'white'}
                                    backgroundColor={'#1e2b3'}
                                    disabled={false}
                                    onClick={() => {
                                        openTaskMenu();
                                    }}
                                    className={''}
                                >
                                    Add Task
                                </Button>
                                {props.lockStatus ? (
                                    ''
                                ) : (
                                    <Button
                                        color={'white'}
                                        backgroundColor={'#46719C'}
                                        disabled={autoAIislocked || state.externalEvents.length === 0}
                                        onClick={() => {
                                            autoAssignTasks();
                                        }}
                                        className={''}
                                    >
                                        Auto-Assign Tasks
                                    </Button>
                                )}
                            </div>
                            <div className="flex flex-grow flex-col gap-y-1 mt-4 overflow-auto bg-slate-100 border-2 rounded-lg h-full w-full">
                                {state.externalEvents.map((event) => (
                                    <ExternalEvent
                                        onClick={handleLeftclick}
                                        onMousePress={(pressStatus: boolean) => {
                                            if (!flags.demandToggle) {
                                                setFlags((flags) => {
                                                    return {
                                                        ...flags,
                                                        showGraphs: pressStatus
                                                    };
                                                });
                                            }
                                        }}
                                        event={event}
                                    />
                                ))}
                            </div>
                        </div>
                        <div id="cal" style={{ minWidth: '1200px', maxWidth: '60%' }} className="w-full ">
                            <div className="flex flex-col container-overview">
                                <div id="scroll-box" className=" h-full overflow-auto mb-5 bg-blue-50 border-2 rounded-lg drop-shadow-2xl border-blue-100">
                                    <div style={{ height: '1600px' }} className="  box ">
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
                                            eventContent={handleEventContent}
                                            eventDragStart={handleDragStart}
                                            eventDragStop={handleDragStop}
                                            eventDrop={handleDrop}
                                            eventReceive={handleEventReceive}
                                            eventLeave={handleExternalEventLeave}
                                            eventResize={handleEventResize}
                                            eventClick={handleLeftclick}
                                            eventMouseEnter={handleMouseHover}
                                            snapDuration={'00:15:00'}
                                            businessHours={{
                                                daysOfWeek: [1, 2, 3, 4, 5],
                                                startTime: '08:00',
                                                endTime: '18:00'
                                            }}
                                            firstDay={1} //Monday
                                            stickyHeaderDates={true}
                                        />
                                    </div>
                                    {flags.showGraphs && !props.lockStatus ? <VerticalGraph unlockAIbutton={unlockAI} showAnimation={flags.showAnimation} className="box z-20" /> : ''}
                                </div>
                            </div>
                        </div>
                        <div id="settings" style={{ minWidth: '100px', maxWidth: '20%' }} className="flex w-full ml-2 ">
                            <div className=" flex flex-col">
                                {props.lockStatus ? (
                                    ''
                                ) : (
                                    <>
                                        <div className="flex w-full settin:flex-row flex-col">
                                            <>
                                                <div id="switch" className="">
                                                    <SwitchButton defaultMode={flags.demandToggle} onChange={toggleDemandOnOff} />
                                                </div>{' '}
                                            </>

                                            <div className="flex">
                                                <img style={{ width: '20px', height: '20px' }} className="mt-1" src={process.env.PUBLIC_URL + '/someIcons/energy.png'} />
                                                <p className="mt-1">show energy pattern</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                                <ContextMenu setDisplayUnlock={handleDisplayUnlock} />
                            </div>
                        </div>
                    </div>
                    <div
                        id="overlay"
                        onClick={(event: any) => {
                            if (event.target.id === 'overlay') {
                                document!.getElementById('overlay')!.style.display = 'none';
                                if (displayTaskForm) setDisplayTaskForm(false);
                                else if (displayAutoAI) setDisplayAutoAI(false);
                                else if (displayUnlock) setDisplayUnlock(false);
                            }
                        }}
                        className=""
                    >
                        {displayTaskForm ? (
                            <TaskForm
                                lockStatus={props.lockStatus}
                                className="mt-10 ml-14"
                                onChange={handleNewOrEditEvent}
                                display={() => {
                                    document!.getElementById('overlay')!.style.display = 'none';
                                    setDisplayTaskForm(!displayTaskForm);
                                }}
                                noScroll={noScroll}
                                onDeadline={calculateDeadline}
                                data={currentEvent}
                                onDelete={editEventsInCalendar}
                                callback={setCurrentEvent}
                            />
                        ) : displayAutoAI ? (
                            returnAIpopup()
                        ) : (
                            ''
                        )}
                        {displayUnlock ? (
                            <LockScreen
                                noScroll={noScroll}
                                display={() => {
                                    const el = document!.getElementById('overlay');
                                    if (el) el.style.display = 'none';

                                    setDisplayUnlock(false);
                                }}
                                unLockApp={handleUnlockApp}
                                lockStatus={props.lockStatus}
                            />
                        ) : (
                            ''
                        )}
                    </div>
                </>
            )}
        </>
    );
};

export default OverviewPage;
