/* 360 viewer related function */

import {closeLinearVideo} from "./linear-video.js";
import {heightAnimHide, mediaTransHide} from "./media.js";
import {centerResetMap} from "./map-movement.js";

// map jquery selectors
const mapLayerMenu = $("#map-menu");
const mapMenuDropdownBtn = $("#map-menu-dropdown-btn");
const mapMenuDropdownArrow = $("#map-menu-dropdown-arrow");
const mapContainer = $("#map-container");

// 360 viewer jquery selectors
const viewer360Container = $("#viewer-360-container");
const viewer360ContainerSecondary = $("#viewer-360-container-secondary");
const exitMediaButton = $("#exit-media-btn");
const video360Range = $("#video-360-range");
const video360ButtonPrev = $("#video-360-button-prev");
const video360ButtonNext = $("#video-360-button-next");

// other selectors
const mediaTransCover = $("#media-trans-cover");

// buffered so section 1 = north, 2 = south, 3 = outside
const sectionFilepath = ["", "north", "south", "outside"];


// Sets up all 360Videos
export function init360Videos() {
    jQuery.get("./csv/360-video/north-1st-floor-filenames.csv", function (data) {
        add360VideoLinks($.csv.toArrays(data), 240, 44, 1);
    }, 'text');

    jQuery.get("./csv/360-video/north-2nd-floor-filenames.csv", function (data) {
        add360VideoLinks($.csv.toArrays(data), 240, 46, 1);
    }, 'text');

    jQuery.get("./csv/360-video/north-3rd-floor-filenames.csv", function (data) {
        add360VideoLinks($.csv.toArrays(data), 240, 46, 1);
    }, 'text');

    jQuery.get("./csv/360-video/north-foyer-filenames.csv", function (data) {
        add360VideoLinks($.csv.toArrays(data), 230, 17, 1);
    }, 'text');

    jQuery.get("./csv/360-video/south-1st-floor-filenames.csv", function (data) {
        add360VideoLinks($.csv.toArrays(data), 230, 32, 2);
    }, 'text');

    jQuery.get("./csv/360-video/south-2nd-floor-filenames.csv", function (data) {
        add360VideoLinks($.csv.toArrays(data), 230, 31, 2);
    }, 'text');

    jQuery.get("./csv/360-video/south-foyer-filenames.csv", function (data) {
        add360VideoLinks($.csv.toArrays(data), 65, 18, 2);
    }, 'text');

    jQuery.get("./csv/360-video/south-tech-ed-filenames.csv", function (data) {
        add360VideoLinks($.csv.toArrays(data), 230, 8, 2);
    }, 'text');

    jQuery.get("./csv/360-video/sports-centre-filenames.csv", function (data) {
        add360VideoLinks($.csv.toArrays(data), 230, 8, 2);
    }, 'text');
}

// Sets up 360 viewer & general media controls
export function initMediaControls() {
    // reset map media active handling
    $(window).resize(function () {
        setTimeout(function () { // wait to let fullscreenchange event trigger
            if (!window.mediaActiveFullscreen && window.activeMedia !== undefined) { // if any resize other than media fullscreen
                window.resizedWhileMedia = true;
            }
        }, 5);
    });

    // add fullscreenchange events to 360 viewers (linearvideo in respective file)
    let mediaContainers = viewer360Container.add(viewer360ContainerSecondary);
    mediaContainers.on("fullscreenchange", function () {
        if (!window.mediaActiveFullscreen) { // going into fullscreen
            window.mediaActiveFullscreen = true;
        } else {
            setTimeout(function () { // wait to let resize check trigger (longer here when exiting fullscreen)
                window.mediaActiveFullscreen = false;
            }, 10);
        }

    });

    // 360 viewer exit button
    exitMediaButton.click(function () {
        if (!window.mediaClickTimeout) {
            window.activeMedia.click();
        }
    });

    // escape shortcut to exit BOTH 360 viewer and linear video
    $(document).keyup(function (e) {
        // note: always active on the virtual tour page. kept this way so we can always close the viewer in case something else goes wrong
        if (e.key === "Escape" && window.activeMedia !== undefined && !window.mediaClickTimeout) {
            window.activeMedia.click();
        }
    });
}

