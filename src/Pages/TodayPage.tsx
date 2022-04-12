import React from 'react';
import TestChart from '../components/charts/VictoryTestChart';

export interface ITodayPageProps {}

const TodayPage: React.FunctionComponent<ITodayPageProps> = (props) => {
    return (
        <div className="mt-56" style={{ height: 800, width: 400 }}>
            {window.api.closePopup({ close: true })}
        </div>
    );
};

export default TodayPage;
