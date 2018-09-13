const styles = [{
  name: 'satellite-streets-v10',
  formalName: 'Satellite',
  image: '/images/newmap-images/sat.jpg',
}, {
  name: 'outdoors-v9',
  formalName: 'Topoghraphy',
  image: '/images/newmap-images/topo.jpg',
}];

export const data = {
  styles,

  // The current active base style
  currentStyle: styles[0],

  otherStyle: styles[1],
};

export const computed = {
  lineLabelColor() {
    return this.currentStyle.formalName === 'Satellite'
      ? '#fff'
      : '#000';
  },

  appropiateTextColor() {
    return this.currentStyle.formalName === 'Satellite'
      ? '#000'
      : '#fff';
  },

  appropiateTextSize() {
    return this.currentStyle.formalName === 'Satellite'
      ? '10px'
      : '13px';
  },
};

// Changing the map base style
export function changeStyle(style) {
  const savedLayers = [];
  const savedSources = {};
  const layerGroups = [
    'line-label',
    'distance-route',
    'state-borders',
    'hunting-layer',
  ];

  layerGroups.forEach((layerGroup) => {
    this.forEachLayer(layerGroup, (layer) => {
      savedSources[layer.source] = this.map.getSource(layer.source).serialize();
      savedLayers.push(layer);
    });
  });

  this.map.setStyle(`mapbox://styles/mapbox/${style}`);
  this.currentStyle = this.styles.find(o => o.name === style);
  this.otherStyle = this.styles.find(o => o.name !== style);

  setTimeout(() => {
    Object.entries(savedSources).forEach(([id, source]) => {
      this.map.addSource(id, source);
    });

    savedLayers.forEach((layer) => {
      this.map.addLayer(layer);
    });

    this.forEachLayer('line-label', (layer) => {
      this.map.setPaintProperty(layer.id, 'text-color', this.lineLabelColor);
    });
  }, 1000);
}

// Switch between the current two map styles
export function switchStyles() {
  if (this.currentStyle.formalName === 'Satellite') {
    this.changeStyle('outdoors-v9');
  } else {
    this.changeStyle('satellite-streets-v10');
  }
}
