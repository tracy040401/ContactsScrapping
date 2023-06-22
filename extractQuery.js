const fs = require('fs');
const csv = require('csv-parser');

function extractQuery(csvFilePath) {
    return new Promise((resolve, reject) => {
        const queries = [];

        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => {
                const firstName = data['First Name'];
                const lastName = data['Last Name'];

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

module.exports = { extractQuery };



// Usage
extractQuery('random.csv');
