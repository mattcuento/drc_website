var calendar = [];
var calendar_rides = firebase.database().ref().child("rides");

firebase.auth().onAuthStateChanged(function(user) {
  if (!user){
    alert("You haven't signed in yet, we are directing you to the login page");
  window.location = "../Login/login.html";
  }
});

calendar_rides.orderByChild('timestamp').on('child_added', function(snap){
  var user_rides = snap.val();
  var user = firebase.auth().currentUser;
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var name = user.displayName;
      var user_email = user.email;
      if (user_rides["email"] == user_email){
        console.log(user_email);
       calendar.push({
          title: user_rides["pickup"] + " to " + user_rides["dropoff"],
          start: user_rides["date"] + 'T' + user_rides["time"] + ':00',
       })
      }
    } else {
      console.log("user not signed in");
    }
  });

  $(document).ready(function() {
   var today = new Date();
   var dd = String(today.getDate()).padStart(2, '0');
   var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
   var yyyy = today.getFullYear();
   today = yyyy + '-' + mm + '-' + dd;

   $('#calendar').fullCalendar({
      header: {
         left: 'prev,next',
         center: 'title',
         right: 'month,basicWeek,basicDay,listWeek'
      },
      buttonText:{
        prev: 'prev',
        next: 'next'
      },
      defaultDate: today,
      navLinks: true, // can click day/week names to navigate views
      eventLimit: true, // allow "more" link when too many events
      events: calendar,
      eventTextColor: '#FFFFFF',
      eventColor: '#454e6f',
      handleWindowResize: true,
      contentHeight: 400,
      aspectRatio: 2
   }); 
});
});