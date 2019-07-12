
var config = {
  apiKey: "AIzaSyDx_Zs0728gUVuZfN2zTJeo9KsOmp_AZ4U",
    authDomain: "drc-tram.firebaseapp.com",
    databaseURL: "https://drc-tram.firebaseio.com",
    projectId: "drc-tram",
    storageBucket: "drc-tram.appspot.com",
    messagingSenderId: "957207324599"
};

// Initialize your Firebase app
firebase.initializeApp(config);
var editPop = document.getElementById("editRide");
var rides = firebase.database().ref().child("rides");
var schedules = [];
var select = document.getElementById("rides"); 
var user = firebase.auth().currentUser;
var dup = 0;


function halfHourLimit(time, date){
  var today = new Date();
  var datearr = date.split("-");
  today.setMinutes(today.getMinutes() + 30);
  if (today.getMinutes() < 10){
    var strtoday = today.getHours() + ":0" + today.getMinutes() + ":" + today.getSeconds();
  }else{
    var strtoday = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  }
  var strtime = time + ":00";
  if(strtoday >= strtime && today.getFullYear() == datearr[0] 
    && today.getMonth()+1 == datearr[1] && today.getDate() == datearr[2]){
    return 1;
  }else{
    return 0;
  }
}



function checkDuplicate(ride){
  var rides = firebase.database().ref().child("rides");
  console.log(ride["email"]);
  rides.orderByChild('email').equalTo(ride["email"]).on('child_added', function(snap){
    var user_rides = snap.val();
    if(user_rides["date"] === ride["date"] && user_rides["time"] === ride["time"]){
      dup = 1;
      console.log(dup);
    }
  });
}

function setDropDown(){

  var schedules = [];
  var select = document.getElementById("rides"); 
  rides.orderByChild('timestamp').on('child_added', function(snap){
  var user_rides = snap.val();
  var user = firebase.auth().currentUser;
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user){
      // alert("You not signed in");
    }
  });
  if (user_rides["email"] == user.email){
      var schedule = user_rides["date"] + " | " + user_rides["time"] + 
    " | " + user_rides["pickup"] + " to " + user_rides["dropoff"];
    schedules.push(schedule);
      var el = document.createElement("option");
      var key = snap.key;
      el.value = schedule;
      el.setAttribute("date", user_rides["date"]);
      el.setAttribute("pickup-time", user_rides["time"]);
      el.setAttribute("pickup-locaction", user_rides["pickup"]);
      el.setAttribute("dropoff-location", user_rides["dropoff"]);
      el.setAttribute("key", key);
      el.innerText = schedule;
      select.appendChild(el);
  }
  });
}

function setForm(){

  var ride = document.getElementById("rides");
  var selectedRide = ride.options[ride.selectedIndex];
  if (selectedRide.value == "unique_id_here"){
    alert("Please select a ride");
  }
    var dates = selectedRide.getAttribute("date");
    var t = selectedRide.getAttribute("pickup-time");
    var dateBox = document.getElementById("edit_date");
    var timeBox = document.getElementById("edit_time");
    var pickBox = document.getElementById("edit_pickup");
    var dropoffBox = document.getElementById("edit_dropoff");
    dateBox.value = dates;
    timeBox.value = t;
    pickBox.value = selectedRide.getAttribute("pickup-locaction");
    dropoffBox.value = selectedRide.getAttribute("dropoff-location");
}

function editForm(){
  console.log("hello from edit");
    var ride = document.getElementById("rides");
    var selectedRide = ride.options[ride.selectedIndex];
    var dates = selectedRide.getAttribute("date");
    var key = selectedRide.getAttribute("key");
    var time = document.getElementById("edit_time").value;
    var pickup = document.getElementById("edit_pickup").value;
    var dropoff = document.getElementById("edit_dropoff").value;
    var rides = firebase.database().ref().child("rides");
    var user = firebase.auth().currentUser;
    firebase.auth().onAuthStateChanged(function(user) {
      if (!user){
        // alert("You not signed in");
      }
    });
    rides.orderByChild('email').equalTo(user.email).on('child_added', function(snap){
        var user_rides = snap.val();
        var keys = snap.key;
        if(keys == key){
            var new_date = document.getElementById("edit_date").value;
            var new_time = document.getElementById("edit_time").value;
            var new_pickup = document.getElementById("edit_pickup").value;
            var new_dropoff = document.getElementById("edit_dropoff").value;
            var new_timestamp = new_date + " " + new_time;
            var d = new Date(new_date+"T"+new_time+":00");
            var today = new Date();
            var ride = {
              email: user_rides["email"],
              date: new_date,
              time: new_time,
              pickup: new_pickup,
              dropoff: new_dropoff,
              timestamp: new_timestamp,
              reoccur: user_rides["reoccur"],
              user_name: user_rides["user_name"],
              wheelchair: user_rides["wheelchair"],
              no_show: user_rides["no_show"]
            };
            checkDuplicate(ride);
            if(d < today){
              alert("Please select time in the future.");
            }else if(halfHourLimit(time.value, date.value) == 1){
              alert("Sorry, rides can't be scheduled within 30 minutes.")
            }else if(dup = 1){
              alert("You currently have a ride at same time, please delete the other ride and try again.");
            }else if(new_pickup === new_dropoff){
              alert("Dropoff and Pickup locations must be different, please try again")
            }else{
              var arr = new_time.split(":");
              if(d.getDay() == 6 || d.getDay() == 7){
                alert("Please select dates from Mon-Fri");
              }else if(arr[0] < 8 || arr[0] > 19){
                alert("Please select time from 8:00am to 7:00pm");
              }else if(arr[0] == 19 && arr[1] > 0){
                alert("Please select time from 8:00am to 7:00pm");
              }else{
                firebase.database().ref().child('/rides/' + key)
                .set({
                  "date": new_date,
                  "time": new_time,
                  "pickup": new_pickup,
                  "dropoff": new_dropoff,
                  "wheelchair": user_rides["wheelchair"],
                  "no_show": user_rides["no_show"],
                  "email": user_rides["email"],
                  "reoccur": user_rides["reoccur"],
                  "timestamp": new_timestamp,
                  "user_name": user_rides["user_name"]
                });
                alert("Ride is updated!");

                window.location.reload(true); 
              }
            }
        }
    });
}

function deleteForm(){
    var ride = document.getElementById("rides");
    var selectedRide = ride.options[ride.selectedIndex];
    var key = selectedRide.getAttribute("key");
    var rides = firebase.database().ref().child("rides");
    var user = firebase.auth().currentUser;
    firebase.auth().onAuthStateChanged(function(user) {
      if (!user){
        alert("You not signed in");
      }
    });
    if (confirm("Comfirm to delete ride: " + selectedRide.value)) {
      rides.orderByChild('email').equalTo(user.email).on('child_added', function(snap){
          var user_rides = snap.val();
          var keys = snap.key;
          if(keys == key){
            snap.ref.remove();
            alert("Ride is deleted!");
            window.location.reload(true); 
          }
      });
    }
}

