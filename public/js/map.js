document.addEventListener("DOMContentLoaded", function () {
    mapboxgl.accessToken = mapToken;

    const map = new mapboxgl.Map({
        container: 'map',
        center: listing.geometry.coordinates,
        zoom: 9  
    });

    new mapboxgl.Marker({ color: 'red', rotation: 0 })
        .setLngLat(listing.geometry.coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 25 })
                .setHTML(`<h4>${listing.location}</h4><p>Exact Location will be provided after booking</p>`)
        )
        .addTo(map);
});