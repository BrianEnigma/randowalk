let latVar = 0;
let lonVar = 0;
function writeMessage(message)
{
    $('#messaging').html(message);
}

function removeDeadCookies()
{
    const fields = ['lat', 'lon', 'latVar', 'longVar'];
    for (let i = 0; i < fields.length; i++) {
        Cookies.remove(fields[i]);
    }
}

// Cookie handling using https://github.com/js-cookie/js-cookie
function saveSettings()
{
    removeDeadCookies();
    const fields = ['radius'];
    for (let i = 0; i < fields.length; i++)
    {
        const name = fields[i];
        const value = parseFloat($('#' + fields[i]).val());
        Cookies.set(name, value, {expires: 366});
    }
}

function loadSettings()
{
    removeDeadCookies();
    const radius = Cookies.get('radius');
    if (radius !== undefined) {
        $('#radius').val(radius);
    } else {
        $('#radius').val('0.5');
    }
}

function buildUrlApple(lat_source, lon_source, lat_destination, lon_destination)
{
    return 'https://maps.apple.com/?t=m&dirflg=w&saddr=' +
        lat_source +
        ',' +
        lon_source +
        '&daddr=' +
        lat_destination +
        ',' +
        lon_destination;
}

function buildUrlGoogle(lat_source, lon_source, lat_destination, lon_destination)
{
    return 'https://www.google.com/maps/dir/?api=1&travelmode=walking&origin=' +
        lat_source +
        ',' +
        lon_source +
        '&destination=' +
        lat_destination +
        ',' +
        lon_destination;
}

function buildUrl(lat_source, lon_source, lat_destination, lon_destination)
{
    const vendor = $("input:radio[name=vendor]:checked").val();
    if ('google' == vendor)
        return buildUrlGoogle(lat_source, lon_source, lat_destination, lon_destination);
    else
        return buildUrlApple(lat_source, lon_source, lat_destination, lon_destination);
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function approximateRadius(lat1, lon1, lat2, lon2)
{
    const R = 3959; // Radius of the earth in miles
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const diameter = R * c; // Distance in miles
    return diameter / 2; // Convert to radius
}

function searchRadius(origin_lat, origin_lon, desired_radius)
{
    // Do a binary search of latitude and longitude offsets so that we can narrow in on a variance that
    // matches the desired radius.
    const loop_count = 20;
    let test_lat = 1;
    let test_lon = 1;
    let variance_lat = Math.abs(origin_lat) + test_lat;
    let variance_lon = Math.abs(origin_lon) + test_lon;
    for (let loop = 0; loop < loop_count; loop++)
    {
        var radius = approximateRadius(Math.abs(origin_lat), Math.abs(origin_lon), variance_lat, Math.abs(origin_lon)) * 2;
        test_lat /= 2;
        if (radius > desired_radius)
        {
            variance_lat -= test_lat;
        } else if (radius < desired_radius)
        {
            variance_lat += test_lat;
        } else {
            break;
        }
        console.log("variance_lat => ", variance_lat, " :: ", radius);
    }
    for (let loop = 0; loop < loop_count; loop++)
    {
        var radius = approximateRadius(Math.abs(origin_lat), Math.abs(origin_lon), Math.abs(origin_lat), variance_lon) * 2;
        test_lon /= 2;
        if (radius > desired_radius)
        {
            variance_lon -= test_lon;
        } else if (radius < desired_radius)
        {
            variance_lon += test_lon;
        } else {
            break;
        }
        console.log("variance_lon => ", variance_lon, " :: ", radius);
    }
    console.log(origin_lat);
    console.log(variance_lat);
    console.log(origin_lon);
    console.log(variance_lon);
    console.log(Math.abs(origin_lat - variance_lat));
    console.log(Math.abs(origin_lon - variance_lon));
    return [Math.abs(Math.abs(origin_lat) - Math.abs(variance_lat)), Math.abs(Math.abs(origin_lon) - Math.abs(variance_lon))];
}

function generateLocation()
{
    updateVariance();
    if ($('#lat').val() == '' || $('#lat').val() == '')
        return false;
    const lat_source = parseFloat($('#lat').val());
    const lon_source = parseFloat($('#lon').val())
    const r1 = (Math.random() * latVar * 2) - latVar;
    const r2 = (Math.random() * lonVar * 2) - lonVar;
    const lat_destination = lat_source + r1;
    const lon_destination = lon_source + r2
    const url = buildUrl(lat_source, lon_source, lat_destination, lon_destination);
    console.log(url);
    let win = window.open(url, '_blank');
    win.focus();
    return false;
}

/// Callback from the browser, giving us the current GPS location.
function setPosition(position)
{
    try {
        $('#lat').val(position.coords.latitude);
        $('#lon').val(position.coords.longitude);
        saveSettings();
        writeMessage('GPS coordinates loaded.');
        $('#buttonGps').fadeOut();
        $('#cardGps').slideUp(400, function() {
            $('#cardGo').slideDown(400);
            $('#buttonGo').fadeIn();
        })
    }
    catch(e)
    {
        writeMessage('Unable to access browser geolocation information.');
    }

}

/// User hit button asking to load the current GPS coordinates.
function loadCurrent()
{
    try {
        if (navigator.geolocation)
        {
            $('#buttonGps').removeClass('buttonGreen').addClass('buttonGray');
            navigator.geolocation.getCurrentPosition(setPosition);
        }
    }
    catch(e)
    {
        writeMessage('Unable to access browser geolocation information.');
    }
}

/// User changed the radius dropdown. Calculate new variances.
function updateVariance()
{
    const origin_lat = parseFloat($('#lat').val());
    const origin_lon = parseFloat($('#lon').val())
    const diagonal_radius = parseFloat($('#radius').val())
    // Use Pythagorean theorem to determine how far horizontally or vertically we can go before we hit the
    // radius via diagonal.
    const horizontal_radius = Math.sqrt(diagonal_radius * diagonal_radius / 2);
    // Find the +/- in latitude and +/- in longitude we can travel before hitting our radius bounds.
    const [variance_lat, variance_lon] = searchRadius(origin_lat, origin_lon, horizontal_radius);
    // Save to globals.
    latVar = variance_lat;
    lonVar = variance_lon;
    saveSettings();
    return false;
}

/// Load the form default values. If cookies exist, use those as overrides.
function initializeForm()
{
    removeDeadCookies();
    loadSettings();
}

$( document ).ready(function() {
    $('#cardGo').slideUp(0);
    initializeForm();
});