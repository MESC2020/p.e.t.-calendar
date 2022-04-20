import React, { useEffect, useState } from 'react';
import StatsBox from '../components/charts/StatsBox';
import VictoryLineChart from '../components/charts/VictoryLineChart';
import VictoryPieChart from '../components/charts/VictoryPieChart';
import { measurement, weekdays } from '../db/Aggregator';

export interface IStatsPageProps {}
export interface ItotalAvg {
    [measurement: string]: number;
}

const placeholderData: any = { productive: 0, energy: 0 };
const StatsPage: React.FunctionComponent<IStatsPageProps> = (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<IaggregatedWeekdays>();
    const [totalAvg, setTotalAvg] = useState<ItotalAvg>();

    useEffect(() => {
        async function getData() {
            const res: IaggregatedWeekdays = await window.api.getAggregatedWeekdays();
            const totalAvg = formatTotalAvg(res);
            setTotalAvg(totalAvg);
            setData(completeAndRetrieveData(res));

            setIsLoading(!isLoading);
        }
        if (isLoading) getData();
    });

    function formatTotalAvg(data: IaggregatedWeekdays) {
        let sumProductive = 0;
        let sumEnergy = 0;
        let count = 0;
        for (let weekday in weekdays) {
            if (data[weekday] !== undefined) {
                sumProductive = sumProductive + data[weekday][measurement.productive];
                sumEnergy = sumEnergy + data[weekday][measurement.energy];

                count++;
            } else continue;
        }
        if (Object.keys(data).length === 0) count = 1;
        return {
            [measurement.productive]: Math.round((sumProductive / count) * 10) / 10,
            [measurement.energy]: Math.round((sumEnergy / count) * 10) / 10
        };
    }

    function completeAndRetrieveData(data: any) {
        let result: IaggregatedWeekdays = {};
        if (data !== undefined) {
            for (let weekday in weekdays) {
                if (data[weekday] !== undefined) {
                    const current = { [weekday]: data[weekday] };
                    result = { ...result, ...current };
                } else {
                    const current = { [weekday]: placeholderData };
                    result = { ...result, ...current };
                }
            }
        }
        return result;
    }

    function getHighestDay(measure: measurement): string {
        const values = [];
        for (let weekday in weekdays) {
            values.push(data![weekday][measure]);
        }
        const highestValue = Math.max(...values);
        const indexInWeekdays = values.indexOf(highestValue);
        const result = Object.values(weekdays)[indexInWeekdays];
        return result;
    }

    return (
        <>
            {isLoading ? (
                ''
            ) : (
                <div style={{ height: 800 }} className=" flex justify-center">
                    <div className="flex flex-col w-11/12 h-full bg-blue-50 border-blue-100 border-2 rounded-lg drop-shadow-2xl ">
                        <div id="cover" className="flex flex-row h-5/6">
                            <div className="w-1/3 flex flex-col justify-between m-5 ">
                                <StatsBox text="Weekly avg. Productivity" className="w-8/12 h-72 box-squared ">
                                    <VictoryPieChart data={totalAvg!.productive} max={7} inPrecent={false} />
                                </StatsBox>
                                <StatsBox text="Weekly avg. Energy" className="h-72 w-8/12 box-squared ">
                                    <VictoryPieChart data={totalAvg!.energy} max={7} inPrecent={false} />
                                </StatsBox>
                            </div>
                            {document.getElementById('cover') ? (
                                <StatsBox text="Self-assessed Productivity & Energy" className="m-5 ">
                                    <VictoryLineChart width={2 * (document.getElementById('cover')!.offsetWidth / 3)} height={document.getElementById('cover')!.offsetHeight} data={data!} />
                                </StatsBox>
                            ) : (
                                ''
                            )}
                        </div>
                        <StatsBox className="h-1/6 m-2">
                            <div className="w-1/3">
                                <div className="flex justify-between ">
                                    <div className="flex">
                                        <img src={process.env.PUBLIC_URL + '/someIcons/productive.png'} />
                                        <p className="font-bold pl-2 pt-2">Most productive weekday:</p>
                                    </div>
                                    <p className="pt-2" style={{ color: '#3b83f6' }}>
                                        {getHighestDay(measurement.productive)}
                                    </p>
                                </div>
                                <div className="flex justify-between mt-2 ">
                                    <div className="flex">
                                        <img src={process.env.PUBLIC_URL + '/someIcons/energy.png'} />
                                        <p className="font-bold pl-2 pt-2">Most energized weekday:</p>
                                    </div>
                                    <p className="pt-2" style={{ color: '#3b83f6' }}>
                                        {getHighestDay(measurement.energy)}
                                    </p>
                                </div>
                            </div>
                        </StatsBox>
                    </div>
                </div>
            )}
        </>
    );
};

export default StatsPage;

/*<div className="flex justify-end w-11/12 bg-blue-50 border-blue-100 border-2 rounded-lg drop-shadow-2xl ">
                        <div className="w-1/2 b flex flex-col border-black border-2">
                            <StatsBox text="Weekly avg. Productivity" className="box-squared align-middle border-black border-2">
                                <VictoryPieChart data={totalAvg!.productive} max={7} inPrecent={false} />
                            </StatsBox>
                            <StatsBox text="Weekly avg. Energy" className="box-squared border-black border-2">
                                <VictoryPieChart data={totalAvg!.energy} max={7} inPrecent={false} />
                            </StatsBox>
                        </div>
                        <div className=" w-full border-black border-2">
                            <StatsBox text="Self-assessed Productivity & Energy" className="box-stretched border-black border-2">
                                <VictoryLineChart data={completeAndRetrieveData()} />
                            </StatsBox>
                        </div>
                    </div>*/
