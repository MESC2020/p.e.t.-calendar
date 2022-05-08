import React, { useEffect, useState } from 'react';
import RangeSlider from '../../views/partials/RangeSlider';
import { Button } from '../../views/partials/Button';
import { colorPalettes } from '../../Pages/Overview/OverviewPage';

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
    const [productivityAssessment, setProductivityAssessment] = useState(0);
    const [energyAssessment, setEnergyAssessment] = useState(0);
    const [userInteracted, setUserInteracted] = useState({ productive: false, energy: false });
    const [isLoading, setIsLoading] = useState(false);
    const [checkBox, setCheckBox] = useState(false);

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
        const [hour, minute] = time.split(':');
        let hourInt = parseInt(hour);
        let minuteInt = parseInt(minute);
        const THRESHOLD_MINUTE: number = 30;
        //round it
        if (minuteInt > THRESHOLD_MINUTE) {
            hourInt++;
        }

        //substract one (so the graphs are correct)
        if (hourInt === 0) hourInt = 24; //use last day's midnight (weekday has to be changed by one)
        return hourInt < 10 ? `0${hourInt}:00` : `${hourInt}:00`;
    };

    const goOneDayBack = () => {
        const today = new Date();
        const changeDateBy = -1;
        var _24HoursInMilliseconds = 86400000;
        return new Date(today.getTime() + changeDateBy * _24HoursInMilliseconds).toLocaleString('en-us', { weekday: 'long' });
    };
    const resetForm = () => {
        setEnergyAssessment(0);
        setProductivityAssessment(0);
    };

    const handleConfirm = (doNotTrack: boolean = false) => {
        setUserInteracted(() => {
            return {
                productive: false,
                energy: false
            };
        });
        const today = new Date();
        const report: ReportObject = { timestamp: '', productive: 0, energy: 0, day: '', time: '' };
        report.timestamp = today.toISOString();
        report.time = convertTime(today.toLocaleTimeString('en-de', { hour: '2-digit', minute: '2-digit' }));
        report.day = report.time === '24:00' ? goOneDayBack() : today.toLocaleString('en-us', { weekday: 'long' }); //getDay() returns only number, this return weekday

        report.productive = doNotTrack ? 0 : productivityAssessment;
        report.energy = doNotTrack ? 0 : energyAssessment;
        resetPage();
        window.api.saveReport([report]);
    };

    const resetPage = () => {
        resetForm();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 5000);
    };

    return (
        <>
            {isLoading ? (
                ''
            ) : (
                <>
                    <div style={{ width: 400, height: 450 }} className="overflow-y-hidden ">
                        <div style={{ borderColor: '#2c3e50', height: 52 }} className="flex border-2 justify-center gap-x-24 shadow-lg bg-white pt-1">
                            <p className="flex pt-2 justify-center font-bold">Self Assessment</p>
                            <Button
                                backgroundColor={colorPalettes.greenButton}
                                disabled={(!userInteracted.productive || !userInteracted.energy) && !checkBox}
                                onClick={() => {
                                    handleConfirm();
                                }}
                                className={'ml-5 mb-1'}
                            >
                                Confirm
                            </Button>
                        </div>

                        <div style={{ height: 398 }} className="report">
                            <div>
                                <div className="flex pt-10">
                                    <Button
                                        disabled={false}
                                        backgroundColor={colorPalettes.redButton}
                                        onClick={() => {
                                            handleConfirm(true);
                                        }}
                                        className={' ml-10 mr-10  mr-1 mt-1 '}
                                    >
                                        I was on a break
                                    </Button>

                                    <p className="pt-1 text-white"></p>
                                </div>
                            </div>
                            <div className="pl-10 pt-10 pr-10 pt-2">
                                <p className="text-white">
                                    How <b>productive</b> did you feel during the last hour?
                                </p>
                                <RangeSlider checkBox={checkBox} textColorWhite={true} labels={demandLevels} standardDemand={productivityAssessment} onChange={handleProductivity} />
                            </div>
                            <div className="pl-10 pr-10 pt-4">
                                <p className="text-white">
                                    How <b>energized</b> did you feel during the last hour?
                                </p>
                                <RangeSlider checkBox={checkBox} textColorWhite={true} labels={demandLevels} standardDemand={energyAssessment} onChange={handleEnergy} />
                            </div>
                            <div></div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default SelfReport;
