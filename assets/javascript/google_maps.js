var map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 30.307182, lng: -97.755996},
        zoom  : 15
    });
}