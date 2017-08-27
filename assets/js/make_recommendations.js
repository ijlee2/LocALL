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
    
    Configure Firebase
    
*****************************************************************************
*****************************************************************************/
const database_eat   = database.ref("events").child("eat");
const database_play  = database.ref("events").child("play");
const database_drink = database.ref("events").child("drink");
const database_recommendations = database.ref("recommendations");

function loadDatabase(eventName_eat, eventName_play, eventName_drink) {
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

loadDatabase("asian", "movie", "bar");



/****************************************************************************
 ****************************************************************************
    
    Make recommendations
    
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

const metric_max = 10;

function createRecommendations(eat, play, drink, directoryName) {
    let metrics = [], metric;

    // Temporary variables
    let a, b, c;
    let temp, total = 0;

    let event1, event2, event3;

    for (let key1 in eat) {
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

                // Remove bad recommendations
                if (metric <= metric_max) {
                    // Probability is yet to be normalized
                    temp = 1 / Math.pow(Math.log(1 + metric), 2);

                    metrics.push({
                        "eat"        : event1,
                        "play"       : event2,
                        "drink"      : event3,
                        "value"      : metric,
                        "probability": temp
                    });

                    // Tally the total for normalization
                    total += temp;
                }
            }
        }
    }

    // List our recommendations from best (low metric) to worst (high metric)
    metrics.sort(function(a, b) {
        return a.value - b.value;
    });

    // Assign the probability that a recommendation occurs
    metrics.forEach(m => m.probability /= total);

    // Save to Firebase
    database_recommendations.child(directoryName).set(metrics);
}