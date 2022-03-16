import React, { useEffect } from 'react';
export interface ITodayPageProps {}

declare global {
    interface Window {
        api: any;
    }
}

const TodayPage: React.FunctionComponent<ITodayPageProps> = (props) => {
    useEffect(() => {
        async function fetchData() {
            console.log(await window.api.getNames());
        }
        fetchData();
    }, []);
    return (
        <div>
            <p>This is the Today Page</p>
            {}
        </div>
    );
};

export default TodayPage;
