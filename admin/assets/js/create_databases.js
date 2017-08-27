/****************************************************************************
 ****************************************************************************
    
    Configure Firebase
    
*****************************************************************************
*****************************************************************************/
const config = {
    "apiKey"           : "AIzaSyDjGV94on0gidAzG2sLCy5F8s-tkQXAzPc",
    "authDomain"       : "locall-atx512.firebaseapp.com",
    "databaseURL"      : "https://locall-atx512.firebaseio.com",
    "projectId"        : "locall-atx512",
    "storageBucket"    : "locall-atx512.appspot.com",
    "messagingSenderId": "1032168672035"
};

firebase.initializeApp(config);

const database = firebase.database();

// ADMIN TODO: Uncomment to remove existing databases (be careful!)
//database.ref("events").remove();



/****************************************************************************
 ****************************************************************************
    
    Useful objects
    
*****************************************************************************
*****************************************************************************/
// For Google Maps
let   map, service;
const delayBetweenAPICalls = 6000;

const location_austin = {"lat": 30.2849, "lng": -97.7341};
const searchRadius    = 20 * 1609.34;

// ADMIN TODO: Do 10 queries at a time (change query_index from 0 to 1)
// (Google Maps limits the number of calls)
const query_index = 0;
const queries = [
    [
        {"keyword": "asian"  , "type": ["restaurant"]   , "event": {"type": "eat"  , "name": "asian"  }},
        {"keyword": "bbq"    , "type": ["restaurant"]   , "event": {"type": "eat"  , "name": "bbq"    }},
        {"keyword": "pizza"  , "type": ["restaurant"]   , "event": {"type": "eat"  , "name": "pizza"  }},
        {"keyword": "indian" , "type": ["restaurant"]   , "event": {"type": "eat"  , "name": "indian" }},
        {"keyword": "texmex" , "type": ["restaurant"]   , "event": {"type": "eat"  , "name": "tex-mex"}},

        {"keyword": "bowling", "type": ["bowling_alley"], "event": {"type": "play" , "name": "bowl"   }},
        {"keyword": "trail"  , "type": ["park"]         , "event": {"type": "play" , "name": "hike"   }},
        {"keyword": "theater", "type": ["movie_theater"], "event": {"type": "play" , "name": "movie"  }},
        {"keyword": "spa"    , "type": ["spa"]          , "event": {"type": "play" , "name": "spa"    }},
        {"keyword": "pool"   , "type": ["park"]         , "event": {"type": "play" , "name": "swim"   }}
    ],

    [
        {"keyword": "bar"    , "type": ["bar"]          , "event": {"type": "drink", "name": "bar"    }},
        {"keyword": "brewery", "type": ["bar"]          , "event": {"type": "drink", "name": "brewery"}},
        {"keyword": "coffee" , "type": ["cafe"]         , "event": {"type": "drink", "name": "coffee" }},
        {"keyword": "tea"    , "type": ["cafe"]         , "event": {"type": "drink", "name": "tea"    }},
        {"keyword": "wine"   , "type": ["bar"]          , "event": {"type": "drink", "name": "wine"   }}
    ]
];



/****************************************************************************
 ****************************************************************************
    
    Google Maps API
    
*****************************************************************************
*****************************************************************************/
function createDatabases() {
    // Initialize the map (only allow zooms)
    map = new google.maps.Map(document.getElementById('map'), {
        "center"          : location_austin,
        "disableDefaultUI": true,
        "zoomControl"     : true,
        "zoom"            : 11
    });

    service = new google.maps.places.PlacesService(map);
    
    // Create a database for each query
    queries[query_index].forEach(q => {
        service.nearbySearch({
            keyword : q.keyword,
            location: location_austin,
            radius  : searchRadius,
            type    : q.type

        }, function(results, status) {
            getPlaceIDs(results, status, q.event);

        });
    });
}

function getPlaceIDs(results, status, event) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        let i = 0;

        // Delay calling getPlaceDetails to avoid OVER_QUERY_LIMIT status
        const intervalID = setInterval(function() {
            // Get the place ID from Google Maps API
            service.getDetails({
                "placeId": results[i].place_id
            
            // Use an anonymous function to pass an extra parameter
            }, function(place, status) {
                // Find the place details
                getPlaceDetails(place, status, event);

            });

            i++;

            if (i === results.length) {
                clearInterval(intervalID);
            }

        }, delayBetweenAPICalls);
    }
}

function getPlaceDetails(place, status, event) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        /********************************************************************
            
            Clean the data
            
        *********************************************************************/
        // Find the street name, city, state, and zip code
        const address = place.formatted_address;

        const temp     = address.split(",");
        const location = {
            "address": address,
            "street" : temp[0].trim(),
            "city"   : temp[1].trim(),
            "state"  : temp[2].trim().substring(0, 2),
            "zipcode": temp[2].trim().substring(3)
        };

        // Find the latitude and longitude
        const geometry = {
            "lat": place.geometry.location.lat(),
            "lng": place.geometry.location.lng()
        };

        // Provide null value if an information is missing
        // (Firebase does not allow undefined)
        const phone      = (typeof place.formatted_phone_number !== "undefined") ? place.formatted_phone_number : null;
        const hours      = (typeof place.opening_hours !== "undefined") ? place.opening_hours.weekday_text : null;
        const websiteURL = (typeof place.website !== "undefined") ? place.website : null;
        const imageURL   = (typeof place.photos  !== "undefined") ? place.photos[0].getUrl({"maxWidth": 600, "maxHeight": 600}) : null;
        const rating     = (typeof place.rating  !== "undefined") ? place.rating : null;
        const reviews    = (typeof place.reviews !== "undefined") ? place.reviews : null;

        // Save the information that we want
        const placeData = {
            "id"      : place.place_id,
            "name"    : place.name,
            "location": location,
            "geometry": geometry,
            "phone"   : phone,
            "hours"   : hours,
            "website" : websiteURL,
            "image"   : imageURL,
            "rating"  : rating,
            "reviews" : reviews
        };

        database.ref(`events/${event.type}`).child(event.name).push(placeData);

    } else {
        // Use this message to determine delayBetweenAPICalls
        console.error(`${event.type}, ${event.name}: Data read failed.`);

    }
}