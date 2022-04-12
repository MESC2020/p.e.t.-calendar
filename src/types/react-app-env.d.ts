/// <reference types="react-scripts" />

declare global {
    var emptyEventObject: EventObject;
    interface Window {
        api: any;
    }

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
    };
}
export {};
