/* 360 viewer related function */

import * as mapMovement from "./map-movement.js";

const mapLayerMenu = $("#map-layer-menu");
const mapLayerMenuDropdown = $("#map-layer-menu-dropdown");

const mapContainer = $("#map-container");

const viewer360Container = $("#viewer-360-container");
const viewer360ContainerSecondary = $("#viewer-360-container-secondary");
const exit360Viewer = $("#exit-360-viewer");


// Sets up all 360Videos
export function initAll360Videos() {
    jQuery.get("./csv/360Video/north-2nd-floor-filenames.csv", function (data) {
        addAll360VideoLinks($.csv.toArrays(data), 235, 46);

    }, 'text');

    // TODO: to add
}

// Sets up all 360 viewer controls (photo and video)
// TODO: unfinished
export function initAll360ViewerControls() {
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

        // TODO: not sure why these are necessary to constrain map if the page is resized since the window resize should achieve the same while we're in the 360 viewer
            // but it only works if these lines are here
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

// Creates and adds 360Photo viewer event to input selector using input media info
export function create360PhotoViewerEvent(selectorIDString, content360Filename, section) {
    // buffered so section 1 = north, 2 = south, 3 = outside
    const sectionFilepath = ["", "north", "south", "outside"];

    $(`#${selectorIDString}`).click(function () {
        if (!window.lockMapSelection) {
            // hide necessary elements
            mapLayerMenu.addClass("hidden");
            mapLayerMenuDropdown.addClass("hidden");
            mapContainer.addClass("hidden");

            // reveal 360 viewer things
            viewer360Container.removeClass("hidden");
            exit360Viewer.removeClass("hidden");

            window.lockDrag = true; // lock map movement

            // check if there's an existing viewer already, if so destroy it
            if (typeof window.viewer360 !== "undefined") {
                window.viewer360.destroy();
            }

            // create a new pannellum viewer
            window.viewer360 = pannellum.viewer('viewer-360-container', {
                "type": "equirectangular",
                "panorama": `media/${sectionFilepath[section]}/${content360Filename}`,
                "friction": 0.1,
                "autoLoad": true,
                "compass": false,
                "keyboardZoom": false,
                "disableKeyboardCtrl": true // TODO: why?
            });
        }
    });
}


// TODO: revise and finish up
function addAll360VideoLinks(filename360VideoArray, initialYaw, fileCount) {
    // console.log(filename360VideoArray[0][0].replace(/ /g, " "));

    const video360Range = $("#video-360-range");
    const video360ButtonPrev = $("#video-360-button-prev");
    const video360ButtonNext = $("#video-360-button-next");
    const mapIDName = $(`#${filename360VideoArray[0][0]}`);
    // define sidebar selection ID
    // remove 360Video from the end of the string
    // if csv title has "floor" then we also append "hallway" to match the sidebar ID
    // otherwise leave it, the other 360Videos are already matched correctly

    let video360Toggle = true;
    let videoPos = 1;
    let tempPrevViewer = null;

    mapIDName.addClass("location"); // add css class that gives the hover effect

    mapIDName.click(function () {
        if (!window.lockMapSelection) {
            // document.getElementById(selectionIDArrayTop[i].attr("id")).scrollIntoView();
            // console.log(selectionIDArrayTop[i - index]);

            // set up 360Video controls
            video360Range.attr("max", fileCount);

            video360ButtonPrev.click(function () {
                videoPos--

                if (videoPos < 1) {
                    videoPos++;
                } else {
                    if (video360Toggle) {
                        tempPrevViewer = video360Transition("viewer-360-container-secondary", viewer360Container, viewer360ContainerSecondary, tempPrevViewer, window.viewer360Secondary);
                    } else {
                        tempPrevViewer = video360Transition("viewer-360-container", viewer360ContainerSecondary, viewer360Container, tempPrevViewer, window.viewer360);
                    }

                    video360Toggle = !video360Toggle;
                }
            });

            video360ButtonNext.click(function () {
                videoPos++

                if (videoPos >= fileCount) {
                    videoPos--;
                } else {
                    if (video360Toggle) {
                        tempPrevViewer = video360Transition("viewer-360-container-secondary", viewer360Container, viewer360ContainerSecondary, tempPrevViewer, window.viewer360Secondary);
                    } else {
                        tempPrevViewer = video360Transition("viewer-360-container", viewer360ContainerSecondary, viewer360Container, tempPrevViewer, window.viewer360);
                    }

                    video360Toggle = !video360Toggle;
                }
            });

            // hide necessary elements, lock map and reveal the 360 viewer container
            mapLayerMenuDropdown.addClass("hidden");
            mapLayerMenu.addClass("hidden");
            mapContainer.addClass("hidden");
            viewer360Container.removeClass("hidden-opacity-360video");
            exit360Viewer.removeClass("hidden");
            window.lockDrag = true;
            // FIXME: discrepancy using hidden and hidden-opacity-360video for my 360 containers

            let content360 = filename360VideoArray[1]; // somehow this works by giving it as an object

            // check if there's an existing viewer already, if so destroy it
            if (typeof window.viewer360 !== "undefined") {
                window.viewer360.destroy();
            }

            window.viewer360 = pannellum.viewer("viewer-360-container", {
                "type": "equirectangular",
                "panorama": `test-media/${filename360VideoArray[0][0].replaceAll("_", " ")}/${content360}`,
                "friction": 0.1,
                "autoLoad": true,
                "compass": false,
                "keyboardZoom": false,
                "disableKeyboardCtrl": true,
                "yaw": initialYaw
            });

            // set up view switching
            tempPrevViewer = window.viewer360;

            function video360Transition(targetContainerString, prevContainer, nextContainer, prevPannellumViewer, nextPannellumViewer) {
                content360 = filename360VideoArray[videoPos];

                nextContainer.removeClass("hidden");
                nextContainer.removeClass("hidden-opacity-360video");

                nextPannellumViewer = pannellum.viewer(targetContainerString, {
                    "type": "equirectangular",
                    "panorama": `test-media/${filename360VideoArray[0][0].replaceAll("_", " ")}/${content360}`,
                    "friction": 0.1,
                    "autoLoad": true,
                    "compass": false,
                    "keyboardZoom": false,
                    "disableKeyboardCtrl": true,
                    "yaw": initialYaw
                });

                prevContainer.addClass("hidden-opacity-360video");
                prevContainer.on('transitionend webkitTransitionEnd oTransitionEnd', function () {
                    prevPannellumViewer.destroy();
                    prevContainer.addClass("hidden");

                    nextContainer.css("z-index", 1);
                    prevContainer.css("z-index", 0);
                });


                return nextPannellumViewer;
            }
        }
    });
}