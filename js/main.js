mapboxgl.accessToken = 'pk.eyJ1IjoiZWFydGhhZGFtIiwiYSI6ImNqd3Y3amlwczBnMzc0YW4xc2x1NWVuNGoifQ.jQvOGeLkupgLxp31-Oa6gw';

function numberWithCommas(x) {
    if (x === undefined || x === null) {
        return 'N/A';
    }
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/earthadam/cjxo0sdri31o01clrrw3qesbq', // Presentation style
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

    map.addSource('powerplants', { type: 'geojson', data: 'https://raw.githubusercontent.com/overview-solutions/AlaskaEnergy/master/geojson/powerplants.geojson' });

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
                ['get', 'plant_source'],
                'wind', '#76b041',
                'solar', '#f39c12',
                'hydro', '#3498db',
                'geothermal', '#9b59b6',
                'biomass', '#27ae60',
                'coal', '#34495e',
                'gas', '#e74c3c',
                'oil', '#2c3e50',
                /* other */ '#fff'
            ],
            'circle-stroke-color': '#000',
            'circle-stroke-width': 1
        }
    });

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mouseover', 'powerplants', function (e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        // Populate the popup and set its coordinates
        // based on the feature found.
        var coordinates = e.features[0].geometry.coordinates.slice();
        var properties = e.features[0].properties;
        var description = `
            <h2>${properties.name}</h2>
            <p><strong>Type:</strong> ${properties.plant_source}</p>
            <p><strong>Capacity:</strong> ${properties.plant_output} MW</p>
            <p><strong>Method:</strong> ${properties.plant_method}</p >
            <p><strong>Operator:</strong> ${properties.operator}</p>
            <p><strong>Commissioned:</strong> ${properties.start_date}</p>
            `;

        popup.setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

    map.on('mouseleave', 'powerplants', function () {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });

    map.on('click', 'powerplants', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var properties = e.features[0].properties;
        var description = `
        < h2 > ${ properties.name }</h2 >
            <p><strong>Type:</strong> ${properties.plant_source}</p>
            <p><strong>Capacity:</strong> ${properties.plant_output} MW</p>
            <p><strong>Method:</strong> ${properties.plant_method}</p>
            <p><strong>Operator:</strong> ${properties.operator}</p>
            <p><strong>Commissioned:</strong> ${properties.start_date}</p>
            `;

        popup.setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

    map.on('click', function () {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
});