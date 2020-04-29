const axios = require('axios');
const Util = require('./Util.js');

class YahooHarness {
    #results;

    constructor() {
        this.#results = [];
    }

    // Requests a page of call data from Retreaver
    async getPage() {
        console.log('getPage');
        try {
            let url = "http://www.yahoo.com";
            const res = await axios.get(url)
            this.processPage(res);
        } catch(error) {
            Util.die(error);
        }
    }

    // Looks for revenue/payout data from a response object
    processPage(inResponse) {
        console.log('processPage');
        console.log(inResponse.headers);
        this.#results.push('this is a test');
    }

    displayResults() {
        console.log('displayResults');
        console.log(this.#results);
    }
}

module.exports = YahooHarness;
