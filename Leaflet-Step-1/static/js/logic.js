let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let mapZoomLevel = 5;
let sanDiegoCoords = [37, -120]

//createMap function
function createMap(earthquakes) {
    //tile layer
    let lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
      });
    

  //create the baseMap object for the lightmap layer
  let baseMap = {
      "Light Map": lightmap
  };

  //create and overlayMap object to hold the earthquake layer
  let overlayMap = {
      "Earthquakes": earthquakes
  };

  //creating the map object
  let map = L.map("map", {
      center: sanDiegoCoords,
      zoom: mapZoomLevel,
      layers: [lightmap, earthquakes]
  });

  //creating the layer control
  L.control.layers(baseMap, overlayMap, {
      collapsed: true
  }).addTo(map);

  //adding the legend
  let legend = L.control({position: "bottomright"});

  legend.onAdd = function (map) {
      let div = L.DomUtil.create('div', 'info legend'),
        grades = [1,2,3,4,5],
        labels = [];

        //loop through grades, create label with colored square for each interval
        for (var i=0; i < grades.length; i++) {
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
    return  d > 5 ? "#d7191c" :
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
            fillOpacity: 0.7,
            radius: (earthquake.properties.mag) * 10000
            }).bindPopup(`<strong>Location</strong>: ${earthquake.properties.place} 
            <br><strong>Magnitude</strong>: ${earthquake.properties.mag}
            <br><strong>Date/Time</strong>: ${new Date(earthquake.properties.time)}`);
        
        //add the marker to the marker array
        earthquakeMarkers.push(earthquakeMarker);
    }

    //create a layer group made from the earthquake markers array and pass it into the createMap function
    createMap(L.layerGroup(earthquakeMarkers));
}

//perform the API call to get the eathquake info and call the createMarkers function when complete
d3.json(queryUrl, createMarkers);