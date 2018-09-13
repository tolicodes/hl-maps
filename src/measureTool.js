const offset = [12, 60];
export function initMeasureTool() {
  this.map.on('mouseup', ({
    lngLat: {
      lng,
      lat,
    },
  }) => {
    if (!this.tools.measure || this.dragging) return;

    this.numberOfPins += 1;

    this.drawMeasureToolPin({
      lng,
      lat,
    });

    if (this.numberOfPins === 1) return;

    const currentCoords = this.getMarker(`distance-point-${this.numberOfPins}`)._lngLat;
    const prevCoords = this.getMarker(`distance-point-${this.numberOfPins - 1}`)._lngLat;

    this.drawMeasureToolLine(currentCoords, prevCoords);
    this.drawMeasureToolLabel(currentCoords, prevCoords);
  });
}


export function drawMeasureToolPin({
  lng,
  lat,
}) {
  this.drawMarker({
    id: `distance-point-${this.numberOfPins}`,
    className: 'distance-point',
    lat,
    lng,
    icon: 'img/pin.png',
    height: 60,
    width: 24,

    // Because it's actually centered to the middle bottom to begin with
    offset: [offset[0], offset[1] / 2],
    onDrag: ({
      lat,
      lng,
      id,
    }) => {
      const pinNumber = parseInt(id.replace('distance-point-', ''), 10);
      const currentCoords = {
        lat,
        lng,
      };
      // first pin doesn't have a line before
      if (pinNumber > 1) {
        const prevCoords = this.getMarker(`distance-point-${pinNumber - 1}`)._lngLat;
        this.removeLayersContaining(`distance-route-${pinNumber}`);
        this.removeLayersContaining(`line-label-${pinNumber}`);

        this.drawMeasureToolLabel(
          currentCoords,
          prevCoords,
          `line-label-${pinNumber}`,
        );

        this.drawMeasureToolLine(
          currentCoords,
          prevCoords,
          `distance-route-${pinNumber}`,
        );
      }

      // last pin doesn't have a line after
      if (pinNumber < this.numberOfPins) {
        const nextCoords = this.getMarker(`distance-point-${pinNumber + 1}`)._lngLat;
        this.removeLayersContaining(`distance-route-${pinNumber + 1}`);
        this.removeLayersContaining(`line-label-${pinNumber + 1}`);

        this.drawMeasureToolLabel(
          nextCoords,
          currentCoords,
          `line-label-${pinNumber + 1}`,
        );

        this.drawMeasureToolLine(
          nextCoords,
          currentCoords,
          `distance-route-${pinNumber + 1}`,
        );
      }
    },
  });
}

export function drawMeasureToolLine(coords1, coords2, id) {
  this.measureToolDistance = parseFloat(
    this.calculateDistance(
      coords1.lng,
      coords1.lat,

      coords2.lng,
      coords2.lat,

      'M',
    ),
  ).toFixed(2);

  this.map.addLayer({
    id: id || `distance-route-${this.numberOfPins}`,
    type: 'line',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [coords2.lng, coords2.lat],
            [coords1.lng, coords1.lat],
          ],
        },
      },
    },
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-width': 2,
      'line-color': '#5924FB',
      'line-translate': offset,
    },
  });
}

export function drawMeasureToolLabel(coords1, coords2, id) {
  this.map.addLayer({
    id: id || `line-label-${this.numberOfPins}`,
    type: 'symbol',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [
            (coords2.lng + coords1.lng) / 2,
            (coords2.lat + coords1.lat) / 2,
          ],
        },
      },
    },
    layout: {
      'text-font': ['Open Sans Bold'],
      'text-field': `${this.measureToolDistance} Mi`,
      'text-size': 16,
      'text-anchor': 'bottom',
      'text-justify': 'center',
      'text-padding': 10,
      'text-allow-overlap': true,
      'text-offset': [offset[0] / 16, offset[1] / 16],
    },
    paint: {
      'text-color': this.lineLabelColor,
    },
  });
}

export function removeMeasureToolLayers() {

}

// TODO: Make this work
export function measureToolSave() {
  if (!this.newMeasureName) {
    return swal('Name required');
  }

  if (!this.isLoggedIn) {
    return this.showPremiumPopup();
  }

  this.closeTools();
  return swal('SAVED (not really)!');
}

export function measureToolClose() {
  this.closeTools();
}

export function measureToolDelete() {
  this.removeMeasureToolLayers();

  this.removeLayersContaining('distance-point');
  this.removeLayersContaining('distance-route');
  this.removeLayersContaining('line-label');

  this.numberOfPins = 0;
  this.measureToolDistance = null;
}

export function measureToolUndo() {
  this.removeMeasureToolLayers();

  this.removeLayersContaining(`distance-point-${this.numberOfPins}`);
  this.removeLayersContaining(`distance-route-${this.numberOfPins}`);
  this.removeLayersContaining(`line-label-${this.numberOfPins}`);

  this.numberOfPins -= 1;
  this.measureToolDistance = null;
}

// Calculate distance between two coordinates in Miles or KM
export function calculateDistance(lat1, lon1, lat2, lon2, unit) {
  const radlat1 = Math.PI * lat1 / 180;
  const radlat2 = Math.PI * lat2 / 180;
  const theta = lon1 - lon2;
  const radtheta = Math.PI * theta / 180;
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit === 'K') {
    dist *= 1.609344;
  }
  if (unit === 'N') {
    dist *= 0.8684;
  }
  return dist;
}

export const watch = {
  // Measure tool
  // eslint-disable-next-line
  'tools.measure': function (on) {
    if (on) {
      this.hideHuntingLayers();
      this.newTimeVal();

      this.tools.markLocation = false;
      this.tools.customWaypoint = false;
      this.tools.tripTracking = false;

      $('.mapboxgl-canvas').css({
        cursor: 'url(img/pin.png), auto',
      });
    } else if (!this.saveCurrentMeasure) {
      this.removeLayersContaining('distance-point');
      this.removeLayersContaining('distance-route');
      this.removeLayersContaining('line-label');

      this.numberOfPins = 0;
      this.measureToolDistance = null;

      $('.mapboxgl-canvas').css({
        cursor: 'auto',
      });
    }
  },
};

export const data = {
  // Double clicks in the distance measurment tool
  numberOfPins: 0,

  // Measurement name
  newMeasureName: '',

  saveCurrentMeasure: false,
};
