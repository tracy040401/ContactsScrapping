const fs = require('fs');
const csv = require('csv-parser');

function extractQuery(csvFilePath) {
    return new Promise((resolve, reject) => {
        const queries = [];

        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => {
                const firstName = data['firstName'];
                const lastName = data['lastName'];

                const query = `"${firstName}" + "${lastName}" + email`;
                queries.push(query);
            })
            .on('end', () => {
                resolve(queries);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}
function extractNames(csvFilePath) {
    return new Promise((resolve, reject) => {
        const names = [];

        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => {
                const firstName = data['firstName'];
                const lastName = data['lastName'];

                names.push([firstName, lastName]);
            })
            .on('end', () => {
                resolve(names);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

module.exports = { extractQuery, extractNames };