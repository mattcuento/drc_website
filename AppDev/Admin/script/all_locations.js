var locations = firebase.database().ref().child("locations");

var features = {
    "type": "FeatureCollection",
    "features": []
};

map.on('style.load', function() {
    window.setInterval(function() {
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
                        "title": "Driver: " + (i + 1),
                        "icon": "car",
                    }
                });
                features = tempFeat;
            }
            //console.log(features);
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