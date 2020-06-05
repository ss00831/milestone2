// Map selector
$(document).ready(function () {
    $(".box").hide(); //hide
    $(".place_name").show(); //set default class to be shown here, or remove to hide all
});
$(document).ready(function () {
    $('input[name="places"]').click(function () {
        var inputValue = $(this).attr("value");
        var targetBox = $("." + inputValue);
        $(".box").not(targetBox).hide();
        $(targetBox).show();
    });
});

// This example uses the autocomplete feature of the Google Places API.
// It allows the user to find all hotels in a given place, within a given
// country. It then displays markers for all the hotels returned,
// with on-click details for each hotel.

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
function initialize() {
    initMap();
    initAutocomplete();
}
var map, places, infoWindow;
var markers = [];
var autocomplete;
var countryRestrict = { country: "kr" };
var MARKER_PATH = "https://developers.google.com/maps/documentation/javascript/images/marker_green";
var hostnameRegexp = new RegExp("^https?://.+?/");

var countries = {
    kr: {
        center: { lat: 37.5326, lng: 127.024612 },
        zoom: 8,
    },
};

function initMap() {
    map = new google.maps.Map(document.getElementById("map_type"), {
        zoom: countries["kr"].zoom,
        center: countries["kr"].center,
        mapTypeControl: false,
        panControl: false,
        zoomControl: false,
        streetViewControl: false,
    });

    infoWindow = new google.maps.InfoWindow({
        content: document.getElementById("info-content"),
    });

    // Create the autocomplete object and associate it with the UI input control.
    // Restrict the search to the default country, and to place type "cities".
    autocomplete = new google.maps.places.Autocomplete(/** @type {!HTMLInputElement} */ (document.getElementById("autocomplete")), {
        types: ["(cities)"],
        componentRestrictions: countryRestrict,
    });
    places = new google.maps.places.PlacesService(map);

    autocomplete.addListener("place_changed", onPlaceChanged);

    // Add a DOM event listener to react when the user selects a country.
    document.getElementById("country").addEventListener("change", setAutocompleteCountry);
}

// When the user selects a city, get the place details for the city and
// zoom the map in on the city.
function onPlaceChanged() {
    var place = autocomplete.getPlace();

    if (place.geometry) {
        map.panTo(place.geometry.location);
        map.setZoom(13);
    } else {
        document.getElementById("autocomplete").placeholder = "Enter a city";
    }
}

// The reference of Place types : https://developers.google.com/places/supported_types
$("input[name=placestype]").click(function searchPlace() {
    if (this.value == "touristattraction") {
        place_value = $("#touristattraction").value;
        var search = {
            bounds: map.getBounds(),
            types: ["tourist_attraction", "amusement_park"],
        };
    } else if (this.value == "accommodation") {
        place_value = $("#accommodation").value;
        var search = {
            bounds: map.getBounds(),
            types: ["lodging"],
        };
    } else if (this.value == "restaurant") {
        place_value = $("#restaurant").value;
        var search = {
            bounds: map.getBounds(),
            types: ["restaurant", "meal_delivery", "meal_takeaway"],
        };
    } else if (this.value == "drink") {
        place_value = $("#drink").value;
        var search = {
            bounds: map.getBounds(),
            types: ["bar", "liquor_store", "cafe", "night_club", "bakery"],
        };
    } else if (this.value == "shopping") {
        place_value = $("#shopping").value;
        var search = {
            bounds: map.getBounds(),
            types: ["clothing_store", "department_store", "shopping_mall"],
        };
    } else if (this.value == "supermarket") {
        place_value = $("#supermarket").value;
        var search = {
            bounds: map.getBounds(),
            types: ["supermarket", "grocery_or_supermarket", "convenience_store"],
        };
    } else if (this.value == "atm") {
        place_value = $("#atm").value;
        var search = {
            bounds: map.getBounds(),
            types: ["atm", "bank"],
        };
    } else if (this.value == "health") {
        place_value = $("#health").value;
        var search = {
            bounds: map.getBounds(),
            types: ["pharmacy", "drugstore", "hospital"],
        };
    }

    places.nearbySearch(search, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            clearResults();
            clearMarkers();
            // Create a marker for each hotel found, and
            // assign a letter of the alphabetic to each marker icon.

            for (var i = 0; i < results.length; i++) {
                var markerLetter = String.fromCharCode("A".charCodeAt(0) + (i % 26));
                var markerIcon = MARKER_PATH + markerLetter + ".png";
                // Use marker animation to drop the icons incrementally on the map.
                markers[i] = new google.maps.Marker({
                    position: results[i].geometry.location,
                    animation: google.maps.Animation.DROP,
                    icon: markerIcon,
                });
                // If the user clicks a hotel marker, show the details of that hotel
                // in an info window.
                markers[i].placeResult = results[i];
                google.maps.event.addListener(markers[i], "click", showInfoWindow);
                setTimeout(dropMarker(i), i * 100);
                addResult(results[i], i);
            }
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            clearMarkers();
            clearResults();
            $('input[name="placestype"]').prop('checked', false);
            alert("No result");

        }
    });
});
function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        if (markers[i]) {
            markers[i].setMap(null);
        }
    }
    markers = [];
}

