import React, { useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material';
import Slider from '@mui/material/Slider';
import { blue, grey, orange } from '@mui/material/colors';

export interface IRangeSliderProps {
    standardDemand: number;
    onChange: any;
    labels?: { value: number; label: string }[];
    textColorWhite: boolean;
    checkBox?: boolean;
}

function valuetext(value: any) {
    return `${value}`;
}
const RangeSlider: React.FunctionComponent<IRangeSliderProps> = (props) => {
    const [storedHTML, setStoredHTML] = useState<any>(undefined);
    useEffect(() => {
        if (storedHTML === undefined) {
            const el = document.getElementsByClassName('MuiSlider-thumbColorPrimary MuiSlider-thumbSizeMedium MuiSlider-thumb css-fqmdoh-MuiSlider-thumb')[0] as HTMLElement;
            console.log(el);
            if (el !== undefined) {
                el.style.display = 'none';
                setStoredHTML(el);
            }
        }
    });
    const [value, setValue] = useState(undefined);
    const demandLevels = [
        { value: 1, label: 'Extremly Low' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: 'Neutral' },
        { value: 5, label: '5' },
        { value: 6, label: '6' },
        { value: 7, label: 'Extremly High' }
    ];

    const handleChange = (newValue: any) => {
        setValue(newValue);
        props.onChange(newValue);
    };

    const muiTheme = createTheme({
        palette: {
            primary: {
                main: blue[500],
                contrastText: '#fff'
            },
            secondary: {
                main: orange[500],
                contrastText: '#fff'
            },
            text: {
                primary: props.textColorWhite ? '#fff' : '#000',
                secondary: props.checkBox ? grey[500] : blue[500]
            }
        }
    });
    return (
        <div className={'w-full '}>
            {' '}
            <ThemeProvider theme={muiTheme}>
                <Slider
                    disabled={props?.checkBox}
                    aria-label="Demanding Level"
                    step={1}
                    color={'primary'}
                    min={1}
                    max={7}
                    value={value}
                    onChange={(event: any, newValue: any) => {
                        console.log('sliding');
                        if (storedHTML !== undefined) storedHTML.style.display = 'block';
                        handleChange(event.target.value);
                    }}
                    valueLabelDisplay="auto"
                    aria-labelledby="range-slider"
                    getAriaValueText={valuetext}
                    marks={props.labels ? props.labels : demandLevels}
                />
            </ThemeProvider>
        </div>
    );
};

export default RangeSlider;
