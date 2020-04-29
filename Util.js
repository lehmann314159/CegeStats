const fs = require('fs');

function getMidnight() {
    let midnight = new Date();
    midnight.setDate(midnight.getDate());
    midnight.setHours(0,0,0,0);
    return midnight;
}

function getYesterdayMidnight() {
    let yesterdayMidnight = new Date();
    yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);
    yesterdayMidnight.setHours(0,0,0,0);
    return yesterdayMidnight;
}

function getYesterday() {
    let yesterday = getYesterdayMidnight();
    return yesterday.getFullYear() + '-'
        + ('0' + (yesterday.getMonth()+1)).slice(-2) + '-'
        + ('0' + yesterday.getDate()).slice(-2);
}

function getConfig(inSection, inFile = 'config.json') {
    try {
        const data = fs.readFileSync(inFile);
        let parsed = JSON.parse(data);

        if (!parsed) {
            die(`Invalid config file: ${inFile}`);
        }
        return parsed[inSection];
    } catch (err) {
        die(err);
    }
}

async function throttle(inMiliseconds) {
    await sleep(inMiliseconds);
}

const sleep = (miliseconds) => {
    return new Promise(resolve => setTimeout(resolve, miliseconds));
}

function die(inError) {
    if (inError)
        console.error(inError);
    process.exit(1);
}

exports.getMidnight = getMidnight;
exports.getYesterdayMidnight = getYesterdayMidnight;
exports.getYesterday = getYesterday;
exports.getConfig = getConfig;
exports.throttle = throttle;
exports.die = die;
