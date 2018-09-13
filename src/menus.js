export function animateOpenClose() {
  // rotation Jquery function
  $.fn.animateRotate = function animateRotate(angle, duration, easing, complete) {
    const args = $.speed(duration, easing, complete);
    const step = args.step;
    return this.each((i, e) => {
      args.complete = $.proxy(args.complete, e);
      args.step = function (now) {
        $.style(e, 'transform', `rotate(${now}deg)`);
        if (step) return step.apply(e, arguments);
      };

      $({
        deg: 0,
      }).animate({
        deg: angle,
      }, args);
    });
  };
  let collapsed = false;

  // legend collapse
  $('.layers-collapse').on('click', () => {
    $('.legend').slideToggle();
    if (!collapsed) {
      $('.layers-collapse .fa-angle-down').animateRotate(180);
      collapsed = !collapsed;
    } else {
      $('.layers-collapse .fa-angle-down').animateRotate(0);
      collapsed = !collapsed;
    }
  });
}

export function closeMenus() {
  this.closeMainMenu();
  this.closeLayerMenu();
}

export function closeMainMenu() {
  this.mainMenuShown = false;
  $('.mm-menu').removeClass('open');
}

export function closeLayerMenu() {
  this.layerMenu = false;
  $('.layer-menu').removeClass('open');
}

export function openMainMenu() {
  this.mainMenuShown = true;
  $('.mm-menu').addClass('open');
}

export function openLayerMenu() {
  this.layerMenuShown = true;
  $('.layer-menu').addClass('open');
}

export function initLayerMenu() {
  $('.layertoggle, .layertoggle-mobile').click(() => this.openLayerMenu());
  $('.mm-toggle').click(() => this.openMainMenu());
  $('.overlay, .close-mm-menu').click(() => this.closeMainMenu());
  $('.layer-menu .close-sht, .overlay2, .close-layer-menu').click(() => this.closeLayerMenu());

  this.animateOpenClose();
}

export const data = {
  mainMenuShown: false,
  layersMenuShown: false,
};
