mapboxgl.accessToken = 'pk.eyJ1IjoiZWFydGhhZGFtIiwiYSI6ImNqd3VzNnN3ZDA2OWE0OHBoN2xrNmlrNGYifQ.MMqPanYD57YyTkaJYxyeHQ';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/earthadam/clz4ne82p02ig01pebh0scaz9', // Presentation style
    //style: 'mapbox://styles/earthadam/clxtz9n6w00qe01obesn73j7q', // Presentation style
    center: [-149.4937, 64.2008], // Coordinates for Alaska
    zoom: 4
});

var icon = "circle";

map.on('load', function () {
    var layers = ['Wind', 'Hydro', 'Geothermal', 'Biomass', 'Solar', 'Battery', 'Diesel', 'Coal', 'Gas', 'Oil', 'Oil_Coal'];
    var colors = ['#1e90ff', '#0073e6', '#32cd32', '#27ae60', '#ffcc00', '#ffff00', '#800000', '#ff0000', '#ff4500', '#b22222', '#ff6347', '#ccc'];for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var color = colors[i];
        var item = document.createElement('div');
        var key = document.createElement('span');
        key.className = 'legend-key';
        key.style.backgroundColor = color;

        var value = document.createElement('span');
        value.innerHTML = layer;
        item.appendChild(key);
        item.appendChild(value);
        legend.appendChild(item);
    }

    fetch('https://raw.githubusercontent.com/overview-solutions/AlaskaEnergy/master/geojson/powerplants.geojson')
        .then(response => response.json())
        .then(data => {
            console.log(data); // Log the entire GeoJSON data

            // Transform the GeoJSON data to convert polygons to points
            var transformedFeatures = data.features.map(feature => {
                if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                    var coordinates = feature.geometry.coordinates[0][0]; // Use the first coordinate of the polygon
                    return {
                        type: 'Feature',
                        properties: feature.properties,
                        geometry: {
                            type: 'Point',
                            coordinates: coordinates
                        }
                    };
                } else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
                    var coordinates = feature.geometry.coordinates[0][0]; // Use the first coordinate of the linestring
                    return {
                        type: 'Feature',
                        properties: feature.properties,
                        geometry: {
                            type: 'Point',
                            coordinates: coordinates
                        }
                    };
                } else {
                    return feature; // Keep other geometries as they are
                }
            });

            var transformedData = {
                type: 'FeatureCollection',
                features: transformedFeatures
            };

            console.log('Transformed GeoJSON data:', transformedData);

            // Log feature properties to debug
            data.features.forEach(feature => {
                console.log("plant_source:"+feature.properties.plant_source);
            });

            // Add the transformed GeoJSON source
            map.addSource('powerplants', {
                type: 'geojson',
                data: transformedData
            });

            // Add a layer showing the power plants
            map.addLayer({
                "id": "powerplants",
                "type": "circle",
                source: "powerplants",
                'paint': {
                    'circle-radius': {
                        'base': 6, // Decreased base size
                        'stops': [[12, 4], [22, 16]]
                    },
                    'circle-color': [
                        'match',
                        ['coalesce', ['get', 'plant_source'], ''], // The feature property to match against
                        'wind', '#1e90ff',
                        'hydro', '#0073e6',
                        'geothermal', '#32cd32',
                        'biomass', '#27ae60',
                        'solar', '#ffcc00',
                        'battery', '#ffff00',
                        'diesel', '#800000',
                        'coal', '#ff0000',
                        'gas', '#ff4500',
                        'oil', '#b22222',
                        'oil_coal', '#ff6347',
                        '', '#ccc', // Default color for undefined plant_source
                    /* other */ '#fff'  // Default color for any unmatched values
                    ],
                    'circle-stroke-color': '#000',
                    'circle-stroke-width': 0.5
                }
            });

            // Create a popup but don't add it to the map yet.
            var popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            function generatePopupContent(properties) {
                let description = `<h2>${properties.name}</h2>`;
                description += properties.plant_source ? `<p><strong>Type:</strong> ${properties.plant_source}</p>` : '';
                description += properties.operator ? `<p><strong>Operator:</strong> ${properties.operator}</p>` : '';
                description += properties.Output ? `<p><strong>output:</strong> ${properties.output}</p>` : '';
                description += properties.plant_method ? `<p><strong>plant_method:</strong> ${properties.plant_method}</p>` : '';
                return description;
            }

            map.on('mouseenter', 'powerplants', function (e) {
                map.getCanvas().style.cursor = 'pointer';

                var coordinates = e.features[0].geometry.coordinates.slice();
                if (coordinates.length === 2) {
                    var properties = e.features[0].properties;
                    var description = generatePopupContent(properties);

                    popup.setLngLat(coordinates)
                        .setHTML(description)
                        .addTo(map);
                }
            });

            map.on('mouseleave', 'powerplants', function () {
                map.getCanvas().style.cursor = '';
                popup.remove();
            });

            console.log('Map setup complete');
        })
        .catch(error => console.error('Error fetching GeoJSON:', error));
    console.log('Map setup complete');
});