// Creates and adds 360Photo viewer event to input selector using input media info
export function create360PhotoViewerEvent(selectorIDString, content360Filename, section) {
    $(`#${selectorIDString}`).click(function (e) {
        e.preventDefault()
        if ($(this).data("mediaActive") !== true && !window.mediaClickTimeout) { // block open when intending to close & prevent double clicks
            // handle click timeout
            window.mediaClickTimeout = true;
            startMediaClickTimeout();

            $(this).data("mediaActive", true);

            setTimeout(function () { // stall 360 viewer load so dropdowns can animate without lag
                // cleans up any prior 360 video, pannellum renderers and linear video
                clean360Video();
                destroyAll360Viewers();
                closeLinearVideo();

                // (re)hide necessary elements
                if (!mapLayerMenu.hasClass("sidebar-selection-hidden")) {
                    heightAnimHide(mapLayerMenu, true);
                    mapMenuDropdownArrow.toggleClass("dropdown-flip");
                }
                mapMenuDropdownBtn.addClass("hidden");
                mapContainer.addClass("hidden");
                mapMenuDropdownArrow.addClass("hidden");

                // reveal 360 viewer things
                viewer360Container.removeClass("hidden");
                exitMediaButton.removeClass("hidden");

                // create a new pannellum viewer
                window.viewer360 = pannellum.viewer('viewer-360-container', {
                    "type": "equirectangular",
                    "panorama": `media/virtual-tour/${sectionFilepath[section]}/${content360Filename}`,
                    "friction": 0.08,
                    "autoLoad": true,
                    "compass": false,
                    "keyboardZoom": false,
                    "disableKeyboardCtrl": true
                }); // todo: finalize these options and do proper pathing

                // once viewer loaded, fade out the media trans
                window.viewer360.on("load", function () {
                    mediaTransHide(mediaTransCover);
                });
            }, 305); // relative to sidebar animation delay (300)
        }
    });
}


// adds all 360 video links to the map and sidebar
function add360VideoLinks(filename360VideoArray, initialYaw, fileCount, section) {
    // find the relevant sidebar ID through some manipulation
    let sidebarSelectorString = filename360VideoArray[0][0].toString();
    sidebarSelectorString = sidebarSelectorString.substring(0, sidebarSelectorString.length - 9); // gets rid of _360Video
    sidebarSelectorString = sidebarSelectorString.replaceAll("_", "-").toLowerCase(); // format to match sidebar ID
    if (sidebarSelectorString.includes("floor")) {
        sidebarSelectorString += "-hallway";
    }
    const sidebarSelector = $(`#${sidebarSelectorString}`);

    let video360TargetToggle = true; // controls alternating between the two 360 viewers
    let videoPos = 1;
    let tempPrevViewer; // holds current viewer until we transition where it's treated as the previous viewer and altered accordingly
    let content360Filename;

    // add click event to sidebar
    sidebarSelector.click(function (e) {
        e.preventDefault()
        if ($(this).data("mediaActive") !== true && !window.mediaClickTimeout) { // block open when intending to close & prevent double clicks
            // click timeout management
            window.mediaClickTimeout = true;
            startMediaClickTimeout();

            $(this).data("mediaActive", true); // sets this elements media as active to prevent repeat clicks

            setTimeout(() => { // stall 360 video load so button can animate without lag (and sync with other media load timings)
                // cleans up any prior 360 video, pannellum renderers and linear video
                clean360Video();
                destroyAll360Viewers();
                closeLinearVideo();

                // (re)hide necessary elements
                if (!mapLayerMenu.hasClass("sidebar-selection-hidden")) {
                    heightAnimHide(mapLayerMenu, true);
                    mapMenuDropdownArrow.toggleClass("dropdown-flip");
                }
                mapMenuDropdownBtn.addClass("hidden");
                mapContainer.addClass("hidden");
                mapMenuDropdownArrow.addClass("hidden");

                // reveal and bring to foreground main 360 viewer
                viewer360Container.removeClass("hidden");
                exitMediaButton.removeClass("hidden");
                // reset secondary viewer to initial state
                viewer360ContainerSecondary.addClass("hidden-opacity-360video");
                viewer360ContainerSecondary.removeClass("hidden");

                // reveal 360 video controls
                video360ButtonNext.removeClass("hidden");
                video360ButtonPrev.removeClass("hidden");
                video360Range.removeClass("hidden");

                // always start at the one end of the hallway
                content360Filename = filename360VideoArray[1].toString();
                videoPos = 1;
                video360Range.val(1);

                window.viewer360 = pannellum.viewer("viewer-360-container", {
                    "type": "equirectangular",
                    "panorama": `media/virtual-tour/${sectionFilepath[section]}/${filename360VideoArray[0][0].toString()}/${content360Filename}`,
                    "friction": 0.08,
                    "autoLoad": true,
                    "compass": false,
                    "keyboardZoom": false,
                    "disableKeyboardCtrl": true,
                    "yaw": initialYaw
                });

                // once viewer loaded, fade out the media trans
                window.viewer360.on("load", function () {
                    mediaTransHide(mediaTransCover);
                });

                $(this).data("mediaActive", true);

                // set up view switching
                video360TargetToggle = true;
                tempPrevViewer = window.viewer360;


                // 360 video next button event
                video360ButtonNext.click(function () {
                    timeoutCountdown();

                    videoPos++

                    if (videoPos > fileCount) { // if we're past the range, hold position
                        videoPos--;
                    } else {
                        video360Range.val(videoPos);
                        triggerVideo360Transition();
                    }

                    timeoutLock(); // always lock after a move
                });

                // disable previous button initially, enable next button
                video360ButtonPrev.prop("disabled", true);
                video360ButtonPrev.css("cursor", "default");
                video360ButtonNext.prop("disabled", false);
                video360ButtonNext.css("cursor", "pointer");

                // 360 video previous button event
                video360ButtonPrev.click(function () {
                    timeoutCountdown();

                    videoPos--

                    if (videoPos < 1) { // if we're past the range, hold position
                        videoPos++;
                    } else {
                        video360Range.val(videoPos);
                        triggerVideo360Transition();
                    }

                    timeoutLock(); // always lock after a move
                });

                // set up range slider
                video360Range.attr("max", fileCount);
                video360Range.change(function () {
                    timeoutCountdown();

                    videoPos = parseInt(video360Range.val());
                    triggerVideo360Transition();

                    timeoutLock(); // always lock after a move
                })

                // trigger timeout lock
                function timeoutLock() {
                    video360ButtonNext.prop("disabled", true);
                    video360ButtonNext.css("cursor", "default");
                    video360ButtonPrev.prop("disabled", true);
                    video360ButtonPrev.css("cursor", "default");
                    video360Range.prop("disabled", true);
                    video360Range.css("cursor", "default");
                }

                // timeout countdown helper
                function timeoutCountdown() {
                    // allow the timeout to expire when we allow a transition
                    setTimeout(function () {
                        if (videoPos !== fileCount) {
                            video360ButtonNext.prop("disabled", false);
                            video360ButtonNext.css("cursor", "pointer");
                        }

                        if (videoPos !== 1) {
                            video360ButtonPrev.prop("disabled", false);
                            video360ButtonPrev.css("cursor", "pointer");
                        }

                        video360Range.prop("disabled", false);
                        video360Range.css("cursor", "pointer");
                    }, 1150); // relative to load delay (220) + transition time (800) + transitionend buffer (20) todo: confirm this timing + extra (110)
                }

                // trigger for 360 video transition
                function triggerVideo360Transition() {
                    if (video360TargetToggle) { // toggle back and forth between the two viewers to simulate 360 video
                        tempPrevViewer = video360Transition("viewer-360-container-secondary", viewer360Container, tempPrevViewer, window.viewer360Secondary);
                        window.viewer360Secondary = tempPrevViewer; // necessary to keep track of the secondary viewer since js is pass by value
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
                        "friction": 0.08,
                        "autoLoad": true,
                        "compass": false,
                        "keyboardZoom": false,
                        "disableKeyboardCtrl": true,
                        "yaw": 360 + prevPannellumViewer.getYaw(),
                        "pitch": prevPannellumViewer.getPitch()
                    });

                    // show next viewer immediately underneath while fading out previous viewer
                    nextContainerSelector.removeClass("hidden-opacity-360video");

                    setTimeout(function () {
                        prevContainer.addClass("hidden-opacity-360video"); // fade out previous viewer
                    }, 220); // allow other viewer to load fully first (load delay hiding)

                     if (!prevContainer[0].ontransitionend) { // only add event on the first time
                         prevContainer[0].ontransitionend = (event) => {
                             if (event.propertyName === "opacity") { // only trigger on opacity transition (the only one I adjust but added here just in case)
                                 // destroy previous viewer renderer, push to background
                                 prevPannellumViewer.destroy();
                                 prevContainer.css("z-index", 0);

                                 // bring next viewer to foreground
                                 nextContainerSelector.css("z-index", 1);
                             }
                         };
                     }

                    return nextPannellumViewer;
                }
            }, 305); // relative to sidebar animation delay (300)
        }
    });
}

