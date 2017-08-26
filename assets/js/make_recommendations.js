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
const database_eat = database.ref("activities").child("eat");

function loadDatabase(activity_eat, activity_play, activity_drink) {
    let eat = [], play = [], drink = [];

    // When the page loads, or when a user adds a train
    database_eat.child(`${activity_eat.name}`).on("child_added", function(snapshot) {
        console.log(snapshot.val());

        // Get the data
        eat.push(snapshot.val());
    });
}

loadDatabase({"type": "eat", "name": "asian"});


/****************************************************************************
 ****************************************************************************
    
    Test case
    
*****************************************************************************
*****************************************************************************/
const eat = [
    {"name": "Stubb's"       , "geometry": {"lat": 30.268490, "lng": -97.736156}},
    {"name": "Franklin"      , "geometry": {"lat": 30.270119, "lng": -97.731273}},
    {"name": "SLAB"          , "geometry": {"lat": 30.370630, "lng": -97.725124}},
    {"name": "Stiles"        , "geometry": {"lat": 30.334553, "lng": -97.721391}},
    {"name": "Black's"       , "geometry": {"lat": 30.298485, "lng": -97.741200}},
    {"name": "Green Mesquite", "geometry": {"lat": 30.261519, "lng": -97.759200}}
];

const play = [
    {"name": "Chisholm"    , "geometry": {"lat": 30.511925, "lng": -97.689391}},
    {"name": "Copperfield" , "geometry": {"lat": 30.388973, "lng": -97.655342}},
    {"name": "Roy and Ann" , "geometry": {"lat": 30.264217, "lng": -97.755940}},
    {"name": "Ranch Trails", "geometry": {"lat": 30.523158, "lng": -97.770973}},
    {"name": "Great Hills" , "geometry": {"lat": 30.410463, "lng": -97.755936}}
];

const drink = [
    {"name": "Draught House", "geometry": {"lat": 30.311071, "lng": -97.742874}},
    {"name": "Brew Exchange", "geometry": {"lat": 30.270356, "lng": -97.749884}},
    {"name": "NXNW"         , "geometry": {"lat": 30.391162, "lng": -97.738351}},
    {"name": "Jester King"  , "geometry": {"lat": 30.232402, "lng": -98.000223}},
    {"name": "Lazarus"      , "geometry": {"lat": 30.261739, "lng": -97.722008}},
    {"name": "Wright Bros"  , "geometry": {"lat": 30.264564, "lng": -97.733129}}
];



/****************************************************************************
 ****************************************************************************
    
    Useful objects
    
*****************************************************************************
*****************************************************************************/
// A metric allows us to make a quantitative recommendation
let   metrics    = [];
const metric_max = 20;

// For Google Maps
let   map;
const coordinates_austin = {"lat": 30.2849, "lng": -97.7341};
let   markers     = [];
const markerIcons = {
    "eat"  : "assets/images/eat.png",
    "play" : "assets/images/play.png",
    "drink": "assets/images/drink.png"
};



/****************************************************************************
 ****************************************************************************
    
    Distance formula
    
*****************************************************************************
*****************************************************************************/
const deg_to_rad = Math.PI / 180;

// Radius of Earth (in miles)
const r = 6371 / 1.60934;

function euclidean_distance(point1, point2) {
    // Find the Cartesian coordinates of point1
    const cos_lat1 = Math.cos(point1.lat * deg_to_rad);
    const sin_lat1 = Math.sin(point1.lat * deg_to_rad);
    const cos_lng1 = Math.cos(point1.lng * deg_to_rad);
    const sin_lng1 = Math.cos(point1.lng * deg_to_rad);

    const x1 = cos_lat1 * cos_lng1;
    const y1 = cos_lat1 * sin_lng1;
    const z1 = sin_lat1;

    // Find the Cartesian coordinates of point2
    const cos_lat2 = Math.cos(point2.lat * deg_to_rad);
    const sin_lat2 = Math.sin(point2.lat * deg_to_rad);
    const cos_lng2 = Math.cos(point2.lng * deg_to_rad);
    const sin_lng2 = Math.cos(point2.lng * deg_to_rad);

    const x2 = cos_lat2 * cos_lng2;
    const y2 = cos_lat2 * sin_lng2;
    const z2 = sin_lat2;

    // Find the distance (normalized by r)
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
}

