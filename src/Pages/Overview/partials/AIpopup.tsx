import React from 'react';
import { Button } from '../../../views/partials/Button';

enum buttonType {
    cancel = 'cancel',
    okay = 'okay',
    continue = 'continue'
}

export interface IAIpopupProps {
    className?: string;
    onFocus?: any;
    autoAssignTasks?: any;

    display: any;
    noScroll: any;

    data: number;
    message: any[] | any;
    hasCancelButton: boolean;
    hasContinueButton: boolean;
    hasOkayButton: boolean;
}

const AIpopup: React.FunctionComponent<IAIpopupProps> = (props) => {
    const handleConfirmation = (button: buttonType) => {
        if (button === buttonType.continue) props.autoAssignTasks(true);
        props.display();
        // props.noScroll(false);
    };

    function ifMultipleStrings() {
        return props.message.map((element: any, index: number) => {
            return index === 0 ? <p className="">{element}</p> : <p className="font-bold">{element}</p>;
        });
    }

    function returnButtons() {
        if (props.hasCancelButton) {
            return (
                <div className="flex gap-x-2 justify-center">
                    <Button
                        backgroundColor="#648CB5"
                        disabled={false}
                        onClick={() => {
                            handleConfirmation(buttonType.continue);
                        }}
                        className={''}
                    >
                        Continue
                    </Button>

                    <Button
                        backgroundColor=""
                        disabled={false}
                        onClick={() => {
                            handleConfirmation(buttonType.cancel);
                        }}
                        className={''}
                    >
                        Cancel
                    </Button>
                </div>
            );
        } else
            return (
                <div className="w-12 ">
                    <Button
                        backgroundColor=""
                        disabled={false}
                        onClick={() => {
                            handleConfirmation(buttonType.okay);
                        }}
                        className={''}
                    >
                        Okay
                    </Button>
                </div>
            );
    }

    return (
        <>
            <div id="" className={'small-popup flex justify-center p-5 w-1/5 h-1/6' + ' ' + props.className}>
                <div className="flex flex-col justify-center">
                    <div className="mt-2 mb-2 text-justify ">{Array.isArray(props.message) ? ifMultipleStrings() : props.message}</div>
                    <div className="flex justify-center">{returnButtons()}</div>
                </div>
            </div>
        </>
    );
};

export default AIpopup;
