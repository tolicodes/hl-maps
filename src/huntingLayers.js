// const layersRoot = 'https://d3c1jk479l9eyj.cloudfront.net/state-layers-gz/';
const layersRoot = window.location.host === 'huntinglocator.develop'
  ? 'https://d3c1jk479l9eyj.cloudfront.net/state-layers-gz/'
  : 'state-layers/';

export function loadLayersManifest() {
  $.getJSON(`${layersRoot}manifest.json`)
    .then((layers) => {
      this.layersManifest = layers;
    });
}

export function activatePublicHuntingLands() {
  if (!this.selectedState) {
    swal('You need to select a state from the dropdown first.');

    this.closeMenus();
    return;
  }

  this.huntingLayersShown = true;

  $('.legend').empty();
  const $legend = $('<ul/>').appendTo('.legend');

  Object.entries(this.layerColors)
    .forEach(([name, color]) => {
      if (!this.layersManifest[this.selectedState].includes(name)) return;

      const active = this.activeHuntingLayers.includes(name);

      $(`
          <li>
            <div class="box ${active ? 'active' : ''}" style="border-color: ${color}; background-color: ${color};"/>
            <span style>${name}</span
          </li>
        `)
        .appendTo($legend)
        .click(() => {
          if (active) {
            this.activeHuntingLayers.splice(
              this.activeHuntingLayers.indexOf(name),
              1,
            );
          } else {
            this.activeHuntingLayers.push(name);
          }

          // redraw
          this.drawCurrentHuntingLayersForState();
          this.activatePublicHuntingLands();
        });
    });
}

export function drawCurrentHuntingLayersForState() {
  this.removeHuntingLayers();
  if (!this.activeHuntingLayers.length) return null;

  if (!this.isLoggedIn && this.selectedState !== 'Colorado') {
    return this.showPremiumPopup();
  }

  return this.activeHuntingLayers.forEach(this.activateLayer);
}

export function activateLayer(layerName) {
  this.downloadLayer(layerName);
}

export function downloadLayer(layerName) {
  const downloadedLayers = this.huntingLayersDownloaded;
  const downloadedStateLayers = downloadedLayers[this.selectedState];

  if (!downloadedStateLayers || !downloadedStateLayers[layerName]) {
    const download = () => $.getJSON(
      `${layersRoot}${this.selectedState}-${layerName}.json`,
    ).then((layer) => {
      this.huntingLayersDownloaded[this.selectedState] = {
        downloadedStateLayers,
        layer,
      };

      this.huntingLayers = true;
      return layer;
    }, () => {
      swal('This layer is not available for this state.');
    }).then((layer) => {
      this.drawLayer(layer, layerName);
    });

    return this.loadingOverlay(`
        We need some time to get your data ready to be displayed...
        This can take few seconds or mins depends on your internet
        connection.
      `, download);
  }

  return new Promise(resolve => resolve(downloadedStateLayers[layerName]));
}

export function loadingOverlay(message, func) {
  swal(message);

  const $spinner = $('<img src="img/loading.gif"/>')
    .css('margin-top', 20)
    .css('margin-bottom', 40);

  $('.swal-footer')
    .replaceWith($spinner);

  $('.swal-overlay').click(e => e.preventDefault());

  return new Promise((resolve) => {
    setTimeout(() => {
      func().then((res) => {
        setTimeout(() => {
          $('.swal-overlay').remove();
          resolve(res);
        }, 500);
      });
    }, 500);
  });
}

export function drawLayer(layer, layerName) {
  const id = `hunting-layer-${this.selectedState}-${layerName}`;

  return new Promise((resolve) => {
    this.map.addLayer({
      id,
      type: 'fill',
      source: {
        type: 'geojson',
        data: layer,
      },
      paint: {
        'fill-color': this.layerColors[layerName],
        'fill-opacity': 0.4,
        'fill-outline-color': this.layerColors[layerName],
      },
    });

    this.activateMapPopups(id);

    this.huntingLayersShown = true;

    this.closeMenus();

    resolve();
  });
}

export function activateMapPopups(id) {
  this.map.on('click', id, (e) => {
    let {
      lat,
      lng,
    } = e.lngLat;

    lat = parseFloat(Math.round(lat * 10000) / 10000).toFixed(5);
    lng = parseFloat(Math.round(lng * 10000) / 10000).toFixed(5);

    const { 
      Loc_Nm: layer,
      d_State_Nm: state,
      GIS_Acres: acres,
      Access: accessType,
    } = e.features[0].properties;

    const html = $(`
        <div>
        <div class="hunting-layer-popup">
          <div class="popup-header">
            <img class="info-image" src="img/info.png"/>
            <div class="about-text">About this Location</div>
            <div>${layer}</div>
            <div class="lat-lng">
              <span class="lat">${lat},</span>
              <span class="lng">${lng}</span>
            </div>
          </div>

          <div class="info-body">
            <div class="info-label">
              ${state}
            </div>
            <div class="info-label">
              ${acres} Acres
            </div>

            <div class="info-label">
              Access Type - ${accessType}
            </div>
          </div>
        </div>
        </div>
      `).html();

    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(html)
      .addTo(this.map);
  }).on('mouseenter', id, () => {
    this.map.getCanvas().style.cursor = 'pointer';
  }).on('mouseleave', id, () => {
    this.map.getCanvas().style.cursor = '';
  });
}

// @TODO Should eventually hide hunting layers
export function hideHuntingLayers() {
  this.removeHuntingLayers();
}

export function removeHuntingLayers() {
  this.removeLayersContaining('hunting-layer');

  this.huntingLayers = false;
  this.huntingLayersShown = false;

  this.closeMenus();

  // there is no great way of seeing if removal finished
  return new Promise(resolve => setTimeout(resolve, 100));
}

export const data = {
  huntingLayers: false,
  huntingLayersShown: false,
  huntingLayersDownloaded: {},
  activeHuntingLayers: [],
  layersManifest: null,

  layerColors: {
    'American Indian Lands': '#c89931',
    'Bureau of Land Management': '#a76f18',
    'Bureau of Reclamation': '#722608',
    'City Land': '#abba29',
    'County Land': '#e46926',
    Designation: '#149718',
    'Forest Service': '#149718',
    'Fish and Wildlife Service': '#26b7d5',
    Joint: '#e2b0b0',
    'National Oceanic and Atmospheric Administration': '#a0d6c2',
    'National Park Service': '#395624',
    'National Resource Conservation Service': '#fc4422',
    'Non-Governmental Organization': '#ca0813',
    'Other or Unknown Federal Land': '#88c570',
    'Other or Unknown Local Government': '#149718',
    'Other or Unknown State Land': '#a6a6a6',
    Private: '#149718',
    'Private Conservation': '#e46926',
    'Private Corporateion': '#e46926',
    'Puerto Rico Government': '#149718',
    'Regional Agency Land': '#a2d82a',
    'Regional Water Districts': '#149718',
    'State Department of Conservation': '#149718',
    'State Department of Land': '#149718',
    'State Department of Natural Resources': '#149718',
    'State Fish and Wildlife': '#715cd3',
    'State Land Board': '#149718',
    'State Trust Land': '#9a3762',
    'State Park and Recreation': '#8e9cd9',
    'Territorial Land': '#beb49d',
    'U.S. Fish & Wildlife Service': '#149718',
    Unknown: '#149718',
  },
};
