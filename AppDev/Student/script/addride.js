
var date =  document.getElementById("add_date");
var time = document.getElementById("add_time");
var pickup = document.getElementById("add_pickup");
var dropoff = document.getElementById("add_dropoff");
var reoccur = document.getElementById('reoccuring-yes');
var noreoccur = document.getElementById('reoccuring-no');
var reoccurPopup = document.getElementById("reoccurPopup");

var monday = document.getElementById("monday");
var tuesday = document.getElementById("tuesday");
var wednesday = document.getElementById("wednesday");
var thursday = document.getElementById("thursday");
var friday = document.getElementById("friday");
var endDate = document.getElementById("end-repeat-date");

var addPop = document.getElementById("addRide");
var cancel = document.getElementById("cancel-add");

var saveButton = document.getElementById('saveButton');
var savePopup = document.getElementById('savePop');
var closeSaveSuccess = document.getElementsByClassName('close')[0];

var invalidPopup = document.getElementById('invalidPop');
var closeInvalidInput = document.getElementsByClassName('close')[1];

var database = firebase.database();
var dup = 0;

function formatTimeOutput(time){
    var arr = time.split(":");
    if(arr[0] > 12){
        var hour = arr[0] - 12;
        return hour + ":" + arr[1] + " PM";
    }
    else{
        return time + " AM";
    }
}

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


function formatDateOutput(date){
  var arr = date.split("-");
  return arr[1] + "/" + arr[2] + "/" + arr[0];
}

function checkDuplicate(ride){
  var rides = firebase.database().ref().child("rides");
  console.log(ride["email"]);
  rides.orderByChild('email').equalTo(ride["email"]).on('child_added', function(snap){
    var user_rides = snap.val();
    if(user_rides["date"] === ride["date"] && user_rides["time"] === ride["time"]){
      dup = 1;
    }
  });
}

// Reference to the recommendations object in your Firebase database
var rides = firebase.database().ref().child("rides");
var count = 0;

firebase.auth().onAuthStateChanged(function(user) {
    if (!user){
      // alert("You not signed in");
    }else{
      rides.orderByChild('timestamp').on('child_added', function(snap){
      var user_email = user.email;
      var user_rides = snap.val();
      var datearr = user_rides["date"].split("-");
      var d = new Date(user_rides["date"]+"T"+user_rides["time"]+":00");
      var today = new Date();
      if(d < today){
        snap.ref.remove();
      }else{
        if(user_email == user_rides["email"] && count == 0){
          var location_bb = document.getElementById("location_bb");
          var time_bb = document.getElementById("time_bb");
          var date_bb = document.getElementById("date_bb");
          location_bb.innerText = user_rides["pickup"] + " --> " + user_rides["dropoff"];
          time_bb.innerText = formatTimeOutput(user_rides["time"]);
          date_bb.innerText = formatDateOutput(user_rides["date"]);
          count ++;
        }
      }
    });
    }
});


function addNewRide(){
  var user = firebase.auth().currentUser;
  if (user != null) {
      var name = user.displayName;
      var user_email = user.email;
  }
  var ref = database.ref('rides');
  var ride = {
    email: user_email,
    date: date.value,
    time: time.value,
    pickup: pickup.value,
    dropoff: dropoff.value,
    timestamp: date.value + " " + time.value,
    reoccur: false,
    user_name: name,
    wheelchair: false,
    no_show: false
  };
  var d = new Date(date.value+"T"+time.value+":00");
  var today = new Date();
  checkDuplicate(ride);
  if(dup == 1){
    alert("You currently have a ride at same time, please delete the other ride and try again.");
    dup = 0;
  }else if(d < today){
    alert("Please select time in the future.");
  }else if(halfHourLimit(time.value, date.value) == 1){
    alert("Sorry, rides can't be scheduled within 30 minutes.")
  }else if(pickup.value === dropoff.value){
    alert("Dropoff and Pickup locations must be different, please try again")
  }else{
    var arr = time.value.split(":");
    if(d.getDay() == 6 || d.getDay() == 7){
      alert("Please select dates from Mon-Fri");
    }else if(arr[0] < 8 || arr[0] > 19){
      alert("Please select time from 8:00am to 7:00pm");
    }else if(arr[0] == 19 && arr[1] > 0){
      alert("Please select time from 8:00am to 7:00pm");
    }else{
      ref.push(ride);
      date.value = "";
      time.value = "";
      pickup.value = "";
      dropoff.value = "";
      savePopup.style.display = "block";  
      addPop.style.display = "none";
      location.reload();   
    }
  }
}

