import React, { useEffect, useState } from 'react';
import { Button } from '../../../views/partials/Button';
import SwitchButton from '../../../views/partials/switchButton';
import { Mode } from '../OverviewPage';
import RangeSlider from '../../../views/partials/RangeSlider';
import TimeSelector from '../../../views/partials/TimeSelector';

export interface ITaskFormProps {
    className?: string;
    value?: any;
    onFocus?: any;
    name?: any;
    display: any;
    onChange: any;
    data: EventObject;
    onDelete: any;
    callback: any;
}
const STANDARD_DURATION = '02:00';
const STANDARD_DEMAND = 5;
const TaskForm: React.FunctionComponent<ITaskFormProps> = (props) => {
    //to display duration
    const timeDifference = () => {
        const startHour = parseInt(props.data.start!.charAt(11) + props.data.start!.charAt(12));
        const startMinute = parseInt(props.data.start!.charAt(14) + props.data.start!.charAt(15));
        const endHour = parseInt(props.data.end!.charAt(11) + props.data.end!.charAt(12));
        const endMinute = parseInt(props.data.end!.charAt(14) + props.data.end!.charAt(15));
        const difHour = (endHour - startHour) * 60; //in minutes
        const difMinute = endMinute - startMinute;
        const result = (difHour + difMinute) / 60;
        const format = difMinute === 0 ? formatNumber(result) : formatNumber(Math.floor(result), (parseInt(result.toString().split('.')[1]) * 60).toString());

        return format;
    };

    const formatNumber = (hour: number, minute: string = '00') => {
        return hour >= 10 ? `${hour}:${minute}` : `0${hour}:${minute}`;
    };

    const showDeadlineOrNot = props.data.deadline ? true : false;
    const [deadlineToggle, setDeadlineToggle] = useState(showDeadlineOrNot);
    const defaultDemand = props.data.classNames.length !== 0 ? parseInt(props.data.classNames[1].slice(-1)) : STANDARD_DEMAND;
    const [externalEvent, setExternalEvent] = useState({
        id: props.data.id ? props.data.id : undefined,
        title: props.data.title.length !== 0 ? props.data.title : '',
        backgroundColor: '#74AAEB',
        textColor: 'white',
        classNames: props.data.classNames.length !== 0 ? props.data.classNames : ['demand', `demand-${STANDARD_DEMAND}`],
        deadline: props.data.deadline ? props.data.deadline : undefined,
        start: props.data.start ? props.data.start : undefined,
        end: props.data.end ? props.data.end : undefined,
        duration: props.data.start ? timeDifference() : props.data.duration ? props.data.duration : STANDARD_DURATION
    });
    const today = new Date();

    useEffect(() => {});

    const handleExternalEvent = (key: string, value: any) => {
        setExternalEvent({ ...externalEvent, [key]: value });
    };

    const handleChangeToggle = () => {
        if (deadlineToggle) handleExternalEvent('deadline', undefined);
        setDeadlineToggle(!deadlineToggle);
    };

    const handleConfirmation = () => {
        if (props.data.id) props.callback(emptyEventObject);
        props.onChange(externalEvent);
        props.display();
    };

    const handleCancle = () => {
        if (props.data.id) props.callback(emptyEventObject);
        props.display();
    };

    const closeAndDelete = () => {
        const event: EventObject = props.data;
        props.onDelete(event, Mode.deleting); //delete
        props.callback(emptyEventObject);
        props.display(); // close popup
    };
    function updateClassList(demand: any) {
        const currentClassNames = [...externalEvent.classNames];
        let arrayChanged: boolean = false;

        for (let index = 0; index < currentClassNames.length; index++) {
            if (currentClassNames[index].includes('demand-')) {
                currentClassNames[index] = currentClassNames[index].slice(0, -1) + demand;
                arrayChanged = true;
                break;
            }
        }
        if (!arrayChanged) currentClassNames.push(`demand-${demand}`);
        setExternalEvent((state) => {
            return {
                ...state,
                classNames: currentClassNames
            };
        });
    }

    return (
        <>
            <div id="popup" className={'card flex flex-col p-5 w-3/4 h-3/4 relative z-30' + ' ' + props.className}>
                <div className="flex justify-center">
                    <h1 className="font-bold text-3xl mb-2">{props.data.id ? 'Edit Task' : 'Create Task'}</h1>
                </div>
                <input
                    className={'block ml-10 mr-10'}
                    placeholder={'Task Name'}
                    type={'text'}
                    onChange={(e) => {
                        handleExternalEvent('title', e.target.value);
                    }}
                    value={externalEvent.title}
                ></input>

                <div className="ml-10 mt-4 mr-10">
                    <p>How demanding will this task be?</p>
                    <RangeSlider textColorWhite={false} standardDemand={defaultDemand} onChange={updateClassList} />
                </div>
                <div className="flex mt-4 ml-10 gap-x-4">
                    <div className="flex flex-col">
                        <p>Duration (h/m)</p>
                        <TimeSelector className="flex justify-center" startTime={props.data.start} duration={externalEvent.duration} onChange={handleExternalEvent} />
                    </div>
                    <div className="">
                        <p>Deadline?</p>
                        <SwitchButton onChange={handleChangeToggle} defaultMode={showDeadlineOrNot} />
                    </div>
                    <div className="mt-2">
                        {deadlineToggle ? (
                            <input
                                className={'block w-full'}
                                placeholder={`${today}`}
                                type={'datetime-local'}
                                onFocus={props.onFocus}
                                onChange={(e) => {
                                    handleExternalEvent('deadline', e.target.value);
                                }}
                                min={`${today}`}
                                value={externalEvent.deadline}
                            ></input>
                        ) : (
                            ''
                        )}
                    </div>
                </div>
                <Button
                    backgroundColor="#00B36B"
                    disabled={externalEvent.title.length == 0 || (deadlineToggle && externalEvent.deadline == undefined)}
                    onClick={handleConfirmation}
                    className={'w-1/6 block mr-auto ml-auto'}
                >
                    <div className="flex justify-center">
                        {<img className="w-4 h-4" src={process.env.PUBLIC_URL + '/someIcons/save.png'} />}
                        Save
                    </div>
                </Button>

                <div className="mt-auto flex gap-x-80">
                    {props.data.id ? (
                        <Button disabled={false} onClick={closeAndDelete} backgroundColor={'#F56853'} className={'mr-auto mt-auto'}>
                            <div className="flex">
                                {<img className="w-4 h-4" src={process.env.PUBLIC_URL + '/someIcons/trash.png'} />}
                                Delete
                            </div>
                        </Button>
                    ) : (
                        ''
                    )}

                    <Button disabled={false} onClick={handleCancle} className={'ml-auto mt-auto'}>
                        Cancel
                    </Button>
                </div>
            </div>
        </>
    );
};

export default TaskForm;
