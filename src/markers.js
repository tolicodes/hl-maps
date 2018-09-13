export function updateMarker({
  name,
  notes,
  lat,
  lng,
  icon,
  id,
} = {}) {
  $.ajax({
    url: '/maps/markers_ajax',
    method: 'POST',
    data: {
      action: 'update_marker',
      name: name || this.newMarker.name,
      notes: notes || this.newMarker.notes,
      lat: lat || this.newMarker.lat,
      lng: lng || this.newMarker.lng,
      icon: icon || this.newMarker.icon,
      id: id || this.newMarker.id,
    },
  }).done((data) => {
    data = JSON.parse(data);
    if (data.error) {
      swal(data.error);
      return;
    }

    $.ajax({
      url: '/maps/markers_ajax',
      method: 'POST',
      data: {
        action: 'get_markers',
      },
    }).done((data) => {
      $('.marker').remove();
      this.drawWaypoints(JSON.parse(data));
    });
    swal('Your marker has been saved :)');
  });
}

export function drawMarker({
  lat,
  lng,
  icon = 'marker3.png',
  id,
  height,
  width,
  className,
  notes,
  name,
  draggable,
  onDrag,
  onClick,
  offset,
}) {
  // occassionally we get invalid records
  if (!lat || !lng) return false;

  width = parseInt(width, 10) || 73;
  height = parseInt(height, 10) || 73;
  lng = parseFloat(lng);
  lat = parseFloat(lat);

  this.newMarker = {
    lng,
    lat,
    icon,
    id,
    height,
    width,
    className,
    notes,
    name,
  };

  const marker = { ...this.newMarker };

  [this.newMarkerEl] = $('<img/>')
    .attr({
      src: icon,
      class: `marker ${className || ''}`,
    }).css({
      width: width || '73px',
      height: height || '73px',
    }).click(() => onClick && onClick(marker));

  this.newMarkerObject = new mapboxgl.Marker(this.newMarkerEl, {
    offset,
  })
    .setLngLat([lng, lat])
    .addTo(this.map);

  if (draggable) {
    this.newMarkerObject
      .setDraggable(true)
      .on('dragstart', () => {
        this.dragging = true;
      })
      .on('dragend', (e) => {
        const { lat, lng } = e.target.getLngLat();

        if (!onDrag) {
          this.updateMarker({
            name,
            notes,
            lat,
            lng,
            icon,
            id,
          });
        } else {
          onDrag({
            lat,
            lng,
            id,
          });
        }

        this.dragging = false;
      });
  }

  this.newMarkerEl.marker = this.newMarkerObject;

  if (id) {
    this.markers[id] = this.newMarkerObject;
  }

  return this.newMarkerObject;
}

// Reset the data after making a marker (for Mark current location tool)
export function resetMarkerTools() {
  if (!this.newMarkerEl) return;

  this.newMarker = {
    name: '',
    notes: '',
    icon: '',
    lat: '',
    lng: '',
  };
  this.newMarkerObject = null;
  this.newMarkerEl = null;
}

export function getMarker(id) {
  return this.markers[id];
}


export const watch = {
  // If the new marker icon is changed we need to set it as a background
  'newMarker.icon': function (icon) {
    if (!this.newMarkerEl) return;
    this.newMarkerEl.src = icon;
  },

  updateMarkerMode(val) {
    if (val == false) {
      this.newMarker = {
        name: '',
        notes: '',
        icon: '',
        lat: '',
        lng: '',
      };
      this.newMarkerObject = null;
      this.newMarkerEl = null;
      this.$forceUpdate();
    }
  },
};

export const data = {
  // New markers initialization object (Attributes)
  newMarker: {
    name: '',
    notes: '',
    icon: 'img/waypoints/Antelope.png',
    lat: '',
    lng: '',
  },

  // The new marker mapbox gl object itself
  newMarkerObject: null,
  // The new marker mapbox gl Dom Element
  newMarkerEl: null,

  // All markers
  markers: [],

  updateMarkerMode: false,
};
