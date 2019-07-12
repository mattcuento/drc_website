var name = document.getElementById('name');
var email = document.getElementById('email');
var date = document.getElementById('date');
var time = document.getElementById('time');
var pickup = document.getElementById('pickup');
var dropoff = document.getElementById('dropoff');
var reoccur = document.getElementById('reoccuring-yes');
var noreoccur = document.getElementById('reoccuring-no');
var reoccurPopup = document.getElementById("reoccurPopup");

var monday = document.getElementById("monday");
var tuesday = document.getElementById("tuesday");
var wednesday = document.getElementById("wednesday");
var thursday = document.getElementById("thursday");
var friday = document.getElementById("friday");
var endDate = document.getElementById("end-repeat-date");
var passEligibilityPopup = document.getElementById("passEligPopup");

var passEligibilityOncePopup = document.getElementById("passEligOncePopup");

var saveButton = document.getElementById('saveButton');
var savePopup = document.getElementById('savePop');
var invalidPopup = document.getElementById('invalidPop');
var notFoundPopup = document.getElementById("notFoundPopup");
var closeSave = document.getElementsByClassName("close")[0];
var closeNotFound = document.getElementsByClassName("close")[1];
var closeInvalid = document.getElementsByClassName("close")[2];
var closePassElig = document.getElementsByClassName("close")[3];
var closePassEligOnce = document.getElementsByClassName("close")[4];

var database = firebase.database();

var username;
var wheelchair;

function getInfo(data){
    var students = data.val();
    var keys = Object.keys(students);
    
    for(var i=0; i<keys.length; i++){
        var k = keys[i];
        
        var emailData = students[k].email;

        if(emailData === email.value){
            username = students[k].name;
            wheelchair = students[k].wheelchair;

            var start = new Date(date.value);
            var end = new Date(endDate.value);
            var endEligibility = new Date(students[k].end_eligibility);

            if(reoccur.checked && end > endEligibility){
                endDate.value = students[k].end_eligibility;
                passEligibilityPopup.style.display = "block";
            }

            if(noreoccur.checked && start > endEligibility){
                passEligibilityOncePopup.style.display = "block";
                return;
            }
        }
    } 

    if(noreoccur.checked){
        addNewRide(); 
    }      
    else if (reoccur.checked){
        reoccurRide();
    }
}

function addNewRide(){
    var ref = database.ref('rides');

    if(username !== undefined){
        var ride = {
            email: email.value,
            date: date.value,
            time: time.value,
            pickup: pickup.value,
            dropoff: dropoff.value,
            timestamp: date.value + " " + time.value,
            reoccur: false,
            user_name: username,
            wheelchair: wheelchair,
            no_show: false
        };
    
        ref.push(ride);

        email.value = "";
        date.value = "";
        time.value = "";
        pickup.value = "";
        dropoff.value = "";
        savePopup.style.display = "block";
    }
    else{
        notFoundPopup.style.display = "block";
    }    
}

function reoccurRide(){
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

    if(username !== undefined){
        var arrStart = date.value.split("-");
        var arrEnd = endDate.value.split("-");

        var start = new Date(arrStart[0],arrStart[1] - 1, arrStart[2]);
        var end = new Date(arrEnd[0], arrEnd[1] - 1, arrEnd[2]);
        var curr = new Date(start);

        while(curr < end){
            if (repeat.includes(curr.getDay())){
                var ride = {
                    email: email.value,
                    date: formatDate(curr),
                    time: time.value,
                    pickup: pickup.value,
                    dropoff: dropoff.value,
                    timestamp: formatDate(curr) + " " + time.value,
                    reoccur: true,
                    reoccurpattern: formatPattern(start, repeat, end),
                    user_name: username,
                    wheelchair: wheelchair,
                    no_show: false
                };
            
                ref.push(ride);
            }
            
            curr.setDate(curr.getDate() + 1);
        }

        email.value = "";
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
    else{
        notFoundPopup.style.display = "block";
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
    if(formValid()){   
        var studentRef = database.ref('students');
        studentRef.on('value', getInfo);
    }
    else{
        invalidPopup.style.display = "block";
    }
}

reoccur.onclick = function(){
    reoccurPopup.style.display = "block";
}

noreoccur.onclick = function(){
    reoccurPopup.style.display = "none";
}

closeSave.onclick = function() {
    savePopup.style.display = "none";
}

closeNotFound.onclick = function(){
    notFoundPopup.style.display = "none";
}

closeInvalid.onclick = function(){
    invalidPopup.style.display = "none";
}

closePassElig.onclick = function(){
    passEligibilityPopup.style.display = "none";
}

closePassEligOnce.onclick = function(){
    passEligibilityOncePopup.style.display = "none";
}

function formValid(){
    if (reoccur.checked){
        return email.value && date.value && time.value && pickup.value && dropoff.value && endDate.value; 
    }
    return email.value && date.value && time.value && pickup.value && dropoff.value;
}
