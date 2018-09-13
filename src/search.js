// Flying to a place from searching suggestions
export function goToSearchingPlace(place) {
  setTimeout(() => {
    this.goToCords(place.center, 13);
  }, 2000);

  this.searchingPlaces = [];
  this.searchKeyword = place.name;
}

// Search for suggestions based on the user searching input.
export function findSearchPlaces() {
  this.searchingPlaces = [];
  if (this.searchKeyword === '') {
    return;
  }

  $.ajax({
    url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${this.searchKeyword}.json?country=us&access_token=${this.accessToken}`,
  }).done((data) => {
    data.features.forEach((feature) => {
      this.searchingPlaces.push({
        name: feature.place_name,
        center: feature.center,
      });
    });
  });
}

export const data = {
  // Searching keyword in search bard
  searchKeyword: '',

  // Searching suggestions based on searchKeyword
  searchingPlaces: [],
};
