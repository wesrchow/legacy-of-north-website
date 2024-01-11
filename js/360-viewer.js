/* 360 viewer related function */

import * as mapMovement from "./map-movement.js";

// map jquery selectors
const mapLayerMenu = $("#map-layer-menu");
const mapLayerMenuDropdown = $("#map-layer-menu-dropdown");
const mapContainer = $("#map-container");

// 360 viewer jquery selectors
const viewer360Container = $("#viewer-360-container");
const viewer360ContainerSecondary = $("#viewer-360-container-secondary");
const exit360Viewer = $("#exit-360-viewer");
const video360Range = $("#video-360-range");
const video360ButtonPrev = $("#video-360-button-prev");
const video360ButtonNext = $("#video-360-button-next");

// buffered so section 1 = north, 2 = south, 3 = outside
const sectionFilepath = ["", "north", "south", "outside"];


// Sets up all 360Videos
export function initAll360Videos() {
    jQuery.get("./csv/360Video/north-2nd-floor-filenames.csv", function (data) {
        addAll360VideoLinks($.csv.toArrays(data), 235, 46, 1);
    }, 'text');

    jQuery.get("./csv/360Video/north-foyer-filenames.csv", function (data) {
        addAll360VideoLinks($.csv.toArrays(data), 235, 18, 1);
    }, 'text');

    // TODO: to add
}

// Sets up all 360 viewer controls (photo and video)
// TODO: unfinished
export function initAll360ViewerControls() {
    // main viewer exit button
    exit360Viewer.click(function () {
        close360Viewer();
    });

    // escape shortcut to exit viewer
    $(document).keyup(function (e) {
        // note: always active on the virtual tour page. kept this way so we can always close the viewer in case something else goes wrong
        if (e.key === "Escape") {
            close360Viewer();
        }
    });
}

