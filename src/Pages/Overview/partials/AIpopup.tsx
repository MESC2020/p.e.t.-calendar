import React, { useEffect, useState } from 'react';
import { Button } from '../../../views/partials/Button';
import SwitchButton from '../../../views/partials/switchButton';
import { colorPalettes, Mode } from '../OverviewPage';
import RangeSlider from '../../../views/partials/RangeSlider';
import TimeSelector from '../../../views/partials/TimeSelector';
import moment from 'moment';

export interface IAIpopupProps {
    className?: string;
    onFocus?: any;

    display: any;

    data: number;
}
const STANDARD_DURATION = '02:00';
const STANDARD_DEMAND = 5;
const AIpopup: React.FunctionComponent<IAIpopupProps> = (props) => {
    //to display duration
    useEffect(() => {
        noScroll(true);
    });
    const handleConfirmation = () => {
        props.display();
        noScroll(false);
    };

    //prevent background scrolling when task popup is open
    function noScroll(addProperty: boolean) {
        const root = document.querySelector('body');
        if (addProperty) root!.style.overflow = 'hidden';
        else {
            root!.style.overflow = 'scroll';
        }
    }

    return (
        <>
            <div id="popup" className={'card flex p-5 w-1/5 h-1/6 relative z-30' + ' ' + props.className}>
                <div className="m-auto flex gap-x-1">
                    <div className="mt-2">
                        Did not find appropriate Slot for <strong>{props.data}</strong> tasks
                    </div>
                    <Button backgroundColor="" disabled={false} onClick={handleConfirmation} className={''}>
                        Okay
                    </Button>
                </div>
            </div>
        </>
    );
};

export default AIpopup;
