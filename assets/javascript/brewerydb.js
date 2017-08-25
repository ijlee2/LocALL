// Configure API    
var api_url = "https://api.brewerydb.com/v2/?key=cc8daa1e9ba37ff2c611bfa432a7d04a";

$.ajax({
    "url"   : api_url,
    "method": "GET"}

).done(function(response) {
    console.table(response);

});

/* Alternate method
$.getJSON(api_url, function(json) {
    console.log(json);
});
*/