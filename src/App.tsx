import React, { Component } from 'react';
import { BrowserRouter, HashRouter, Route, Routes as Switch } from 'react-router-dom';
import SelfReport from './components/SelfReportPopup/SelfReport';
import OverviewPage from './Pages/Overview/OverviewPage';
import StatsPage from './Pages/StatsPage';
import TodayPage from './Pages/TodayPage';
import MainContainer from './views/navbar/MainContainer';
import WithNavbar from './views/navbar/WithNavbar';
import WithoutNavbar from './views/navbar/WithoutNavbar';

global.emptyEventObject = {
    id: undefined,
    title: '',
    deadline: undefined,
    start: undefined,
    end: undefined,
    classNames: []
};
class App extends Component {
    componentDidMount() {}

    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route element={<WithNavbar />}>
                        <Route path="/" element={<OverviewPage />} />
                        <Route path="/today" element={<TodayPage />} />
                        <Route path="/stats" element={<StatsPage />} />
                    </Route>
                    <Route element={<WithoutNavbar />}>
                        <Route path="/report" element={<SelfReport />} />
                    </Route>
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;
