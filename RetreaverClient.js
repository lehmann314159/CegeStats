const axios = require('axios');
const Util = require('./Util.js');

/* Retreaver can give us raw call data, but they don't have endpoints
 * for summaries.  So we'll grab the first page, find out how many
 * pages there are from the headers, and then read the remaining pages.
 */

/* I'm making this a class so that I can store the number of pages after
 * the first page is requested.  There might be a clever way for me to
 * persist that value via function returns, but I'm already at risk of
 * over-engineering this :)
 */

class RetreaverClient {
    #config;
    #lastPageNumber;
    #midnight;
    #resultsByBuyerId;
    #resultsByCampaignId;
    #yesterdayMidnight;

    constructor(inConfig) {
        this.#config = inConfig;
        this.#yesterdayMidnight = Util.getYesterdayMidnight();
        this.#midnight = Util.getMidnight();
        this.#resultsByBuyerId = {};
        this.#resultsByCampaignId = {};
        this.#resultsByCampaignId = {};
        this.#lastPageNumber = 0;
    }

    // Get yesterday's data and process it.
    async request() {
        if (this.isTest()) { console.log("in getAllCalls"); }
        // GET first page (and number of pages)
        await this.getCallsPage();
 
        if (this.isTest()) { console.log(`getLastPage = ` + this.getLastPage()); }
        // GET the remaining pages
        for (let pageNum = 2; pageNum <= this.getLastPage(); pageNum++) {
            await Util.throttle(this.#config.throttle);
            await this.getCallsPage(pageNum);
        }
    }

    // Requests a page of call data from Retreaver
    async getCallsPage(inPage = 1) {
        console.log(`in getCallsPage with ${inPage}`);
        console.log(`url is ` + this.generatePaginatedUrl(inPage));
        if (this.isTest()) { return; }

        try {
            const res = await axios.get(this.generatePaginatedUrl(inPage));
            this.processCallsResponse(res);
            if (inPage == 1) {
                this.setLastPage(res.headers.link);
            }
        } catch(error) {
            Util.die(error);
        }
    }

    // Looks for revenue/payout data from a response object
    processCallsResponse(inResponse) {
        inResponse.data.forEach((item) => {
            if (item.call.revenue || item.call.payout) {
                this.addCallByBuyerId(item.call);
                this.addCallByCampaignId(item.call);
            }
        });
    }

    addCallByBuyerId(inCall) {
        if (! this.#resultsByBuyerId.hasOwnProperty(inCall.system_target_id)) {
            this.#resultsByBuyerId[inCall.system_target_id] = [];
        }

        this.#resultsByBuyerId[inCall.system_target_id].push({
            revenue:    inCall.revenue,
            payout:     inCall.payout,
            buyerId:    inCall.system_target_id,
            campaignId: inCall.system_campaign_id
        });
    }

    addCallByCampaignId(inCall) {
        console.log(`in addCallByCampaign with ${inCall}`);
        if (! this.#resultsByCampaignId.hasOwnProperty(inCall.system_campaign_id)) {
            this.#resultsByCampaignId[inCall.system_campaign_id] = [];
        }

        this.#resultsByCampaignId[inCall.system_campaign_id].push({
            revenue:    inCall.revenue,
            payout:     inCall.payout,
            buyerId:    inCall.system_target_id,
            campaignId: inCall.system_campaign_id
        });
    }

    getResults() {
        return {
            "resultsByBuyer": this.getResultsByBuyerId(),
            "resultsByCampaign": this.getResultsByCampaignId()
        };
    }
    getResultsByBuyerId() {
        return this.#resultsByBuyerId;
    }

    getResultsByCampaignId() {
        return this.#resultsByCampaignId;
    }

    // Generates a URL based on credentials and Page #
    generatePaginatedUrl(inPage) {
        const queryParameters = {
            company_id:       this.#config.company_id,
            api_key:          this.#config.api_key,
            sort_by:          'created_at',
            created_at_start: this.#yesterdayMidnight.toISOString(),
            created_at_end:   this.#midnight.toISOString(),
            per_page:         100,
            page:             inPage
        };

        const queryString = Object.keys(queryParameters)
            .map( key => key + '=' + queryParameters[key])
            .join('&');

        return 'https://api.retreaver.com/calls.json?' + queryString;
    }

    // Finds the last page number from the link header of a response object
    setLastPage(inLink) {
        let lastPageNumber;
        inLink.split(',').forEach((link) => {
            let lastPageRE = /rel=\"last\"/;
            if (link.search(lastPageRE) > -1) {
                let pageNumberRE = /page=\d+/;
                let lastPage = link.match(pageNumberRE)[0];
                lastPageNumber = lastPage.split('=')[1];
            }
        });
        this.#lastPageNumber = lastPageNumber;
    }

    getLastPage() {
        return 1;
        return this.#lastPageNumber;
    }

    isTest() { return this.#config.test; }
}

module.exports = RetreaverClient;
