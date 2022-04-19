import React, { useEffect, useState } from 'react';
import StatsBox from '../components/charts/StatsBox';
import VictoryLineChart from '../components/charts/VictoryLineChart';
import VictoryPieChart from '../components/charts/VictoryPieChart';
import { measurement } from '../db/Aggregator';

export interface IStatsPageProps {}
export interface ItotalAvg {
    [measurement: string]: number;
}

const placeholderData: IaggregatedWeekdays[] = [
    { MO: { productive: 0, energy: 0 } },
    { TU: { productive: 0, energy: 0 } },
    { WE: { productive: 0, energy: 0 } },
    { TH: { productive: 0, energy: 0 } },
    { FR: { productive: 0, energy: 0 } },
    { SA: { productive: 0, energy: 0 } },
    { SO: { productive: 0, energy: 0 } }
];

const StatsPage: React.FunctionComponent<IStatsPageProps> = (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<IaggregatedWeekdays[]>();
    const [totalAvg, setTotalAvg] = useState<ItotalAvg>();

    useEffect(() => {
        async function getData() {
            const res: IaggregatedWeekdays[] = await window.api.getAggregatedWeekdays();
            const totalAvg = formatTotalAvg(res);
            setTotalAvg(totalAvg);
            setData(res);

            setIsLoading(!isLoading);
        }
        if (isLoading) getData();
    });

    function formatTotalAvg(data: IaggregatedWeekdays[]) {
        let sumProductive = 0;
        let sumEnergy = 0;
        let count = 0;
        console.log(data);
        for (let day of data) {
            sumProductive = sumProductive + day[Object.keys(day)[0]][measurement.productive];
            sumEnergy = sumEnergy + day[Object.keys(day)[0]][measurement.energy];

            count++;
        }
        if (data.length === 0) count = 1;
        return {
            [measurement.productive]: Math.round((sumProductive / count) * 10) / 10,
            [measurement.energy]: Math.round((sumEnergy / count) * 10) / 10
        };
    }

    function completeAndRetrieveData() {
        let result;
        if (data !== undefined) {
            if (data.length < 7) result = [...data, ...placeholderData.slice(data.length)];
            else result = [...data];
        } else result = placeholderData;
        return result;
    }

    return (
        <>
            {isLoading ? (
                ''
            ) : (
                <div style={{ height: 1000, width: 1700 }} className="flex bg-blue-50 border-blue-100 border-2 rounded-lg drop-shadow-2xl">
                    <div className="w-1/2 b flex">
                        <StatsBox text="Weekly avg. Productivity" className="box-squared">
                            <VictoryPieChart data={totalAvg!.productive} max={7} inPrecent={false} />
                        </StatsBox>
                        <StatsBox text="Weekly avg. Energy" className="box-squared">
                            <VictoryPieChart data={totalAvg!.energy} max={7} inPrecent={false} />
                        </StatsBox>
                    </div>
                    <div className="w-1/2">
                        <StatsBox text="Self-assessed Productivity & Energy" className="box-stretched">
                            <VictoryLineChart data={completeAndRetrieveData()} />
                        </StatsBox>
                    </div>
                </div>
            )}
        </>
    );
};

export default StatsPage;
