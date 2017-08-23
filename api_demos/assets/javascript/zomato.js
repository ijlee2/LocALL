// Key: b5ee5402ab1c74adead9b0b432d1db0f

// Find all bbq locations in Austin, TX
var api_url = "https://developers.zomato.com/api/v2.1/search?q=bbq%2C%20barbecue&lat=30.307182&lon=-97.755996&radius=100000";

$.ajax({
    url: api_url,
    method: 'GET',
    dataType: 'JSON',
    beforeSend: setHeader

}).done(function(response) {
    var restaurants = [];

    response.restaurants.forEach(r => restaurants.push(r.restaurant));
    
    console.table(restaurants);

});

function setHeader(xhr) {
    xhr.setRequestHeader('user-key', 'b5ee5402ab1c74adead9b0b432d1db0f');
}