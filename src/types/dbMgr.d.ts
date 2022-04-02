import { TypeOfTag } from 'typescript';
type callback = (err: error, result?: any) => any;

declare global {
    type SQlite = {
        db: any;
        close(callback: callback): any; //returns nothing
        all(sql: string, info: string[], callback: callback): any;
    };
    type error = {
        message: string;
    };
}

export {};
