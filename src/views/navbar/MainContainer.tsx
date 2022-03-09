import React from 'react';
import MainNavigation from './MainNavigation';

export interface IMainContainerProps {}

const MainContainer: React.FunctionComponent<IMainContainerProps> = (props) => {
    return (
        <>
            <div className="navbar border-2 border-green-500">
                <MainNavigation />
            </div>
            <div className="main">{props.children}</div>;
        </>
    );
};

export default MainContainer;
