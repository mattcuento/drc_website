var vehicleList = document.getElementById("vehicleList");

var typeInput = document.getElementById('type-input');
var plateInput =document.getElementById('plate-input');
var accessInput = document.getElementById('accessibility-input');

var addButton = document.getElementById('add');
var addPopButton = document.getElementById('popup-add');
var addPopup = document.getElementById('addPop');
var confirmSavePopup = document.getElementById('savePop');
var invalidPopup = document.getElementById('invalidPop');
var cancelAddButton = document.getElementById("popup-cancel-add");
var closeConfirm = document.getElementsByClassName("close")[0];
var closeInvalid = document.getElementsByClassName("close")[1];

var typeEdit = document.getElementById('type-edit');
var seatEdit = document.getElementById('seat-edit');
var plateEdit =document.getElementById('plate-edit');
var accessEdit = document.getElementById('accessibility-edit');
var outOfOrderEdit = document.getElementById('outoforder-edit');
var editPopup = document.getElementById('editPop');
var editSaveButton = document.getElementById('popup-save-edit');
var cancelEditButton = document.getElementById('popup-cancel-edit');

var confirmDeletePopup = document.getElementById('confirmDelPop');
var confirmDeleteButton = document.getElementById('popup-confirm-delete');
var declineDeleteButton = document.getElementById('popup-decline-delete');

var database = firebase.database();
var ref = database.ref('vehicles');
ref.on('child_added', getAllVehicles, errData);
ref.on('child_changed', editVehicle, errData);
ref.on('child_removed', removeVehicle, errData);

function getAllVehicles(data){
    var vehicle = data.val();
    var k = data.key;

    var type = vehicle["type"];
    var plate = vehicle["plate"];
    var access = vehicle["accessibility"];
    var outOfOrder = vehicle["out_of_order"];

    var vehicleDiv = document.createElement("div");
    vehicleDiv.setAttribute("id", k);
    vehicleDiv.setAttribute("style", "display: flex; justify-content: space-between;");
    
    var buttons = document.createElement("div");
    buttons.setAttribute("style", "display: flex; justify-content: space-between;")
    var editButton = document.createElement("button");
    var deleteButton = document.createElement("button");
    editButton.innerHTML = "Edit";
    deleteButton.innerHTML = "Delete";
    editButton.setAttribute("style", "background-color: #035642; border-radius: 4px;border: none;text-decoration: none;font-family: Roboto;color: white;font-weight: 500;margin: 20px 20px 20px 0; width: 80px; height: 30px;");
    editButton.setAttribute("id", "editButton");
    editButton.setAttribute("onclick", "editData('" + k + "','" + type + "'," + access + "," + outOfOrder + ",'" + plate + "')");
    console.log(outOfOrder);
    deleteButton.setAttribute("style", "background-color: #035642; border-radius: 4px;border: none;text-decoration: none;font-family: Roboto;color: white;font-weight: 500;margin: 20px 0 20px 20px; width: 80px; height: 30px;");
    deleteButton.setAttribute("id", "deleteButton"); 
    deleteButton.setAttribute("onclick", "deleteData('" + k +"')");  
    buttons.appendChild(editButton);
    buttons.appendChild(deleteButton);

    var vehicleInfo = document.createElement("div");

    var typeDiv = document.createElement("div");
    var typeInfo = document.createTextNode(type);
    typeDiv.setAttribute("style", "font-size: 28px; font-weight: bold;")
    typeDiv.appendChild(typeInfo);

    var plateDiv = document.createElement("div");
    var plateInfo = document.createTextNode("License Plate: " + plate);
    plateDiv.setAttribute("style", "margin-left: 30px;");
    plateDiv.appendChild(plateInfo);

    vehicleInfo.appendChild(typeDiv);
    vehicleInfo.appendChild(plateDiv);
    vehicleInfo.setAttribute("style", "display: flex; flex-direction: column;")
    if(access){
        var accessDiv = document.createElement("div");
        var accessInfo = document.createTextNode("Wheelchair Accessible");
        accessDiv.setAttribute("style", "margin-left: 30px;");
        accessDiv.appendChild(accessInfo);
        vehicleInfo.appendChild(accessDiv);
    }
    if(outOfOrder){
        var outOfOrderDiv = document.createElement("div");
        var outOfOrderInfo = document.createTextNode("Out of Order");
        outOfOrderDiv.setAttribute("style", "margin-left: 30px;");
        outOfOrderDiv.appendChild(outOfOrderInfo);
        vehicleInfo.appendChild(outOfOrderDiv);
    }

    vehicleDiv.appendChild(vehicleInfo);
    vehicleDiv.appendChild(buttons);

    vehicleList.appendChild(vehicleDiv);    
}

