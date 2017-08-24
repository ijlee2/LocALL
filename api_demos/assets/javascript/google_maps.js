var map;
var places = [{"name"      : "Rudy's BBQ",
               "latitude"  : 30.2953166667,
               "longitude:": -97.7423694444},
               
              {"name"      : "Bert's BBQ",
               "latitude"  : 30.2953166667,
               "longitude:": -97.7423694444}
             ];

function displayMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 30.307182, lng: -97.755996},
        zoom  : 15
    });
}