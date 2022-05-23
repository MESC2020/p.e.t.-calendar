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
        if (storedHTML === undefined && props.standardDemand === 0) {
            const elements = document.getElementsByClassName('MuiSlider-colorPrimary MuiSlider-sizeMedium MuiSlider-root MuiSlider-marked css-24mx6r') as unknown as HTMLElement[];

            //make buttonKnob disappear when init
            //make buttonKnob appear when user uses slider
            //Buggy behavior TODO (works not in dev mode but in distributed mode)
            for (let el of elements) {
                const buttonKnob = el.children.item(16);
                if (el !== undefined && buttonKnob !== undefined) {
                    (buttonKnob as any).style.display = 'none';
                    el.addEventListener('mousedown', () => {
                        if ((buttonKnob as any).style.display !== 'block') (buttonKnob as any).style.display = 'block';
                    });
                }
            }
            setStoredHTML(elements);
        }
    });
    const [value, setValue] = useState(props.standardDemand);
    const demandLevels = [
        { value: 1, label: 'Extremely Low' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: 'Neutral' },
        { value: 5, label: '5' },
        { value: 6, label: '6' },
        { value: 7, label: 'Extremely High' }
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
                    defaultValue={props.standardDemand}
                    onChange={(event: any, newValue: any) => {
                        //if (storedHTML !== undefined) storedHTML.style.display = 'block';
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
