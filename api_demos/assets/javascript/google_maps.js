var map;
var places = [{"name"      : "Rudy's BBQ",
               "address"   : "512 W 29th Street, Austin 78705",
               "latitude"  : 30.2953166667,
               "longitude:": -97.7423694444},
               
              {"name"      : "Bert's BBQ",
               "address"   : "907 W 24th Street, Austin 78705",
               "latitude"  : 30.2953166667,
               "longitude:": -97.7423694444},
               
              {"name"      : "BBQ Revolution",
               "address"   : "3111 Manor Road, Austin 78723",
               "latitude"  : 30.3154988,
               "longitude:": -97.7167106}
             ];

function displayMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 30.307182, lng: -97.755996},
        zoom  : 15
    });
}