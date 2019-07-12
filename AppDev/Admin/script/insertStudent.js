var nameInput = document.getElementById('name');
var emailInput = document.getElementById('email');
var accessibilityInput = document.getElementById('accessibility');
var additionalInfoInput = document.getElementById('additionalInfo');

var saveButton = document.getElementById('saveButton');
var savePopup = document.getElementById('savePop');
var invalidPopup = document.getElementById('invalidPop');
var closeSave = document.getElementsByClassName("close")[0];
var closeInvalid = document.getElementsByClassName("close")[1];

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

function addNewStudent(){ //add to student table
    var database = firebase.database();
    var ref = database.ref('students');

    // week of provisional eligibility 
    var date = new Date();
    date.setDate(date.getDate() + 7);

    var student = {
        name: nameInput.value,
        email: emailInput.value,
        end_eligibility: formatDate(date),
        info: additionalInfoInput.value,
        wheelchair: accessibilityInput.checked,
        permission: "Provisional"
    }
    
    ref.push(student);

    nameInput.value = "";
    emailInput.value = "";
    accessibilityInput.checked = false;
    additionalInfoInput.value = "";
    savePopup.style.display = "block";
}


saveButton.onclick = function() {
    if(formValid()){
        addNewStudent();
    }
    else{
        invalidPopup.style.display = "block";
    }
}

closeSave.onclick = function() {
    savePopup.style.display = "none";
}

closeInvalid.onclick = function(){
    invalidPopup.style.display = "none";
}

function formValid(){
    return nameInput.value && emailInput.value;
}
