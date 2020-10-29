const request = require('request-promise');
const qs = require('query-string');

const API_KEY = '';
const BASE_URL = 'https://tracker.dashbot.io';

const CONVERSION = {
    "AlexaSkill": "alexa",
    "GoogleAction": "google"
}

async function recordMetricsEvent (eventName, eventData) {

    const userId = this.$user.getId();
    const sessionId = this.$request.getSessionId()
    const platform = CONVERSION[this.getType()];

    var sBody = {
        "name": eventName,
        "type": "customEvent",
        "userId": userId,
        "conversationId": sessionId,
        "extraInfo": eventData
    };

    
    const queryParams = {
        platform,
        v: "11.1.0-rest",
        type: 'event',
        apiKey: API_KEY
    }
    console.log(queryParams)
    const query = qs.stringify(queryParams);

    try{
        var postURL = `${BASE_URL}/track?${query}`;
        var options = {
            method: 'POST',
            uri: postURL,
            body: sBody,
            json: true // Automatically stringifies the body to JSON
        };

        await request.post(postURL, options);
    } catch (err){
        console.log(err);
    }
};

function exampleEvent (somedata) {
    return recordMetricsEvent.call(this, "Example", {
        somedata
    })
}


module.exports = {
    exampleEvent
}