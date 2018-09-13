export function fixBrokenImages() {
  // fix broken images (no idea where this is coming front do will hide for now)
  $('<style/>')
    .html('img[src="undefined"] { display: none; }')
    .appendTo('body');
}

export function forEachLayer(text, cb) {
  this.map.getStyle().layers.forEach((layer) => {
    if (!layer.id.includes(text)) return;

    cb(layer);
  });
}

// Make the map fly to specific coordinates
export function goToCords(coordinates, zoom = 15) {
  this.map.flyTo({
    center: coordinates,
    zoom,
    bearing: 0,
    speed: 0.7,
    curve: 1,
  });
}

//  Flying to the user current location.
export function goHome() {
  if (!this.currentLocationGeojson) {
    setTimeout(() => {
      this.goHome();
    }, 1000);

    if (this.showedErrorForGoHome == false) {
      swal("We couldn't get your coordniates yet .. once we get it we will take you there !");
      this.showedErrorForGoHome = true;
    }
    return;
  }
  this.goToCords(this.currentLocationGeojson.features[0].geometry.coordinates);
}

// Flying to some place.
export function goToPlace(place) {
  $.ajax({
    url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json?access_token=${this.accessToken}`,
  }).done((data) => {
    this.goToCords([data.features[0].geometry.coordinates[0], data.features[0].geometry.coordinates[1]], 6);
  });
}

export function isMobile() {
  return $('.mobile-tools-trigger').is(':visible');
}

export function removeLayersContaining(text) {
  this.map.getStyle().layers.forEach((layer) => {
    if (layer.id.includes(text)) {
      this.map.removeLayer(layer.id);
      this.map.removeSource(layer.id);
    }
  });

  Object.entries(this.markers).forEach(([id, marker]) => {
    if (id.includes(text)) {
      marker.remove();
      delete this.markers[id];
    }
  });
}
