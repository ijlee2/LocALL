var map, markers = [];

var places = [{"name"     : "Rudy's BBQ",
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
    var center = {"lat": 0, "lng": 0};

    // Find the center of all bbq places
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
    
    // Place a marker for each bbq place
    places.forEach(p => {
        var marker = new google.maps.Marker({
            "position": {"lat": p.latitude,
                         "lng": p.longitude},
            "map": map
        });
    });
}