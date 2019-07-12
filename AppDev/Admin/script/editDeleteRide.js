var emailInput = document.getElementById('email');
var searchButton = document.getElementById('searchButton');
var rideList = document.getElementById('ridelist');

var deletePopup = document.getElementById('delPop');
var oneRide = document.getElementById('oneRide');
var multRide = document.getElementById('multRide');
var confirmDeleteReoccur = document.getElementById('popup-delete');
var declineDeleteReoccur = document.getElementById('popup-cancel-delete');

var confirmDeletePopup = document.getElementById('confirmDelPop');
var confirmDelete = document.getElementById('popup-confirm-delete');
var declineDelete = document.getElementById('popup-decline-delete');

var editPopup = document.getElementById('editPop');
var editOneRide = document.getElementById('editOneRide');
var editMultRide = document.getElementById('editMultRide');
var reoccurDate = document.getElementsByClassName('edit-date')[0];
var reoccurPop = document.getElementsByClassName('reoccur')[0];
var saveEdit = document.getElementById('popup-save');
var cancelEdit = document.getElementById('popup-cancel-edit');
var savePopup = document.getElementById('savePop');
var closeSavePop = document.getElementsByClassName('close')[0];
var fillInfoPopup = document.getElementById('fillInfoPopup');
var closeFillInfoPop = document.getElementsByClassName('close')[2];

var dateInput = document.getElementById('date');
var timeInput = document.getElementById('time');
var pickupInput = document.getElementById('pickup');
var dropoffInput = document.getElementById('dropoff');

var passEligibilityPopup = document.getElementById("passEligPopup");
var closePassElig = document.getElementsByClassName('close')[1];

var notFoundPopup = document.getElementById("notFoundPopup");
var closeNotFound = document.getElementsByClassName('close')[3];


var database = firebase.database();
var refObject = database.ref('rides').orderByChild("timestamp");

var studentEndElig;

searchButton.onclick = function(){
    while(rideList.firstChild){
        rideList.removeChild(rideList.firstChild);
    }
    refObject.on('child_added', getAllRides, errData);
    refObject.on('child_removed', deleteRide, errData);
    refObject.on('child_changed', updateRide, errData);
}

function getAllRides(data){
    var rides = data.val();
    var k = data.key;

    var email = rides["email"];

    var ref = database.ref('students');
    ref.on('value', getName, errData);

    if(email === emailInput.value){
        var date = formatDate(rides["date"]);
        var dropoff = rides["dropoff"];
        var pickup = rides["pickup"];
        var time = formatTime(rides["time"]);
        var reoccur = rides["reoccur"];

        var ride = document.createElement("div");
        ride.setAttribute("id", "ride" + k);
        ride.setAttribute("style", "display: flex; justify-content: space-between;");

        var buttons = document.createElement("div");
        buttons.setAttribute("style", "display: flex; justify-content: space-between;")
        var editButton = document.createElement("button");
        var deleteButton = document.createElement("button");
        editButton.innerHTML = "Edit";
        deleteButton.innerHTML = "Delete";
        editButton.setAttribute("style", "background-color: #035642; border-radius: 4px;border: none;text-decoration: none;font-family: Roboto;color: white;font-weight: 500;padding: 0 20px;margin: 5% 10%");
        editButton.setAttribute("id", "editButton");
        editButton.setAttribute("onclick", "editData('" + k + "','" + rides["date"] + "','" + dropoff + "','" + pickup + "','" + rides["time"] + "'," + reoccur + ")");
        deleteButton.setAttribute("style", "background-color: #035642; border-radius: 4px;border: none;text-decoration: none;font-family: Roboto;color: white;font-weight: 500;padding: 0 20px;margin: 5% 10%;");
        deleteButton.setAttribute("id", "deleteButton");
        deleteButton.setAttribute("onclick", "deleteData('" + k + "'," + reoccur + ")");
        buttons.appendChild(editButton);
        buttons.appendChild(deleteButton);

        var rideInfo = document.createTextNode(date + " Time: " + time + " Pickup: " + pickup + " Dropoff: " + dropoff);
        ride.appendChild(rideInfo);
        ride.appendChild(buttons);

        rideList.appendChild(ride);
    }
    else{
        notFoundPopup.style.display = "block";
    }

}

function updateRide(data){
    var rides = data.val();
    var k = data.key;

    var ride = document.getElementById("ride" + k);

    var date = formatDate(rides["date"]);
    var dropoff = rides["dropoff"];
    var pickup = rides["pickup"];
    var time = formatTime(rides["time"]);
    var reoccur = rides["reoccur"];
    var rideInfo = document.createTextNode(date + " Time: " + time + " Pickup: " + pickup + " Dropoff: " + dropoff);

    var buttons = document.createElement("div");
    buttons.setAttribute("style", "display: flex; justify-content: space-between;")
    var editButton = document.createElement("button");
    var deleteButton = document.createElement("button");
    editButton.innerHTML = "Edit";
    deleteButton.innerHTML = "Delete";
    editButton.setAttribute("style", "background-color: #035642; border-radius: 4px;border: none;text-decoration: none;font-family: Roboto;color: white;font-weight: 500;padding: 0 20px;margin: 5% 10%");
    editButton.setAttribute("id", "editButton");
    editButton.setAttribute("onclick", "editData('" + k + "','" + rides["date"] + "','" + dropoff + "','" + pickup + "','" + rides["time"] + "'," + reoccur + ")");
    deleteButton.setAttribute("style", "background-color: #035642; border-radius: 4px;border: none;text-decoration: none;font-family: Roboto;color: white;font-weight: 500;padding: 0 20px;margin: 5% 10%;");
    deleteButton.setAttribute("id", "deleteButton");
    deleteButton.setAttribute("onclick", "deleteData('" + k + "'," + reoccur + ")");
    buttons.appendChild(editButton);
    buttons.appendChild(deleteButton);

    ride.replaceChild(rideInfo, ride.childNodes[0]);
    ride.replaceChild(buttons, ride.childNodes[1]);
}