// Set the country restriction based on user input.
// Also center and zoom the map on the given country.
function setAutocompleteCountry() {
    var country = document.getElementById("country").value;
    if (country == "all") {
        autocomplete.setComponentRestrictions({ country: [] });
        map.setCenter({ lat: 15, lng: 0 });
        map.setZoom(2);
    } else {
        autocomplete.setComponentRestrictions({ country: country });
        map.setCenter(countries[country].center);
        map.setZoom(countries[country].zoom);
    }
    clearResults();
    clearMarkers();
}

function dropMarker(i) {
    return function () {
        markers[i].setMap(map);
    };
}

function addResult(result, i) {
    var results = document.getElementById("results");
    var markerLetter = String.fromCharCode("A".charCodeAt(0) + (i % 26));
    var markerIcon = MARKER_PATH + markerLetter + ".png";

    var tr = document.createElement("tr");
    tr.style.backgroundColor = i % 2 === 0 ? "#F0F0F0" : "#FFFFFF";
    tr.onclick = function () {
        google.maps.event.trigger(markers[i], "click");
    };

    var iconTd = document.createElement("td");
    var nameTd = document.createElement("td");
    var icon = document.createElement("img");
    icon.src = markerIcon;
    icon.setAttribute("class", "placeIcon");
    icon.setAttribute("className", "placeIcon");
    var name = document.createTextNode(result.name);
    iconTd.appendChild(icon);
    nameTd.appendChild(name);
    tr.appendChild(iconTd);
    tr.appendChild(nameTd);
    results.appendChild(tr);
}

function clearResults() {
    var results = document.getElementById("results");
    while (results.childNodes[0]) {
        results.removeChild(results.childNodes[0]);
    }
}

// Get the place details for a hotel. Show the information in an info window,
// anchored on the marker for the hotel that the user selected.
function showInfoWindow() {
    var marker = this;
    places.getDetails({ placeId: marker.placeResult.place_id }, function (place, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
            return;
        }
        infoWindow.open(map, marker);
        buildIWContent(place);
    });
}

// Load the place information into the HTML elements used by the info window.
function buildIWContent(place) {
    document.getElementById("iw-icon").innerHTML = '<img class="hotelIcon" ' + 'src="' + place.icon + '"/>';
    document.getElementById("iw-url").innerHTML = '<b><a target="_blank" href="' + place.url + '">' + place.name + "</a></b>";
    document.getElementById("iw-address").textContent = place.vicinity;

    if (place.formatted_phone_number) {
        document.getElementById("iw-phone-row").style.display = "";
        document.getElementById("iw-phone").textContent = place.formatted_phone_number;
    } else {
        document.getElementById("iw-phone-row").style.display = "none";
    }

    // Assign a five-star rating to the hotel, using a black star ('&#10029;')
    // to indicate the rating the hotel has earned, and a white star ('&#10025;')
    // for the rating points not achieved.
    if (place.rating) {
        var ratingHtml = "";
        for (var i = 0; i < 5; i++) {
            if (place.rating < i + 0.5) {
                ratingHtml += "&#10025;";
            } else {
                ratingHtml += "&#10029;";
            }
            document.getElementById("iw-rating-row").style.display = "";
            document.getElementById("iw-rating").innerHTML = ratingHtml;
        }
    } else {
        document.getElementById("iw-rating-row").style.display = "none";
    }

    // The regexp isolates the first part of the URL (domain plus subdomain)
    // to give a short URL for displaying in the info window.
    if (place.website) {
        var fullUrl = place.website;
        var website = hostnameRegexp.exec(place.website);
        if (website === null) {
            website = "http://" + place.website + "/";
            fullUrl = website;
        }
        document.getElementById("iw-website-row").style.display = "";
        document.getElementById("iw-website").textContent = website;
    } else {
        document.getElementById("iw-website-row").style.display = "none";
    }
}

// initial map and by place name
function initAutocomplete() {
    var map = new google.maps.Map(document.getElementById("map_name"), {
        center: { lat: 37.5326, lng: 127.024612 },
        zoom: 8,
        mapTypeId: "roadmap",
        mapTypeControl: false,
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById("pac-input");
    var options = {
        componentRestrictions: { 
            country: "kr"},
    };
    var searchBox = new google.maps.places.SearchBox(input, options);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", function () {
        searchBox.setBounds(map.getBounds());
    });

    var nameResetButton = document.getElementById("nameReset");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(nameResetButton);

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener("places_changed", function () {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25),
            };

            // Create a marker for each place.
            markers.push(
                new google.maps.Marker({
                    map: map,
                    icon: icon,
                    title: place.name,
                    position: place.geometry.location,
                })
            );

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}

function resetPlaceFunction(){
    clearMarkers();
    clearResults();
    $('input[id="pac-input"]').val("");
    $('input[id="autocomplete"]').val("");
    $('input[name="placestype"]').prop('checked', false);
}