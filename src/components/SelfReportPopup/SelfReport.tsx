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
        setProductivityAssessment(result);
    };

    const handleConfirm = () => {
        window.api.saveReport();
    };
    return (
        <div style={{ width: 400, height: 300 }} className="bg-red-100">
            <div style={{ borderColor: '#2c3e50' }} className="flex border-2 justify-center gap-x-5 h-1/6 shadow-lg bg-white pt-1">
                <p className="flex pt-2 justify-center font-bold">Self Assessment</p>
                <Button
                    disabled={!userInteracted.productive || !userInteracted.energy}
                    onClick={() => {
                        console.log('confirming');
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
