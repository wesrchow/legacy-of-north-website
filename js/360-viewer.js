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
    jQuery.get("./csv/360Video/north-1st-floor-filenames.csv", function (data) {
        addAll360VideoLinks($.csv.toArrays(data), 240, 44, 1);
    }, 'text');

    jQuery.get("./csv/360Video/north-2nd-floor-filenames.csv", function (data) {
        addAll360VideoLinks($.csv.toArrays(data), 240, 46, 1);
    }, 'text');

    jQuery.get("./csv/360Video/north-3rd-floor-filenames.csv", function (data) {
        addAll360VideoLinks($.csv.toArrays(data), 240, 46, 1);
    }, 'text');

    jQuery.get("./csv/360Video/north-foyer-filenames.csv", function (data) {
        addAll360VideoLinks($.csv.toArrays(data), 230, 17, 1);
    }, 'text');

    // TODO: to add
}

// Sets up 360 viewer controls
export function init360ViewerControls() { // todo: how to manage this with linear video
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

            // cleans up any prior 360 video
            clean360Video();

            // reveal 360 viewer things
            viewer360Container.removeClass("hidden");
            exit360Viewer.removeClass("hidden");

            window.lockDrag = true; // lock map movement

            // check if there's existing viewer(s) already, if so destroy it
            // destroyAll360Viewers(); // todo: double check this removal doesn't cause issues (we overwrite the viewer anyway and cant easily check if one is active)

            // create a new pannellum viewer
            window.viewer360 = pannellum.viewer('viewer-360-container', {
                "type": "equirectangular",
                "panorama": `media/virtual-tour/${sectionFilepath[section]}/${content360Filename}`,
                "friction": 0.1,
                "autoLoad": true,
                "compass": false,
                "keyboardZoom": false,
                "disableKeyboardCtrl": true // TODO: why?
            });
        }
    });
}


