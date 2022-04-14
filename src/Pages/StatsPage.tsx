import React, { useEffect, useState } from 'react';
import LineChart from '../components/charts/LineChart';
import PieChart from '../components/charts/PieChart';
import ScatterChart from '../components/charts/ScatterChart';
import StatsBox from '../components/charts/StatsBox';
import VictoryLineChart from '../components/charts/VictoryLineChart';
import VictoryPieChart from '../components/charts/VictoryPieChart';

export interface IStatsPageProps {}

const StatsPage: React.FunctionComponent<IStatsPageProps> = (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>();
    const [totalAvgProd, setTotalAvgProd] = useState(0);

    useEffect(() => {
        async function getData() {
            const res = await window.api.getAggregatedWeekdays();
            const totalAvgProd = totalAvgProductivity(res);
            setTotalAvgProd(totalAvgProd);
            setData(res);

            setIsLoading(!isLoading);
        }
        if (isLoading) getData();
    });

    function totalAvgProductivity(data: any) {
        let sum = 0;
        let count = 0;
        for (let day of data) {
            sum = sum + day[Object.keys(day)[0]];
            count++;
        }
        return Math.round((sum / count) * 10) / 10;
    }

    return (
        <>
            {isLoading ? (
                ''
            ) : (
                <div style={{ height: 1000, width: 1700 }} className="flex bg-blue-50 border-blue-100 border-2 rounded-lg drop-shadow-2xl">
                    <div className="w-1/2 b flex">
                        <StatsBox text="Weekly avg. Productivity" className="box-squared">
                            <VictoryPieChart data={totalAvgProd} max={7} inPrecent={false} />
                        </StatsBox>
                        <StatsBox text="Task Completition on time" className="box-squared">
                            <VictoryPieChart data={80} max={100} inPrecent={true} />
                        </StatsBox>
                    </div>
                    <div className="w-1/2">
                        <StatsBox text="Self-assessed Productivity & Energy" className="box-stretched">
                            <VictoryLineChart data={data} />
                        </StatsBox>
                    </div>
                </div>
            )}
        </>
    );
};

export default StatsPage;
