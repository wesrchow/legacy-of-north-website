/* Map menu events */

import {centerResetMap} from "./map-movement.js";
import * as mediaHelper from "./media.js";


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
    const mapMenuContainer = $("#map-menu-container");
    const mapMenuDropdownBtn = $("#map-menu-dropdown-btn");
    const mapMenuDropdownArrow = $("#map-menu-dropdown-arrow");
    const mapLayerMenu = $("#map-menu");
    const mapLayerMenuNorth1st = $("#map-menu-north-1st");
    const mapLayerMenuNorth2nd = $("#map-menu-north-2nd");
    const mapLayerMenuNorth3rd = $("#map-menu-north-3rd");
    const mapLayerMenuSouth1st = $("#map-menu-south-1st");
    const mapLayerMenuSouth2nd = $("#map-menu-south-2nd");
    const mapLayerMenuOutside = $("#map-menu-outside");

    // other selectors
    const mediaTransCover = $("#media-trans-cover");

    // Helper variables
    const mapLayerMenuTitles = ["North 1st Floor", "North 2nd Floor", "North 3rd Floor", "South 1st Floor", "South 2nd Floor", "Outside"];
    // default start state
    let currentMapLayer = mapLayerNorth2nd; // initial map layer
    mapMenuDropdownBtn.text(mapLayerMenuTitles[1]); // initial menu title
    let currentBuilding = 1; // 1 = north, 2 = south, 3 = outside

    // events for locking map when mouse is hovering the menu
    mapMenuLockPanning(mapMenuDropdownBtn);
    mapMenuLockPanning(mapLayerMenu);

    // map menu dropdown toggle
    mediaHelper.heightAnimHide(mapLayerMenu, true); // hide initially
    mapMenuDropdownBtn.click(function () {
        // mapLayerMenu.toggleClass("hidden");
        if (mapLayerMenu.css("display") === "none") {
            mediaHelper.heightAnimReveal(mapLayerMenu);
        } else {
            mediaHelper.heightAnimHide(mapLayerMenu, false);
        }

        mapMenuDropdownArrow.toggleClass("dropdown-flip");
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
    function switchMapLayers(targetMapLayer, targetBuilding, title) { // todo: add click timeout to prevent rapid clicking
        if (currentMapLayer !== targetMapLayer) {
            mapMenuDropdownBtn.text(mapLayerMenuTitles[title]); // change menu title (active layer)

            // swap map layers accordingly
            if (targetBuilding !== currentBuilding) { // if the buildings are different, reset the map
                mapMenuContainer.css('z-index', '7'); // temp set z-index to be above trans cover
                mediaHelper.mediaTransReveal(mediaTransCover, false); // media trans cover

                setTimeout(function () { // allow trans cover to show first
                    currentMapLayer.addClass("hidden"); // todo bonus: small concern about this not switching faster than the media cover begins hiding
                    currentMapLayer.addClass("media-trans-hidden");

                    targetMapLayer.removeClass("hidden");
                    targetMapLayer.removeClass("media-trans-hidden");

                    centerResetMap();
                    currentBuilding = targetBuilding;

                    mediaHelper.mediaTransHide(mediaTransCover); // hide trans cover & reveal map
                }, 350); // relative to trans cover animation delay (held a bit longer so it's natural compared to media load time)
            } else { // within building transition
                mediaHelper.mediaTransHide(currentMapLayer);
                mediaHelper.mediaTransReveal(targetMapLayer, true);
            }

            setTimeout(function () {
                currentMapLayer = targetMapLayer;
            }, 355); // relative to letting maps transition first

            setTimeout(function () {
                mapMenuContainer.css('z-index', '5'); // reset z-index
            }, 700); // relative to above trans hide cover finishing
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