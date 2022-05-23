const { stringify } = require('csv-stringify');
import { dbMgr } from './dbMgr';

const fs = require('fs');
const archiver = require('archiver');
const fsPromises = fs.promises;

export class Converter {
    dbManager: dbMgr;
    filePathBase: any;
    data?: any;
    fileNames?: any;
    constructor(dbManager: dbMgr, filePathBase: any) {
        this.dbManager = dbManager;
        this.filePathBase = filePathBase;
    }
    async convert() {
        try {
            await this.retrieveData();
            await this.createCSVfiles();
        } catch (err: any) {
            console.error('Error occured while storing files!', err);
        }
        //await this.createZIPfolder();
    }

    private async retrieveData() {
        if (this.dbManager !== undefined) {
            const data: any = await this.dbManager.returnAllTables();
            this.data = data;
        }
    }

    private async createCSVfiles() {
        const pathBase = this.filePathBase;
        const tableNames = [];
        if (this.data !== undefined && pathBase !== undefined) {
            for (let dataTable of this.data) {
                const tableName = Object.keys(dataTable)[0];
                tableNames.push(tableName);
                stringify(
                    dataTable[tableName],
                    {
                        header: true
                    },
                    function (err: any, output: any) {
                        fsPromises.writeFile(pathBase + `/${tableName}.csv`, output, function (err: any) {
                            if (err) throw err;
                            console.log('Saved!');
                        });
                    }
                );
            }
            this.fileNames = tableNames;
        }
    }

    //used to work but currently doesnt TODO
    async createZIPfolder() {
        const pathBase = this.filePathBase;
        const fileNames = this.fileNames;

        if (pathBase !== undefined && fileNames !== undefined) {
            const output = fs.createWriteStream(`${pathBase}/data.zip`);
            const archive = archiver('zip', {
                gzip: true,
                zlib: { level: 9 } // Sets the compression level.
            });

            archive.on('error', function (err: any) {
                throw err;
            });

            // pipe archive data to the output file
            archive.pipe(output);

            // append files
            for (let fileName of fileNames) {
                archive.file(`${pathBase}/${fileName}.csv`, { name: `${fileName}.csv` });
            }
            //
            archive.finalize();
        }
    }
}
