var displayButton = document.getElementById('display');
var modal = document.getElementById("modal");
var leaving_soon_btn = document.getElementById("leaving_soon");
var wheelchair_btn = document.getElementById("wheelchair");

var allRides = document.getElementById('info');
var displayRide = document.getElementById('modal_content');

var num_drivers = 0;
var studentsDict = {};

var database = firebase.database();
var ref_rides = database.ref('rides').orderByChild("timestamp");
var locations = database.ref().child("locations");
var uid = localStorage.getItem('myUuid');

var ref_tram_stop_coords = database.ref("tram_stop_coords");
var stop_object_list = [];

//putting all the students into a dictionary in order to display them later
var studentRef = database.ref("students");
studentRef.on("value", function(snap) {
    var students = snap.val();
    var keys = Object.keys(students);

    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var name = students[k].name;
        var email = students[k].email;
        studentsDict[email] = name;
    }
});

//delete rides for students pass eligibility date or inactive
var students = firebase.database().ref().child("students");
students.orderByChild("email").on('child_added', function(snap) {
    var userQuery = snap.val();
    var key = Object.keys(userQuery)[0];
    var stud;
    stud = snap.val();
    var endDate = stud['end_eligibility'];
    var dateArr = endDate.split("-");
    var d = new Date();
    var flag = 0;
    var status = stud['permission'];
    if (status === "Inactive") {
        flag = 1;
    } else {
        if (dateArr[0] < d.getFullYear()) {
            flag = 1;
        } else {
            if (dateArr[1] < d.getMonth() + 1) {
                flag = 1;
            } else {
                if (dateArr[1] == d.getMonth() + 1 && dateArr[2] < d.getDate()) {
                    flag = 1;
                }
            }
        }
    }
    if (flag == 1) {
        var rides = firebase.database().ref().child("rides");
        rides.orderByChild('email').equalTo(stud['email']).on('child_added', function(snap) {
            snap.ref.remove();
        });
    }
});



// changing status of driver's car: wheelchair or no wheelchair
function change_status() {
    if (wheelchair_btn.checked) {
        locations.child(myUuid).child("wheelchair").set(true);
    } else {
        locations.child(myUuid).child("wheelchair").set(false);
    }
}

function leaving_soon_timer() {
    // Set the date we're counting down to
    locations.child(myUuid).child("leaving_soon").set(true);
    var start = new Date().getTime();
    var minutes = 30; // how many minutes the countdown will be
    var later_date = new Date(start + minutes * 60000);

    // disable button until end of timer
    leaving_soon_btn.disabled = true;

    // Update the count down every 1 second
    var x = setInterval(function() {

        // Get todays date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = later_date - now;

        // Time calculations for days, hours, minutes and seconds
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="timer"
        document.getElementById("timer").innerHTML = minutes + "m " + seconds + "s ";

        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("timer").innerHTML = "SHIFT OVER";
            leaving_soon_btn.disabled = false;
            locations.child(myUuid).child("leaving_soon").set(false);
        }
    }, 1000);
}

displayButton.onclick = function() {
    if (displayRide.style.display === "none") {
        displayRide.style.display = "block";
    } else if (displayRide.style.display === "block") {
        displayRide.style.display = "none";
    }
}

// runs it for the first time
locations.once("value", set_num_drivers, errData);
ref_tram_stop_coords.once("value", set_tram_stops, errData);
ref_rides.once("value", handle_rides, errData);

// getting new rides every 30 min
var timerID = setInterval(function() {
    //getting number of drivers online
    locations.once("value", set_num_drivers, errData);

    while (allRides.firstChild) {
        allRides.removeChild(allRides.firstChild);
    }
    ref_rides.once("value", handle_rides, errData);
}, 30 * 60 * 1000); //1000 milliseconds * 60 seconds * 30 minutes

function errData(err) {
    console.log('Error!');
    console.log(err);
}

function set_tram_stops(snap) {
    var stops = snap.val(); // get all tram stop locations
    var stop_objects = {};

    for (item in stops) {
        var stop = {
            latitude: snap.child(item).child("latitude").val(),
            longitude: snap.child(item).child("longitude").val()
        };
        stop_objects[item] = stop; // key of dict entry is the stop number
    }
    stop_object_list = stop_objects;
}

function formatDate(date) {
    var arr = date.split("-");
    return arr[1] + "/" + arr[2] + "/" + arr[0];
}

function formatTime(time) {
    var arr = time.split(":");
    if (arr[0] > 12) {
        var hour = arr[0] - 12;
        return hour + ":" + arr[1] + " PM";
    } else {
        return time + " AM";
    }
}

function get_ride_list(snap) {
    var all_rides = snap.val();
    var ride_objects = [];

    for (item in all_rides) {
        // filter rides for current day and within an hour
        var this_day = same_date(snap.child(item).child("date").val());
        var within_hour = within_an_hour(snap.child(item).child("time").val());

        if (this_day && within_hour) {
            var ride = {
                ride_id: item,
                date: snap.child(item).child("date").val(),
                dropoff: snap.child(item).child("dropoff").val(),
                email: snap.child(item).child("email").val(),
                pickup: snap.child(item).child("pickup").val(),
                time: snap.child(item).child("time").val(),
                wheelchair: snap.child(item).child("wheelchair").val()
            };
            ride_objects.push(ride);
        }
    }
    return ride_objects;
}

