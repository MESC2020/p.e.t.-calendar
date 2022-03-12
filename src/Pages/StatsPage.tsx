import React from 'react';
import LineChart from '../components/models/LineChart';
import PieChart from '../components/models/PieChart';
import ScatterChart from '../components/models/ScatterChart';
import StatsBox from '../components/models/StatsBox';
import VictoryLineChart from '../components/models/VictoryLineChart';
import VictoryPieChart from '../components/models/VictoryPieChart';

export interface IStatsPageProps {}

const StatsPage: React.FunctionComponent<IStatsPageProps> = (props) => {
    return (
        <>
            <div style={{ height: 1000, width: 1700 }} className="flex bg-blue-50 border-blue-100 border-2 rounded-lg drop-shadow-2xl">
                <div className="w-1/2 b flex">
                    <StatsBox text="Some  other info" className="box-squared">
                        {}
                    </StatsBox>
                    <StatsBox text="Task Completition on time" className="box-squared">
                        <VictoryPieChart />
                    </StatsBox>
                </div>
                <div className="w-1/2">
                    <StatsBox text="Self-assessed Productivity & Energy" className="box-stretched">
                        <VictoryLineChart />
                    </StatsBox>
                </div>
            </div>
        </>
    );
};

export default StatsPage;
