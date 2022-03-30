import React from 'react';
import { Button } from '../../../views/partials/Button';

export interface INewTaskFormProps {
    className?: string;
    value?: any;
    onFocus?: any;
    name?: any;
    display: any;
}

const NewTaskForm: React.FunctionComponent<INewTaskFormProps> = (props) => {
    return (
        <>
            <div id="popup" className={'card flex flex-col p-5 w-3/4 h-3/4 relative z-30' + ' ' + props.className}>
                <div className="flex justify-center">
                    <h1>Create Task</h1>
                </div>
                <input className={'block w-full'} placeholder={'Task Name'} name={props.name} type={'text'} onFocus={props.onFocus} value={props.value}></input>
                <div className="flex gap-x-4">
                    <div>
                        <p>START</p>
                        <input className={'block w-full'} placeholder={'29.03.2022 14:00'} type={'calendar'} onFocus={props.onFocus} value={props.value}></input>
                    </div>
                    <div>
                        <p>END</p>
                        <input className={'block w-full'} placeholder={'29.03.2022 16:00'} type={'calendar'} onFocus={props.onFocus} value={props.value}></input>
                    </div>
                </div>
                <p className="text-red-400 font-bold">WORK IN PROGRESS</p>
                <Button disabled={false} onClick={props.display} className={'ml-auto mt-auto'}>
                    Cancel
                </Button>
            </div>
        </>
    );
};

export default NewTaskForm;
