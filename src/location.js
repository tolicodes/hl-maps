// Get the user current location every 10 secs
export function autoRefreshLocation() {
  this.getCurrentLocationGeoJson();
  setInterval(() => {
    this.getCurrentLocationGeoJson();
  }, 10000);
}


// Get and update the user current location GEOJSON data.
export function getCurrentLocationGeoJson() {
  navigator.geolocation.getCurrentPosition((position) => {
    const {
      latitude,
      longitude,
    } = position.coords;

    this.currentLocationGeojson = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            longitude,
            latitude,
          ],
        },
      }],
    };
  });
}

export function markCurrentLocation(force) {
  // If it's the active tool
  if (!this.tools.markLocation && !force) return;

  // If we can have the user current location
  if (this.currentLocationGeojson) {
    this.goHome();

    const [lng, lat] = this.currentLocationGeojson.features[0].geometry.coordinates;

    this.drawMarker({
      icon: this.newMarker.icon,
      lng,
      lat,
      draggable: true,
    });
  } else {
    swal("We're not able to get your current location due to your browser permissions");

    // Reset everything
    this.resetMarkerTools();
    this.tools.markLocation = false;
    this.tools.customWaypoint = false;
    this.tools.measure = false;
  }
}

export const watch = {
  // When the user location changes we change the point on the map according to the new coordinates
  currentLocationGeojson(geojson) {
    if (this.map.getSource('current_location')) {
      this.map.removeLayer('current_location');
      this.map.removeSource('current_location');
    }
    this.map.addSource('current_location', {
      type: 'geojson',
      data: geojson,
    });

    this.map.addLayer({
      id: 'current_location',
      type: 'circle',
      source: 'current_location',
      paint: {
        'circle-radius': 10,
        'circle-color': '#1D35D0',
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 2,
      },
    });

    // If there's a trip push the new coordinates and change the trip line layer geojson.
    if (this.tripTrackingLoop != null) {
      return;
    }
    if (this.tripIsGoing == false) {
      return;
    }
    if (this.currentTrip != null) {
      const newCoordinates = [geojson.features[0].geometry.coordinates[0], geojson.features[0].geometry.coordinates[1]];
      this.tripCoords.push(newCoordinates);
      $.ajax({
        url: '/maps/ajax',
        method: 'POST',
        data: {
          action: 'continue',
          id: this.currentTrip.id,
          lng: geojson.features[0].geometry.coordinates[0],
          lat: geojson.features[0].geometry.coordinates[1],
        },
      }).done((data) => {
        data = JSON.parse(data);
        const newData = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'LineString',
              properties: {
                trip_name: data.trip_name,
              },
              coordinates: this.tripCoords,
            },
          }],
        };
        this.map.getSource('current_trip_line').setData(newData);
      });
    }
  },

  // Mark current location tool
  // eslint-disable-next-line
  'tools.markLocation': function (val) {
    if (val) {
      this.hideHuntingLayers();
      this.newTimeVal();
      this.markCurrentLocation();
      this.tools.customWaypoint = false;
      this.tools.measure = false;
      this.tools.tripTracking = false;
    }
  },
};

export const data = {
  // Current geojson data for the user current location
  currentLocationGeojson: null,

  showedErrorForGoHome: false,
};
