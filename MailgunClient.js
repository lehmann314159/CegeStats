const axios = require('axios');
const Util = require('./Util.js');

class MailgunClient {
    #accessToken;
    #config;
    #domainList;
    #results;
    #startDate;

    constructor(inConfig) {
        this.#config    = inConfig;
        this.#startDate = Util.getYesterday();
        this.#endDate   = Util.getYesterday();
        this.#results   = {};
        this.#domainList = this.#config.domainList;
    }

    async request() {
        this.#domainList.forEach( (aDomain) => {
        await this.getStatsYesterday(aDomain));
            
        });
    }

    async getStatsYesterday(inDomain) {
        try {
            const res = await axios({
                "url": `https://api.mailgun.net/v3/${inDomain}/stats/total`,
                "headers": {
                    "accept":        "application/json",
                    "content-type":  "application/x-www-form-urlencoded",
                    "authorization": `Basic ${this.basicAuth()}`,
                },
                "method": "get",
                "params": {
                }
            });
            console.log(res);
            this.#results[inDomain] = res.data;
        } catch(error) {
            Util.die(error);
        }
    }

    getResults() {
        return this.#results;
    }

    basicAuth() {
        let buff = new Buffer.from(`api:${this.#config.api_key}`);
        return buff.toString('base64');
    }
}
module.exports = YtelClient;
