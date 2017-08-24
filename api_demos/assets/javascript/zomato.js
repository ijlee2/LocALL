// Find all bbq locations in Austin, TX
var api_url = "https://developers.zomato.com/api/v2.1/search?q=bbq%2C%20barbecue&lat=30.307182&lon=-97.755996&radius=100000";

$.ajax({
    url       : api_url,
    method    : 'GET',
    dataType  : 'JSON',
    beforeSend: setHeader

}).done(function(response) {
    console.log(response.restaurants);
    var restaurants = [];

    response.restaurants.forEach(r => {
        // Create a custom restaurant object
        var restaurant = {"name"         : r.restaurant.name,
                          "location"     : {"address"  : r.restaurant.location.address,
                                            "city"     : r.restaurant.location.city,
                                            "state"    : "TX",
                                            "zipcode"  : r.restaurant.location.zipcode,
                                            "longitude": parseFloat(r.restaurant.location.longitude),
                                            "latitude" : parseFloat(r.restaurant.location.latitude)},
                          "website"      : undefined,
                          "image_feature": r.restaurant.featured_image,
                          "rating"       : {"starRating": parseFloat(r.restaurant.user_rating.aggregate_rating),
                                            "numRatings": parseInt(r.restaurant.user_rating.votes)},
                          "price"        : r.restaurant.price_range,
                          "type"         : "bbq"
                         };

        // Add the restaurant object to our array
    	restaurants.push(restaurant);
    });
    
    // Uncomment this to see the restaurants array on the console
    // console.table(restaurants);
});

function setHeader(xhr) {
    xhr.setRequestHeader('user-key', 'b5ee5402ab1c74adead9b0b432d1db0f');
}