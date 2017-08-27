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



/****************************************************************************
 ****************************************************************************
    
    Useful objects
    
*****************************************************************************
*****************************************************************************/
// For Firebase
const database_eat   = database.ref("events").child("eat");
const database_play  = database.ref("events").child("play");
const database_drink = database.ref("events").child("drink");
const database_recommendations = database.ref("recommendations");

const eventNames_eat   = ["asian"  , "bbq"    , "indian" , "pizza"  , "tex-mex"];
const eventNames_play  = ["bowl"   , "hike"   , "movie"  , "spa"    , "swim"   ];
const eventNames_drink = ["bar"    , "brewery", "coffee" , "tea"    , "wine"   ];

const metric_max = 10;

function loadDatabases(eventName_eat, eventName_play, eventName_drink) {
    let   eat, play, drink;
    const directoryName = `${eventName_eat}_${eventName_play}_${eventName_drink}`;

    // When the page loads
    database_eat.child(eventName_eat).on("value", function(snapshot) {
        eat = snapshot.val();

        database_play.child(eventName_play).on("value", function(snapshot) {
            play = snapshot.val();

            database_drink.child(eventName_drink).on("value", function(snapshot) {
                drink = snapshot.val();

                createRecommendations(eat, play, drink, directoryName);
            });
        });
    });
}

// Do 25 queries at a time (change index from 0 to 4)
const index = 0;

eventNames_play.forEach(eventName_play =>
    eventNames_drink.forEach(eventName_drink =>
        loadDatabases(eventNames_eat[index], eventName_play, eventName_drink)
    )
)



/****************************************************************************
 ****************************************************************************
    
    Create recommendations
    
*****************************************************************************
*****************************************************************************/
const deg_to_rad = Math.PI / 180;

// Radius of Earth (in miles)
const r = 6371 / 1.60934;

// Haversine formula
function spherical_distance(point1, point2) {
    const lat1_rad = point1.lat * deg_to_rad;
    const lng1_rad = point1.lng * deg_to_rad;

    const lat2_rad = point2.lat * deg_to_rad;
    const lng2_rad = point2.lng * deg_to_rad;

    // Find the distance (normalized by r)
    return 2 * Math.sqrt(Math.pow(Math.sin((lat2_rad - lat1_rad) / 2), 2) + Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.pow(Math.sin((lng2_rad - lng1_rad) / 2), 2));
}

function createRecommendations(eat, play, drink, directoryName) {
    // Variables that we will store in Firebase
    let data = [], numData = 0, bins = [0];

    // Temporary variables
    let a, b, c;
    let metric;
    let temp, total = 0;

    let event1, event2, event3;
    let latitude, longitude;

    for (let key1 in eat) {
        // Ignore the proto method
        if (!eat.hasOwnProperty(key1)) {
            continue;
        }

        event1 = eat[key1];

        for (let key2 in play) {
            if (!play.hasOwnProperty(key2)) {
                continue;
            }

            event2 = play[key2];

            // Find the distance between points
            a = spherical_distance(event1.geometry, event2.geometry);

            for (let key3 in drink) {
                if (!drink.hasOwnProperty(key3)) {
                    continue;
                }

                event3 = drink[key3];

                // Find the distance between points
                b = spherical_distance(event2.geometry, event3.geometry);
                c = spherical_distance(event3.geometry, event1.geometry);

                // Spherical perimeter
                metric = r * (a + b + c);

                // Save only good recommendations
                if (metric <= metric_max) {
                    numData++;

                    // Find the center of the 3 places
                    latitude  = (event1.geometry.lat + event2.geometry.lat + event3.geometry.lat) / 3;
                    longitude = (event1.geometry.lng + event2.geometry.lng + event3.geometry.lng) / 3;

                    // Probability is yet to be normalized
                    temp = 1 / Math.pow(Math.log(1 + metric), 2);

                    data.push({
                        "eat"        : event1,
                        "play"       : event2,
                        "drink"      : event3,
                        "center"     : {"lat": latitude, "lng": longitude},
                        "metric"     : metric,
                        "probability": temp
                    });

                    // Tally the total for normalization
                    total += temp;
                }
            }
        }
    }

    // List our recommendations from best (low metric) to worst (high metric)
    data.sort(function(a, b) {
        return a.metric - b.metric;
    });

    // Assign the probability that a recommendation occurs
    let bin_count = 0;

    data.forEach(m => {
        m.probability /= total;

        bin_count += Math.round(1000000 * m.probability);

        bins.push(bin_count);
    });

    // Save to Firebase
    database_recommendations.child(directoryName).set({
        "data"   : data,
        "numData": numData,
        "bins"   : bins
    });

    console.log(`${directoryName} successfully created.\nNumber of recommendations: ${numData}`);
}