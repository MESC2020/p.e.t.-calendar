import { stringify } from 'csv-stringify';
const sqlite3 = require('sqlite3');

let stringifier: any;
let columns: any;

export class Converter {
    constructorq() {}

    async converting(db: any) {
        await new Promise((resolve, reject) => {
            db.each(
                'SELECT * FROM Events',
                function (err: any, row: any) {
                    // This function is executed for each row in the result set.
                    // For the first invocation, we initialize the columns and stringifier.
                    // For every invocation, we write the row object to the stringifier.
                    // The row object is a simple object where the fields match the columns
                    // specified in the query.
                    if (err) {
                        reject(err);
                    }
                    if (!columns) {
                        columns = Object.keys(row);
                    }
                    if (!stringifier) {
                        stringifier = stringify({
                            delimiter: ',',
                            header: true,
                            columns: columns
                        });
                        stringifier.pipe(process.stdout);
                    }
                    // console.log(row);
                    stringifier.write(row);
                },
                function (err: any, count: any) {
                    // This is invoked when all rows are processed.
                    if (err) {
                        reject(err);
                    }
                    // console.log(`FINISHED ${count} rows`);
                    stringifier.end();
                    resolve(undefined);
                }
            );
        });
    }
}
