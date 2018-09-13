import html from '../html/main.html';
import '../style.scss';

import * as menusFuncs from './menus';
import * as mapStyles from './mapStyles';
import * as huntingLayersFuncs from './huntingLayers';
import * as mapFuncs from './map';
import * as waypointToolFuncs from './waypointTool';
import * as trackingToolFuncs from './trackingTool';
import * as measureToolsFuncs from './measureTool';
import * as locationFuncs from './location';
import * as miscFunctions from './misc';
import * as searchFuncs from './search';
import * as servicesAndSuppliesFuncs from './servicesAndSupplies';
import * as markerFuncs from './markers';
import * as statesFuncs from './states';
import * as premiumPopupFuncs from './premiumPopup';
import * as tutorialModalFuncs from './tutorialModal';

import toolsFuncs from './tools';

const withoutData = funcs => (
  Object.entries(funcs)
    .reduce((out, [key, func]) => {
      if (['data', 'watch', 'computed'].includes(key)) return out;
      out[key] = func;
      return out;
    }, {})
);

$('html body').append(html);

const app = new Vue({
  el: '#app',

  mounted() {
    this.initButtons();
    this.makeToolsDraggable();
    this.initLayerMenu();
    this.initMap();
    this.initTools();
    this.loadLayersManifest();
    this.initStatesDropdown();
    this.getIsLoggedIn();
    this.initWaypointsTool();
    this.initTutorialModal();
  },

  data() {
    return {
      // Distance measurement tool result
      measureToolDistance: null,

      ...huntingLayersFuncs.data,
      ...mapStyles.data,
      ...statesFuncs.data,
      ...toolsFuncs.data,
      ...mapFuncs.data,
      ...locationFuncs.data,
      ...searchFuncs.data,
      ...markerFuncs.data,
      ...measureToolsFuncs.data,
      ...servicesAndSuppliesFuncs.data,
      ...trackingToolFuncs.data,
      ...menusFuncs.data,
      ...mapStyles.data,
    };
  },
  computed: {
    ...waypointToolFuncs.computed,
    ...mapStyles.computed,
  },
  methods: {
    ...withoutData(menusFuncs),
    ...withoutData(mapFuncs),
    ...withoutData(mapStyles),

    ...withoutData(statesFuncs),
    ...withoutData(searchFuncs),
    ...withoutData(servicesAndSuppliesFuncs),
    ...withoutData(markerFuncs),
    ...withoutData(huntingLayersFuncs),
    ...withoutData(premiumPopupFuncs),
    ...withoutData(tutorialModalFuncs),
    ...withoutData(miscFunctions),

    ...withoutData(toolsFuncs),
    ...withoutData(waypointToolFuncs),
    ...withoutData(trackingToolFuncs),
    ...withoutData(measureToolsFuncs),
    ...withoutData(locationFuncs),
  },

  watch: {
    ...locationFuncs.watch,
    ...markerFuncs.watch,
    ...waypointToolFuncs.watch,
    ...measureToolsFuncs.watch,
    ...trackingToolFuncs.watch,
  },
});
