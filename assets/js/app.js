$(".dropdown-toggle").dropdown("update");

function displayPage(page) {
    $(".page").hide();
    $(`.page:nth-of-type(${page + 1})`).show();
};

$(".dropdown-item").click(function() {
    const activity_text = $(this).text();
//    console.log(activity_text);
    
    const button_activity = ($(this).parent().parent().children())[0];
//    console.log(button_activity);
    
    $(button_activity).text(activity_text);
});