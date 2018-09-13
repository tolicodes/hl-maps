export function initTutorialModal() {
  if (this.isLoggedIn && localStorage.getItem('tutorialComplete')) {
    return;
  }

  const $modal = $('.tutorial-modal');
  $modal.show();

  $modal.find('.map-module-row').click(({ currentTarget }) => {
    if (this.isMobile()) return;

    const $el = $(currentTarget);
    const name = $el.data('name');

    $modal.find('.map-module-row').removeClass('map-module-row-active');
    $el.addClass('map-module-row-active');

    $modal.find('.laptop').attr('src', `img/tutorial-overlay/${name}-laptop.png`);
  });

  $modal.find('.map-module-row').eq(0).click();

  $modal.find('.instructions.button, .mobile-close-button').click(() => {
    this.hideTutorialModal();
  });

  $('.show-tutorial').click(() => {
    this.closeMenus();
    this.showTutorialModal();
  });
}

export function hideTutorialModal() {
  $('.tutorial-modal').fadeOut();
  $('.mobile-backdrop').fadeOut();

  this.stateSelected('Colorado');

  if (this.isLoggedIn) {
    localStorage.setItem('tutorialComplete', true);
  }
}

export function showTutorialModal() {
  $('.mobile-backdrop').fadeIn();
  $('.tutorial-modal').fadeIn();
}