// closes and cleans up the 360 viewer
export function close360Viewer() {
    // reveal and unlock map
    mapMenuDropdownBtn.removeClass("hidden");
    mapContainer.removeClass("hidden");
    mapMenuDropdownArrow.removeClass("hidden");
    window.lockDrag = false;

    // hide 360 viewer elements
    viewer360Container.addClass("hidden");
    exitMediaButton.addClass("hidden");
    clean360Video(); // cleans up any prior 360 video
    destroyAll360Viewers(); // cleans up any prior pannellum renderers

    // reset the map in case we resize while the 360 viewer is open
    // necessary because center reset doesn't work when map is hidden
    if (window.resizedWhileMedia) {
        centerResetMap();
        window.resizedWhileMedia = false;
    }
}

// clean up all 360 viewer renderers
function destroyAll360Viewers() {
    // destroy all 360 viewers only if they exist
    if (viewer360Container.children().length) {
        window.viewer360.destroy();
        window.viewer360.off(); // todo: need for clean up? pannellum load check usage
    }
    if (viewer360ContainerSecondary.children().length) {
        window.viewer360Secondary.destroy();
        window.viewer360Secondary.off(); // todo: need for clean up? pannellum load check usage
    }

    // clear transitionend events regardless (one container will be inactive when in 360 video)
    viewer360Container[0].ontransitionend = null;
    viewer360ContainerSecondary[0].ontransitionend = null;
}

// 360 video clean up
function clean360Video() {
    // hide 360 video elements
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

// delays opening and closing of media
export function startMediaClickTimeout() {
    setTimeout(() => {
        window.mediaClickTimeout = false;
    }, 960); // relative to sidebar animation delay / media load stall (305) + media.js css manipulation (20) + trans cover (300+300)
}