// adds all 360 video links to the map and sidebar
function addAll360VideoLinks(filename360VideoArray, initialYaw, fileCount, section) {
    const mapSelector = $(`#${filename360VideoArray[0][0].toString()}`);

    // find the relevant sidebar ID through some manipulation
    let sidebarSelectorString = filename360VideoArray[0][0].toString();
    sidebarSelectorString = sidebarSelectorString.substring(0, sidebarSelectorString.length - 9); // gets rid of _360Video
    sidebarSelectorString = sidebarSelectorString.replaceAll("_", "-").toLowerCase(); // format to match sidebar ID
    if (sidebarSelectorString.includes("floor")) {
        sidebarSelectorString += "-hallway";
    }
    const sidebarSelector = $(`#${sidebarSelectorString}`);

    // combine the two selectors so we add the same click event to both
    const video360Selectors = mapSelector.add(sidebarSelector);

    let video360TargetToggle = true; // controls alternating between the two 360 viewers
    let videoPos = 1;
    let tempPrevViewer; // holds current viewer until we transition where it's treated as the previous viewer and altered accordingly
    let content360Filename;
    let moveTimeout = false; // used to timeout 360 video clicks

    mapSelector.addClass("location"); // add css class that gives the hover effect to just map

    // add click event to both map and sidebar
    video360Selectors.click(function () {
        if (!window.lockMapSelection) {
            // hide necessary elements
            mapLayerMenuDropdown.addClass("hidden");
            mapLayerMenu.addClass("hidden");
            mapContainer.addClass("hidden");

            // cleans up any prior 360 video
            clean360Video();

            // reveal and bring to foreground main 360 viewer
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
            video360Range.val(1);

            // check if there's an existing viewer already, if so destroy it
            if (typeof window.viewer360 !== "undefined") {
                window.viewer360.destroy();
            }

            window.viewer360 = pannellum.viewer("viewer-360-container", {
                "type": "equirectangular",
                "panorama": `media/virtual-tour/${sectionFilepath[section]}/${filename360VideoArray[0][0].toString()}/${content360Filename}`,
                "friction": 0.1,
                "autoLoad": true,
                "compass": false,
                "keyboardZoom": false,
                "disableKeyboardCtrl": true,
                "yaw": initialYaw
            });

            // set up view switching
            video360TargetToggle = true;
            tempPrevViewer = window.viewer360;
        }

        // 360 video next button event
        video360ButtonNext.click(function () {
            if (!moveTimeout) {
                timeoutCountdown();

                videoPos++

                if (videoPos >= fileCount) { // if we're past the range, hold position
                    videoPos--;
                } else {
                    video360Range.val(videoPos);
                    triggerVideo360Transition();
                }
            }

            timeoutLock(); // always lock after a move
        });

        // 360 video previous button event
        video360ButtonPrev.click(function () {
            if (!moveTimeout) {
                timeoutCountdown();

                videoPos--

                if (videoPos < 1) { // if we're past the range, hold position
                    videoPos++;
                } else {
                    video360Range.val(videoPos);
                    triggerVideo360Transition();
                }
            }

            timeoutLock(); // always lock after a move
        });

        // set up range slider
        video360Range.attr("max", fileCount);
        video360Range.change(function () {
            if (!moveTimeout) {
                timeoutCountdown();

                videoPos = video360Range.val();
                triggerVideo360Transition();
            }

            timeoutLock(); // always lock after a move
        })

        // trigger timeout lock
        function timeoutLock() {
            video360ButtonNext.prop("disabled", true);
            video360ButtonPrev.prop("disabled", true);
            video360Range.prop("disabled", true);
            moveTimeout = true;
        }

        // timeout countdown helper
        function timeoutCountdown() {
            // allow the timeout to expire when we allow a transition
            setTimeout(function () {
                video360ButtonNext.prop("disabled", false);
                video360ButtonPrev.prop("disabled", false);
                video360Range.prop("disabled", false);
                moveTimeout = false;
            }, 1200);
        }

        // trigger for 360 video transition
        function triggerVideo360Transition() {
            if (video360TargetToggle) { // toggle back and forth between the two viewers to simulate 360 video
                tempPrevViewer = video360Transition("viewer-360-container-secondary", viewer360Container, tempPrevViewer, window.viewer360Secondary);
            } else {
                tempPrevViewer = video360Transition("viewer-360-container", viewer360ContainerSecondary, tempPrevViewer, window.viewer360);
            }

            video360TargetToggle = !video360TargetToggle;
        }

        // facilitates 360 video transition
        function video360Transition(nextContainerString, prevContainer, prevPannellumViewer, nextPannellumViewer) {
            const nextContainerSelector = $(`#${nextContainerString}`);
            content360Filename = filename360VideoArray[videoPos].toString();

            nextPannellumViewer = pannellum.viewer(nextContainerString, {
                "type": "equirectangular",
                "panorama": `media/virtual-tour/${sectionFilepath[section]}/${filename360VideoArray[0][0].toString()}/${content360Filename}`,
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
function close360Viewer() {
    // reveal and unlock map
    mapLayerMenuDropdown.removeClass("hidden");
    mapContainer.removeClass("hidden");
    window.lockDrag = false;

    // hide 360 viewer elements
    viewer360Container.addClass("hidden");
    exit360Viewer.addClass("hidden");
    clean360Video(); // cleans up any prior 360 video

    // reset the map in case we resize while the 360 viewer is open
    // necessary because window resize check doesn't work when map is hidden
    mapMovement.resetMapVars();
    mapMovement.constrainMap();

    destroyAll360Viewers();
}

// clean up all 360 viewers
function destroyAll360Viewers() {
    if (typeof viewer360 !== "undefined") { // avoid errors if any, but destroy() doesn't seem to clear pannellum to undefined anyway
        window.viewer360.destroy();
    }
    if (typeof viewer360Secondary !== "undefined") {
        window.viewer360Secondary.destroy();
    }
}

// 360 video clean up
// necessary to trigger between active 360 video map to any sidebar selection
function clean360Video() {
    // hide 360 viewer elements
    viewer360ContainerSecondary.addClass("hidden");
    video360ButtonNext.addClass("hidden");
    video360ButtonPrev.addClass("hidden");
    video360Range.addClass("hidden");

    // reset z-index 360 video manipulation
    viewer360Container.css("z-index", 1);
    viewer360ContainerSecondary.css("z-index", 0);

    // remove 360 video control events
    video360ButtonNext.off("click");
    video360ButtonPrev.off("click");
    video360Range.off("change");

    // cut the transition class if we're moving away
    viewer360Container.removeClass("hidden-opacity-360video");
}