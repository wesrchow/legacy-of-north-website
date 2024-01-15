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
window.lockMapSelection = false; // lock map selection location clicks
window.viewer360 = undefined;
window.viewer360Secondary = undefined;
window.mouseDragging = false; // used for map panning checks

/*
*
* Initialization functions
*
* */
// TODO: reorder map and sidebar init so we have the sidebar ids to scroll to for map links? or other method to do this
mapEvents.initMap(); // Replace map SVG with inline SVG, attach media clickable events and setup map controls/interaction

sidebar.initSidebar(); // Inject sidebar elements, attach clickable events, init searchbar

mapMovement.initMapMovementEvents(); // Add map events to facilitate map movement

viewer360Module.init360ViewerControls(); // Add all 360 viewer controls (photo and video)

// init 360 videos moved to sidebar since it must be deferred until sidebar is loaded