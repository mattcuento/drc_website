var emailInput = document.getElementById('email');
var displayButton = document.getElementById('display');
var setDrivers = document.getElementById('setDrivers');
var rideList = document.getElementById('ridelist');
var allRides = document.getElementById('all_rides');

var database = firebase.database();
var ref_rides = database.ref('rides').orderByChild("timestamp");
var ref_drivers = database.ref("locations");
var ref_tram_stop_coords = database.ref("tram_stop_coords");
var stop_object_list = [];
var num_drivers = 0;
var studentsDict = {};

//putting all the students into a dictionary in order to display them later
var studentRef = database.ref("students");
studentRef.on("value", function(snap){
    var students = snap.val();
    var keys = Object.keys(students);

    for(var i=0; i<keys.length; i++){
        var k = keys[i];
        var name = students[k].name;
        var email = students[k].email;
        studentsDict[email] = name;
    }
});

setDrivers.onclick = function(){
    ref_drivers.once("value", set_num_drivers, errData);
    ref_tram_stop_coords.once("value", set_tram_stops, errData);
}

displayButton.onclick = function(){
    while(allRides.firstChild){
        allRides.removeChild(allRides.firstChild);
    }
    ref_rides.once("value", handle_rides, errData);
}

function errData(err){
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

function formatDate(date){
    var arr = date.split("-");
    return arr[1] + "/" + arr[2] + "/" + arr[0];
}

function formatTime(time){
    var arr = time.split(":");
    if(arr[0] > 12){
        var hour = arr[0] - 12;
        return hour + ":" + arr[1] + " PM";
    }
    else{
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
        });

        // push those rides to a driver table
    }

    console.log(groups);


    push_rides(groups);
    return groups;
}

function push_rides(groups){
    var locationRef = database.ref("locations");
    var i = 0;
    locationRef.on("child_added", function(snap){
        var group = groups[i];
        i++;
        var ride = locationRef.child(snap.key);
        ride.update({
            rides: group
        });
        ride.on("child_added", display_ride);
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
    }
    else {
        divide_rides(snap, num_drivers);
    }
}

function no_rides() {
    var no_rides_div = document.createElement("div");
    no_rides_div.setAttribute("id", "no_rides");
    no_rides_div.setAttribute("style", "display: flex; justify-content: space-between;");

    var no_rides_text = document.createTextNode("There are no rides scheduled.");
    no_rides_div.appendChild(no_rides_text);
    allRides.append(no_rides_div);
}

function display_ride(data) {
    var rides = data.val();
    var k = data.key;

    var no_rides_div = document.getElementById("no_rides");
    if(no_rides_div != null){
        no_rides_div.style.display = "none";
    }

    if(k === "rides"){
        for(var i = 0; i < rides.length; i++){
            //var date = formatDate(rides[i]["date"]);
            var dropoff = rides[i]["dropoff"];
            var pickup = rides[i]["pickup"];
            var time = formatTime(rides[i]["time"]);
            var name = getName(rides[i]["email"]);

            var rideDiv = document.createElement("div");
            rideDiv.setAttribute("id", "ride" + k);
            rideDiv.setAttribute("style", "display: flex; justify-content: space-between;");

            var rideInfo = document.createTextNode(name + " Time: " + time + " Pickup: " + pickup + " Dropoff: " + dropoff);
            rideDiv.appendChild(rideInfo);
            allRides.appendChild(rideDiv);
        }
    }
}

function getName(email){
    return studentsDict[email];
}
