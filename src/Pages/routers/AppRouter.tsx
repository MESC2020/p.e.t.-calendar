import React from 'react';
import { BrowserRouter, HashRouter, Navigate, Route, Routes as Switch } from 'react-router-dom';
import MainContainer from '../../views/navbar/MainContainer';
import OverviewPage from '../Overview/OverviewPage';
import StatsPage from '../StatsPage';
import TodayPage from '../TodayPage';
export interface IAppRouterProps {
    base?: string;
}

const AppRouter: React.FunctionComponent<IAppRouterProps> = (props) => {
    return (
        <MainContainer>
            <Switch>
                <Route path="/app" element={<OverviewPage />} />
                <Route path="/app/today" element={<TodayPage />} />
                <Route path="/app/stats" element={<StatsPage />} />
            </Switch>
        </MainContainer>
    );
};

export default AppRouter;
