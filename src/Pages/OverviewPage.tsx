import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../views/partials/Button';
import VictoryLineChart from '../components/models/VictoryLineChart';

export interface IOverviewPageProps {}

const OverviewPage: React.FunctionComponent<IOverviewPageProps> = (props) => {
    const navigate = useNavigate();

    return (
        <>
            <div style={{ height: 700, width: 1500 }} className="bg-blue-50 border-blue-100 border-2 rounded-lg drop-shadow-2xl">
                <p>This is the OverviewPage </p>
            </div>
        </>
    );
};

export default OverviewPage;