function deleteRide(data){
    var k = data.key;

    var ride = document.getElementById("ride" + k);
    rideList.removeChild(ride);
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

function getName(data){
    var students = data.val();
    var keys = Object.keys(students);

    for(var i=0; i<keys.length; i++){
        var k = keys[i];
        var name = students[k].name;
        var email = students[k].email;

        if(email === emailInput.value){
            var nameText = document.getElementById("riderName");
            nameText.innerText = "Rides for " + name + ":";

            var filler = document.createElement("div");
            filler.setAttribute("style", "height: 20px;");

            nameText.appendChild(filler);

            studentEndElig = students[k].end_eligibility;
        }
    }
}

function errData(err){
    console.log('Error!');
    console.log(err);
}

function editData(key, date, dropoff, pickup, time, reoccur){
    dateInput.value = date;
    dropoffInput.value = dropoff;
    pickupInput.value = pickup;
    timeInput.value = time;

    editPopup.style.display = "block";

    if(reoccur){
        reoccurPop.style.display = "block";
    }
    else{
        reoccurPop.style.display = "none";
    }

    saveEdit.onclick = function(){
        if(dateInput.value > studentEndElig){
            passEligibilityPopup.style.display = "block";
            return;
        }

        if(editOneRide.checked || editMultRide.checked){
            var ref = database.ref('rides');
            if(editOneRide.checked){
                var el = ref.child(key);
                el.update({
                    date: dateInput.value,
                    time: timeInput.value,
                    dropoff: dropoffInput.value,
                    pickup: pickupInput.value,
                    timestamp: dateInput.value + " " + timeInput.value,
                    reoccur: false,
                    reoccurpattern: ""
                });
            }
            else if(editMultRide.checked){
                ref.child(key).once("value", ride => {
                    var info = ride.val();
                    var pattern = info["reoccurpattern"];

                    ref.once("value", ride => {
                        ride.forEach(rideInfo => {
                            var list = rideInfo.val();
                            var k = rideInfo.key;

                            var ridePattern = list["reoccurpattern"];

                            if(pattern === ridePattern){
                                var el = ref.child(k);
                                el.update({
                                    time: timeInput.value,
                                    dropoff: dropoffInput.value,
                                    pickup: pickupInput.value,
                                    timestamp: dateInput.value + " " + timeInput.value
                                });
                            }
                        });
                    });

                });
            }

            editPopup.style.display = "none";
            savePopup.style.display = "block";
        }
        else{
            fillInfoPopup.style.display = "block";
            return;
        }

        editOneRide.checked = false;
        editMultRide.checked = false;
    }
}

editMultRide.onclick = function(){
    reoccurDate.style.display = "none";
}

editOneRide.onclick = function(){
    reoccurDate.style.display = "block";
}

closeSavePop.onclick = function(){
    savePopup.style.display = "none";
}

closePassElig.onclick = function(){
    passEligibilityPopup.style.display = "none";
}

closeFillInfoPop.onclick = function(){
    fillInfoPopup.style.display = "none";
}

closeNotFound.onclick = function(){
    notFoundPopup.style.display = "none";
}


function deleteData(key, reoccur){
    if(reoccur){
        deletePopup.style.display = "block";
    }
    else{
        confirmDeletePopup.style.display = "block";
    }

    confirmDeleteReoccur.onclick = function(){
        if(oneRide.checked || multRide.checked){
            deletePopup.style.display = "none";
            confirmDeletePopup.style.display = "block";
        }
    }

    confirmDelete.onclick = function(){
        var ref = database.ref('rides');

        if(reoccur){
            if(oneRide.checked){
                ref.child(key).remove();
            }
            else if(multRide.checked){
                ref.child(key).once("value", deleteMultRide, errData);
            }
        }
        else{
            ref.child(key).remove();
        }
        confirmDeletePopup.style.display = "none";
        oneRide.checked = false;
        multRide.checked = false;
    }
}

function deleteMultRide(data){
    var info = data.val();
    var k = info["reoccurpattern"];

    var ref = database.ref('rides');
    ref.once("value", ride => {
        ride.forEach(rideInfo => {
            var list = rideInfo.val();
            var key = rideInfo.key;
            if(list["reoccurpattern"] === k){
                ref.child(key).remove();
            }
        });
    });
}

cancelEdit.onclick = function(){
    editPopup.style.display = "none";
}

declineDelete.onclick = function(){
    confirmDeletePopup.style.display = 'none';
}

declineDeleteReoccur.onclick = function(){
    deletePopup.style.display = 'none';
}  
