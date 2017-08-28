// Find all hiking trails in Austin, TX
var api_url = "https://trailapi-trailapi.p.mashape.com/?q[activities_activity_type_name_eq]=hiking&q[city_cont]=Austin&q[state_cont]=Texas&radius=50";

$.ajax({
    url: api_url,
    method: 'GET',
    dataType: 'JSON',
    beforeSend: setHeader

}).done(function(response) {
    console.table(response.places);

});

function setHeader(xhr) {
    xhr.setRequestHeader('X-Mashape-Key', 'YJAiQK0Cirmshoi4JIWN51e4ZBWzp1FCJuTjsng1orgLvIxQK9');
//    xhr.setRequestHeader('Accept', 'text/plain');
}