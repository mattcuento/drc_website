var emailInput = document.getElementById('email');
var searchButton = document.getElementById('searchButton');

var savePopup = document.getElementById('savePop');
var closeSavePop = document.getElementsByClassName('close')[0];

var editButtonDiv = document.getElementById('editbutton');
var endDatePopup = document.getElementById('enddate');

var editPopup = document.getElementById('editPop');
var saveEdit = document.getElementById('popup-save');
var cancelEdit = document.getElementById('popup-cancel-edit');
var provisionalInput = document.getElementById('provisional');
var activeInput = document.getElementById('active');
var inactiveInput = document.getElementById('inactive');

var notFoundPopup = document.getElementById("notFoundPopup");
var closeNotFound = document.getElementsByClassName('close')[1];

var database = firebase.database();
var ref = database.ref('students');

var found = true;

searchButton.onclick = function(){
    while(studentInfo.firstChild){
        studentInfo.removeChild(studentInfo.firstChild);
    }
    ref.on('child_added', getStudent, errData);
    ref.on('child_changed', getStudent, errData);
    
}

if(!found){
    notFoundPopup.style.display = "block";
}

function getStudent(data){
    while(editButtonDiv.firstChild){
        editButtonDiv.removeChild(editButtonDiv.firstChild);
    }
    var student = data.val();

    var name = student["name"];
    var email = student["email"];
    var endDate = student["end_eligibility"];
    var permission = student["permission"];
    var wheelchair = student["wheelchair"];
    var addinfo = student["info"];
    if(addinfo === ""){
        addinfo = "None";
    }
    if(wheelchair){
        wheelchair = "Yes";
    }
    else{
        wheelchair = "No";
    }

    endDatePopup.value = endDate;

    endDate = formatDate(endDate)

    if(email === emailInput.value){
        var resText = document.getElementById("resultText");
        resText.innerText = "Results for " + email + ": ";

        var nameText = document.getElementById("studentName");
        nameText.innerText = name;

        var infoText = document.getElementById('studentInfo');
        infoText.innerText = "Email: " + email + "\nPermissions: " + permission + "\nEnd Eligibility Date: " + endDate + "\nWheelchair Accessibility: " + wheelchair + "\nAdditional Information: " + addinfo;
        
        var editButton = document.createElement("button");
        editButton.innerHTML = "Edit";
        editButton.setAttribute("style", "background-color: #035642; border-radius: 4px;border: none;text-decoration: none;font-family: Roboto;color: white;font-weight: 500;padding: 0 20px;");
        editButton.setAttribute("id", "editButton");
        editButton.setAttribute("onclick", "editPopup.style.display = 'block'");
        editButtonDiv.appendChild(editButton);

        if(permission === 'Provisional'){
            provisionalInput.checked = true;
        }
        else if(permission === 'Active'){
            activeInput.checked = true;
        }
        else if(permission === 'Inactive'){
            inactiveInput.checked = true;
        }
        found = true;
        console.log("inside" + email);
    }
    else{
        found = false;
        console.log(email);
        console.log(emailInput.value);
    }
}

function formatDate(date){
    var arr = date.split("-");
    return arr[1] + "/" + arr[2] + "/" + arr[0];
}

saveEdit.onclick = function(){
    ref.on('child_added', updateStudent, errData);
}

function updateStudent(data){
    var rides = firebase.database().ref().child("rides");
    var k = data.key;

    var permissionInput = '';
    if(provisionalInput.checked){
        permissionInput = 'Provisional';
    }
    else if(activeInput.checked){
        permissionInput = 'Active';
    }
    else if(inactiveInput.checked){
        permissionInput = 'Inactive';
        rides.orderByChild('email').equalTo(emailInput.value).on('child_added', function(snap){
          snap.ref.remove();
        });
    }
    var ref = database.ref('students');
    var el = ref.child(k);
    el.update({
        permission: permissionInput,
        end_eligibility: endDatePopup.value
    });
    
    editPopup.style.display = "none";
    savePopup.style.display = "block"; 
}

function errData(err){
    console.log('Error!');
    console.log(err);
}

closeSavePop.onclick = function(){
    savePopup.style.display = "none";
}

cancelEdit.onclick = function(){
    editPopup.style.display = "none";
}

closeNotFound.onclick = function(){
    notFoundPopup.style.display = "none";
}
