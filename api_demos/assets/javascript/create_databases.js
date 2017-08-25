/****************************************************************************
 ****************************************************************************
    
    Configure Firebase
    
*****************************************************************************
*****************************************************************************/
const config = {
    apiKey: "AIzaSyDjGV94on0gidAzG2sLCy5F8s-tkQXAzPc",
    authDomain: "locall-atx512.firebaseapp.com",
    databaseURL: "https://locall-atx512.firebaseio.com",
    projectId: "locall-atx512",
    storageBucket: "locall-atx512.appspot.com",
    messagingSenderId: "1032168672035"
  };

firebase.initializeApp(config);

const database = firebase.database();



/****************************************************************************
 ****************************************************************************
    
    Useful objects
    
*****************************************************************************
*****************************************************************************/
// Search radius in miles
let user = {"city"      : "Austin",
            "state"     : "Texas",
            "state_abbr": "TX",
            "latitude"  :  30.307182,
            "longitude" : -97.755996,
            "radius"    : 50
           };

// For API calls
let query, parameters, api_url;

// Database (arrays) that we want to populate and send to Firebase
const restaurants = [], trails = [], breweries = [];

// For Google Maps
let map;
const markers = [];


/****************************************************************************
 ****************************************************************************
    
    Zomato API (Restaurants)
    
*****************************************************************************
*****************************************************************************/
// Find all bbq locations in Austin, TX
query      = "bbq%2C%20barbecue";
parameters = {"q"     : query,
              "lat"   : user.latitude,
              "lon"   : user.longitude,
              "radius": 1609.34 * user.radius
             };
api_url    = "https://developers.zomato.com/api/v2.1/search?" + $.param(parameters);

$.ajax({
    url       : api_url,
    method    : 'GET',
    dataType  : 'JSON',
    beforeSend: setHeader_zomato

}).done(function(response) {
    // For each restaurant that Zomato API provides us
    response.restaurants.forEach(r => {
        // Extract the information that we want
        let restaurant = {"name"         : r.restaurant.name,
                          "location"     : {"address"  : r.restaurant.location.address,
                                            "city"     : r.restaurant.location.city,
                                            "state"    : "TX",
                                            "zipcode"  : r.restaurant.location.zipcode,
                                            "latitude" : parseFloat(r.restaurant.location.latitude),
                                            "longitude": parseFloat(r.restaurant.location.longitude)
                                           },
                          "website"      : null,
                          "image_feature": r.restaurant.featured_image,
                          "rating"       : {"starRating": parseFloat(r.restaurant.user_rating.aggregate_rating),
                                            "numRatings": parseInt(r.restaurant.user_rating.votes)
                                           },
                          "type"         : "bbq"
                         };

        // Store the information in our array
        restaurants.push(restaurant);
    });

    /* TODO - Jacque: Save the restaurants array to Firebase. */
    database.ref().push({
      restaurant: restaurants
    });

    // Display the array on the console
    console.log("-- Restaurants --");
    console.table(restaurants);

  // });
});

function setHeader_zomato(xhr) {
    // API key for Zomato
    xhr.setRequestHeader('user-key', 'b5ee5402ab1c74adead9b0b432d1db0f');
}



/****************************************************************************
 ****************************************************************************
    
    Trail API (Trails)
    
*****************************************************************************
*****************************************************************************/
// Find all hiking trails in Austin, TX
query      = "hiking";
parameters = {"q[activities_activity_type_name_eq]": query,
              "q[city_cont]"                       : user.city,
              "q[state_cont]"                      : user.state,
              "radius"                             : user.radius
             };
api_url    = "https://trailapi-trailapi.p.mashape.com/?" + $.param(parameters);

$.ajax({
    url       : api_url,
    method    : 'GET',
    dataType  : 'JSON',
    beforeSend: setHeader_trails

}).done(function(response) {
    // For each trail that Trails API provides us
    response.places.forEach(p => {
        // Extract the information that we want
        let trail = {"name"         : p.name,
                     "location"     : {"address"  : null,
                                       "city"     : p.city,
                                       "state"    : p.state,
                                       "zipcode"  : null,
                                       "latitude" : p.lat,
                                       "longitide": p.lon
                                      },
                     "website"      : p.activities[0].url,
                     "image_feature": null,
                     "rating"       : {"starRating": p.activities[0].rating,
                                       "numRatings": null
                                      },
                     "type"         : p.activities[0].activity_type_name
                    };

        // Store the information in our array
        trails.push(trail);
    });

    /* TODO - Jacque: Save the trails array to Firebase. */
    database.ref().push({
      trails: trails
    });
    
    // Display the array on the console
    console.log("-- Trails --");
    console.table(trails);
});

function setHeader_trails(xhr) {
    xhr.setRequestHeader('X-Mashape-Key', 'YJAiQK0Cirmshoi4JIWN51e4ZBWzp1FCJuTjsng1orgLvIxQK9');
}



/****************************************************************************
 ****************************************************************************
    
    Trail API (Trails)
    
*****************************************************************************
*****************************************************************************/
// Find all beer locations in Austin, TX
api_url = `https://beermapping.com/webservice/loccity/68a06dbe893eb0da2b905eecb80e8c2f/${user.city},${user.state_abbr}&s=json`;

$.getJSON(api_url, function(response) {
    // For each brewery that Beer Mapping API provides us
    response.forEach(b => {
        // Extract the information that we want
        var brewery = {"name"         : b.name,
                       "location"     : {"address"  : b.street,
                                         "city"     : b.city,
                                         "state"    : b.state,
                                         "zipcode"  : b.zip,
                                         "latitude" : null,
                                         "longitude": null
                                        },
                       "website"      : b.url,
                       "image_feature": null,
                       // Make the rating out of 5 stars (1 decimal point)
                       "rating"       : {"starRating": Math.round(parseFloat(b.overall) / 2) / 10,
                                         "numRatings": null
                                        },
                       "type"         : "brewery"
                      };

        // Store the information in our array
        breweries.push(brewery);
    });

    /* TODO - Jacque: Save the breweries array to Firebase. */
    database.ref().push({
      breweries: breweries
    });
    
    // Display the array on the console
    console.log("-- Breweries --");
    console.table(breweries);
});



/****************************************************************************
 ****************************************************************************
    
    Google Maps API
    
*****************************************************************************
*****************************************************************************/
let places = [{"name"     : "Rudy's BBQ",
               "address"  : "512 W 29th Street, Austin 78705",
               "latitude" : 30.2953166667,
               "longitude": -97.7423694444},
               
              {"name"     : "Bert's BBQ",
               "address"  : "907 W 24th Street, Austin 78705",
               "latitude" : 30.2881055556,
               "longitude": -97.7474527778},
               
              {"name"     : "BBQ Revolution",
               "address"  : "3111 Manor Road, Austin 78723",
               "latitude" : 30.3154988,
               "longitude": -97.7167106}
             ];

function displayMap() {
    // Where we want Google Maps to zoom in
    let center = {"lat": 0, "lng": 0};

    // Take the average location of all places
    places.forEach(p => {
        center.lat += p.latitude;
        center.lng += p.longitude;
    });

    center.lat /= places.length;
    center.lng /= places.length;

    // Create the map
    map = new google.maps.Map(document.getElementById("map"), {
        "center": center,
        "zoom"  : 13
    });
    
    // Place a marker for each place
    places.forEach(p => {
        let marker = new google.maps.Marker({
            "position": {"lat": p.latitude,
                         "lng": p.longitude},
            "map": map
        });

        // Store the markers for future reference
        markers.push(marker);
    });
}