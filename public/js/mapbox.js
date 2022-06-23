export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiaWdhdXJhdiIsImEiOiJjbDRiM3hwY20wMWs4M2JwYndvNWVkaXVuIn0.6k4MyfDgF-qHTcjJ45TIog';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://sprites/mapbox/streets-v8',
    center: [72.6455481, 23.2207097],
    //   zoom: 14,
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    //create marker
    const el = document.createElement('div');
    el.className = 'marker';

    //add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //extends map bounds to the marker
    bounds.extend(loc.coordinates);

    new mapboxgl.Popup({ closeOnClick: false, offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>${loc.address}</p>`)
      .addTo(map);
  });

  map.fitBounds(bounds, {
    zoom: 14,
    padding: { top: 200, bottom: 200, left: 100, right: 100 },
  });
};