function editVehicle(data){
    var vehicle = data.val();
    var k = data.key;

    var type = vehicle["type"];
    var plate = vehicle["plate"];
    var access = vehicle["accessibility"];
    var outOfOrder = vehicle["out_of_order"];

    var vehicleDiv = document.getElementById(k);
    
    var buttons = document.createElement("div");
    buttons.setAttribute("style", "display: flex; justify-content: space-between;")
    var editButton = document.createElement("button");
    var deleteButton = document.createElement("button");
    editButton.innerHTML = "Edit";
    deleteButton.innerHTML = "Delete";
    editButton.setAttribute("style", "background-color: #035642; border-radius: 4px;border: none;text-decoration: none;font-family: Roboto;color: white;font-weight: 500;margin: 20px 20px 20px 0; width: 80px; height: 30px;");
    editButton.setAttribute("id", "editButton");
    editButton.setAttribute("onclick", "editData('" + k + "','" + type + "'," + access + "," + outOfOrder + ",'" + plate + "')");
    deleteButton.setAttribute("style", "background-color: #035642; border-radius: 4px;border: none;text-decoration: none;font-family: Roboto;color: white;font-weight: 500;margin: 20px 0 20px 20px; width: 80px; height: 30px;");
    deleteButton.setAttribute("id", "deleteButton"); 
    deleteButton.setAttribute("onclick", "deleteData('" + k +"')");  
    buttons.appendChild(editButton);
    buttons.appendChild(deleteButton);

    var vehicleInfo = document.createElement("div");

    var typeDiv = document.createElement("div");
    var typeInfo = document.createTextNode(type);
    typeDiv.setAttribute("style", "font-size: 28px; font-weight: bold;")
    typeDiv.appendChild(typeInfo);

    var plateDiv = document.createElement("div");
    var plateInfo = document.createTextNode("License Plate: " + plate);
    plateDiv.setAttribute("style", "margin-left: 30px;");
    plateDiv.appendChild(plateInfo);

    vehicleInfo.appendChild(typeDiv);
    vehicleInfo.appendChild(plateDiv);
    vehicleInfo.setAttribute("style", "display: flex; flex-direction: column;")
    if(access){
        var accessDiv = document.createElement("div");
        var accessInfo = document.createTextNode("Wheelchair Accessible");
        accessDiv.setAttribute("style", "margin-left: 30px;");
        accessDiv.appendChild(accessInfo);
        vehicleInfo.appendChild(accessDiv);
    }
    if(outOfOrder){
        var outOfOrderDiv = document.createElement("div");
        var outOfOrderInfo = document.createTextNode("Out of Order");
        outOfOrderDiv.setAttribute("style", "margin-left: 30px;");
        outOfOrderDiv.appendChild(outOfOrderInfo);
        vehicleInfo.appendChild(outOfOrderDiv);
    }

    vehicleDiv.replaceChild(vehicleInfo, vehicleDiv.childNodes[0]);
    vehicleDiv.replaceChild(buttons, vehicleDiv.childNodes[1]); 
}

function removeVehicle(data){
    var k = data.key;
    
    var vehicle = document.getElementById(k);
    vehicleList.removeChild(vehicle);
}
function errData(err){
    console.log(err);
}

function editData(key, type, access, out_of_order, plate){
    typeEdit.value = type;
    accessEdit.checked = access;
    outOfOrderEdit.checked = out_of_order;
    plateEdit.value = plate;

    editPopup.style.display = "block";

    editSaveButton.onclick = function(){
        var vehicle = ref.child(key);
        vehicle.update({
            type: typeEdit.value,
            accessibility: accessEdit.checked,
            plate: plateEdit.value,
            out_of_order: outOfOrderEdit.checked
        })

        editPopup.style.display = "none";
        confirmSavePopup.style.display = "block";
    }
}

cancelEditButton.onclick = function() {
    editPopup.style.display = "none";
}

function deleteData(key){
    confirmDeletePopup.style.display = "block";

    confirmDeleteButton.onclick = function(){
        var ref = database.ref('vehicles');
        ref.child(key).remove();
        confirmDeletePopup.style.display = "none";
    }
}

declineDeleteButton.onclick = function(){
    confirmDeletePopup.style.display = 'none'; 
}  

// When the user clicks on the button, open the modal
addButton.onclick = function() {
    addPopup.style.display = "block";

    addPopButton.onclick = function() {
        if(formValid()){
            addVehicle();
        }
        else{
            invalidPopup.style.display = "block";
        }
    }
}

function addVehicle(){
    var vehicle = {
        type: typeInput.value,
        plate: plateInput.value,
        out_of_order: false,
        accessibility: accessInput.checked
    }

    ref.push(vehicle);

    typeInput.value = "";
    plateInput.value = "";
    accessInput.checked = false;

    addPopup.style.display = "none";
    confirmSavePopup.style.display = "block";
}

function formValid(){
    return typeInput.value;
} 

closeConfirm.onclick = function() {
    confirmSavePopup.style.display = "none";
}

closeInvalid.onclick = function() {
    invalidPopup.style.display = "none";
}

// When the user clicks on <span> (x), close the modal
cancelAddButton.onclick = function() {
    addPopup.style.display = "none";
}