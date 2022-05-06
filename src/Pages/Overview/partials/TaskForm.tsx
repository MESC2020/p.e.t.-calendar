import React, { useEffect, useState } from 'react';
import { Button } from '../../../views/partials/Button';
import SwitchButton from '../../../views/partials/switchButton';
import { colorPalettes, Mode } from '../OverviewPage';
import RangeSlider from '../../../views/partials/RangeSlider';
import TimeSelector from '../../../views/partials/TimeSelector';
import moment from 'moment';
import { State } from 'history';

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
    onDeadline: any;
    noScroll: any;
}
const STANDARD_DURATION = '02:00';
const STANDARD_DEMAND = 5;
const TaskForm: React.FunctionComponent<ITaskFormProps> = (props) => {
    //to display duration

    const showDeadlineOrNot = props.data.deadline ? true : false;
    const [deadlineToggle, setDeadlineToggle] = useState(showDeadlineOrNot);
    const defaultDemand = props.data.classNames.length !== 0 ? parseInt(props.data.classNames[1].slice(-1)) : STANDARD_DEMAND;
    const [externalEvent, setExternalEvent] = useState({
        id: props.data.id ? props.data.id : undefined,
        title: props.data.title.length !== 0 ? props.data.title : '',
        backgroundColor: props.data.backgroundColor ? props.data.backgroundColor : colorPalettes.calendarBlue,
        textColor: 'white',
        classNames: props.data.classNames.length !== 0 ? props.data.classNames : ['demand', `demand-${STANDARD_DEMAND}`],
        deadline: props.data.deadline ? props.data.deadline : undefined,
        start: props.data.start ? props.data.start : undefined,
        end: props.data.end ? props.data.end : undefined,
        durationTime: props.data.durationTime ? props.data.durationTime : STANDARD_DURATION,
        duration: STANDARD_DURATION //durationTime is for DB and duration is for fc (can't access duration later, because it's a hidden property of fc)
    });
    const today = moment().minutes(0).seconds(0).milliseconds(0).toISOString().replace(':00.000Z', '');
    const placeholder = moment().add(1, 'days').minutes(0).seconds(0).milliseconds(0).toISOString().replace(':00.000Z', '');

    useEffect(() => {});

    const handleExternalEvent = async (key: string, value: any) => {
        setExternalEvent({ ...externalEvent, [key]: value });
    };

    const handleChangeToggle = () => {
        //turn off toggle
        if (deadlineToggle) {
            handleExternalEvent('deadline', undefined);
        }

        setDeadlineToggle(!deadlineToggle);
    };

    const handleConfirmation = () => {
        const copyEvent = { ...externalEvent };
        props.onDeadline(copyEvent);
        if (props.data.id) props.callback(emptyEventObject);
        props.noScroll(false);

        props.onChange(copyEvent);
        props.display();
    };

    const handleCancle = () => {
        if (props.data.id) props.callback(emptyEventObject);
        props.noScroll(false);
        props.display();
    };

    const closeAndDelete = () => {
        const event: EventObject = props.data;
        props.onDelete(event, Mode.deleting); //delete
        props.noScroll(false);
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

    function updateDurationAndEndDate(durationTime: string, endDate?: string) {
        const newContent =
            endDate !== undefined
                ? {
                      durationTime: durationTime,
                      duration: durationTime,
                      end: endDate
                  }
                : {
                      durationTime: durationTime,
                      duration: durationTime
                  };
        setExternalEvent((state) => {
            return {
                ...state,
                ...newContent
            };
        });
    }

    function handleKeyDown(event: any) {
        const isNotFull = checkIfFormFull();
        if (event.key === 'Enter' && !isNotFull) {
            handleConfirmation();
        } else if (event.key === 'Escape') {
            handleCancle();
        }
    }

    function checkIfFormFull() {
        const isNotFull = externalEvent.title.length === 0 || (deadlineToggle && externalEvent.deadline === undefined);
        return isNotFull;
    }

    return (
        <>
            <div onKeyDown={handleKeyDown} className={'popup flex flex-col p-5 w-3/5 h-3/5 ' + ' ' + props.className}>
                <div className="flex justify-center">
                    <h1 className="font-bold text-3xl mb-2">{props.data.id ? 'Edit Task' : 'Create Task'}</h1>
                </div>
                <input
                    autoFocus={true}
                    className={'block ml-10 mr-10'}
                    placeholder={'Task Name'}
                    type={'text'}
                    onChange={(e) => {
                        handleExternalEvent('title', e.target.value);
                    }}
                    value={externalEvent.title}
                ></input>

                <div className="ml-10 mt-7 mr-10">
                    <p>How demanding will this task be?</p>
                    <RangeSlider textColorWhite={false} standardDemand={defaultDemand} onChange={updateClassList} />
                </div>
                <div className="flex mt-7 ml-10 gap-x-4">
                    <div className="flex flex-col">
                        <p>Duration (h/m)</p>
                        <TimeSelector className="flex justify-center" startTime={props.data.start} duration={externalEvent.durationTime} onChange={updateDurationAndEndDate} />
                    </div>
                </div>
                <div className="ml-10 mt-7 flex">
                    <div className="">
                        <p>Deadline?</p>
                        <SwitchButton onChange={handleChangeToggle} defaultMode={showDeadlineOrNot} />
                    </div>
                    <div className="pl-11">
                        {deadlineToggle ? (
                            <input
                                className={'block w-full'}
                                type={'datetime-local'}
                                onFocus={props.onFocus}
                                onChange={(e) => {
                                    handleExternalEvent('deadline', e.target.value);
                                }}
                                min={`${today}`}
                                step={60 * 15}
                                value={externalEvent.deadline ? externalEvent.deadline : placeholder}
                            ></input>
                        ) : (
                            ''
                        )}
                    </div>
                </div>

                <div className="mt-auto flex justify-center gap-x-2">
                    {props.data.id ? (
                        <Button disabled={false} onClick={closeAndDelete} backgroundColor={colorPalettes.redButton} className={'mr-auto mt-auto'}>
                            <div className="flex">
                                {<img className="w-4 h-4" src={process.env.PUBLIC_URL + '/someIcons/trash.png'} />}
                                Delete
                            </div>
                        </Button>
                    ) : (
                        ''
                    )}
                    <div className="flex justify-end gap-x-2 w-full">
                        <Button
                            backgroundColor={colorPalettes.greenButton}
                            disabled={externalEvent.title.length == 0 || (deadlineToggle && externalEvent.deadline == undefined)}
                            onClick={handleConfirmation}
                            className={'w-1/6 block '}
                        >
                            <div className="flex justify-center">
                                {<img className="w-4 h-4" src={process.env.PUBLIC_URL + '/someIcons/save.png'} />}
                                Save
                            </div>
                        </Button>

                        <Button disabled={false} onClick={handleCancle} className={''}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TaskForm;
