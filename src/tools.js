function initTools() {
  this.initMeasureTool();
  this.initToolEvents();
}

function makeToolsDraggable() {
  const tools = ['measure', 'track', 'waypoint', 'marklocation'];

  function onMouseDown(e) {
    if ($(e.target).is('img')) return;

    const draggingTools = {
      pageX0: e.pageX,
      pageY0: e.pageY,
      elem: this,
      offset0: $(this).offset(),
    };

    function onDragging(e) {
      const left = draggingTools.offset0.left + (e.pageX - draggingTools.pageX0);
      const top = draggingTools.offset0.top + (e.pageY - draggingTools.pageY0);

      $(draggingTools.elem).offset({
        top,
        left,
      });

      console.log('a');
    }

    function onMouseUp() {
      $('body')
        .off('mousemove', onDragging)
        .off('mouseup', onMouseUp);
    }

    $('body')
      .on('mouseup', onMouseUp)
      .on('mousemove', onDragging);
  }

  tools.forEach((tool) => {
    $(`.${tool}-tool-wrap`)
      .mousedown(onMouseDown);
  });

  $('.map-tools').mousedown(onMouseDown);
}

// Set a new value for the datetime for the tools pop-ups.
function newTimeVal() {
  this.PopupsDateTime = `${new Date().getDate()}/${new Date().getMonth()}/${new Date().getFullYear()} ${new Date().toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  })}`;
}


function hideMobileToolsHeader() {
  $('.mobileMap-tools-container .header').fadeOut();
}

function showMobileToolsHeader() {
  $('.mobileMap-tools-container .header').fadeIn();
}

function activateMobileToolsMenu() {
  $('.map-tools').fadeIn();
}

function onMobileToolsClick() {
  this.closeTools();
}

function closeTools() {
  Object.keys(this.tools).forEach((tool) => {
    this.tools[tool] = false;
  });

  $('.mobileMap-tools-container').fadeOut();
  $('.mobile-tools').fadeOut();
  $('.map-tools').fadeIn();
  $('[class*="tool-wrap"]').fadeOut();
}

const buttons = [{
  name: 'measure',
  img: 'measure.png',
  activeImg: 'measure-hover.png',
},
{
  name: 'track',
  img: 'track.png',
  activeImg: 'track-hover.png',
},
{
  name: 'waypoint',
  img: 'waypoint.png',
  activeImg: 'waypoint-hover.png',
},
{
  name: 'marklocation',
  img: 'marklocation.png',
  activeImg: 'marklocation-hover.png',
},
];

function otherButtons(currentButton) {
  return buttons.filter(button => button.name !== currentButton).map(button => button.name);
}

function getImage(button, checked) {
  const def = buttons.find(def => def.name === button);

  return `img/tools/${checked ? def.activeImg : def.img}`;
}

function initButtons() {
  $('.mobile-tools-trigger').click(() => {
    $('.mobile-tools.header').addClass('on');
  });

  $('.mobileMap-tools-container .mobileMap-overlay, .mm-toggle, .mobile-map-tools-hide').click(() => {
    this.closeMenus();
    $('.mobile-tools.header').removeClass('on');
    $('.mobileMap-tools-container').fadeOut();
    $('.mobile-tools').fadeIn();
    $('.get-location-btn').css('margin-bottom', 0);
    $('.map-tools').fadeOut();
  });

  buttons.forEach((def) => {
    const button = def.name;
    const $trigger = $(`.${button}-trigger`);
    const $radio = $(`.${button}-radio`);
    const $triggerLabel = $trigger.find('label');
    const $toolWrapImg = $(`.${button}-tool-wrap .header img`);
    const $img = $trigger.find('img')
      .add($radio.find('img'));
    const $imgCheck = $trigger.find('.img-check');

    const isActive = () => $radio.hasClass('check') || $triggerLabel.hasClass('check');

    $toolWrapImg
      .click(() => {
        $(`.${button}-tool-wrap`).fadeOut();
        $('.map-tools').fadeIn();
      });

    $trigger
      .add($radio)
      .hover(() => {
        $img.attr('src', getImage(button, true));
      }, () => {
        if (isActive()) return;
        $img.attr('src', getImage(button, false));
      })
      .click(() => {
        $imgCheck
          .addClass('check')
          .siblings('input')
          .prop('checked', true);

        $triggerLabel
          .addClass('check')
          .find('input')
          .prop('checked', true);

        $(`.mobile-${button}`).fadeIn();
        $(`.${button}-tool-wrap`).fadeIn();

        $img.attr('src', getImage(button, true));

        $('.get-location-btn')
          .css('margin-bottom',
            $('.mobileMap-tools-container').height() - 80);

        otherButtons(button).forEach((button) => {
          $(`.mobile-${button}`).fadeOut();
          $(`.${button}-tool-wrap`).fadeOut();
          $(`.${button}-radio img`).attr('src', getImage(button, false));

          $imgCheck
            .removeClass('check')
            .siblings('input')
            .prop('checked', false);

          $triggerLabel
            .removeClass('check')
            .find('input')
            .prop('checked', false);
        });

        if (window.innerWidth <= 500) {
          this.closeMenus();
        }

        // hide Mobile tools menu
        $('.map-tools').fadeOut();
      });

    if (window.innerWidth <= 500) {
      $radio.click(() => {
        $('.mobileMap-tools-container').fadeIn();
      });
    }
  });
}

function initToolEvents() {
  $('.track-tool-wrap .header img').on('click', () => {
    $('.track-tool-wrap').fadeOut();
  });

  $('.track-tool-wrap .gray-btn').on('click', () => {
    $('.track-confirm-wrap.delete-confirm').fadeIn();
  });

  $('.track-confirm-wrap .header img').on('click', () => {
    $('.track-confirm-wrap.delete-confirm').fadeOut();
  });


  $('.track-confirm-wrap .header img').on('click', () => {
    $('.track-confirm-wrap.save-confirm').fadeOut();
  });

  $('.waypoint-tool-wrap .header img').on('click', () => {
    $('.waypoint-tool-wrap').fadeOut();
  });
}

const data = {
  tools: {
    measure: false,
    markLocation: false,
    customWaypoint: false,
    tripTracking: false,
  },

  // Tools popups datetime
  PopupsDateTime: null,

  firstTimeToOpenMobileTools: true,
};

export default {
  initTools,
  initToolEvents,
  initButtons,
  makeToolsDraggable,
  newTimeVal,
  hideMobileToolsHeader,
  showMobileToolsHeader,
  activateMobileToolsMenu,
  onMobileToolsClick,
  closeTools,

  data,
};
