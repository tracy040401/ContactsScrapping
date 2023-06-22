const fs = require("fs");

function generateRandomNamesCSV(numEntries, filePath) {
    const data = [];
    for (let i = 0; i < numEntries; i++) {
        const firstName = generateRandomName();
        const lastName = generateRandomName();
        data.push({ firstName, lastName });
    }

    let csvContent = "First Name,Last Name\n";
    data.forEach((entry) => {
        csvContent += `"${entry.firstName}","${entry.lastName}"\n`;
    });

    fs.writeFileSync(filePath, csvContent, "utf8");

    console.log(`Random names CSV file generated: ${filePath}`);
}

function generateRandomName() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let name = "";

    for (let i = 0; i < 5; i++) {
        name += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return name;
}

// Usage
generateRandomNamesCSV(10, "random_names.csv");

