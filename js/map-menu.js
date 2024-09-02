/* Map menu events */

import * as mapMovement from "./map-movement.js";


// add the events for the map layer menu
export function initMapLayerMenu() {
    // Map layer selectors
    const mapLayerNorth1st = $("#map-layer-north-1st");
    const mapLayerNorth2nd = $("#map-layer-north-2nd");
    const mapLayerNorth3rd = $("#map-layer-north-3rd");
    const mapLayerSouth1st = $("#map-layer-south-1st");
    const mapLayerSouth2nd = $("#map-layer-south-2nd");
    const mapLayerOutside = $("#map-layer-outside");

    // Map layer menu selectors
    const mapLayerMenuDropdown = $("#map-layer-menu-dropdown");
    const mapLayerMenu = $("#map-layer-menu");
    const mapLayerMenuNorth1st = $("#map-layer-menu-north-1st");
    const mapLayerMenuNorth2nd = $("#map-layer-menu-north-2nd");
    const mapLayerMenuNorth3rd = $("#map-layer-menu-north-3rd");
    const mapLayerMenuSouth1st = $("#map-layer-menu-south-1st");
    const mapLayerMenuSouth2nd = $("#map-layer-menu-south-2nd");
    const mapLayerMenuOutside = $("#map-layer-menu-outside");

    // Helper variables
    const mapLayerMenuTitles = ["North 1st Floor", "North 2nd Floor", "North 3rd Floor", "South 1st Floor", "South 2nd Floor", "Outside"];
    // default start state
    let currentMapLayer = mapLayerSouth1st; // initial map layer
    mapLayerMenuDropdown.text(mapLayerMenuTitles[3]); // initial menu title
    let currentBuilding = 2; // 1 = north, 2 = south, 3 = outside

    // events for locking map when mouse is hovering the menu
    mapMenuLockPanning(mapLayerMenuDropdown);
    mapMenuLockPanning(mapLayerMenu);

    // map menu dropdown toggle
    mapLayerMenuDropdown.click(function () {
        mapLayerMenu.toggleClass("hidden");
    });

    //
    // map menu layer switching
    //
    mapLayerMenuNorth1st.click(function () {
        switchMapLayers(mapLayerNorth1st, 1, 0);
    });

    mapLayerMenuNorth2nd.click(function () {
        switchMapLayers(mapLayerNorth2nd, 1, 1);
    });

    mapLayerMenuNorth3rd.click(function () {
        switchMapLayers(mapLayerNorth3rd, 1, 2);
    });

    mapLayerMenuSouth1st.click(function () {
        switchMapLayers(mapLayerSouth1st, 2, 3);
    });

    mapLayerMenuSouth2nd.click(function () {
        switchMapLayers(mapLayerSouth2nd, 2, 4);
    });

    mapLayerMenuOutside.click(function () {
        switchMapLayers(mapLayerOutside, 3, 5);
    });

    // helper function to switch map layers by toggling "hidden" class
    function switchMapLayers(targetMapLayer, targetBuilding, title) {
        if (currentMapLayer !== targetMapLayer) {
            mapLayerMenuDropdown.text(mapLayerMenuTitles[title]); // change menu title (active layer)

            // hide the current layer and show the target layer
            currentMapLayer.toggleClass("hidden");
            targetMapLayer.toggleClass("hidden");

            if (targetBuilding !== currentBuilding) { // if the buildings are different, reset the map
                mapMovement.centerResetMap();
                currentBuilding = targetBuilding;
            }

            currentMapLayer = targetMapLayer;
        }
    }
}

// properly lock map panning when hovering over the layer menu
function mapMenuLockPanning(menuElement) {
    menuElement.hover(function () { // enter element
            if (!mouseDragging) { // lock map panning if not dragging
                window.lockDrag = true;
            }
        }, function () { // leave element
            window.lockDrag = false;
        }
    );

    menuElement.mouseup(function () { // lock if we mouseup within the menu as well (usually while having been dragging)
        setTimeout(function () { // waits for the mouseup in map-movement to trigger first
            window.lockDrag = true;
        }, 10);
    });
}