// Creates and adds 360Photo viewer event to input selector using input media info
export function create360PhotoViewerEvent(selectorIDString, content360Filename, section) {
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
function addAll360VideoLinks(filename360VideoArray, initialYaw, fileCount, section) {
    const mapIDName = $(`#${filename360VideoArray[0][0]}`);
    // define sidebar selection ID
    // remove 360Video from the end of the string
    // if csv title has "floor" then we also append "hallway" to match the sidebar ID
    // otherwise leave it, the other 360Videos are already matched correctly

    let video360TargetToggle = true; // controls alternating between the two 360 viewers
    let videoPos = 1;
    let tempPrevViewer; // holds current viewer until we transition where it's treated as the previous viewer and altered accordingly
    let content360Filename;
    let clickTimeout = false; // used to timeout 360 video clicks

    mapIDName.addClass("location"); // add css class that gives the hover effect

    // add click event to map
    mapIDName.click(function () {
        if (!window.lockMapSelection) {
            // hide necessary elements
            mapLayerMenuDropdown.addClass("hidden");
            mapLayerMenu.addClass("hidden");
            mapContainer.addClass("hidden");

            // reveal and bring to foreground main 360 viewer
            // we do this here because sometimes the user exits during transition when the hidden opacity hasn't been added yet
            viewer360Container.removeClass("hidden-opacity-360video");
            viewer360Container.removeClass("hidden");
            exit360Viewer.removeClass("hidden");
            // reset secondary viewer to initial state
            viewer360ContainerSecondary.addClass("hidden-opacity-360video");
            viewer360ContainerSecondary.removeClass("hidden");

            // reveal 360 video controls
            video360ButtonNext.removeClass("hidden");
            video360ButtonPrev.removeClass("hidden");
            video360Range.removeClass("hidden");

            window.lockDrag = true; // lock map movement

            // always start at the one end of the hallway
            content360Filename = filename360VideoArray[1].toString();
            videoPos = 1;

            // check if there's an existing viewer already, if so destroy it
            if (typeof window.viewer360 !== "undefined") {
                window.viewer360.destroy();
            }

            window.viewer360 = pannellum.viewer("viewer-360-container", {
                "type": "equirectangular",
                "panorama": `media/${sectionFilepath[section]}/${filename360VideoArray[0][0].toString()}/${content360Filename}`,
                "friction": 0.1,
                "autoLoad": true,
                "compass": false,
                "keyboardZoom": false,
                "disableKeyboardCtrl": true,
                "yaw": initialYaw
            });

            // console.log(window.viewer360.getpi)

            // set up view switching
            video360TargetToggle = true;
            tempPrevViewer = window.viewer360;
        }

        // 360 video previous button event
        video360ButtonPrev.click(function () {
            if (!clickTimeout) {
                // allow the timeout to expire when we allow a transition
                setTimeout(function () {
                    clickTimeout = false;
                }, 1000);
                videoPos--

                if (videoPos < 1) { // if we're past the range, hold position
                    videoPos++;
                } else {
                    if (video360TargetToggle) { // toggle back and forth between the two viewers to simulate 360 video
                        tempPrevViewer = video360Transition("viewer-360-container-secondary", viewer360Container, tempPrevViewer, window.viewer360Secondary);
                    } else {
                        tempPrevViewer = video360Transition("viewer-360-container", viewer360ContainerSecondary, tempPrevViewer, window.viewer360);
                    }

                    video360TargetToggle = !video360TargetToggle;
                }
            }

            clickTimeout = true; // always reset click timeout when clicked
        });

        // 360 video next button event
        video360ButtonNext.click(function () {
            if (!clickTimeout) {
                // allow the timeout to expire when we allow a transition
                setTimeout(function () {
                    clickTimeout = false;
                }, 1000);
                videoPos++

                if (videoPos >= fileCount) { // if we're past the range, hold position
                    videoPos--;
                } else {
                    if (video360TargetToggle) { // toggle back and forth between the two viewers to simulate 360 video
                        tempPrevViewer = video360Transition("viewer-360-container-secondary", viewer360Container, tempPrevViewer, window.viewer360Secondary);
                    } else {
                        tempPrevViewer = video360Transition("viewer-360-container", viewer360ContainerSecondary, tempPrevViewer, window.viewer360);
                    }

                    video360TargetToggle = !video360TargetToggle;
                }
            }

            clickTimeout = true; // always reset click timeout when clicked
        });

        // set up range slider
        video360Range.attr("max", fileCount);
        // todo bonus: range slider functionality

        // facilitates 360 video transition
        function video360Transition(nextContainerString, prevContainer, prevPannellumViewer, nextPannellumViewer) {
            const nextContainerSelector = $(`#${nextContainerString}`);
            content360Filename = filename360VideoArray[videoPos].toString();

            nextPannellumViewer = pannellum.viewer(nextContainerString, {
                "type": "equirectangular",
                "panorama": `media/${sectionFilepath[section]}/${filename360VideoArray[0][0].toString()}/${content360Filename}`,
                "friction": 0.1,
                "autoLoad": true,
                "compass": false,
                "keyboardZoom": false,
                "disableKeyboardCtrl": true,
                "yaw": 360+prevPannellumViewer.getYaw(),
                "pitch": prevPannellumViewer.getPitch()
            });

            // show next viewer immediately underneath while fading out previous viewer
            nextContainerSelector.removeClass("hidden-opacity-360video");

            prevContainer.addClass("hidden-opacity-360video"); // fade out previous viewer
            prevContainer.on('transitionend webkitTransitionEnd oTransitionEnd', function () {
                // destroy previous viewer renderer, push to background
                prevPannellumViewer.destroy();
                prevContainer.css("z-index", 0);

                // bring next viewer to foreground
                nextContainerSelector.css("z-index", 1);
            });

            return nextPannellumViewer;
        }
    });
}

// closes and cleans up the 360 viewer
function close360Viewer() { // todo: flesh out for 360 video
    // reveal and unlock map
    mapLayerMenuDropdown.removeClass("hidden");
    mapContainer.removeClass("hidden");
    window.lockDrag = false;

    // hide 360 viewer elements
    viewer360Container.addClass("hidden");
    viewer360ContainerSecondary.addClass("hidden");
    exit360Viewer.addClass("hidden");
    video360ButtonNext.addClass("hidden");
    video360ButtonPrev.addClass("hidden");
    video360Range.addClass("hidden");

    // reset z-index 360 video manipulation
    viewer360Container.css("z-index", 1);
    viewer360ContainerSecondary.css("z-index", 0);

    // remove 360 video control events
    video360ButtonNext.off("click");
    video360ButtonPrev.off("click");

    // reset the map in case we resize while the 360 viewer is open
    // necessary because window resize check doesn't work when map is hidden
    mapMovement.resetMapVars();
    mapMovement.constrainMap();

    // close the 360 viewer renderer
    if (typeof viewer360 !== "undefined") {
        viewer360.destroy();
    }
    if (typeof viewer360Secondary !== "undefined") {
        console.log("destroyed secondary viewer");
        viewer360Secondary.destroy();
    }
}