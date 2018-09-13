import { accessToken } from './config';

export function generateMap() {
  return new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v10',
    center: [-97, 37.4419],
    zoom: this.isMobile() ? 2 : 4,
  });
}

export function onMapLoad() {
  this.autoRefreshLocation();
  this.fetchWaypoints();
  this.fetchServicesAndSupplies();
  this.fixBrokenImages();
  this.drawStateBorders();
  this.initPremiumPopup();
}

export function initMap() {
  // Set the access token for Mapbox GL
  mapboxgl.accessToken = this.accessToken;
  // Initialize the map
  this.map = this.generateMap()
    .addControl(new mapboxgl.NavigationControl())
    .on('load', this.onMapLoad);
}

export const data = {
  // The access token for Mapbox
  accessToken,

  // The map object
  map: null,
};
