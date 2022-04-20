import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../partials/Button';

export interface INavbarProps {}

const Navbar: React.FunctionComponent<INavbarProps> = (props) => {
    const navigate = useNavigate();
    const location = useLocation();

    let status: boolean = false;

    function isButtonPressed(path: string) {
        let value: boolean = false;
        if (path == location.pathname) value = true;
        console.log(value);
        return value;
    }
    const STATS_PATH = '/stats/';
    const OVERVIEW_PATH = '/';

    return (
        <>
            <div className="navbar pb-5 pt-5">
                <div className="flex gap-x-20 justify-center ">
                    <Button disabled={status} isButtonPressed={isButtonPressed(OVERVIEW_PATH)} className="" onClick={() => navigate(OVERVIEW_PATH)}>
                        Overview
                    </Button>
                    <Button disabled={false} className="" isButtonPressed={isButtonPressed(STATS_PATH)} onClick={() => navigate(STATS_PATH)}>
                        Stats
                    </Button>
                </div>
            </div>
        </>
    );
};

export default Navbar;
