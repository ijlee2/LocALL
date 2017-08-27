$("#button_signup").on("click", function() {
    $("#header").text("Sign Up");
    $("#userName_container").css({"display": "block"});

});

$("#button_login").on("click", function() {
    $("#header").text("Log In");
    $("#userName_container").css({"display": "none"});

});

$("#button_logout").on("click", function() {
    $("#header").text("Log Out");
    $("#userName_container").css({"display": "none"});
    
});