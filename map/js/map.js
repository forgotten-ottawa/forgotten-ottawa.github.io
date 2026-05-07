/*import Map from '../node_modules/ol/Map.js';
import View from '../node_modules/ol/View.js';
import TileLayer from '../node_modules/ol/layer/Tile.js';
import OSM from '../node_modules/ol/source/OSM.js';*/

// var geojsonObject = {
// "type": "FeatureCollection",
// "name": "forgotten_ottawa_stories_web",
// "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3857" } },
// "features": [
// { "type": "Feature", "properties": { "TITLE": "Hull Explosion of 1910", "TAGLINE": "In 1910, Hull was devestated by an explosion at an explosives factory...", "LINK": "hull-explosion.html" }, "geometry": { "type": "Point", "coordinates": [ -8429968.326474562287331, 5690610.276863837614655 ] } },
// { "type": "Feature", "properties": { "TITLE": "Standish Hall Hotel", "TAGLINE": "The Standish Hall hosted some of the biggest jazz musicians of the day...", "LINK": "standish-hall.html" }, "geometry": { "type": "Point", "coordinates": [ -8429410.448340244591236, 5688687.356375645846128 ] } },
// { "type": "Feature", "properties": { "TITLE": "Titanic: The Ottawa Stories", "TAGLINE": "From a railway magnate to a group from a small village in the Middle East, the stories of people who were Ottawa-bound on the Titanic...", "LINK": "ottawa-titanic-stories.html" }, "geometry": { "type": "Point", "coordinates": [ -8426285.325602248311043, 5688730.57936623133719 ] } },
// { "type": "Feature", "properties": { "TITLE": "1905 Stanley Cup Games and Kick", "TAGLINE": "After winning the Stanley Cup, the Ottawa Silver Sevens celebrated with the Cup in a strange way...", "LINK": "stanley-cup-kick.html" }, "geometry": { "type": "Point", "coordinates": [ -8426868.333382254466414, 5686264.858531135134399 ] } },
// { "type": "Feature", "properties": { "TITLE": "Porter Island Isolation Hospital", "TAGLINE": "If you were unfortunate enough to catch smallpox in the 1890s, you'd most likely be sent to the dreaded Porter Island...", "LINK": "porter-island.html" }, "geometry": { "type": "Point", "coordinates": [ -8424946.418079890310764, 5690703.759145800955594 ] } },
// { "type": "Feature", "properties": { "TITLE": "Russell House Hotel", "TAGLINE": "Ottawa's premier hotel for over 60 years until it was usurped by the Château Laurier...", "LINK": "russell-house.html" }, "geometry": { "type": "Point", "coordinates": [ -8426334.57970780134201, 5688464.707714829593897 ] } },
// { "type": "Feature", "properties": { "TITLE": "Peter Aylen & The Shiners’ War", "TAGLINE": "Early Bytown was a lawless place run by a group called the Shiners...", "LINK": "shiners-war.html" }, "geometry": { "type": "Point", "coordinates": [ -8432021.167230973020196, 5683973.286140669137239 ] } },
// { "type": "Feature", "properties": { "TITLE": "Upper Town", "TAGLINE": "One of the original neighbourhoods of Bytown later lost to time...", "LINK": "upper-town.html" }, "geometry": { "type": "Point", "coordinates": [ -8427547.83900174498558, 5688111.384896405041218 ] } },
// { "type": "Feature", "properties": { "TITLE": "Ottawa Sewer Explosions", "TAGLINE": "Within 2 years, Ottawa had not 1 but 2 sewer explosions...", "LINK": "ottawa-sewer-explosions.html" }, "geometry": { "type": "Point", "coordinates": [ -8424357.379184970632195, 5688804.963117444887757 ] } },
// { "type": "Feature", "properties": { "TITLE": "Ottawa's Movie Milestones", "TAGLINE": "Major moments for movies in Ottawa including the first public showing, the first \"talkie\" and the first multiplex in the world...", "LINK": "movie-milestones.html" }, "geometry": { "type": "Point", "coordinates": [ -8426689.410304980352521, 5687663.07201730273664 ] } }
// ]
// };

/* const vectorSource = new ol.source.Vector({
    /* features: new ol.format.GeoJSON().readFeatures(geojsonObject), *
    url: '/map/forgotten_ottawa_stories.geojson',
    format: new ol.format.GeoJSON({
				dataProjection: 'EPSG:3857', featureProjection: 'EPSG:3857'
			}),
}); */

/* const image = new ol.style.Circle({
    radius: 5,
    fill: null,
    stroke: new ol.style.Stroke({color: 'red', width: 1}),
});*/

/* const styleFunction = function (feature) {
    return image;
}; */

var vectorSource = new ol.source.Vector();

fetch('/data/stories.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        data.forEach(function(story) {

            if (!story.coordinates) return;

            var feature = new ol.Feature({
                geometry: new ol.geom.Point(
                    ol.proj.fromLonLat(story.coordinates)
                ),
                title: story.title,
                url: story.url,
                category: story.category
            });

            vectorSource.addFeature(feature);
        });

    });

var styleFunction = function(feature, resolution) {
    // Get property from feature
    //var type = feature.get('type'); 
    var radius = 7;
    var color = 'blue';

    return [
        new ol.style.Style({
            image: new ol.style.Circle({
                radius: radius,
                fill: new ol.style.Fill({
                    color: color
                }),
                stroke: new ol.style.Stroke({
                    color: 'white',
                    width: 2
                })
            })
        })
    ];
};

const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: styleFunction,
});

const map = new ol.Map({
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM(),
        }),
        vectorLayer
    ],
    target: 'map',
    controls: ol.control.defaults({
        attributionOptions: {
            collapsible: false
        }
    }),
    view: new ol.View({
        center: ol.proj.transform([-75.67824, 45.41501], "EPSG:4326", "EPSG:3857"),
        zoom: 13,
    }),
});

// 1. Create an element for the tooltip
var tooltipElement = document.getElementById('tooltip');
var tooltipOverlay = new ol.Overlay({
    element: tooltipElement,
    positioning: 'bottom-center',
    offset: [0, -10], // Adjust offset to show above the feature
    stopEvent: false
});
map.addOverlay(tooltipOverlay);

// 2. Set up the hover interaction (pointermove)
map.on('pointermove', function(evt) {
    if (evt.dragging) { return; }
  
    var pixel = map.getEventPixel(evt.originalEvent);
    var feature = map.forEachFeatureAtPixel(pixel, function(f) {
        return f;
    });

    if (feature) {
        var coords = feature.getGeometry().getCoordinates();
        tooltipElement.innerHTML = feature.get('title'); // Assuming a 'name' attribute
        tooltipOverlay.setPosition(coords);
        tooltipElement.style.display = 'block';
        map.getTargetElement().style.cursor = 'pointer';
    } else {
        tooltipElement.style.display = 'none';
        map.getTargetElement().style.cursor = '';
    }
});

map.on('singleclick', function (evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
    });

    if (feature) {
        var url = feature.get('url');

        if (url) {
            window.open(url, '_blank'); // or window.location.href = url;
        }
    }
});