/// <reference types="react-scripts" />

declare global {
    var emptyEventObject: EventObject;
    interface Window {
        api: any;
    }

    type ReportObject = {
        timestamp: string;
        productive: number;
        energy: number;
        day: string;
        time: string;
    };

    type EventObject = {
        id: number | undefined;
        title: string;
        start: string | undefined;
        end: string | undefined;
        deadline: string | undefined;
        classNames: string[];
        backgroundColor?: string;
        textColor?: string;
        demand?: number;
        duration?: string;
    };
}
export {};
