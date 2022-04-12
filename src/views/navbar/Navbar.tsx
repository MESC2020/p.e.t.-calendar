import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../partials/Button';

export interface INavbarProps {}

const Navbar: React.FunctionComponent<INavbarProps> = (props) => {
    const navigate = useNavigate();

    let status: boolean = false;

    return (
        <>
            <div className="navbar pb-5 pt-5">
                <div className="w-5/12 flex gap-x-20 justify-center ">
                    <Button disabled={status} className="" onClick={() => navigate('/')}>
                        Overview
                    </Button>
                    <Button disabled={false} className="" onClick={() => navigate('/today/')}>
                        Today
                    </Button>
                    <Button disabled={false} className="" onClick={() => navigate('/stats/')}>
                        Stats
                    </Button>
                </div>
            </div>
        </>
    );
};

export default Navbar;
