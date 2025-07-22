/* Linear video stuff */

import {startMediaClickTimeout, close360Viewer} from "./360-viewer.js";
import * as mapMovement from "./map-movement.js";
import {heightAnimHide, mediaTransHide} from "./media.js";

// map jquery selectors
const mapLayerMenu = $("#map-menu");
const mapMenuDropdownBtn = $("#map-menu-dropdown-btn");
const mapMenuDropdownArrow = $("#map-menu-dropdown-arrow");
const mapContainer = $("#map-container");

// linear video jquery selectors
let videoContainer = $("#video-container"); // duplicated later because video js destroys it
const exitMediaButton = $("#exit-media-btn");

// other selectors
const mediaContainer = $("#media-container");
const mediaTransCover = $("#media-trans-cover");

// buffered so section 1 = north, 2 = south, 3 = outside
const sectionFilepath = ["", "north", "south", "outside"];

// creates and adds linear video event to input selector using input media info
export function createLinearVideoEvent(selectorIDString, contentVideoFilename, section) {
    $(`#${selectorIDString}`).click(function (e) {
        e.preventDefault()
        if ($(this).data("mediaActive") !== true && !window.mediaClickTimeout) {
            // click timeout management
            window.mediaClickTimeout = true;
            startMediaClickTimeout();

            $(this).data("mediaActive", true); // sets this elements media as active to prevent repeat clicks

            setTimeout(() => { // stall video load so button can animate without lag (and sync with other media load timings)
                // close any prior 360 photo & video, clean linear video
                close360Viewer();
                destroyLinearVideo();

                // (re)hide necessary elements
                if (!mapLayerMenu.hasClass("sidebar-selection-hidden")) {
                    heightAnimHide(mapLayerMenu, true);
                    mapMenuDropdownArrow.toggleClass("dropdown-flip");
                }
                mapMenuDropdownBtn.addClass("hidden");
                mapContainer.addClass("hidden");
                mapMenuDropdownArrow.addClass("hidden");

                // linear video style
                mediaContainer.css("cursor", "auto"); // override out of map cursor

                // reveal linear video things
                videoContainer.removeClass("hidden");
                exitMediaButton.removeClass("hidden");

                // initialize video js and set params (required to be after reveal)
                videojs("video-container", {
                    sources: [{
                        src: `media/virtual-tour/${sectionFilepath[section]}/${contentVideoFilename}`,
                        type: 'video/mp4'
                    }],
                    controls: true,
                    controlBar: {
                        pictureInPictureToggle: false,
                        volumePanel: false,
                        remainingTimeDisplay: false
                    },
                    autoplay: false,
                    preload: 'auto',
                    restoreEl: true
                }, linearVideoLoadInit); // video js load callback // todo: do proper pathing
            }, 305); // relative to sidebar dropdown animation (300)
        }
    });
}

// closes and cleans up the linear video
export function closeLinearVideo() {
    // reveal and unlock map
    mapMenuDropdownBtn.removeClass("hidden");
    mapContainer.removeClass("hidden");
    mapMenuDropdownArrow.removeClass("hidden");
    window.lockDrag = false;

    // clean up video js renderer
    destroyLinearVideo();

    // hide linear video elements
    videoContainer.addClass("hidden");
    exitMediaButton.addClass("hidden");

    // reset the map in case we resize while the linear video is open
    // necessary because window resize check doesn't work when map is hidden
    if (window.resizedWhileMedia) {
        mapMovement.centerResetMap();
        window.resizedWhileMedia = false;
    }
    mediaContainer.css("cursor", "default"); // reset cursor (for 360 media close as well)
}

// clean up linear video renderer
function destroyLinearVideo() {
    // only dispose if video js is initialized
    if(videojs.getPlayer("video-container")) {
        videojs("video-container").dispose();
        videoContainer = $("#video-container"); // need to set this again since it gets thrashed by video js
    }
}

// video js load callback trigger
// fullscreenchange event for linear video (works in tandem with 360 viewer module init media controls)
function linearVideoLoadInit() {
    mediaTransHide(mediaTransCover); // once loaded, fade out the media trans

    videoContainer = $("#video-container"); // need to set this again since it gets thrashed by video js

    videoContainer.on("fullscreenchange", function () {
        if (!window.mediaActiveFullscreen) { // going into fullscreen
            window.mediaActiveFullscreen = true;
        } else {
            setTimeout(function () { // wait to let resize check trigger (longer here when exiting fullscreen)
                window.mediaActiveFullscreen = false;
            }, 10);
        }

    });
}