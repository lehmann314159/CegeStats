const axios = require('axios');
const Util = require('./Util.js');

class YtelClient {
    #accessToken;
    #config;
    #results;
    #startDate;
    #endDate;

    constructor(inConfig) {
        this.#config = inConfig;
        this.#results = {};

        //const y = Util.getYesterday();
        //this.#startDate = y.getFullYear() + '-'
            //+ ('0' + (y.getMonth()+1)).slice(-2) + '-'
            //+ ('0' + y.getDate()).slice(-2);
        //this.#endDate = this.#startDate;
        this.#startDate = Util.getYesterday();
        this.#endDate = Util.getYesterday();
    }

    async request() {
        await this.getUsageYesterday();
    }

    // This will be useful for v4 calls.  v3 calls use basic auth.
    async authorize() {
        try {
            const res = await axios({
                "url": "https://api-beta.ytel.com/auth/v2/token/",
                "method": "post",
                "headers": {
                    "accept":       "application/json",
                    "content-type": "application/json"
                },
                "data": {
                    "grantType": "resource_owner_credentials",
                    "username":  "sford@cege.com",
                    "password":  "Roundtwo$5155cegemedia",
                }
            });
            this.#accessToken = res.data.accessToken;
            if (this.isTest()) { console.log(this.#accessToken); }
        } catch(error) {
            Util.die(error);
        }
    }

    async getUsageYesterday() {
        try {
            const res = await axios({
                "url": "https://api.ytel.com/api/v3/usage/listusage.json",
                "method": "post",
                "headers": {
                    "accept":        "application/json",
                    "content-type":  "application/x-www-form-urlencoded",
                    "authorization": `Basic ${this.basicAuth()}`,
                },
                "data": `startDate=${this.#startDate}&endDate=${this.#endDate}`,
            });
            console.log(res);
            this.#results = res.data;
        } catch(error) {
            Util.die(error);
        }
    }

    getResults() {
        return this.#results;
    }

    basicAuth() {
        let buff = new Buffer.from(`${this.#config.username}:${this.#config.password}`);
        return buff.toString('base64');
    }

    isTest() { return this.#config.test; }
}
module.exports = YtelClient;
