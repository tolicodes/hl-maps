export function initWaypointsTool() {
  const app = this;
  $('.types-inner input').click(function changeCursor() {
    if (!app.tools.customWaypoint) return;
    $('.mapboxgl-canvas').css({
      cursor: `url(${$(this).val()}), auto`,
    });
  });
}

export function fetchWaypoints() {
  $.getJSON({
    url: '/maps/markers_ajax',
    method: 'POST',
    data: {
      action: 'get_markers',
    },
  }).then(this.drawWaypoints);
}

export function onClickWaypoint(marker) {
  this.newMarker = marker;

  if (this.isMobile()) {
    this.activateWayPointTool(true);
  } else {
    $('.waypoint-radio').trigger('click');
  }
}

export function markWayPoints() {
  this.map.on('click', ({
    lngLat: {
      lng,
      lat,
    },
  }) => {
    if (this.dragging) return;
    if (!this.tools.customWaypoint) return;
    if (!this.newMarker.icon) return;

    this.drawMarker({
      lng,
      lat,
      icon: this.newMarker.icon,
      offset: [0, -72 / 2],
      onClick: this.onClickWaypoint,
      draggable: true,
    });
  });
}

// Save new marker in the database
export function saveMarker() {
  if (!this.newMarker.name) {
    swal('Name required');
    return;
  } if (!this.newMarker.icon) {
    swal('Icon required');
    return;
  }

  if (!this.isLoggedIn) {
    return this.showPremiumPopup();
  }

  if (this.updateMarkerMode && (this.newMarker.id || this.newMarker.id === 0)) {
    return this.updateMarker();
  }

  const {
    name,
    notes,
    lat,
    lng,
    icon,
  } = this.newMarker;

  $.post('/maps/markers_ajax', {
    action: 'create_marker',
    name,
    notes,
    lat,
    lng,
    icon,
  }, 'json').then((data) => {
    if (data.error) return swal(data.error);

    this.fetchMarkers();
    this.resetMarkerTools();
    this.closeTools();
    swal('Your marker has been saved :)');
  });

  this.tools.customWaypoint = false;
}

export function fetchMarkers() {
  $('.marker').remove();

  $.post('/maps/markers_ajax', {
    action: 'get_markers',
  }, 'json')
    .then(this.drawWaypoints);
}
// Draw markers on the map using returned data from ajax request.
// Displaying the markers we have in the database.
export function drawWaypoints(data) {
  // dunno where this is coming from @TODO
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }

  data.forEach((marker) => {
    marker.icon = marker.icon.replace('images/pngs/', 'img/waypoints/')
      .replace('images/maps/', '/images/maps/')
      .replace('img/maps/', 'img/')
      .replace('/img/waypoints', 'img/waypoints');

    marker.draggable = true;
    marker.onClick = this.onClickWaypoint;

    this.drawMarker(marker);
  });
}

export function deleteCurrentWaypoint() {
  $.post('/maps/markers_ajax', {
    action: 'delete_marker',
    id: this.newMarker.id,
  }).then((data) => {
    data = JSON.parse(data);
    if (data.done) {
      swal('The marker has been deleted !');
    }

    $('.marker').remove();

    $.post('/maps/markers_ajax', {
      action: 'get_markers',
    }, 'json').then((data) => {
      this.drawWaypoints(JSON.parse(data));
    });
  });

  this.newMarkerEl.parentNode.removeChild(this.newMarkerEl);
  this.resetMarkerTools();
}

// Disable the waypoints and mark current location tools.
export function disableWayPointAndMarkCurrentLocation() {
  this.tools.markLocation = false;
  this.tools.customWaypoint = false;
  this.updateMarkerMode = false;

  this.showMobileToolsHeader();
}

export function activateWayPointTool(fromElement = false) {
  if (fromElement) {
    this.tools.customWaypoint = true;
  }

  $('.mobileMap-tools-container').fadeIn();
  this.hideMobileToolsHeader();

  $('.close-layer-menu').trigger('click');
  $('.close-mm-menu').trigger('click');

  if (this.firstTimeToOpenMobileTools) {
    this.tools.customWaypoint = true;
    $('.waypoint-trigger').trigger('click');
    this.firstTimeToOpenMobileTools = false;
  }
}

export const computed = {
  // The markers tools (Mark Current Location, Waypoints) heading.
  waypointsHeading() {
    if (this.tools.markLocation) {
      return 'Mark your current location';
    }
    return 'Mark a waypoint';
  },

  // The markers tools (Mark Current Location, Waypoints) description.
  waypointsDescription() {
    if (this.tools.markLocation) {
      return 'Name and mark your current location on the map';
    }
    return 'Name and mark your own waypoints on the map';
  },
};

export const watch = {
  // Mark custom waypoint tool
  // eslint-disable-next-line
  'tools.customWaypoint': function (val) {
    if (val) {
      this.hideHuntingLayers();
      this.newTimeVal();
      this.markWayPoints();
      this.tools.markLocation = false;
      this.tools.measure = false;
      this.tools.tripTracking = false;

      this.newMarker = {
        name: '',
        notes: '',
        icon: '',
        lat: '',
        lng: '',
      };
    } else {
      $('.mapboxgl-canvas').css({
        cursor: 'auto',
      });
    }
  },
};
