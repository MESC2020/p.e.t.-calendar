import React, { useEffect } from 'react';
import { makeStyles } from '@mui/material';
import Slider from '@mui/material/Slider';

export interface IRangeSliderProps {
    onChange: any;
}

function valuetext(value: any) {
    return `${value}`;
}
const RangeSlider: React.FunctionComponent<IRangeSliderProps> = (props) => {
    const defaultValue = 5;
    const [value, setValue] = React.useState(defaultValue);
    const demandLevels = [
        { value: 1, label: 'Extremly Low' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: 'Neutral' },
        { value: 5, label: '5' },
        { value: 6, label: '6' },
        { value: 7, label: 'Extremly High' }
    ];

    const handleChange = (event: any, newValue: any) => {
        setValue(newValue);
        props.onChange(value);
    };

    return (
        <div className={'w-full text-pink-500'}>
            <Slider
                aria-label="Demanding Level"
                defaultValue={defaultValue}
                step={1}
                color={'primary'}
                min={1}
                max={7}
                value={value}
                onChange={handleChange}
                valueLabelDisplay="auto"
                aria-labelledby="range-slider"
                getAriaValueText={valuetext}
                marks={demandLevels}
            />
        </div>
    );
};

export default RangeSlider;
