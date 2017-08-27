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
let eventName_eat = "", eventName_play = "", eventName_drink = "";
let recommendations = [];

// Handle button clicks
$("li").click(function() {
    const eventType = $(this).parent().attr("id");

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
            eventName_eat = $(this).text().toLowerCase();
            break;

        case "play":
            eventName_play = $(this).text().toLowerCase();
            break;

        case "drink":
            eventName_drink = $(this).text().toLowerCase();
            break;

    }

    // Display recommendations once the user selects 3 events
    if (eventName_eat !== "" && eventName_play !== "" && eventName_drink !== "") {
        displayRecommendations(eventName_eat, eventName_play, eventName_drink);
    }
});


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


        // Display the top 10 recommendations
        recommendations = data.slice(0, 10);
        
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
    console.log("clicked");

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