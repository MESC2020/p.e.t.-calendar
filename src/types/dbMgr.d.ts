import { TypeOfTag } from 'typescript';
type callback = (err: error, result?: any) => any;

declare global {
    type SQlite = {
        db: any;
        close(callback: callback): any; //returns nothing
        all(sql: string, info: string[], callback: callback): any;
        run(sql: string, values?: any[], err?: any): any;
        get(sql: string, callback: callback): any;
        prepare(sql: string): any;
        last_insert_rowid(): any;
    };
    type error = {
        message?: string;
    };
}

export {};
