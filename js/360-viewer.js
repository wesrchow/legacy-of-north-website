import * as mapMovement from "./map-movement.js";

const exit360Viewer = $("#exit-360-viewer");

const mapLayerMenuDropdown = $("#map-layer-menu-dropdown");
const mapLayerMenu = $("#map-layer-menu");

const mapContainer = $("#map-container");
const viewer360Container = $("#viewer-360-container");
const viewer360ContainerSecondary = $("#viewer-360-container-secondary");

export function addPannellumClick(filenameArray, selectionIDArray, locationArray, section) { // TODO: fix the offsetting when skipping the 360videos
    let filenameOffset = 0;
    let locationArrayOffset = 0;
    let specialProperty = null;
    let counter = 0;
    let counting = false;

    let video360Counter = 0;

    if (section === 1) {
        for (let i = 0; i < selectionIDArray.length; i++) {

            // if (locationArray[i + 1 - locationArrayOffset][1] === "360Video") {
            //     video360Counter++;
            // }

            // use variables to offset the array's indexing
            specialProperty = locationArray[i + 1 - locationArrayOffset /*+ video360Counter*/][1];

            // if (counting) {
            //     counter++;
            // }

            if (counting) {
                locationArrayOffset++;
                // counter = 0;
                counting = false;
            }

            // grab the variable filenameOffset each iteration for each click function and pass it into the function as index variable
            (function (index) {
                $(`#${selectionIDArray[i]}`).click(function () {
                    // let test1 = (selectionIDArray[i]);
                    // let test2 = (i + 1 - index);
                    // let test3 = (filenameArray[(i + 1 - index)]);
                    // console.log(test1, test2, test3);

                    let content360 = filenameArray[(i + 1 - index)];

                    // hide necessary elements, lock map and reveal the 360 viewer container
                    mapLayerMenuDropdown.addClass("hidden");
                    mapLayerMenu.addClass("hidden");
                    mapContainer.addClass("hidden");
                    viewer360Container.removeClass("hidden");
                    exit360Viewer.removeClass("hidden");
                    window.lockDrag = true;

                    // check if there's an existing viewer already, if so destroy it
                    if (typeof window.viewer360 !== "undefined") {
                        window.viewer360.destroy();
                    }

                    window.viewer360 = pannellum.viewer('viewer-360-container', {
                        "type": "equirectangular",
                        "panorama": `test-media/${content360}`,
                        "friction": 0.1,
                        "autoLoad": true,
                        "compass": false,
                        "keyboardZoom": false,
                        "disableKeyboardCtrl": true
                    });
                });
            })(filenameOffset)

            if (/^[1-9]\d*$/.test(specialProperty)) {
                filenameOffset++;
                counting = true;
            }
        }
    }

    exit360Viewer.click(function () {
        close360Viewer();
    });

    $(document).keyup(function (e) { // right now this is firing always on the virtual tour page
        if (e.key === "Escape") {
            close360Viewer();
        }
    });

    function close360Viewer() {
        // hide the 360 viewer container, back to map button, and reveal + unlock map
        mapLayerMenuDropdown.removeClass("hidden");
        mapContainer.removeClass("hidden");
        viewer360Container.addClass("hidden");
        exit360Viewer.addClass("hidden");
        // FIXME: discrepancy using hidden and hidden-opacity-360video for my 360 containers

        viewer360Container.css("z-index", 1);
        viewer360ContainerSecondary.css("z-index", 0);

        window.lockDrag = false;

        mapMovement.resetMapVars();
        mapMovement.constrainMap();

        // close the viewer renderer
        if (typeof viewer360 !== "undefined") {
            viewer360.destroy();
        }
        if (typeof viewer360Secondary !== "undefined") {
            viewer360Secondary.destroy();
        }
    }

}