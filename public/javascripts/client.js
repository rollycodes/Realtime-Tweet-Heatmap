const socket = window.io.connect('http://localhost:8000');
// const socket = window.io.connect('https://realtime-twitter-feed-heatmap.herokuapp.com/');

socket.on('connection', function() {
    socket.emit('begin stream');

    socket.on('filteredData', function(filteredData) {

        var geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({
            address: filteredData.city + (filteredData.country.length > 0 ? ", " + filteredData.country : "")
        }, (results, status) => {
            if (status == google.maps.GeocoderStatus.OK) {
                console.log(results);
                filteredData.coordinates = [];
                filteredData.coordinates.push(results[0].geometry.location.lat());
                filteredData.coordinates.push(results[0].geometry.location.lng());
                if (filteredData.country == "") {
                    var country_item = results[0].address_components.find(x => x.types.includes("country"));
                    if (country_item != null) {
                        filteredData.country = country_item.long_name;
                    }
                }
                console.log(filteredData.coordinates);
                if (filteredData.country != "") {
                    window.map.updateMarkers(filteredData);
                    window.leftNav.updateIndex(filteredData);
                    window.rightNav.updateIndex(filteredData);
                    window.bottomNav.updateIndex(filteredData);
                }

            } else {
                console.log('Geocode was not successful for the following reason: ' + status);
            }
        });
    });
});