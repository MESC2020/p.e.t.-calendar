import React, { useEffect, useState } from 'react';
import { Button } from '../../../views/partials/Button';
import SwitchButton from '../../../views/partials/switchButton';
import RangeSlider from './RangeSlider';

export interface ITaskFormProps {
    className?: string;
    value?: any;
    onFocus?: any;
    name?: any;
    display: any;
    onChange: any;
}

const TaskForm: React.FunctionComponent<ITaskFormProps> = (props) => {
    const [deadlineToggle, setDeadlineToggle] = useState(false);
    const [externalEvent, setExternalEvent] = useState({ id: 'test', title: '', backgroundColor: '#74AAEB', textColor: 'white', classNames: ['demand'], deadline: '' });
    const today = new Date();

    useEffect(() => {});

    const handleExternalEvent = (key: string, value: any) => {
        setExternalEvent({ ...externalEvent, [key]: value });
    };

    const handleChangeToggle = () => {
        setDeadlineToggle(!deadlineToggle);
    };

    const handleConfirmation = () => {
        props.onChange(externalEvent);
        props.display();
    };

    const handleChangeDemand = (demand: number) => {
        const currentClassNames = externalEvent.classNames;
        currentClassNames.length > 1 ? currentClassNames.splice(1, 1, 'demand-' + demand) : currentClassNames.push('demand-' + demand);
        setExternalEvent((state) => {
            return {
                ...state,
                classNames: currentClassNames
            };
        });
    };

    return (
        <>
            <div id="popup" className={'card flex flex-col p-5 w-3/4 h-3/4 relative z-30' + ' ' + props.className}>
                <div className="flex justify-center">
                    <h1 className="font-bold text-3xl mb-2">Create Task</h1>
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
                    <RangeSlider onChange={handleChangeDemand} />
                </div>
                <div className="flex mt-4 ml-10 gap-x-4">
                    <div className="">
                        <p>Deadline?</p>
                        <SwitchButton onChange={handleChangeToggle} defaultMode={false} />
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
                    backgroundColor="#01E68A"
                    disabled={externalEvent.title.length == 0 || (deadlineToggle && externalEvent.deadline?.length == 0)}
                    onClick={handleConfirmation}
                    className={'w-1/6 block mr-auto ml-auto'}
                >
                    Confirm
                </Button>

                <Button disabled={false} onClick={props.display} className={'ml-auto mt-auto'}>
                    Cancel
                </Button>
            </div>
        </>
    );
};

export default TaskForm;
