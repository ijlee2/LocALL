$('.dropdown-toggle').dropdown("update");

function displayPage(page) {
    $(".page").hide();
    $(".page:nth-of-type(" + (page + 1) + ")").show();
};

$(".dropdown-item").click(function() {
    var activity_text = $(this).text();
    console.log(activity_text);
    
    var button_activity = ($(this).parent().parent().children())[0];
    console.log(button_activity);
    
    $(button_activity).text(activity_text);
});