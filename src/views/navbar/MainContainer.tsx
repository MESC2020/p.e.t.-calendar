import React from 'react';
import MainNavigation from './Navbar';

export interface IMainContainerProps {
    className?: string;
}

const MainContainer: React.FunctionComponent<IMainContainerProps> = (props) => {
    return (
        <>
            <div className={'navbar pt-5'}>
                <MainNavigation />
            </div>
            <div className="main">{props.children}</div>;
        </>
    );
};

export default MainContainer;
