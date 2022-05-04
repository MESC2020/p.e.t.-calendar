import React, { Component, useEffect, useState } from 'react';
import { BrowserRouter, HashRouter, Route, Routes as Switch } from 'react-router-dom';
import SelfReport from './components/SelfReportPopup/SelfReport';
import OverviewPage, { logOptions } from './Pages/Overview/OverviewPage';
import StatsPage from './Pages/StatsPage';
import WithNavbar from './views/navbar/WithNavbar';
import WithoutNavbar from './views/navbar/WithoutNavbar';
import Loader from './views/partials/Loader';

global.emptyEventObject = {
    id: undefined,
    title: '',
    deadline: undefined,
    start: undefined,
    end: undefined,
    durationTime: '02:00',
    classNames: []
};

export interface IAppProps {}

const App: React.FunctionComponent<IAppProps> = (props) => {
    const [isLocked, setIsLocked] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        async function checkIfLocked() {
            const isLocked = await window.api.retrieveLockStatus(logOptions.isLocked);
            if (isLocked.data === 'false') setIsLocked(false);
        }
        if (isLocked) checkIfLocked();
        if (isLoading) {
            setTimeout(() => {
                setIsLoading(false);
            }, 3000);
        }
    }, [isLocked]);

    return (
        <>
            {isLoading ? (
                <div className="loader">
                    <Loader className={''} />
                </div>
            ) : (
                <HashRouter>
                    <Switch>
                        <Route element={<WithNavbar isLocked={isLocked} />}>
                            <Route path="/" element={<OverviewPage isLocked={isLocked} setIsLocked={setIsLocked} />} />
                            <Route path="/stats" element={<StatsPage />} />
                        </Route>
                        <Route element={<WithoutNavbar />}>
                            <Route path="/report" element={<SelfReport />} />
                        </Route>
                    </Switch>
                </HashRouter>
            )}
        </>
    );
};

export default App;
