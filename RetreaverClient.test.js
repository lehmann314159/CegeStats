// The class to test
const RetreaverClient = require('./RetreaverClient.js');

// Sample Credentials
const sampleConfig = {
    "api_key": "HxeTvViH34HffhEzS4zM",
    "company_id": 32656
};

test('Sets and gets Last Page', () => {
    const linkString = '<https://api.retreaver.com/calls.json?api_key=HxeTvViH34HffhEzS4zM&company_id=32656&created_at_end=2020-04-09T06%3A00%3A00.000Z&created_at_start=2020-04-08T06%3A00%3A00.000Z&page=509&sort_by=created_at>; rel="last", <https://api.retreaver.com/calls.json?api_key=HxeTvViH34HffhEzS4zM&company_id=32656&created_at_end=2020-04-09T06%3A00%3A00.000Z&created_at_start=2020-04-08T06%3A00%3A00.000Z&page=2&sort_by=created_at>; rel="next"';
    let myRH = new RetreaverClient(sampleConfig);
    myRH.setLastPage(linkString);
    expect(myRH.getLastPage()).toBe(509);
});

//test('Verifies generatePaginatedUrl', () => {});

test('Verifies processCallsResponse', () => {
    const response = { "data": [
        {
            "call": {
                "revenue": 50,
                "payout": 0,
                "system_target_id": 12345,
                "system_campaign_id": 9862,
            }
        },
        {
            "call": {
                "revenue": 50,
                "payout": 10,
                "system_target_id": 34479,
                "system_campaign_id": 9862,
            }
        },
    ]};

    const expectedByBuyerId = {
        "12345": [
        {
            revenue:    50,
            payout:     0,
            buyerId:    12345,
            campaignId: 9862
        }
        ],
        "34479": [
        {
            revenue:    50,
            payout:     10,
            buyerId:    34479,
            campaignId: 9862
        }
    ]};

    const expectedByCampaignId = {
        "9862": [
        {
            revenue:    50,
            payout:     0,
            buyerId:    12345,
            campaignId: 9862
        },
        {
            revenue:    50,
            payout:     10,
            buyerId:    34479,
            campaignId: 9862
        }
    ]};

    let myRH = new RetreaverClient(sampleConfig);
    debugger;
    myRH.processCallsResponse(response);
    expect(myRH.getResultsByBuyerId()).toEqual(expectedByBuyerId);
    expect(myRH.getResultsByCampaignId()).toEqual(expectedByCampaignId);
});
