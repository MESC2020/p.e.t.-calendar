import React, { Component } from 'react';
import { BrowserRouter, HashRouter, Route, Routes as Switch } from 'react-router-dom';
import SelfReport from './components/SelfReportPopup/SelfReport';
import OverviewPage from './Pages/Overview/OverviewPage';
import StatsPage from './Pages/StatsPage';
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
            <HashRouter>
                <Switch>
                    <Route path="/" element={<OverviewPage />} />
                    <Route path="/stats" element={<StatsPage />} />

                    <Route path="/report" element={<SelfReport />} />
                </Switch>
            </HashRouter>
        );
    }
}

export default App;
