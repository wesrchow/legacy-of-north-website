/* Core script for virtual tour that executes all initialization functions */

import * as sidebar from "./sidebar.js";
import * as mapEvents from "./map-events.js";
import * as mapMovement from "./map-movement.js";
import * as viewer360Module from "./360-viewer.js";
import * as linearVideo from "./linear-video.js";

/*
*
* Global definitions
*
* */
window.lockDrag = false; // lock map panning
window.lockMapSelection = false; // lock map selection location clicks
window.viewer360 = undefined;
window.viewer360Secondary = undefined;
window.mouseDragging = false; // used for map panning checks
window.activeMedia = undefined;
window.activeMediaSecondary = undefined;

/*
*
* Initialization functions
*
* */
// Inject sidebar elements, attach clickable events, init searchbar, init 360Videos (defers till sidebar is loaded)
// Replace map SVG with inline SVG, attach media clickable events and setup map controls/interaction
Promise.all([sidebar.initSidebar(), mapEvents.initMap()]).then(() => {
    jQuery.get("./csv/web-lists/map-id-list.csv", function (data) {
        mapEvents.addMapLinksNew($.csv.toArrays(data)); // wait until both sidebar and map are loaded before adding map links
    }, 'text');
}).catch((error) => {
    console.error(error);
});

mapMovement.initMapMovementEvents(); // Add map events to facilitate map movement

viewer360Module.init360ViewerControls(); // Add all 360 viewer controls (photo and video)

linearVideo.initLinearVideoControls(); // Add all linear video controls

// init 360 videos moved to sidebar since it must be deferred until sidebar is loaded
