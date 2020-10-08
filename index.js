settings = new Settings();

function writeMessage(message)
{
    $('#messaging').html(message);
}

function createCookie(name, value, days) {
    let expires;

    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function readCookie(name) {
    let nameEQ = encodeURIComponent(name) + "=";
    let ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ')
            c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return undefined;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

// Cookie handling using https://github.com/js-cookie/js-cookie
function saveSettings()
{
    const fields = ['lat', 'long', 'latVar', 'longVar'];
    for (let i = 0; i < fields.length; i++)
    {
        const name = fields[i];
        const value = parseFloat($('#' + fields[i]).val());
        Cookies.set(name, value, {expires: 366});
        //createCookie(name, value, 366);
    }
}

function loadSettings()
{
    const fields = ['lat', 'long', 'latVar', 'longVar'];
    for (let i = 0; i < fields.length; i++)
    {
        const name = fields[i];
        const value = Cookies.get(fields[i]);
        //const value = readCookie(name);
        if (value !== undefined)
            $('#' + name).val(parseFloat(value));
    }
}

function resetForm(userInitiated)
{
    if (userInitiated)
    {
        const fields = ['lat', 'long', 'latVar', 'longVar'];
        for (let i = 0; i < fields.length; i++) {
            Cookies.remove(fields[i]);
            //eraseCookie(fields[i]);
        }
    }
    $('#lat').val(settings.latitude);
    $('#long').val(settings.longitude);
    $('#latVar').val(settings.latitude_variance);
    $('#longVar').val(settings.longitude_variance);
    if (userInitiated)
        writeMessage('Form reset to defaults.');
    return false;
}

function readFormValues()
{
    return [
        parseFloat($('#lat').val()) + parseFloat($('#latVar').val()),
        parseFloat($('#lat').val()) - parseFloat($('#latVar').val()),
        parseFloat($('#long').val()) - parseFloat($('#longVar').val()),
        parseFloat($('#long').val()) + parseFloat($('#longVar').val())
    ];
}

function buildUrl(lat_source, long_source, lat_destination, long_destination)
{
    return 'http://maps.apple.com/?t=m&dirflg=w&saddr=' +
        lat_source +
        ',' +
        long_source +
        '&daddr=' +
        lat_destination +
        ',' +
        long_destination;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

function approximateRadius(lat1, lon1, lat2, lon2) {
    const R = 3959; // Radius of the earth in miles
    const dLat = deg2rad(lat2-lat1);
    const dLon = deg2rad(lon2-lon1);
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const diameter = R * c; // Distance in miles
    return diameter / 2; // Convert to radius
}

function testArea()
{
    const [lat1, lat2, long1, long2] = readFormValues();
    const url = buildUrl(lat1, long1, lat2, long2);
    console.log(url);
    let win = window.open(url, '_blank');
    win.focus();
    return false;
}

function generateLocation()
{
    const lat_source = parseFloat($('#lat').val());
    const long_source = parseFloat($('#long').val())
    const latVar = parseFloat($('#latVar').val());
    const longVar = parseFloat($('#longVar').val());
    const r1 = (Math.random() * latVar * 2) - latVar;
    const r2 = (Math.random() * longVar * 2) - longVar;
    const lat_destination = lat_source + r1;
    const long_destination = long_source + r2
    const url = buildUrl(lat_source, long_source, lat_destination, long_destination);
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
        $('#long').val(position.coords.longitude);
        saveSettings();
        writeMessage('GPS coordinates loaded.');
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
            navigator.geolocation.getCurrentPosition(setPosition);
    }
    catch(e)
    {
        writeMessage('Unable to access browser geolocation information.');
    }
}

function updateRadius()
{
    const [lat1, lat2, long1, long2] = readFormValues();
    let radius = approximateRadius(lat1, long1, lat2, long2)
    radius = parseInt(radius * 100) / 100.0;
    $('#radius').val(radius + ' miles');
}

/// Load the form default values. If cookies exist, use those as overrides.
function initializeForm()
{
    resetForm(false);
    loadSettings();
    updateRadius();
}

$( document ).ready(function() {
    initializeForm();
});