// When the page loads
let pageStatus = "signup";

$("#messageToUser").text("");
$("#messageToUser").css({"display": "hide"});


// When the user clicks on sign up, log in, or log out button
$("#button_signup").click(function() {
    pageStatus = "signup";

    $("#header").text("Sign Up");
    $("#userName_container").css({"display": "block"});
    $("#userEmail_container").css({"display": "block"});
    $("#userPassword_container").css({"display": "block"});
    $("#button_submit").css({"display": "block"});

    $("#messageToUser").text("");
    $("#messageToUser").css({"display": "hide"});

});

$("#button_login").click(function() {
    pageStatus = "login";

    $("#header").text("Log In");
    $("#userName_container").css({"display": "none"});
    $("#userEmail_container").css({"display": "block"});
    $("#userPassword_container").css({"display": "block"});
    $("#button_submit").css({"display": "block"});

    $("#messageToUser").text("");
    $("#messageToUser").css({"display": "hide"});

});

$("#button_logout").click(function() {
    pageStatus = "logout";

    $("#header").text("Log Out");
    $("#userName_container").css({"display": "none"});
    $("#userEmail_container").css({"display": "none"});
    $("#userPassword_container").css({"display": "none"});
    $("#button_submit").css({"display": "none"});

    $("#messageToUser").text("Success!");
    $("#messageToUser").css({"display": "block"});
    
});


// When the user clicks on the submit button
$("#button_submit").click(function() {
    const name     = $("#userName").val().trim();
    const email    = $("#userEmail").val().trim();
    const password = $("#userPassword").val();

    // TODO - Jacque:
    // Validate the inputs using regular expression and match function.
    // If there is an error, display an error message in the input field.

    // First name must be all letters
    

    // Email must have format of ***@***.com (*** cannot be empty)
    

    // Password must have 8-64 characters, 1 letter, 1 number, 1 special character
    

    if (pageStatus === "signup") {
        // TODO - Isaac:
        // Create an account on Firebase.

    } else if (pageStatus === "login") {
        // TODO - Isaac:
        // Log in to an existing account.

    } else if (pageStatus === "logout") {
        // TODO - Isaac:
        // Log out of an existing account.

    }
});