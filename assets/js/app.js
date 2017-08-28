$(".dropdown-toggle").dropdown("update");

function displayPage(page) {
    $(".page").hide();
    $(`.page:nth-of-type(${page + 1})`).show();
};



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

const database_recommendations = firebase.database().ref("recommendations");



/****************************************************************************
 ****************************************************************************
    
    Initialize
    
*****************************************************************************
*****************************************************************************/
// For making recommendations
let   recommendations;
const numRecommendations_max = 10, metric_max = 7;

// For Google Maps
let   map, infowindow;
let   markers     = [];
const markerIcons = {
    "eat"  : "assets/images/eat.png",
    "play" : "assets/images/play.png",
    "drink": "assets/images/drink.png"
};



/****************************************************************************
 ****************************************************************************
    
    Make recommendations
    
*****************************************************************************
*****************************************************************************/
let eventType, eventName;
let eventName_eat = "", eventName_play = "", eventName_drink = "", eventName_location = "";

$(".dropdown-item").click(function() {
    const eventName = $(this).text();

    const type = Math.floor($(".dropdown-item").index(this) / 5);

    if (type === 0) {
        eventType = "eat";
        eventName_eat = eventName.toLowerCase();

    } else if (type === 1) {
        eventType = "play";
        eventName_play = eventName.toLowerCase();

    } else if (type === 2) {
        eventType = "drink";
        eventName_drink = eventName.toLowerCase();

    } else if (type === 3) {
        eventType = "location";
        eventName_location = eventName.toLowerCase();

    }
    
    $(`#button_${eventType}`).text(eventName);

    let myLocation;

    switch (eventName_location) {
        case "central": 
            myLocation = {"lat": 30.284919, "lng": -97.734057};  // UT Austin
            break;

        case "north":
            myLocation = {"lat": 30.402065, "lng": -97.725883};  // The Domain
            break;

        case "west":
            myLocation = {"lat": 30.343171, "lng": -97.835514};  // Emma Long Metropolitan Park
            break;
        
        case "east": 
            myLocation = {"lat": 30.263466, "lng": -97.695904};  // Austin Bouldering Project
            break;

        case "south":
            myLocation = {"lat": 30.256079, "lng": -97.763509};  // Alamo Drafthouse South Lamar
            break;
    }

    // Display recommendations once the user selects all options
    if (eventName_eat !== "" && eventName_play !== "" && eventName_drink !== "" && eventName_location !== "") {
        displayRecommendations(eventName_eat, eventName_play, eventName_drink, myLocation);
    }
});



/****************************************************************************
 ****************************************************************************
    
    Distance formula
    
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

    // Find the distance
    return 2 * r * Math.sqrt(Math.pow(Math.sin((lat2_rad - lat1_rad) / 2), 2) + Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.pow(Math.sin((lng2_rad - lng1_rad) / 2), 2));
}


/****************************************************************************
 ****************************************************************************
    
    Create recommendations
    
*****************************************************************************
*****************************************************************************/
function createBins(data) {
    let bins = [0];
    let bin_count = 0;

    data.forEach(d => {
        bin_count += Math.round(1000000 * d.probability);

        bins.push(bin_count);
    });

    return bins;
}


function displayRecommendations(eventName_eat, eventName_play, eventName_drink, myLocation) {
    const directoryName = `${eventName_eat}_${eventName_play}_${eventName_drink}`;
    
    // Temporary variables
    let i, j;
    let bins, bin_max;
    let randomNumber;

    database_recommendations.child(directoryName).once("value", function(snapshot) {
        // Reset our recommendations
        recommendations = [];

        // Recommend events near the user
        let data = snapshot.val().filter(function(a) {
            return spherical_distance(a.center, myLocation) < metric_max;
        });

        // Return a finite number of recommendations at random
        for (i = 0; i < numRecommendations_max; i++) {
            // Create bins
            bins    = createBins(data);
            bin_max = bins[bins.length - 1];

            // Select a number at random
            randomNumber = Math.floor(bin_max * Math.random());

            // Find the correct bin
            for (j = 0; j < (bins.length - 1); j++) {
                if (bins[j] <= randomNumber && randomNumber < bins[j + 1]) {
                    // Save the recommendation
                    recommendations.push(...data.splice(j, 1));

                    break;
                }
            }
        }
        
        // Display recommendations
        let names, output = "";

        recommendations.forEach(r => {
            names = `<p>▪ ${r.eat.name}</p><p>▪ ${r.play.name}</p><p>▪ ${r.drink.name}</p>`;

            output += `<tr><td>${names}</td><td>${r.metric.toFixed(3)}</td></tr>`;
        });

        $("#recommendations tbody").html(output);
    });
}



/****************************************************************************
 ****************************************************************************
    
    Display the map
    
*****************************************************************************
*****************************************************************************/
function displayMap() {
    // Initialize the map (only allow zooms)
    map = new google.maps.Map(document.getElementById("map"), {
        "center"          : {"lat": 30.2849, "lng": -97.7341},
        "disableDefaultUI": true,
        "zoomControl"     : true,
        "zoom"            : 13
    });

    infowindow = new google.maps.InfoWindow();
}

// Respond to clicks on dynamically generated rows
$("body").on("click", "tbody tr", function() {
    // Delete existing markers
    markers.forEach(m => m.setMap(null));
    markers = [];
    
    // Find out which row was clicked
    const r      = recommendations[$("tbody tr").index(this)];
    const places = {"eat": r.eat, "play": r.play, "drink": r.drink};
    
    // Adjust the center of the map
    map.setCenter(r.center);

    // Adjust the zoom level
    map.setZoom(Math.max(10, 15 - Math.floor(1 + r.metric / 3)));
    
    // Place a marker for each place
    for (let key in places) {
        const marker = new google.maps.Marker({
            "map"     : map,
            "position": places[key].geometry,
            "icon"    : markerIcons[key]
        });

        google.maps.event.addListener(marker, "click", function() {
            const output = `<div><strong>${places[key].name}</strong><br>${places[key].location.address}</div>`;

            infowindow.setContent(output);
            infowindow.open(map, this);
        });

        markers.push(marker);
    }
});