//map boundaries
var bounds = [
    [-120.683, 35.295], // Southwest coordinates
    [-120.65, 35.316] // Northeast coordinates
];

//reference to locations branch
var locations = firebase.database().ref().child("locations");

//mapbox tokens
mapboxgl.accessToken = 'pk.eyJ1IjoiY2FscG9seWRyYyIsImEiOiJjanQzbTdyY3oxdmM1M3lwaXBodnYxdWZyIn0.ExsTXwSdoYErBWNRc-y09Q';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/calpolydrc/cjt3m8xjq1lov1fpa62pvwjni',
    center: [-120.659809, 35.301004],
    zoom: 15.0,
    maxBounds: bounds
});

function setDriverId() {
    var check = firebase.database().ref();
    check.on('value', function(snapshot) {
        if (!snapshot.child('locations').exists) {
            return 1;
        }
    });
    check = check.child('locations').orderByChild('driver_num').limitToLast(1);
    check.on('value', function(snapshot) {
        var val = snapshot.val();
        return val;
    });
}

//set up for drc stops and popups on map
map.on('click', function(e) {
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['drcstops']
    });

    if (!features.length) {
        return;
    }

    var feature = features[0];

    var popup = new mapboxgl.Popup({
            offset: [0, -15]
        })
        .setLngLat(feature.geometry.coordinates)
        .setHTML('<h2>' + feature.properties.stopnum + '</h2><p>' + feature.properties.description + '</p>')
        .setLngLat(feature.geometry.coordinates)
        .addTo(map);
});

//variables for longitude, latitude, and device id for location pushes
var lat;
var lng;
var myUuid = localStorage.getItem('myUuid');

//main code, checks for location first
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
            lat = position.coords.latitude;
            lng = position.coords.longitude;
        },
        function(error) {
            //TODO show popup and attach link https://support.google.com/chrome/answer/142065?hl=en
            if (window.confirm("Your location services are not enabled! Press OK to be redirected to directions on how to enable your location.")) {
                window.location.href = 'https://support.google.com/chrome/answer/142065?hl=en';
            };
            console.log("Error: ", error);
        }, {
            enableHighAccuracy: true
        }
    );
    // Create a new one for newcomers
    if (!myUuid) {
        //creates a location child specific to device
        var locationsKeyRef = locations.child(myUuid).set({
            coords: {
                longitude: lng,
                latitude: lat
            },
            timestamp: Math.floor(Date.now() / 1000),
            wheelchair: false,
            leaving_soon: false
        });
        myUuid = locationsKeyRef.key;
        localStorage.setItem('myUuid', myUuid);
    }
    locations.child(myUuid).onDisconnect().remove();
    //creates a point of current location
    var point = {
            "geometry": {
                "type": "Point",
                "coordinates": [lng, lat]
            },
            "type": "Feature",
            "properties": {}
        }
        //feature collection to grab all other location children
    var features = {
        "type": "FeatureCollection",
        "features": []
    };
    map.on('load', function() {
        locations.child(myUuid).child("wheelchair").set(false);
        locations.child(myUuid).child("leaving_soon").set(false);
        //var id = setDriverId();
        //FIX SET ID
        //locations.child(myUuid).child("driver_num").set(id);
        window.setInterval(function() {
            navigator.geolocation.getCurrentPosition(function(position) {
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                },
                function(error) {
                    //TODO show popup and attach link https://support.google.com/chrome/answer/142065?hl=en
                    if (window.confirm("Your location services are not enabled! Press OK to be redirected to directions on how to enable your location.")) {
                        window.location.href = 'https://support.google.com/chrome/answer/142065?hl=en';
                    };
                    console.log("Error: ", error);
                }, {
                    enableHighAccuracy: true
                }
            );
            point = {
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lng, lat]
                    },
                    "type": "Feature",
                    "properties": {}
                }
                //update current location
            locations.child(myUuid).child("coords").set({
                longitude: lng,
                latitude: lat
            });
            locations.child(myUuid).child("timestamp").set(Math.floor(Date.now() / 1000));
            //grab all locations from the database and add to featurecollection
            locations.once("value").then(function(snapshot) {
                var data = snapshot;
                var val = data.val();
                var keys = Object.keys(val);
                var tempFeat = {
                    "type": "FeatureCollection",
                    "features": []
                };
                for (var i = 0; i < keys.length; i++) {
                    var k = keys[i];
                    var curLat = val[k].coords.latitude;
                    var curLng = val[k].coords.longitude;
                    tempFeat.features.push({
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [+curLng, +curLat]
                        },
                        "properties": {
                            "title": "Driver " + (i + 1),
                            "icon": "car",
                        }
                    });
                    features = tempFeat;
                }
            });
            //set feature collection onto map
            map.getSource('driver').setData(features);
        }, 2000);

        map.addSource('driver', {
            "type": 'geojson',
            "data": features
        });
        map.addLayer({
            "id": "driver",
            "source": "driver",
            "type": "symbol",
            "layout": {
                "icon-image": "{icon}-15",
                "icon-size": 1.3,
                "text-size": 10,
                "text-field": "{title}",
                "text-anchor": "top",
                "text-offset": [0, .4]
            }
        });
    });
}