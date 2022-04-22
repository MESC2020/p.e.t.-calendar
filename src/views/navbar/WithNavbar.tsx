import React from 'react';
import { Outlet } from 'react-router';
import Navbar from './Navbar';

export interface IWithNavbarProps {}

const WithNavbar: React.FunctionComponent<IWithNavbarProps> = (props) => {
    return (
        <>
            <Navbar />
            <div className="main">
                <Outlet />
            </div>
        </>
    );
};

export default WithNavbar;
