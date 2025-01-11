// Create the map object and set the initial view
const map = L.map("map").setView([37.09, -95.71], 4); // Centered on the US

// Add the base tile layer (street map) from Leaflet
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
}).addTo(map);

// Earthquake data URL (past 7 days)
const earthquakeDataUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to determine marker size based on magnitude
const markerSize = (magnitude) => magnitude * 4;

// Function to determine marker color based on depth
const getColor = (depth) => {
  return depth > 90 ? "#ff5f65" :
         depth > 70 ? "#fca35d" :
         depth > 50 ? "#fdb72a" :
         depth > 30 ? "#f7db11" :
         depth > 10 ? "#dcf400" :
                      "#a3f600";
};

// Fetch earthquake data and plot it
d3.json(earthquakeDataUrl).then((data) => {
  // Add GeoJSON layer to the map
  L.geoJSON(data, {
    pointToLayer: (feature, latlng) => L.circleMarker(latlng),
    style: (feature) => ({
      radius: markerSize(feature.properties.mag),
      fillColor: getColor(feature.geometry.coordinates[2]), // Depth is the 3rd coordinate
      color: "#000",
      weight: 0.5,
      opacity: 1,
      fillOpacity: 0.8
    }),
    onEachFeature: (feature, layer) => {
      layer.bindPopup(`
        <h3>${feature.properties.place}</h3>
        <hr>
        <p><strong>Magnitude:</strong> ${feature.properties.mag}</p>
        <p><strong>Depth:</strong> ${feature.geometry.coordinates[2]} km</p>
      `);
    }
  }).addTo(map);

  // Add a legend to the map
  const legend = L.control({ position: "bottomright" });

  legend.onAdd = () => {
    const div = L.DomUtil.create("div", "info legend");
    const depths = [-10, 10, 30, 50, 70, 90];
    const colors = ["#a3f600", "#dcf400", "#f7db11", "#fdb72a", "#fca35d", "#ff5f65"];

    // Generate legend HTML
    depths.forEach((depth, i) => {
      div.innerHTML += `
        <i style="background: ${colors[i]}; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i>
        ${depth}${depths[i + 1] ? `&ndash;${depths[i + 1]} km<br>` : "+ km"}
      `;
    });

    return div;
  };

  legend.addTo(map);
});
