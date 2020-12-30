let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";
let geoJsonLink = "static/geojson/PB2002_boundaries.json";
let mapZoomLevel = 5;
let sanDiegoCoords = [37, -120]

//createMap function
function createMap(earthquakes, faultLayer) {
    //tile layer
    let lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    let darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    let satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "satellite-v9",
        accessToken: API_KEY
    });

    let outdoorMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "outdoors-v11",
        accessToken: API_KEY
    });

    //create the baseMap object for the lightmap layer
    let baseMap = {
        "Light Map": lightmap,
        "Dark Map": darkMap,
        "Satellite Map": satelliteMap,
        "Outdoor Map": outdoorMap
    };



    //creating the map object
    let map = L.map("map", {
        center: sanDiegoCoords,
        zoom: mapZoomLevel,
        layers: [lightmap, earthquakes, faultLayer]
    });

    //create an overlayMap object to hold the earthquake/fault layer
    let overlayMap = {
        "Earthquakes": earthquakes,
        "Fault Lines": faultLayer
    };

    //creating the layer control
    L.control.layers(baseMap, overlayMap, {
        collapsed: false
    }).addTo(map);

    //adding the legend
    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend'),
            grades = [1, 2, 3, 4, 5],
            labels = [];

        //loop through grades, create label with colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(map);
}

//color setting function for earthquake circles and legend
function getColor(d) {
    return d > 5 ? "#d7191c" :
        d > 4 ? "#fdae61" :
        d > 3 ? "#fcfc8d" :
        d > 2 ? "#a6d96a" :
                "#1a9641";
}

function createMarkers(response) {
    //get the earthquake property from the geojson response
    let earthquakes = response.features;

    //initialize array to hold quake markers
    let earthquakeMarkers = [];


    //Loop through the earthquakes array 
    for (var i = 0; i < earthquakes.length; i++) {
        let earthquake = earthquakes[i];

        //get the lat and lon
        let lat = earthquake.geometry.coordinates[1];
        let lon = earthquake.geometry.coordinates[0];

        let earthquakeMarker = L.circle([lat, lon], {
            weight: .7,
            color: "gray",
            fillColor: getColor(earthquake.properties.mag),
            fillOpacity: 0.9,
            radius: (earthquake.properties.mag) ** 2 * 3000
        }).bindPopup(`<strong>Location</strong>: ${earthquake.properties.place} 
            <br><strong>Magnitude</strong>: ${earthquake.properties.mag}
            <br><strong>Date/Time</strong>: ${new Date(earthquake.properties.time)}`);

        //add the marker to the marker array
        earthquakeMarkers.push(earthquakeMarker);
    }

    //create a layer group made from the earthquake markers array and pass it into the createMap function
    return L.layerGroup(earthquakeMarkers);
}

function createFaultLayer(faultresponse) {
return L.geoJson(faultresponse, {
            style: {
                color: "orange",
                weight: 2
            }
        });
}

//perform the API call to get the eathquake info and call the createMarkers function when complete
//d3.json(queryUrl, createMarkers);

d3.json(queryUrl, earthquakeResponse => {
    const earthquakeLayer = createMarkers(earthquakeResponse);

    d3.json(geoJsonLink, faultResponse => {
        const faultLayer = createFaultLayer(faultResponse);
    
        createMap(earthquakeLayer, faultLayer)
    });
    
});