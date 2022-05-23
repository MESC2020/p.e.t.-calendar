import React from 'react';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';
import styled from '@emotion/styled';
import moment, { Moment } from 'moment';

export interface ITimeSelectorProps {
    className?: string;
    onChange: any;
    duration: string;
    startTime: string | undefined;
}

export const StyleWrapper = styled.div`
    .rc-time-picker {
        height: 30px !important;
        width: 115px !important;
    }
    .rc-time-picker-input {
        color: #3b83f6 !important;
        font-size: 2em !important;
    }
`;

const TimeSelector: React.FunctionComponent<ITimeSelectorProps> = (props) => {
    function handleTimePicking(value: Moment) {
        const onlyTime = value.format('HH:mm');
        //if Task already in Calendar
        if (props.startTime !== undefined && props.startTime !== null) {
            const [hour, minute] = onlyTime.split(':');
            let milSec = new Date(props.startTime).getTime() + parseInt(hour) * 60 * 60 * 1000 + parseInt(minute) * 60 * 1000;
            const newDate = new Date(milSec).toISOString(); //new End date
            props.onChange(onlyTime, newDate);
        } else props.onChange(onlyTime);
    }
    return (
        <div className={`${props.className}` + ' '}>
            <StyleWrapper>
                <TimePicker
                    showSecond={false}
                    minuteStep={15}
                    defaultValue={moment(props.duration, [moment.ISO_8601, 'HH:mm'])}
                    allowEmpty={false}
                    onChange={(value) => {
                        handleTimePicking(value);
                    }}
                />
            </StyleWrapper>
        </div>
    );
};

export default TimeSelector;
