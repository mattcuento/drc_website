(function(){

  var users = firebase.database().ref().child("users");
  const txtUser = document.getElementById('Driver_username');
  const txtPassword = document.getElementById('Driver_Password');
  const bntRegister = document.getElementById('btnDriverRegister');
  const name = document.getElementById('btnDriverRegister');
  const confirm = document.getElementById('Driver_confirm_password');

  bntRegister.addEventListener('click', e => {
    const username = txtUser.value;
    const email = username + "@gmail.com";
    const pass = txtPassword.value;
    const auth = firebase.auth();
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.then(function () {
      user = firebase.auth().currentUser;
      user.sendEmailVerification();
      users.push({[username] : "driver"});
      alert('User Created. Validation link was sent to ' + email + '.');
      txtUser.value = "";
      txtPassword.value = "";
      name.value = "";
      confirm.value = "";
    })
    .then(function () {
      user.updateProfile({
        displayName: name.value,
      });
    })
    .catch(function(error) {
      alert(error.message);
    });
  });

}())
