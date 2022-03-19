import React, { useEffect, useState } from 'react';
export interface ITodayPageProps {}

const TodayPage: React.FunctionComponent<ITodayPageProps> = (props) => {
    const [name, setName] = useState<any[]>([]);
    useEffect(() => {
        async function fetchData() {
            const result = await window.api.getNames();
            console.log(result);
            setName(result);
        }
        fetchData();
    }, []);

    return (
        <div>
            <p>This is the Today Page</p>
            {name.length == 0 ? '...' : name[0].names}
        </div>
    );
};

export default TodayPage;
