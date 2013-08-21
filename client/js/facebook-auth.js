window.fbAsyncInit = function() {
  FB.init({
    appId      : '555596811143941', // App ID
    channelUrl : '//localhost:8081', // Channel File
    status     : true, // check login status
    cookie     : true, // enable cookies to allow the server to access the session
    xfbml      : true  // parse XFBML
  });

  // Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired
  // for any authentication related change, such as login, logout or session refresh. This means that
  // whenever someone who was previously logged out tries to log in again, the correct case below 
  // will be handled. 
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      accessToken = response.authResponse.accessToken;
    } else {
      view.login.render();
    }
  });

  FB.Event.subscribe('auth.authResponseChange', function(response) {
    console.log(response);
    // Here we specify what we do with the response anytime this event occurs. 
    if (response.status === 'connected') {
      accessToken = response.authResponse.accessToken;
      // todo: also check blip groups this user already has access to            
      $.getJSON('http://localhost:8082/v1/user/facebook?accessToken=' + accessToken + '&callback=?', function(user) {
        view.header.render(user);
        console.log(user);
      });
      // The response object is returned with a status field that lets the app know the current
      // login status of the person. In this case, we're handling the situation where they 
      // have logged in to the app.
    }// else if (response.status === 'not_authorized') {
      // In this case, the person is logged into Facebook, but not into the app, so we call
      // FB.login() to prompt them to do so. 
      // In real-life usage, you wouldn't want to immediately prompt someone to login 
      // like this, for two reasons:
      // (1) JavaScript created popup windows are blocked by most browsers unless they 
      // result from direct interaction from people using the app (such as a mouse click)
      // (2) it is a bad experience to be continually prompted to login upon page load.
      


    //} else {
    else {
      // In this case, the person is not logged into Facebook, so we call the login() 
      // function to prompt them to do so. Note that at this stage there is no indication
      // of whether they are logged into the app. If they aren't then they'll see the Login
      // dialog right after they log in to Facebook. 
      // The same caveats as above apply to the FB.login() call here.
      //FB.login();
      //FB.login({scope: 'user_groups,user_birthday,user_status,user_about_me,publish_actions,email'});
      //view.login();
      window.location.hash = '';
      view.login.render();
    }
  });
  };

  // Load the SDK asynchronously
  (function(d){
   var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement('script'); js.id = id; js.async = true;
   js.src = "//connect.facebook.net/en_US/all.js";
   ref.parentNode.insertBefore(js, ref);
  }(document));