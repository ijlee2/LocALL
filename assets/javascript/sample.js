// For Yelp Fusion
'use strict';

const yelp = require('yelp-fusion');

// Place holders for Yelp Fusion's OAuth 2.0 credentials. Grab them
// from https://www.yelp.com/developers/v3/manage_app
const clientId = 'bqDHXvgStkwAiVaPtAUgaw';
const clientSecret = '7QfdPckMiikGYc4V3cd9EwhxDPQH6zmxG4Oa76iHo2NLKKPEDLDriJiyCiXttRYk';

const searchRequest = {
  term:'bbq',
  location: 'austin, tx'
};

yelp.accessToken(clientId, clientSecret).then(response => {
  const client = yelp.client(response.jsonBody.access_token);

  client.search(searchRequest).then(response => {
    const firstResult = response.jsonBody.businesses[0];
    const prettyJson = JSON.stringify(firstResult, null, 4);
    console.log(prettyJson);
  });
}).catch(e => {
  console.log(e);
});