function create_n_groups(num_drivers, num_rides, ride_list) {
    var groups = [] // groups of rides

    // divide rides
    var rides_per_driver = Math.floor(num_rides / num_drivers);
    var remaining_rides = num_rides - (rides_per_driver * num_drivers);

    // create a group for each driver
    for (i = 0; i < num_drivers; i++) {
        var group = [];
        for (j = 0; j < rides_per_driver; j++) {
            group.push(ride_list[j]);
        }
        ride_list.splice(0, rides_per_driver); // remove rides from main list
        groups.push(group); // add group to list of all groups
    }

    // add remaining rides to last group
    for (k = 0; k < ride_list.length; k++) {
        (groups[groups.length - 1]).push(ride_list[k]);
    }
    return groups;
}

// find the latitude and longitude associated with a stop in firebase
function find_coords_of_stop(location) {
    var coords = {
        latitude: (stop_object_list[location.pickup]).latitude,
        longitude: (stop_object_list[location.pickup]).longitude
    };
    return coords;
}

// sort rides by closest to farthest
function sort_by_location(a, b) {
    // temporarily hard-coded
    // the driver's current location pulled from firebase
    var driver_location = {
        latitude: 35.600705,
        longitude: -120.678767
    };

    // get dist of current location to a
    var a_coords = find_coords_of_stop(a);
    var a_dist = coord_distance(driver_location, a_coords);

    // get dist of current location to b
    var b_coords = find_coords_of_stop(b);
    var b_dist = coord_distance(driver_location, b_coords);

    // return difference between those distances
    return a_dist - b_dist;
}

// distance between two coordinates
function coord_distance(a, b) {
    var lat_diff = a.latitude - b.latitude;
    var lon_diff = a.longitude - b.longitude;
    var distance = Math.sqrt(Math.pow(lat_diff, 2) + Math.pow(lon_diff, 2));
    return distance;
}

function sort_and_push(groups) {
    for (i = 0; i < groups.length; i++) {
        // get one of the groups
        var group = groups[i];

        // sort rides by proximity to driver
        group.sort(sort_by_location);

        // sort rides by increasing time
        group.sort(function(a, b) {
            return a.time.localeCompare(b.time);
        })

        // push those rides to a driver table
    }
    push_rides(groups);
    return groups;
}

function push_rides(groups) {
    var locationRef = database.ref("locations");
    var i = 0;
    locationRef.on("child_added", function(snap) {
        var group = groups[i];
        i++;
        var ride = locationRef.child(snap.key);
        ride.update({
            rides: group
        });

        // only printing the pickups assigned to the driver
        if (snap.key == uid) {
            ride.on("child_added", display_ride);
        }
    });
}

function divide_rides(snap, num_drivers) {
    var ride_list = get_ride_list(snap); // convert snapshot to list of rides
    if (ride_list.length > 0) {
        var num_rides = ride_list.length;
        groups = create_n_groups(num_drivers, num_rides, ride_list);
        groups = sort_and_push(groups);
    }
    else {
        console.log("No rides within an hour today.");
    }
}

function set_num_drivers(snap) {
    num_drivers = snap.numChildren();
}


function same_date(ride_date) {
    // break down the given ride's date
    var components = ride_date.split("-");
    var ride_year = parseInt(components[0]);
    var ride_month = parseInt(components[1]);
    var ride_day = parseInt(components[2]);

    // break down the current date
    var today = new Date();
    var today_year = today.getYear() + 1900;
    var today_month = today.getMonth() + 1;
    var today_day = parseInt(today.getDate());

    if (ride_year == today_year && ride_month == today_month
        && ride_day == today_day) {
        return true;
    }
    return false;
}

function within_an_hour(ride_time) {
    // break down ride's time
    var ride_split = ride_time.split(":");
    var ride_hour = parseInt(ride_split[0]);
    var ride_min = parseInt(ride_split[1]);

    // break down the current date
    var now = new Date();
    var now_hour = now.getHours();
    var now_min = now.getMinutes();

    // difference between current hour and ride's hour
    var hour_diff = ride_hour - now_hour;
    var min_diff = ride_min - now_min;

    if (hour_diff == 1) {
        if (min_diff < 0) {
            return true;
        }
    }
    else if (hour_diff == 0) {
        return true;
    }
    return false;
}

function handle_rides(snap) {
    var rides = snap.val(); // get all rides
    if (rides == null || num_drivers == 0) { // there are no rides
        console.log("There are no drivers currently.");
        no_rides();
    } else {
        divide_rides(snap, num_drivers);
    }
}

function no_rides() {
    var noRidesDiv = document.createElement("div");
    noRidesDiv.setAttribute("style", "padding: 10px 10px;");
    noRidesDiv.innerHTML = "There are no rides scheduled.";
    allRides.append(noRidesDiv);
}

