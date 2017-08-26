/****************************************************************************
 ****************************************************************************
    
    Test case
    
*****************************************************************************
*****************************************************************************/
const restaurants = [
    {"name": "Stubb's"       , "geometry": {"lat": 30.268490, "lng": -97.736156}},
    {"name": "Franklin"      , "geometry": {"lat": 30.270119, "lng": -97.731273}},
    {"name": "SLAB"          , "geometry": {"lat": 30.370630, "lng": -97.725124}},
    {"name": "Stiles"        , "geometry": {"lat": 30.334553, "lng": -97.721391}},
    {"name": "Black's"       , "geometry": {"lat": 30.298485, "lng": -97.741200}},
    {"name": "Green Mesquite", "geometry": {"lat": 30.261519, "lng": -97.759200}}
];

const trails = [
    {"name": "Chisholm"    , "geometry": {"lat": 30.511925, "lng": -97.689391}},
    {"name": "Copperfield" , "geometry": {"lat": 30.388973, "lng": -97.655342}},
    {"name": "Roy and Ann" , "geometry": {"lat": 30.264217, "lng": -97.755940}},
    {"name": "Ranch Trails", "geometry": {"lat": 30.523158, "lng": -97.770973}},
    {"name": "Great Hills" , "geometry": {"lat": 30.410463, "lng": -97.755936}}
];

const breweries = [
    {"name": "Draught House", "geometry": {"lat": 30.311071, "lng": -97.742874}},
    {"name": "Brew Exchange", "geometry": {"lat": 30.270356, "lng": -97.749884}},
    {"name": "NXNW"         , "geometry": {"lat": 30.391162, "lng": -97.738351}},
    {"name": "Jester King"  , "geometry": {"lat": 30.232402, "lng": -98.000223}},
    {"name": "Lazarus"      , "geometry": {"lat": 30.261739, "lng": -97.722008}},
    {"name": "Wright Bros"  , "geometry": {"lat": 30.264564, "lng": -97.733129}}
];

// A metric allows us to make a quantitative recommendation
let metrics = [];


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
// Temporary variables
let i, j, k;
let r_i, t_j, b_k;

// Spherical perimeter, spherical area
let metric;
let perimeter, area;
let a, b, c, s, E;

for (i = 0; i < restaurants.length; i++) {
    r_i = restaurants[i];

    for (j = 0; j < trails.length; j++) {
        t_j = trails[j];

        // Calculate the distance between points
        a = spherical_distance(r_i.geometry, t_j.geometry);

        for (k = 0; k < breweries.length; k++) {
            b_k = breweries[k];

            // Calculate the distance between points
            b = spherical_distance(t_j.geometry, b_k.geometry);
            c = spherical_distance(b_k.geometry, r_i.geometry);

            // Calculate the semiperimeter
            s = (a + b + c) / 2;
            
            // Calculate the perimeter
            perimeter = 2 * r * s;

            // Calculate the excess angle
            E = 4 * Math.atan(Math.sqrt( Math.abs(Math.tan(s/2) * Math.tan((s - a)/2) * Math.tan((s - b)/2) * Math.tan((s - c)/2)) ));

            // Calculate the area
            area = E * Math.pow(r, 2);

            // Update metrics
            metric = perimeter;

            metrics.push({
                "name"       : `<p>▪ ${r_i.name}</p><p>▪ ${t_j.name}</p><p>▪ ${b_k.name}</p>`,
                "places"     : [r_i.geometry, t_j.geometry, b_k.geometry],
                "perimeter"  : perimeter,
                "area"       : area,
                "value"      : metric,
                "probability": 1 / Math.pow(Math.log(1 + metric), 2)
            });
        }
    }
}

// List our recommendations from best to worst
metrics.sort(function(a, b) {
    return a.value - b.value;
});

// Remove bad recommendations
let sum = 0;

metrics = metrics.filter(function(a) {
    if (a.perimeter < 20) {
        sum += a.probability;

        return true;
    }
})

// Assign probability of being recommended
metrics.forEach(m => m.probability /= sum);



/****************************************************************************
 ****************************************************************************
    
    Display the metrics
    
*****************************************************************************
*****************************************************************************/
let output = "";

for (let i = 0; i < metrics.length; i++) {
    output += `<tr id="${i}">
                   <td>${metrics[i].name}</td>
                   <td>${metrics[i].value.toFixed(3)}</td>
                   <td>${metrics[i].probability.toFixed(4)}</td>
               </tr>`;
}

$("#metrics tbody").html(output);



/****************************************************************************
 ****************************************************************************
    
    Display the map
    
*****************************************************************************
*****************************************************************************/
let map, markers = [];

function displayMap(places) {
    // Initialize the map
    map = new google.maps.Map(document.getElementById("map"), {
        "center": {"lat": 30.2849, "lng": -97.7341},
        "zoom"  : 13
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
        center.lat += p.lat;
        center.lng += p.lng;
    });

    center.lat /= places.length;
    center.lng /= places.length;

    map.setCenter(center);

    // Adjust the zoom level
    map.setZoom(Math.max(10, 15 - Math.floor((metrics[index].perimeter + 4) / 4)));
    
    // Place a marker for each place
    places.forEach(p => {
        var marker = new google.maps.Marker({
            "map"     : map,
            "position": p
        });

        markers.push(marker);
    });
});