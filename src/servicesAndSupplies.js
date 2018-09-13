// Get the correct marker image based on the categories of a store.
export function getMarkerImage(categories) {
  if (categories.indexOf(', ') > -1) {
    return 'img/businesses/red-hotel.svg';
  }
  if (categories === 'Guides & tours') {
    return 'img/businesses/green-guides-tours.svg';
  }
  if (categories === 'Hotels & lodging') {
    return 'img/businesses/brown-lodging.svg';
  }
  if (categories === 'Supply store') {
    return 'img/businesses/blue-pale-supplies.svg';
  }
  if (categories === 'Restaurants & grocery') {
    return 'img/businesses/blue-restaurant.svg';
  }
  if (categories === 'Transportation') {
    return 'img/businesses/grey-transportation.svg';
  }
  if (categories === 'Processing & taxidermy') {
    return 'img/businesses/purple-taxidermy.svg';
  }
  return 'img/businesses/yellow-house.svg';
}

// Prepairing the geo json for Services and Supplies Layer
export function fetchServicesAndSupplies() {
  $.getJSON({
    url: '/maps/ajax_businesses',
  }).done((data) => {
    this.businesses = data;
    const features = [];
    this.businesses.forEach((bus) => {
      if (bus.lat !== '' && bus.lng != null) {
        features.push({
          type: 'Feature',
          properties: {
            message: `<h3>${bus.title}</h3><h4>Phone: ${bus.phone}</h4><h4>Address: ${bus.zip}, ${bus.county}, ${bus.state}</h4>`,
            image: this.getMarkerImage(bus.business_category),
            iconSize: [45, 59],
          },
          geometry: {
            type: 'Point',
            coordinates: [
              bus.lng,
              bus.lat,
            ],
          },
        });
      } else {
        $.ajax({
          url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${bus.county}, ${bus.state}.json?access_token=${this.accessToken}`,
        }).done((data) => {
          features.push({
            type: 'Feature',
            properties: {
              message: `<h3>${bus.title}</h3><h4>Phone: ${bus.phone}</h4><h4>Address: ${bus.zip}, ${bus.county}, ${bus.state}</h4>`,
              image: this.getMarkerImage(bus.business_category),
              iconSize: [45, 59],
            },
            geometry: {
              type: 'Point',
              coordinates: [data.features[0].geometry.coordinates[0], data.features[0].geometry.coordinates[1]],
            },
          });
        });
      }
    });

    this.businessesGeojson = {
      type: 'FeatureCollection',
      features,
    };
  });
}

// Toggle the services and supplies layer on the map
export function toggleServicesAndSuppliesLayer() {
  if (this.businessesLayerActive) {
    this.removeStoresMarkersAndPopups();
  } else {
    this.addStoresMarkersAndPopups();
  }
}

export function removeStoresMarkersAndPopups() {
  this.removeLayersContaining('store-marker');
  this.businessesLayerActive = false;
}

// Add services and supplies layer on the map.
export function addStoresMarkersAndPopups() {
  // add markers to map
  this.businessesGeojson.features.forEach((markerData, i) => {
    const { coordinates } = markerData.geometry;
    const { iconSize } = markerData.properties;

    const popup = new mapboxgl.Popup()
      .setHTML(markerData.properties.message);

    const marker = this.drawMarker({
      id: `store-marker-${i}`,
      icon: markerData.properties.image,
      lng: coordinates[0],
      lat: coordinates[1],
      className: 'stores',
      width: `${iconSize[0]}px`,
      height: `${iconSize[1]}px`,
    }).setPopup(popup);

    this.storesMarkers.push(marker);
    this.storesPopups.push(popup);
  });
  this.businessesLayerActive = true;
}

export const data = {
  // Services and suppliers businesses in database
  businesses: [],
  // Services and suppliers layer map markers objects
  storesMarkers: [],
  // Services and suppliers layer map popups objects
  storesPopups: [],
  // S & S layer gejson data
  businessesGeojson: null,
  // S & S Layer displayed or not
  businessesLayerActive: false,
};
