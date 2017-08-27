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
    
    Useful objects
    
*****************************************************************************
*****************************************************************************/
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
    
    Make recommendations
    
*****************************************************************************
*****************************************************************************/
let eventName_eat = "", eventName_play = "", eventName_drink = "", myLocation = "";
let recommendations = [];

// Handle button clicks
$("li").click(function() {
    const eventType = $(this).parent().attr("id");
    const eventName = $(this).text().toLowerCase();

    // Highlight the choices
    var index  = $("li").index(this) % 5;

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
                // UT Austin
                myLocation = coordinates_austin;

            } else if (eventName === "north") {
                // The Domain
                myLocation = {"lat": 30.402065, "lng": -97.725883};

            } else if (eventName === "south") {
                // Auditorium Shores
                myLocation = {"lat": 30.262717, "lng": -97.751530};

            }

            break;

    }

    // Display recommendations once the user selects 3 events
    if (eventName_eat !== "" && eventName_play !== "" && eventName_drink !== "" && myLocation !== "") {
        displayRecommendations(eventName_eat, eventName_play, eventName_drink);
    }
});


// Haversine formula
const deg_to_rad = Math.PI / 180;
const r = 6371 / 1.60934;

function spherical_distance(point1, point2) {
    const lat1_rad = point1.lat * deg_to_rad;
    const lng1_rad = point1.lng * deg_to_rad;

    const lat2_rad = point2.lat * deg_to_rad;
    const lng2_rad = point2.lng * deg_to_rad;

    // Find the distance
    return 2 * r * Math.sqrt(Math.pow(Math.sin((lat2_rad - lat1_rad) / 2), 2) + Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.pow(Math.sin((lng2_rad - lng1_rad) / 2), 2));
}


function displayRecommendations(eventName_eat, eventName_play, eventName_drink) {
    const directoryName = `${eventName_eat}_${eventName_play}_${eventName_drink}`;

    // Get the recommendations database from Firebase
    let data, numData, bins;

    database_recommendations.child(directoryName).on("value", function(snapshot) {
        data    = snapshot.val().data;
        numData = snapshot.val().numData;
        bins    = snapshot.val().bins;   

        console.log(data);
        console.log(bins);
        console.log("Number of recommendations (original): " + numData);


        // Reset the recommendations array
        recommendations = [];

        // find last index of bins
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
        
        let output = "", name;

        recommendations.forEach(r => {
            name = `<p>▪ ${r.eat.name}</p><p>▪ ${r.play.name}</p><p>▪ ${r.drink.name}</p>`;

            output += `<tr><td>${name}</td><td>${r.metric.toFixed(3)}</td></tr>`
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
        "center"          : coordinates_austin,
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
    const places = [{"type": "eat"  , "geometry": r.eat.geometry},
                    {"type": "play" , "geometry": r.play.geometry},
                    {"type": "drink", "geometry": r.drink.geometry}];
    
    // Adjust the center of the map
    map.setCenter(r.center);

    // Adjust the zoom level
    map.setZoom(Math.max(10, 14 - Math.floor(1 + r.metric / 4)));
    
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