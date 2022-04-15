import React from 'react';
import { CircularProgress } from '@mui/material';

export interface ILoaderProps {
    className: string;
}

//unused currently
const Loader: React.FunctionComponent<ILoaderProps> = (props) => {
    return (
        <div className={`${props.className} ` + ' '}>
            <CircularProgress />
        </div>
    );
};

export default Loader;
