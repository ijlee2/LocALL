// Find all beer locations in Austin, TX
var api_url = "https://beermapping.com/webservice/loccity/68a06dbe893eb0da2b905eecb80e8c2f/austin,tx&s=json";

$.getJSON(api_url, function(json) {
    console.table(json);
});