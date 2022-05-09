import React from 'react';
import { Outlet } from 'react-router';

export interface IWithoutNavbarProps {}

const WithoutNavbar: React.FunctionComponent<IWithoutNavbarProps> = (props) => {
    return (
        <>
            <Outlet />
        </>
    );
};

export default WithoutNavbar;