function reoccurRide(){
  var user = firebase.auth().currentUser;
  if (user != null) {
      var name = user.displayName;
      var user_email = user.email;
  }
  var ref = database.ref('rides');

  var repeat = [];

  if(monday.checked){
      repeat.push(1);
  }
  if(tuesday.checked){
      repeat.push(2);
  }
  if(wednesday.checked){
      repeat.push(3);
  }
  if(thursday.checked){
      repeat.push(4);
  }
  if(friday.checked){
      repeat.push(5);
  }
  var arrStart = date.value.split("-");
  var arrEnd = endDate.value.split("-");

  var start = new Date(arrStart[0],arrStart[1] - 1, arrStart[2]);
  var end = new Date(arrEnd[0], arrEnd[1] - 1, arrEnd[2]);
  var curr = new Date(start);

  var arr = time.value.split(":");
  if(arr[0] < 8 || arr[0] > 19){
    alert("Please select time from 8:00am to 7:00pm");
  }else if(halfHourLimit(time.value, date.value) == 1){
    alert("Sorry, rides can't be scheduled within 30 minutes.")
  }else{
      while(curr < end){
      if (repeat.includes(curr.getDay())){
          var ride = {
              email: user_email,
              date: formatDate(curr),
              time: time.value,
              pickup: pickup.value,
              dropoff: dropoff.value,
              timestamp: formatDate(curr) + " " + time.value,
              reoccur: true,
              reoccurpattern: formatPattern(start, repeat, end),
              user_name: name,
              wheelchair: false,
              no_show: false
          };
          ref.push(ride);
      }
      curr.setDate(curr.getDate() + 1);
      }
      date.value = "";
      time.value = "";
      pickup.value = "";
      dropoff.value = "";
      monday.checked = false;
      tuesday.checked = false;
      wednesday.checked = false;
      thursday.checked = false;
      friday.checked = false;
      endDate.value = "";
      savePopup.style.display = "block";
  }      
}

function formatDate(curr){
  var month = curr.getMonth() + 1;
  if(curr.getMonth() < 9){
      month = "0" + (curr.getMonth() + 1);
  }
  var date = curr.getDate();
  if(curr.getDate() < 10){
      date = "0" + (curr.getDate());
  }
      
  return (curr.getFullYear() + "-" + month + "-" + date);
}

function formatPattern(start, repeat, end){
  var str = "";
  str = formatDate(start) + " ";
  for(x in repeat){
      str += repeat[x];
  }
  str += " " + formatDate(end);
  return str;
}

saveButton.onclick = function() {
  if(formValid() && reoccur.checked){   
    reoccurRide();
    location.reload();
  }
  else if(formValid() && noreoccur.checked){
    addNewRide();
  }
  else{
      invalidPopup.style.display = "block";
  }
}

function formValid(){
  if (reoccur.checked){
      return date.value && time.value && pickup.value && dropoff.value && endDate.value; 
  }
  return date.value && time.value && pickup.value && dropoff.value;
}


cancel.onclick = function (){
  addPop.style.display = "none";
}

reoccur.onclick = function(){
  reoccurPopup.style.display = "block";
}

noreoccur.onclick = function(){
  reoccurPopup.style.display = "none";
}

closeSaveSuccess.onclick = function(){
    savePopup.style.display = "none";
}

closeInvalidInput.onclick = function(){
    invalidPopup.style.display = "none";
}
