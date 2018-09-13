// Start trip tracking functionality.
export function startTrip() {
  if (this.tripTrackingToolLabel == 'Stop Tracking') {
    this.tools.tripTracking = false;
    return;
  }

  if (this.newTripName == null) {
    swal('Please enter a trip name first !');
    return;
  }

  const currentLocationGeojson = this.currentLocationGeojson;
  if (!currentLocationGeojson) {
    return swal('cannot get your current location. Please turn location settings on');
  }

  const { coordinates } = currentLocationGeojson.features[0].geometry;

  $.ajax({
    url: '/maps/ajax',
    method: 'POST',
    data: {
      action: 'start',
      name: this.newTripName,
    },
  }).done((data) => {
    this.tripTrackingToolLabel = 'Stop Tracking';
    this.currentTrip = JSON.parse(data);
    this.tripIsGoing = true;

    this.map.addLayer({
      id: 'current_trip_line',
      type: 'line',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'LineString',
              properties: {
                trip_name: this.newTripName,
              },
              coordinates,
            },
          }],
        },
      },
      layout: {
        'line-join': 'bevel',
        'line-cap': 'square',
      },
      paint: {
        'line-color': '#FA863C',
        'line-width': {
          base: 0.5,
          stops: [
            [3.5, 1.25],
            [4.5, 5],
          ],
        },
        'line-dasharray': [6, 4.8],
      },
    });
  });


  this.map.on('click', 'current_trip_line', (e) => {
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(this.newTripName)
      .addTo(this.map);
  });
}

export function pauseTrip() {
  this.tripIsGoing = false;
}

export function resumeTrip() {
  this.tripIsGoing = true;
}

export function saveTrip() {
  if (this.currentTrip == null) {
    return swal("There's no current trip !");
  }

  if (!this.newTripName) {
    return swal('Name is required');
  }

  if (!this.isLoggedIn) {
    return this.showPremiumPopup();
  }

  return $.ajax({
    url: '/maps/ajax',
    method: 'POST',
    data: {
      action: 'saveTrip',
      id: this.currentTrip.id,
    },
  }).done(() => {
    this.closeTools();
    this.tripTrackingToolLabel = 'Start Tracking';
    swal('The current trip is saved (not really)');
  });
}

export function stopTripOnly() {
  this.tools.tripTracking = false;
  this.tripTrackingToolLabel = 'Start Tracking';
}

// Stop and delete the current trip.
export function stopAndDeleteCurrentTrip() {
  $('.track-tool-wrap').fadeOut();
  $('#tripTrackingDeleteConfirm').fadeIn();
}

// Delete current trip after confirmation.
export function deleteCurrentTripConfirmed() {
  this.tools.tripTracking = false;
  if (this.map.getSource('current_trip_line')) {
    this.map.removeLayer('current_trip_line');
    this.map.removeSource('current_trip_line');
  }
  $('#tripTrackingDeleteConfirm').fadeOut();
}

export function deleteCurrentTripCanceled() {
  $('#tripTrackingDeleteConfirm').fadeOut();
}

export const watch = {
  // Trip tracking tool
  // eslint-disable-next-line
  'tools.tripTracking': function (val) {
    if (val) {
      this.hideHuntingLayers();
      this.tools.markLocation = false;
      this.tools.measure = false;
      this.tools.customWaypoint = false;

      if (this.map.getSource('current_trip_line')) {
        this.map.removeLayer('current_trip_line');
        this.map.removeSource('current_trip_line');
      }
    } else {
      if (!this.currentTrip) return;

      $.ajax({
        url: '/maps/ajax',
        method: 'POST',
        data: {
          action: 'stop',
          id: this.currentTrip.id,
        },
      }).done(() => {
        // Restore the trips varaiables
        this.newTripName = null;
        this.currentTrip = null;
        this.tripTrackingLoop = null;
        this.tripCoords = [];
        this.currentTripGeojson = null;
        this.tripTrackingToolLabel = 'Start Tracking';
        this.tripIsGoing = false;
      });
    }
  },
};

export const data = {
  // New trip name
  newTripName: null,
  // Current Trip Object (From Database)
  currentTrip: null,
  // Trip Tracking Loop (depracted)
  tripTrackingLoop: null,
  tripIsGoing: false,
  // Current trip points' coordinates
  tripCoords: [],

  // Current trip geojson data
  currentTripGeojson: null,
  // Trip tracking tool label
  tripTrackingToolLabel: 'Start Tracking',
};
