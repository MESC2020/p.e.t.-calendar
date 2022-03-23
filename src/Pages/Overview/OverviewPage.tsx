import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SwitchButton from '../../views/partials/switchButton';
import ExternalEvent from './partials/ExternalEvent';
export interface IOverviewPageProps {}

const OverviewPage: React.FunctionComponent<IOverviewPageProps> = (props) => {
    const calendarRef = useRef<any>();
    const [showDemandLevel, setShowDemandLevel] = useState(false);
    const [firstTime, setFirstTime] = useState(true);
    const [state, setState] = useState({
        weekendsVisible: true,
        externalEvents: [
            { title: 'Task 1', color: '#74AAEB', textColor: 'white', id: 'd', demanding: 3 },
            { title: 'Task 2', color: '#E7EDFB', textColor: 'black', id: 'e', demanding: 5 },
            { title: 'Task 3', color: '#E7EDFB', textColor: 'black', id: 'f', demanding: 1 },
            { title: 'Task 4', color: '#74AAEB', textColor: 'white', id: 'g', demanding: 7 }
        ],
        events: [
            {
                id: 'a',
                title: 'This is just an example',
                start: '2022-03-21T12:30:00',
                end: '2022-03-21T16:30:00',
                backgroundColor: '#74AAEB',
                textColor: 'white',
                demanding: 5
            },
            {
                id: 'b',
                title: 'This is another example',
                start: '2022-03-24T08:00:00',
                end: '2022-03-24T11:30:00',
                demanding: 5
            },
            {
                id: 'c',
                title: 'I wonder if you can have line seperator:\n Did this work? ',
                start: '2022-03-25T14:00:00',
                end: '2022-03-25T16:00:00',
                backgroundColor: '#E7EDFB',
                textColor: 'black',
                demanding: 5
            }
        ]
    });

    const handleEventReceive = (eventInfo: any) => {
        const newEvent = {
            id: eventInfo.event.id,
            title: eventInfo.event.title,
            start: eventInfo.event.start,
            end: eventInfo.event.end,
            backgroundColor: eventInfo.event.backgroundColor,
            textColor: eventInfo.event.textColor,
            demanding: eventInfo.event.extendedProps.demanding
        };

        setState((state) => {
            return {
                ...state,
                events: state.events.concat(newEvent)
            };
        });
        manageAPI();
    };

    const toggleDemandOnOff = () => {
        if (firstTime) setFirstTime(false);
        let newValue;
        if (showDemandLevel) newValue = false;
        else newValue = true;
        setShowDemandLevel(newValue);
    };
    function handleEventChange(eventInfo: any) {}

    function eventChangeWidth(arg: any) {
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
    const manageAPI = () => {
        if (calendarRef.current != null) {
            let calendarApi = calendarRef.current.getApi();
            console.log(calendarApi.getEvents());
        }
    };

    return (
        <>
            <div className="flex flex-col">
                <div className="flex justify-end">
                    <p className="mr-2">Demanding Level</p>
                    <SwitchButton onChange={toggleDemandOnOff} />
                </div>
                <div style={{ height: 800, width: 1200 }}>
                    <div className="bg-blue-50 border-blue-100 border-2 rounded-lg drop-shadow-2xl">
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
                            events={state.events}
                            editable={true}
                            eventClassNames={eventChangeWidth}
                            droppable={true}
                            eventReceive={handleEventReceive}
                            forceEventDuration={true}
                            eventDrop={handleEventChange}
                        />
                    </div>
                    <div className="mt-5 bg-green-50 border-2 rounded-lg w-full h-auto p-2">
                        {state.externalEvents.map((event) => (
                            <ExternalEvent key={event.id} event={event} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default OverviewPage;
