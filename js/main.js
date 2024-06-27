mapboxgl.accessToken = 'pk.eyJ1IjoiZWFydGhhZGFtIiwiYSI6ImNqd3Y3amlwczBnMzc0YW4xc2x1NWVuNGoifQ.jQvOGeLkupgLxp31-Oa6gw';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/earthadam/clxtz9n6w00qe01obesn73j7q', // Presentation style
    center: [-149.4937, 64.2008], // Coordinates for Alaska
    zoom: 4
});

var icon = "circle";

map.on('load', function () {
    var layers = ['Wind', 'Solar', 'Hydro', 'Geothermal', 'Biomass', 'Coal', 'Gas', 'Oil'];
    var colors = ['#76b041', '#f39c12', '#3498db', '#9b59b6', '#27ae60', '#34495e', '#e74c3c', '#2c3e50'];
    for (var i = 0; i < layers.length; i++) {
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

            // Log feature properties to debug
            data.features.forEach(feature => {
                console.log("plant_source:"+feature.properties.plant_source);
            });

            // Add the GeoJSON source
            map.addSource('powerplants', {
                type: 'geojson',
                data: data
            });

            // Add a layer showing the power plants
            map.addLayer({
                "id": "powerplants",
                "type": "circle",
                source: "powerplants",
                'paint': {
                    'circle-radius': {
                        'base': 20,
                        'stops': [[12, 5], [22, 180]]
                    },
                    'circle-color': [
                        'match',
                        ['coalesce', ['get', 'plant_source'], ''], // The feature property to match against
                        'wind', '#76b041',
                        'solar', '#f39c12',
                        'hydro', '#3498db',
                        'geothermal', '#9b59b6',
                        'battery', '#ffff00',
                        'biomass', '#27ae60',
                        'coal', '#34495e',
                        'gas', '#e74c3c',
                        'oil', '#2c3e50',
                        'oil_coal', '#2c3e50',
                        '','#ccc',
                        /* other */ '#fff' // Default color for any unmatched values
                    ],
                    'circle-stroke-color': '#000',
                    'circle-stroke-width': 1
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