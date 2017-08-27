/****************************************************************************
 ****************************************************************************
    
    Configure Firebase
    
*****************************************************************************
*****************************************************************************/
const config = {
    "apiKey"           : "AIzaSyDjGV94on0gidAzG2sLCy5F8s-tkQXAzPc",
    "authDomain"       : "locall-atx512.firebaseapp.com",
    "databaseURL"      : "https://locall-atx512.firebaseio.com",
    "projectId"        : "locall-atx512",
    "storageBucket"    : "locall-atx512.appspot.com",
    "messagingSenderId": "1032168672035"

};

firebase.initializeApp(config);

const database       = firebase.database();
const database_users = database.ref("users");
const auth           = firebase.auth();

// database_users.remove();


/****************************************************************************
 ****************************************************************************
    
    User actions
    
*****************************************************************************
*****************************************************************************/
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

    // Validate the inputs using regular expression and match function.
    // If there is an error, display an error message in the input field.

    /*
    // First name must be all letters
    var regex;
    var matches;
    var validationPassed = true;

    // If valid
    if (name === "") {
        $("#messageToUser").text("Please enter your name.");
        validationPassed = false; 
    
    } else { 
        regex = /^[a-z]+$/;
        matches = name.match(regex);

        if (!matches) {
            $("#messageToUser").text("Name is invalid."); 
            validationPassed = false; 
        }
    }


    // Email must have format of ***@***.com (*** cannot be empty)
     if (email === "") {
        $("#messageToUser").append("<br>Please enter your email.");
    
    } else { 
        regex = /^[a-z0-9._]+@[a-z]+.(com|net|edu)$/i;
        matches = email.match(regex);

        if (!matches) {
            $("#messageToUser").append("<br>Email is invalid.");
            validationPassed = false; 
        
        }
    }

    
    // Password must have 8-64 characters, 1 letter, 1 number, 1 special character
      if (password === "") {
        $("#messageToUser").append("<br>Please enter your password.");
    
    } else {
        if (password.length < 8 || password.length > 64) {
            $("#messageToUser").append("<br>Password length must be between 8-64.");
        }

        regex = /[a-z]+/i;
        matches = password.match(regex);
        if (!matches) {
            $("#messageToUser").append("<br>Password must contain at least 1 letter.");
        
        }

        regex = /[0-9]+/;
        matches = password.match(regex);
        if (!matches) {
            $("#messageToUser").append("<br>Password must contain at least 1 number.");
        
        }

        regex = /[!@#$%^&*]+/;
        matches = password.match(regex);
        if (!matches) {
            $("#messageToUser").append("<br>Password must contain at least 1 special character.");
        
        }
    }
    */

    // Create an account on Firebase
    if (pageStatus === "signup") {
        auth.createUserWithEmailAndPassword(email, password)
            .then(function(user) {
                console.log("Sign up:");
                console.log(user);

                database_users.child(user.uid).set({
                    "name" : name,
                    "email": email
                });
            })
            .catch(
                e => console.log(e.message)
            );

    // Log in to an existing account
    } else if (pageStatus === "login") {
        auth.signInWithEmailAndPassword(email, password)
            .then(function(user) {
                console.log("Log in:");
                console.log(user);

                database_users.child(user.uid).on("value", function(snapshot) {
                    console.log("My name is: " + snapshot.val().name);
                    console.log("My email is: " + snapshot.val().email);
                });
            })
            .catch(
                e => console.log(e.message)
            );

    // Log out of an existing account
    } else if (pageStatus === "logout") {
        auth.signOut();

    }

    auth.onAuthStateChanged(user => {
        if (user) {
//            console.log(user);
        } else {
            console.log("Not logged in.");
        }
    });
});