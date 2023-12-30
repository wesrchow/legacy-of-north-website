
import * as mapMovement from "./map-movement.js";

const mapLayerMenuDropdown = $("#map-layer-menu-dropdown");
const mapLayerMenu = $("#map-layer-menu");

export function initMapLayerMenu() {
    // formerly dropdown and menu jquery selector here

    const mapLayerNorth1st = $("#map-layer-north-1st");
    const mapLayerNorth2nd = $("#map-layer-north-2nd");
    const mapLayerNorth3rd = $("#map-layer-north-3rd");
    const mapLayerSouth1st = $("#map-layer-south-1st");
    const mapLayerSouth2nd = $("#map-layer-south-2nd");
    const mapLayerOutside = $("#map-layer-outside");

    const mapLayerMenuNorth1st = $("#map-layer-menu-north-1st");
    const mapLayerMenuNorth2nd = $("#map-layer-menu-north-2nd");
    const mapLayerMenuNorth3rd = $("#map-layer-menu-north-3rd");
    const mapLayerMenuSouth1st = $("#map-layer-menu-south-1st");
    const mapLayerMenuSouth2nd = $("#map-layer-menu-south-2nd");
    const mapLayerMenuOutside = $("#map-layer-menu-outside");

    const mapLayerMenuTitles = ["North 1st Floor", "North 2nd Floor", "North 3rd Floor", "South 1st Floor", "South 2nd Floor", "Outside"];
    let currentMapLayer = mapLayerNorth2nd;
    let currentBuilding = 1; // 1 = north, 2 = south, 3 = outside

    // TODO: fix map drag allowed if you drag and release within the layer menu
    mapLayerMenuDropdown.hover(
        function () { // enter element
            if (!mouseDragging) {
                window.lockDrag = true;
            }
        }, function () { // leave element
            window.lockDrag = false;
        }
    );

    mapLayerMenu.hover(
        function () { // enter element
            if (!mouseDragging) {
                window.lockDrag = true;
            }
        }, function () { // leave element
            window.lockDrag = false;
        }
    );

    mapLayerMenuDropdown.click(function () {
        mapLayerMenu.toggleClass("hidden");
    });

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

    function switchMapLayers(targetMapLayer, targetBuilding, title) {
        if (currentMapLayer !== targetMapLayer) {
            mapLayerMenuDropdown.text(mapLayerMenuTitles[title]);
            currentMapLayer.toggleClass("hidden");
            targetMapLayer.toggleClass("hidden");

            if (targetBuilding !== currentBuilding) {
                mapMovement.centerMap();
            }

            currentBuilding = targetBuilding;
            currentMapLayer = targetMapLayer;
        }
    }
}