/* Core script for virtual tour that executes all initialization functions */

import * as sidebar from "./sidebar.js";
import * as mapEvents from "./map-events.js";
import * as mapMovement from "./map-movement.js";
import * as viewer360Module from "./360-viewer.js";

/*
*
* Global definitions
*
* */
window.lockDrag = false; // lock map panning
window.lockMapSelection = false; // lock map selection location clicks for clicking and dragging
window.viewer360 = undefined; // pannellum viewer object
window.viewer360Secondary = undefined; // pannellum viewer object for 360 video
window.mouseDragging = false; // used for map panning checks
window.activeMedia = undefined; // handles media switching and closing
window.activeMediaSecondary = undefined; // handles media switching and closing for sub media
window.mediaClickTimeout = false; // prevent media double clicks
window.sidebarClickTimeout = false; // prevent sidebar double clicks
window.mapClickTimeout = false; // prevent map double clicks
window.resizedWhileMedia = false; // check resized when media is active (not fullscreens)
window.mediaActiveFullscreen = false; //track media fullscreen toggle (specific window resize type)

/*
*
* Initialization functions
*
* */
// Inject sidebar elements, attach clickable events, init searchbar, init 360Videos (defers till sidebar is loaded)
// Replace map SVG with inline SVG, attach media clickable events and setup map controls/interaction
Promise.all([sidebar.initSidebar(), mapEvents.initMap()]).then(() => {
    jQuery.get("./csv/virtual-tour/map-id-list.csv", function (data) {
        mapEvents.addMapLinksNew($.csv.toArrays(data)); // wait until both sidebar and map are loaded before adding map links
    }, 'text');
}).catch((error) => {
    console.error(error);
});

mapMovement.initMapMovementEvents(); // Add map events to facilitate map movement

viewer360Module.initMediaControls(); // Add all 360 viewer controls (photo and video)

// note: init 360 videos moved to sidebar since it must be deferred until sidebar is loaded
