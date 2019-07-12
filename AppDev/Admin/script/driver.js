var table = document.getElementById("table");
var headers = document.getElementById("headers");

var database = firebase.database();
var refObject = database.ref('locations');

refObject.on('child_added', getStatus, errData);
refObject.on('child_removed', removeDriver, errData);
refObject.on('child_changed', updateStatus, errData);

var num = 0;
var dict = {};
var count = 0;

function getStatus(data){
    var rides = data.val();
    var k = data.key;
    var wheel = rides["wheelchair"];
    var leaving_soon = rides["leaving_soon"];

    var newRow = table.insertRow(table.rows.length);

    var newCell0 = newRow.insertCell(0);
    var newText0 = document.createTextNode(++num);

    var newCell1 = newRow.insertCell(1);
    if(leaving_soon){
        var x = "Leaving Soon";
    }
    else{
        var x = "Active";
    }
    var newText1 = document.createTextNode(x);

    var newCell2 = newRow.insertCell(2);
    if(wheel){
        var w = "Yes";
    }
    else{
        var w = "No";
    }
    var newText2 = document.createTextNode(w);

    dict[k] = num;

    newCell0.appendChild(newText0);
    newCell1.appendChild(newText1);
    newCell2.appendChild(newText2);
    count++;
    console.log(count);
}

function updateStatus(data){
    var rides = data.val();
    var k = data.key;
    var wheel = rides["wheelchair"];
    var leaving_soon = rides["leaving_soon"];

    var rowNum = dict[k];

    var row = table.rows[rowNum];
    for(var i = 0; i < row.cells.length; i++){
        row.cells[i].removeChild(row.cells[i].firstChild);
    }

    var newText0 = document.createTextNode(rowNum);

    if(leaving_soon){
        var x = "Leaving Soon";
    }
    else{
        var x = "Active";
    }
    var newText1 = document.createTextNode(x);

    if(wheel){
        var w = "Yes";
    }
    else{
        var w = "No";
    }
    var newText2 = document.createTextNode(w);


    row.cells[0].appendChild(newText0);
    row.cells[1].appendChild(newText1);
    row.cells[2].appendChild(newText2);
}

function removeDriver(data){
    var k = data.key;
    
    var rowNum = dict[k];
    table.deleteRow(rowNum);
    delete dict[k];
    num--;

    Object.keys(dict).forEach(function(key){
        if(dict[key] > rowNum){
            dict[key] -= 1;            
        }
    });  
}

function errData(err){
    console.log('Error!');
    console.log(err);
}