import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../views/partials/Button';

export interface IOverviewPageProps {}

const OverviewPage: React.FunctionComponent<IOverviewPageProps> = (props) => {
    const navigate = useNavigate();

    return (
        <>
            <div>
                <p>This is the OverviewPage </p>
            </div>
        </>
    );
};

export default OverviewPage;
