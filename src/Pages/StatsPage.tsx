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
        if (highestValue === 0) return '?';
        const indexInWeekdays = values.indexOf(highestValue);
        const result = Object.values(weekdays)[indexInWeekdays];
        return result;
    }

    return (
        <>
            {isLoading ? (
                ''
            ) : (
                <div className="h-full flex justify-center w-full min-size-statsPage">
                    <div className="bg-blue-50 border-blue-100 border-2 rounded-lg drop-shadow-2xl ">
                        <div id="cover" className="grid lg:grid-cols-2 grid-cols-1 grid-flow-row">
                            <>
                                <div className="grid lg:grid-cols-2 grid-flow-row gap-x-5 m-3 gap-y-2 grid-cols-1">
                                    <StatsBox text="Weekly avg. Productivity" className="box-squared ">
                                        <VictoryPieChart data={totalAvg!.productive} max={7} inPrecent={false} />
                                    </StatsBox>
                                    <StatsBox text="Weekly avg. Energy" className="box-squared ">
                                        <VictoryPieChart data={totalAvg!.energy} max={7} inPrecent={false} />
                                    </StatsBox>{' '}
                                    <StatsBox className="mr-8 w-full">
                                        <div id="detail-information" className="overflow-hidden">
                                            <div className="flex justify-between">
                                                <div className="flex">
                                                    <div style={{ height: 35, width: 35 }}>
                                                        <img src={process.env.PUBLIC_URL + '/assets/productive.png'} />
                                                    </div>
                                                    <p className="font-bold pl-1">Most productive weekday</p>
                                                </div>
                                                <p className="" style={{ color: '#3b83f6' }}>
                                                    {getHighestDay(measurement.productive)}
                                                </p>
                                            </div>
                                            <div className="flex justify-between mt-2 ">
                                                <div className="flex">
                                                    <div style={{ height: 35, width: 35 }}>
                                                        <img src={process.env.PUBLIC_URL + '/assets/energy.png'} />
                                                    </div>
                                                    <p className="font-bold pl-1">Most energized weekday</p>
                                                </div>
                                                <p className="" style={{ color: '#3b83f6' }}>
                                                    {getHighestDay(measurement.energy)}
                                                </p>
                                            </div>
                                        </div>
                                    </StatsBox>
                                </div>
                            </>

                            <StatsBox text="Self-assessed Productivity & Energy" className="m-3">
                                <VictoryLineChart data={data!} />
                            </StatsBox>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StatsPage;
