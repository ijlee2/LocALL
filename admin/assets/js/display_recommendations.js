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
numRecommendations = 20;

// For Google Maps
let   map;
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
let eventName_eat = "", eventName_play = "", eventName_drink = "", myLocation = "";

// Handle button clicks
$("li").click(function() {
    const eventType = $(this).parent().attr("id");
    const eventName = $(this).text().toLowerCase();

    // Highlight the user's choices
    var index = $("li").index(this) % 5;

    $(`#${eventType} li`).css({
        "background-color": "var(--color-background)",
        "color"           : "var(--color-text)"}
    );
    $(`#${eventType} li:nth-of-type(${index + 1})`).css({
        "background-color": "var(--color-light-blue)",
        "color"           : "var(--color-text-contrast)"
    });

    switch (eventType) {
        case "eat":
            eventName_eat = eventName;
            break;

        case "play":
            eventName_play = eventName;
            break;

        case "drink":
            eventName_drink = eventName;
            break;

        case "location":
            if (eventName === "central") {
                myLocation = {"lat": 30.284919, "lng": -97.734057};  // UT Austin

            } else if (eventName === "north") {
                myLocation = {"lat": 30.402065, "lng": -97.725883};  // The Domain

            } else if (eventName === "west") {
                myLocation = {"lat": 30.343171, "lng": -97.835514};  // Emma Long Metropolitan Park

            } else if (eventName === "east") {
                myLocation = {"lat": 30.263466, "lng": -97.695904};  // Austin Bouldering Project

            } else if (eventName === "south") {
                myLocation = {"lat": 30.256079, "lng": -97.763509};  // Alamo Drafthouse South Lamar

            }

            break;

    }

    // Display recommendations once the user selects all options
    if (eventName_eat !== "" && eventName_play !== "" && eventName_drink !== "" && myLocation !== "") {
        displayRecommendations(eventName_eat, eventName_play, eventName_drink);
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
let recommendations;

function createBins(data) {
    let bin_count = 0;

    data.forEach(d => {
        bin_count += Math.round(1000000 * d.probability);

        bins.push(bin_count);
    });
}


function displayRecommendations(eventName_eat, eventName_play, eventName_drink) {
    const directoryName = `${eventName_eat}_${eventName_play}_${eventName_drink}`;

    database_recommendations.child(directoryName).on("value", function(snapshot) {
        // Reset our recommendations
        recommendations = [];

        // Read database from Firebase
        let data    = snapshot.val().data;
        let numData = snapshot.val().numData;
        let bins    = snapshot.val().bins;


        // Randomly select recommendations
        var maximum = bins[bins.length - 1];
        var randomNumbers = [];

        for (var i = 0; i < 20; i++) {
            var randomNumber = Math.floor(Math.random() * (maximum + 1));

            // If randomNumber already exists in randomNumbers array
            while (randomNumbers.indexOf(randomNumber) >= 0) {
                // Generate a new random number
                randomNumber = Math.floor(Math.random() * (maximum + 1));
            }

            randomNumbers.push(randomNumber);

            for (var index = 0; index < numData; index++) {
                if (bins[index] <= randomNumber && randomNumber <= bins[index + 1]) {
                    recommendations.push(data[index]);

                    break;
                }
            }

        }

        // Display recommendations close to the user
        recommendations = recommendations.filter(function(a) {
            return spherical_distance(a.center, myLocation) <= 2.5;
        });
        
        // Display the top 10 recommendations
        recommendations = recommendations.slice(0, 10);
        
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
}

// Respond to clicks on dynamically generated rows
$("body").on("click", "tbody tr", function() {
    // Delete existing markers
    markers.forEach(m => m.setMap(null));
    markers = [];
    
    // Find out which row was clicked
    const r = recommendations[$("tbody tr").index(this)];
    const places = {
        "eat"  : r.eat.geometry,
        "play" : r.play.geometry,
        "drink": r.drink.geometry
    };
    
    // Adjust the center of the map
    map.setCenter(r.center);

    // Adjust the zoom level
    map.setZoom(Math.max(10, 14 - Math.floor(1 + r.metric / 4)));
    
    // Place a marker for each place
    for (key in places) {
        var marker = new google.maps.Marker({
            "map"     : map,
            "position": places[key],
            "icon"    : markerIcons[key]
        });

        markers.push(marker);
    }
});