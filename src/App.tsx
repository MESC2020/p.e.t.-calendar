import React, { Component } from 'react';
import { BrowserRouter, Route, Routes as Switch } from 'react-router-dom';
import OverviewPage from './Pages/Overview/OverviewPage';
import StatsPage from './Pages/StatsPage';
import TodayPage from './Pages/TodayPage';
import MainContainer from './views/navbar/MainContainer';

class App extends Component {
    componentDidMount() {}

    render() {
        return (
            <BrowserRouter>
                <MainContainer>
                    <Switch>
                        <Route path="/" element={<OverviewPage />} />
                        <Route path="today" element={<TodayPage />} />
                        <Route path="stats" element={<StatsPage />} />
                    </Switch>
                </MainContainer>
            </BrowserRouter>
        );
    }
}

export default App;
