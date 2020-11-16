// Initialize & Create LayerGroups: earthquakes
var earthquakes = new L.LayerGroup();

// Earthquakes GeoJSON URL Variables
var earthquakesDataURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Tile Layers
var outdoorMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY_TOKEN
});

var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY_TOKEN
});

var grayscaleMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY_TOKEN
});

//baseMaps Object to Hold Base Layers
var baseMaps = {
    "Satellite": satelliteMap,
    "Grayscale": grayscaleMap,
    "Outdoors": outdoorMap
};

//Overlay Object to Hold Overlay Layers
var overlayMaps = {
    "Earthquakes": earthquakes
};

// Create Map, Passing In satelliteMap & earthquakes as Default Layers to Display on Load
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 2,
    layers: [satelliteMap, earthquakes]
});

// Create a Layer Control + Pass in baseMaps and overlayMaps + Add the Layer Control to the Map
L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// Retrieve earthquakesDataURL (USGS Earthquakes GeoJSON Data) with D3
d3.json(earthquakesDataURL, function(earthquakeData) {

    // Function to Determine Size of Marker Based on the Magnitude of the Earthquake
    function markerSize(magnitude) {
        if (magnitude === 0) {
          return 1;
        }
        return magnitude * 3;
    }
    
    // Function to Determine Style of Marker Based on the Magnitude of the Earthquake
    function stylesInfo(feature) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: selectColor(feature.properties.mag),
          color: "#000000",
          radius: markerSize(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
    }
    
    // Function to Determine Color of Marker Based on the Magnitude of the Earthquake
    function selectColor(magnScale) {
        switch (true) {
        case magnScale > 5:
            return "#581845";
        case magnScale > 4:
            return "#900C3F";
        case magnScale > 3:
            return "#C70039";
        case magnScale > 2:
            return "#FF5733";
        case magnScale > 1:
            return "#FFC300";
        default:
            return "#DAF7A6";
        }
    }
    
    //A GeoJSON Layer Containing the Features Array on the earthquakeData Object
    L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: stylesInfo,
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h4>Location: " + feature.properties.place + 
            "</h4><hr><p>Date & Time: " + new Date(feature.properties.time) + 
            "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
    // Add earthquakeData to earthquakes LayerGroups 
    }).addTo(earthquakes);
    // Add earthquakes Layer to the Map
    earthquakes.addTo(myMap);

    // Set Up the Legend
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function() {
    
        var div = L.DomUtil.create("div", "info legend"), 
        magnitudeLevels = [0, 1, 2, 3, 4, 5];
        div.innerHTML += "<h3>Magnitude</h3>"

        for (var j = 0; j < magnitudeLevels.length; j++) {
            div.innerHTML +=
                '<i style="background: ' + selectColor(magnitudeLevels[j] + 1) + '"></i> ' +
                magnitudeLevels[j] + (magnitudeLevels[j + 1] ? '&ndash;' + magnitudeLevels[j + 1] + '<br>' : '+');
        }

        return div;
    };
    
    // Add the Legend to the Map
    legend.addTo(myMap);
});
