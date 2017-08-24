// Find all beer locations in Austin, TX
var api_url = "https://beermapping.com/webservice/loccity/68a06dbe893eb0da2b905eecb80e8c2f/austin,tx&s=json";

$.getJSON(api_url, function(response) {
    var breweries = [];

    response.forEach(b => {
        // Create a custom brewery object
        var brewery = {"name"         : b.name,
                       "location"     : {"address"  : b.street,
                                         "city"     : b.city,
                                         "state"    : b.state,
                                         "zipcode"  : b.zip,
                                         "latitude" : undefined,
                                         "longitude": undefined},
                       "website"      : b.url,
                       "image_feature": undefined,
                       // Make the rating out of 5 stars (1 decimal point)
                       "rating"       : {"starRating": Math.round(parseFloat(b.overall) / 2) / 10,
                                         "numRatings": undefined},
                       "price"        : undefined,
                       "type"         : "brewery"
                      };

        // Add the brewery object to our array
        breweries.push(brewery);
    });
    
    // Comment this to hide the breweries array on the console
    console.table(breweries);
});