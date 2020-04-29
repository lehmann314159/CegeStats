const RetreaverClient = require('./RetreaverClient.js');
const YtelClient = require('./YtelClient.js');
const Util = require('./Util.js');

let myRH = new RetreaverClient(Util.getConfig('retreaver'));
myRH.request()
.then( () => {
    console.log(JSON.stringify(myRH.getResults()));
});

let myYC = new YtelClient(Util.getConfig('ytel'));
myYC.request()
.then( () => {
    console.log(JSON.stringify(myYC.getResults()));
});

