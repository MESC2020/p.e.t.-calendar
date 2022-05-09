import React, { useEffect, useState } from 'react';
import { HashRouter, Route, Routes as Switch } from 'react-router-dom';
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
    const [isLoading, setIsLoading] = useState(true);
    const [isLocked, setIsLocked] = useState<any>(undefined);
    useEffect(() => {
        if (isLoading) {
            setTimeout(() => {
                retrieveLockStatus();
            }, 2000);
        }
    });
    async function retrieveLockStatus() {
        const isLocked = (await window.api.retrieveLockStatus(logOptions.isLocked)).data === 'true';

        setIsLoading(false);
        setIsLocked(isLocked);
    }
    return (
        <>
            {isLoading || isLocked === undefined ? (
                <div className="loader">
                    <Loader className={''} />
                </div>
            ) : (
                <HashRouter>
                    <Switch>
                        <Route element={<WithNavbar />}>
                            <Route path="/" element={<OverviewPage lockStatus={isLocked} reloadPage={setIsLoading} />} />
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
