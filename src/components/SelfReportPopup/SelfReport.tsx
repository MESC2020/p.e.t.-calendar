import React, { useState } from 'react';
import RangeSlider from '../../views/partials/RangeSlider';
import { Button } from '../../views/partials/Button';

export interface ISelfReportProps {}
const demandLevels = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6' },
    { value: 7, label: '7' }
];

const SelfReport: React.FunctionComponent<ISelfReportProps> = (props) => {
    const [productivityAssessment, setProductivityAssessment] = useState(1);
    const [energyAssessment, setEnergyAssessment] = useState(1);
    const [userInteracted, setUserInteracted] = useState({ productive: false, energy: false });

    const handleProductivity = (result: number) => {
        if (!userInteracted.productive)
            setUserInteracted((state) => {
                return {
                    ...state,
                    productive: true
                };
            });
        setProductivityAssessment(result);
    };
    const handleEnergy = (result: number) => {
        if (!userInteracted.energy)
            setUserInteracted((state) => {
                return {
                    ...state,
                    energy: true
                };
            });
        setEnergyAssessment(result);
    };
    const convertTime = (time: string) => {
        let resultedTime = time;
        const [hour, minute] = time.split(':');
        const THRESHOLD_MINUTE: number = 30;
        if (parseInt(minute) <= THRESHOLD_MINUTE) {
            resultedTime = `${hour}:00`;
        } else {
            const newHour: number = parseInt(hour) + 1;
            resultedTime = newHour < 10 ? `0${newHour}:00` : `${newHour}:00`;
        }
        return resultedTime;
    };

    const handleConfirm = () => {
        const today = new Date();
        const report: ReportObject = { timestamp: '', productive: 0, energy: 0, day: '', time: '' };
        report.timestamp = today.toISOString();
        report.day = today.toLocaleString('en-us', { weekday: 'long' }); //getDay() returns only number, this return weekday
        report.time = convertTime(today.toLocaleTimeString('en-de', { hour: '2-digit', minute: '2-digit' }));
        report.productive = productivityAssessment;
        report.energy = energyAssessment;
        window.api.saveReport([report]);
    };
    return (
        <div style={{ width: 400, height: 300 }} className="bg-red-100">
            <div style={{ borderColor: '#2c3e50' }} className="flex border-2 justify-center gap-x-5 h-1/6 shadow-lg bg-white pt-1">
                <p className="flex pt-2 justify-center font-bold">Self Assessment</p>
                <Button
                    disabled={!userInteracted.productive || !userInteracted.energy}
                    onClick={() => {
                        handleConfirm();
                    }}
                    className={'ml-5'}
                >
                    Confirm
                </Button>
            </div>
            <div className="report h-5/6">
                <div className="pl-10 pr-10 pt-2">
                    <p className="text-white">
                        How <b>productive</b> did you feel during the last hour?
                    </p>
                    <RangeSlider textColorWhite={true} labels={demandLevels} standardDemand={5} onChange={handleProductivity} />
                </div>
                <div className="pl-10 pr-10 pt-4">
                    <p className="text-white">
                        How <b>energized</b> did you feel during the last hour?
                    </p>
                    <RangeSlider textColorWhite={true} labels={demandLevels} standardDemand={5} onChange={handleEnergy} />
                </div>
                <div></div>
            </div>
        </div>
    );
};

export default SelfReport;
