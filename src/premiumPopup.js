
export function initPremiumPopup() {
  $('.modal-backdrop')
    .click(() => this.hidePremiumPopup());

  $(document).keyup(function (e) {
    if (e.keyCode == 27) { // escape key maps to keycode `27`
      this.hidePremiumPopup();
    }
  });
}

export function showPremiumPopup() {
  $('.premium-member-popup, .modal-backdrop').addClass('on');
}

export function hidePremiumPopup() {
  $('.premium-member-popup, .modal-backdrop').removeClass('on');
}

export async function getIsLoggedIn() {
  this.isLoggedIn = (await $.getJSON('/account/isLoggedIn')).logged_in;
}