function display_ride(data) {
    var rides = data.val();
    var k = data.key;

    var no_rides_div = document.getElementById("no_rides");
    if (no_rides_div != null) {
        no_rides_div.style.display = "none";
    }

    if (k === "rides") {
        for (var i = 0; i < rides.length; i++) {
            var dropoff = rides[i]["dropoff"];
            var pickup = rides[i]["pickup"];
            var time = formatTime(rides[i]["time"]);
            var name = getName(rides[i]["email"]);
            var rideKey = rides[i]["ride_id"];
            var wheelchair = rides[i]["wheelchair"];

            var rideDiv = document.createElement("div");
            rideDiv.setAttribute("style", "display: flex; justify-content: space-between; flex-direction: row;");
            // if the driver is late to the pickup
            var today = new Date();
            var timeRN = today.getHours() + ":" + today.getMinutes();
            if (timeRN > rides[i]["time"]) {
                rideDiv.setAttribute("style", "display: flex; justify-content: space-between; flex-direction: row; background-color: #800000; color: white; padding: 5% 0;");
            }

            // if the ride need a wheelchair
            if (wheelchair && wheelchair_btn) {
                rideDiv.setAttribute("style", "display: flex; justify-content: space-between; flex-direction: row; background-color: #3A75C4; color: white; padding: 5% 0;");
            }

            var rideInfoDiv = document.createElement("div");
            rideInfoDiv.setAttribute("style", "display: flex; justify-content: space-between; flex-direction: column; margin: 0 60px 0 10px;");

            var nameDiv = document.createElement("div");
            nameDiv.innerHTML = name;
            nameDiv.style.fontWeight = "bold";
            nameDiv.style.fontSize = "20px";
            rideInfoDiv.appendChild(nameDiv);

            var timeDiv = document.createElement("div");
            timeDiv.innerHTML = "Time: " + time;
            rideInfoDiv.appendChild(timeDiv);

            var pickupDiv = document.createElement("div");
            pickupDiv.innerHTML = "Pickup: " + pickup;
            rideInfoDiv.appendChild(pickupDiv);

            var dropoffDiv = document.createElement("div");
            dropoffDiv.innerHTML = "Dropoff: " + dropoff;
            rideInfoDiv.appendChild(dropoffDiv);

            var buttonDiv = document.createElement("div");
            buttonDiv.setAttribute("style", "display: flex; flex-direction: column; justify-content: space-evenly;");

            var pickedUpLabel = document.createElement("label");
            var pickedUp = document.createElement("input");
            pickedUp.type = "radio";
            pickedUp.name = "radiobut" + rideKey;
            pickedUp.id = "pickedup" + rideKey;
            pickedUp.setAttribute("onclick", "pickedUp('" + rideKey + "')");
            pickedUpLabel.appendChild(pickedUp);
            pickedUpLabel.appendChild(document.createTextNode("Picked Up"));
            buttonDiv.appendChild(pickedUpLabel);

            var noShowLabel = document.createElement("label");
            var noShow = document.createElement("input");
            noShow.type = "radio";
            noShow.name = "radiobut" + rideKey;
            noShow.id = "noshow" + rideKey;
            noShow.setAttribute("onclick", "noShow('" + rideKey + "')");
            noShowLabel.appendChild(noShow);
            noShowLabel.appendChild(document.createTextNode('No Show'));
            buttonDiv.appendChild(noShowLabel);

            rideDiv.appendChild(rideInfoDiv);
            rideDiv.appendChild(buttonDiv);

            allRides.appendChild(rideDiv);
            allRides.appendChild(document.createElement("br"));
        }
    }
}

function getName(email) {
    return studentsDict[email];
}

function pickedUp(key) {
    var ridesRef = database.ref("rides");
    var ride = ridesRef.child(key);

    var checkbox = document.getElementById("pickedup" + key);
    if (checkbox.checked) {
        ride.update({
            pickedUp: true
        });
    } else {
        ride.update({
            pickedUp: false
        });
    }
}

function noShow(key) {
    var ridesRef = firebase.database().ref("rides");
    var ride = ridesRef.child(key);

    var checkbox = document.getElementById("noshow" + key);
    if (checkbox.checked) {
        ride.update({
            no_show: true
        });
    } else {
        ride.update({
            no_show: false
        });
    }

    var locations = firebase.database().ref().child("locations").child(myUuid).child('rides');
    locations.orderByChild('ride_id').on('value', function(snap) {
        snap.forEach(function(child) {
            if (key == child.val().ride_id) {
                locations.child(child.key).remove();
            }
        })
    });
    var email;
    var date;
    var rideStatusUpdate = firebase.database().ref().child("rides").child(key);
    rideStatusUpdate.orderByKey().once('value', function(snap) {
        date = snap.val().date;
        email = snap.val().email;
    });

    ridesRef.orderByChild("date").once('value', function(snap) {
        snap.forEach(function(child) {
            if (child.val().date == date && child.val().email == email) {
                var curRide = ridesRef.child(child.key);
                if (child.key != key) {
                    curRide.child('no_show').set("cancelled_noshow");
                }
            }
        });
    });
}
