# RandoWalk

Recently the [Randonautica](https://www.randonautica.com) app has stopped working. This left me hanging since I would often use it for random walks around the neighborhood. I figured it would be fairly simple to build out a basic web application that gave me a random point in the immediate vicinity. This is that webapp.

This version doesn't quite have the spooky woo-woo that goes with quantum attractors and voids. It uses regular random numbers — so take that as you will.

# Installation

- Copy `settings-example.js` to `settings.js`
- Edit your default starting GPS location and variance.
- Put these files on a web server.

# Get Your GPS Location

## The Easy Way: “Here”

- Use the “Load Current GPS Location” feature of the app.
- Copy and paste the latitude and longitude into the `settings.js` file.

## The Complicated Way: “Anywhere”

- Find your house (or other starting point) in a [Google Maps](https://maps.google.com) search. For example for the defaults, I did a search for the Portlandia sculpture in downtown Portland, Oregon.
- Copy out the URL. In this case: `https://www.google.com/maps/place/Portlandia/@45.5157751,-122.6812279,17z/data=!3m1!4b1!4m5!3m4!1s0x54950a101cb3456b:0x46db417e8d645c59!8m2!3d45.5157751!4d-122.6790392`
- There are obvious GPS coordinates at the front. In this case, `@45.5157751,-122.6812279`. You _*DO NOT*_ want those. There are less obvious ones at the end. In this case, the part that goes `d45.5157751!4d-122.6790392`. More specifically, if you trim out the extra letters and symbols (don't forget to retain the negative), you'll get `45.5157751,-122.6790392`
- Close your Google Maps browser tab and open a fresh one. Paste those coordinates into the location box to verify they are correct.
- Use those in your `settings.js` file.

# Finding a Default Variance

The latitude and longitude variance are used to determine range. We will pick a random number that is +/- that max variance value, then add (or subtract, if negative) to the latitude and longitude. This gives a bounding box that limits how far you'll walk. Up in Portland, this gives about a 0.6 mile radius. Because of the way latitude and longitude work, this radius may increase closer to the equator and shrink the further you move from it.

To get a rough idea of the radius, use the “Validate Map Area” button. This will show you the top-left and bottom-right corners of your possible destinations.

# TODO

- Recalculate radius when changing variance.
- Remove variance values, replace with radius.
- Switch for Apple Maps versus Google Maps.

# License

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a>

This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.
