  
  var users = firebase.database().ref().child("users");
  const txtUser = document.getElementById('txtUser');
  const txtPassword = document.getElementById('txtPassword');
  const confirmPassword = document.getElementById('confirm_password');
  const bntRegister = document.getElementById('btnRegister');
  const nameInput = document.getElementById('name');
  var accessibilityInput = document.getElementById('accessibility');
  var btnRegister = document.getElementById('btnRegister');
  var invalidPopup = document.getElementById('invalidPop');
  var closeSave = document.getElementsByClassName("close")[0];
  var closeInvalid = document.getElementsByClassName("close")[1];

function addNewStudent(){//add to student table
  var database = firebase.database();
  var ref = database.ref('students');

  // week of provisional eligibility 
  var date = new Date();
  date.setDate(date.getDate() + 7);

  var student = {
      name: nameInput.value,
      email: txtUser.value + "@calpoly.edu",
      end_eligibility: formatDate(date),
      wheelchair: accessibilityInput.checked,
      permission: "Provisional"
  }
  
  ref.push(student);
  txtUser.value = "";
  txtPassword.value = "";
  nameInput.value = "";
  confirmPassword.value = "";
  accessibilityInput.checked = false;
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


function formValid(){
    return nameInput.value && txtUser.value;
}


(function(){
  bntRegister.addEventListener('click', e => {
    const username = txtUser.value;
    const email = username + "@calpoly.edu";
    const pass = txtPassword.value;
    const auth = firebase.auth();
    if(formValid()){
        addNewStudent();
        const promise = auth.createUserWithEmailAndPassword(email, pass);
        promise.then(function (){
          user = firebase.auth().currentUser;
          user.sendEmailVerification();
          users.push({[username] : "student"});
          alert('User Created. Validation link was sent to ' + email + '.');
        })
        .then(function () {
          user.updateProfile({
            displayName: nameInput.value,
          });
        })
        .catch(function(error) {
          alert(error.message);
        });
        }
    else{
        alert("invalid entry");
    }
  });

}())

