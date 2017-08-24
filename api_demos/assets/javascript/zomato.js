// Find all bbq locations in Austin, TX
var api_url = "https://developers.zomato.com/api/v2.1/search?q=bbq%2C%20barbecue&lat=30.307182&lon=-97.755996&radius=100000";

$.ajax({
    url: api_url,
    method: 'GET',
    dataType: 'JSON',
    beforeSend: setHeader

}).done(function(response) {
    var restaurants = [];
    console.log(response);
    response.restaurants.forEach(r => {
    	var restaurant = {"name": r.restaurant.name,
                          "location": {"address": r.restaurant.location.address,
                          			   "city": r.restaurant.location.city,
                          			   "zipcode": r.restaurant.location.zipcode, 
                                       "longitude": parseFloat(r.restaurant.location.longitude),
                                       "latitude": parseFloat(r.restaurant.location.latitude)},
                          "image_feature": r.restaurant.featured_image,
                          "rating": {"starRating": parseFloat(r.restaurant.user_rating.aggregate_rating),
                          			 "numRatings": parseInt(r.restaurant.user_rating.votes)},
                          "price": r.restaurant.price_range,
                          "type": "bbq"
                         };
    	restaurants.push(restaurant);
    });
   
    // console.table(restaurants);

});

function setHeader(xhr) {
    xhr.setRequestHeader('user-key', 'b5ee5402ab1c74adead9b0b432d1db0f');
}