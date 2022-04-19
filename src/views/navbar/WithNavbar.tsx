import React from 'react';
import { Outlet } from 'react-router';
import Navbar from './Navbar';

export interface IWithNavbarProps {}

const WithNavbar: React.FunctionComponent<IWithNavbarProps> = (props) => {
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );
};

export default WithNavbar;
