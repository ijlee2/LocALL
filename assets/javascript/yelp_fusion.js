// Find all bbq locations in Austin, TX
var api_url = "https://api.yelp.com/v3/businesses/search?term=bbq%2C%20barbecue&latitude=30.307182&longitude=-97.755996";

$.ajax({
    url: api_url,
    method: 'GET',
    dataType: 'JSON',
    cache: true,
    beforeSend: setHeader

}).done(function(response) {
    console.table(response.places);

});

function setHeader(xhr) {
    xhr.setRequestHeader('Bearer', '-8OoUwfqw9gEPuRDLrleAxOSnItGSdmV3scnZcsp4FHEy0Xb9f30Tq_rvbD7o2sThR8MQ3UWLib8LVuYSAKhG9HaApTL15w8pUTI0mB8vV4YL0UgFCRUEGQKptWeWXYx');
//    xhr.setRequestHeader('Accept', 'text/plain');
}