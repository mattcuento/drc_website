function login() {
    const txtEmail = document.getElementById('txtEmail');
    const txtPassword = document.getElementById('txtPassword');
    const bntLogin = document.getElementById('btnLogin');
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.then((authData) => {
        console.log("User created successfully with payload-", authData);
        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                var users = firebase.database().ref().child("users");
                console.log(firebaseUser.email);

                users.orderByKey().on('child_added', function(snap) {
                    var user_val = snap.val();
                    var user_type = user_val[Object.keys(user_val)[0]];
                    var gmail = Object.keys(user_val)[0] + "@gmail.com";
                    var calpoly = Object.keys(user_val)[0] + "@calpoly.edu";
                    if (gmail == firebaseUser.email){
                        if (user_type == "driver") {
                            console.log("I am the driver");
                            window.location = "../Driver/driver_main.html";
                        }else if (user_type == "admin") {
                            window.location = "../Admin/admin_main_map.html";
                             console.log("I am the admin");
                        }
                    }else{
                        var user = calpoly;
                        var students = firebase.database().ref().child("students");
                        console.log(firebaseUser.email);
                        console.log(user_type);
                        console.log(user);
                        students.orderByChild("email").equalTo(firebaseUser.email).on('value', function(snap) {
                            var userQuery = snap.val();
                            var key = Object.keys(userQuery)[0];
                            var stud;
                            students.child(key).on('value', function(snap) {
                                stud = snap.val();
                            });
                            if (stud['email'] == user) {
                                var endDate = stud['end_eligibility'];
                                var dateArr = endDate.split("-");
                                var d = new Date();
                                var flag = 0;
                                var status = stud['permission'];
                                if (status === "Inactive"){
                                    alert("Your account is inactive.\nPlease call the DRC at 805-756-1396.");
                                    flag = 1;
                                }else{
                                    if (dateArr[0] < d.getFullYear()) {
                                        console.log(dateArr[0]);
                                        alert("Your eligibility date has passed!\nPlease call the DRC at 805-756-1396.");
                                        flag = 1;
                                    } else {
                                        console.log(dateArr[1]);
                                        console.log(d.getMonth()+1);
                                        if (dateArr[1] < d.getMonth() + 1) {
                                            alert("Your eligibility date has passed!\nPlease call the DRC at 805-756-1396.");
                                            flag = 1;
                                        } else {
                                            console.log(dateArr[2]);
                                            console.log(d.getDate());
                                            if (dateArr[1] == d.getMonth() + 1 && dateArr[2] < d.getDate()) {
                                                alert("Your eligibility date has passed!\nPlease call the DRC at 805-756-1396.");
                                                flag = 1;

                                            }else if (dateArr[2] == d.getDate()) {
                                                alert("This is your last day of eligibility!\nPlease call the DRC at 805-756-1396 if you need an extension.");
                                            }
                                        }
                                    }
                                }
                                if (flag == 0) {
                                    window.location = "../Student/index.html";
                                }
                            }
                        });
                    }
                    console.log(user_type);
                });
            } else {
                console.log("log in error");
            }
        });
        //Write code to use authData to add to Users
    }).catch((_error) => {
        alert("Please enter valid username and password");
        console.log("Registration Failed!", _error);
    })
}