// Haversine formula
function spherical_distance(point1, point2) {
    const lat1_rad = point1.lat * deg_to_rad;
    const lng1_rad = point1.lng * deg_to_rad;

    const lat2_rad = point2.lat * deg_to_rad;
    const lng2_rad = point2.lng * deg_to_rad;

    // Find the distance (normalized by r)
    return 2 * Math.sqrt(Math.pow(Math.sin((lat2_rad - lat1_rad) / 2), 2) + Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.pow(Math.sin((lng2_rad - lng1_rad) / 2), 2));
}



/****************************************************************************
 ****************************************************************************
    
    Make recommendations
    
*****************************************************************************
*****************************************************************************/
let metric;
let probability, probability_total = 0;

// Temporary variables
let perimeter, area;
let a, b, c, s, E;

eat.forEach(activity_i => {
    play.forEach(activity_j => {
        // Find the distance between points
        a = spherical_distance(activity_i.geometry, activity_j.geometry);

        drink.forEach(activity_k => {
            // Find the distance between points
            b = spherical_distance(activity_j.geometry, activity_k.geometry);
            c = spherical_distance(activity_k.geometry, activity_i.geometry);

            // Semiperimeter, perimeter
            s = (a + b + c) / 2;
            perimeter = 2 * r * s;

            // Excess angle, area
            E = 4 * Math.atan(Math.sqrt( Math.abs(Math.tan(s/2) * Math.tan((s - a)/2) * Math.tan((s - b)/2) * Math.tan((s - c)/2)) ));
            area = E * Math.pow(r, 2);

            // Calculate the metric
            metric = perimeter;

            // Remove bad recommendations
            if (metric <= metric_max) {
                probability = 1 / Math.pow(Math.log(1 + metric), 2);

                metrics.push({
                    "name"       : `<p>▪ ${activity_i.name}</p><p>▪ ${activity_j.name}</p><p>▪ ${activity_k.name}</p>`,
                    "places"     : [
                        {"type": "eat"  , "geometry": activity_i.geometry},
                        {"type": "play" , "geometry": activity_j.geometry},
                        {"type": "drink", "geometry": activity_k.geometry}
                    ],
                    "perimeter"  : perimeter,
                    "area"       : area,
                    "value"      : metric,
                    "probability": probability
                });

                // Tally the total
                probability_total += probability;
            }
        });
    });
});

// List our recommendations from best (low metric) to worst (high metric)
metrics.sort(function(a, b) {
    return a.value - b.value;
});

// Assign the probability that a recommendation occurs
metrics.forEach(m => m.probability /= probability_total);



/****************************************************************************
 ****************************************************************************
    
    Display the metrics
    
*****************************************************************************
*****************************************************************************/
let output = "";

metrics.forEach(m => output += `<tr><td>${m.name}</td><td>${m.value.toFixed(3)}</td><td>${m.probability.toFixed(4)}</td></tr>`);

$("#metrics tbody").html(output);



/****************************************************************************
 ****************************************************************************
    
    Display the map
    
*****************************************************************************
*****************************************************************************/
function displayMap() {
    // Initialize the map (only allow zooms)
    map = new google.maps.Map(document.getElementById("map"), {
        "center"          : coordinates_austin,
        "disableDefaultUI": true,
        "zoomControl"     : true,
        "zoom"            : 13
    });
}

$("tbody tr").on("click", function() {
    // Delete existing markers
    markers.forEach(m => m.setMap(null));
    markers = [];
    
    // Find out which row was clicked
    const index  = $("tbody tr").index(this);
    const places = metrics[index].places;
    
    // Adjust the center of the map
    let center = {"lat": 0, "lng": 0};
    
    places.forEach (p => {
        center.lat += p.geometry.lat;
        center.lng += p.geometry.lng;
    });

    center.lat /= places.length;
    center.lng /= places.length;

    map.setCenter(center);

    // Adjust the zoom level
    map.setZoom(Math.max(10, 15 - Math.floor(1 + metrics[index].perimeter / 4)));
    
    // Place a marker for each place
    places.forEach(p => {
        var marker = new google.maps.Marker({
            "map"     : map,
            "position": p.geometry,
            "icon"    : markerIcons[p.type]
        });

        markers.push(marker);
    });
});