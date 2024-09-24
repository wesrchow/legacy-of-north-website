/* Linear video stuff */

import * as viewer360Module from "./360-viewer.js";
import * as mapMovement from "./map-movement.js";

// map jquery selectors
const mapLayerMenu = $("#map-layer-menu");
const mapLayerMenuDropdown = $("#map-layer-menu-dropdown");
const mapContainer = $("#map-container");

// linear video jquery selectors
let videoContainer = $("#video-container");
const exitMediaButton = $("#exit-media-button");

// other jquery selectors
const mediaContainer = $("#media-container");

// buffered so section 1 = north, 2 = south, 3 = outside
const sectionFilepath = ["", "north", "south", "outside"];

// creates and adds linear video event to input selector using input media info
export function createLinearVideoEvent(selectorIDString, contentVideoFilename, section) {
    $(`#${selectorIDString}`).click(function (e) {
        e.preventDefault()
        if (!window.lockMapSelection && $(this).data("mediaActive") !== true && !window.mediaClickTimeout) {
            // click timeout management
            window.mediaClickTimeout = true;
            viewer360Module.startMediaClickTimeout();

            $(this).data("mediaActive", true); // sets this elements media as active to prevent repeat clicks

            setTimeout(() => { // stall video load so button can animate without lag (and sync with other media)
                // close any prior 360 photo & video, clean linear video
                viewer360Module.close360Viewer();
                destroyLinearVideo();

                // (re)hide necessary elements
                mapLayerMenu.addClass("hidden");
                mapLayerMenuDropdown.addClass("hidden");
                mapContainer.addClass("hidden");

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
                }); // todo: do proper pathing

                window.lockDrag = true; // lock map movement
            }, 260);
        }
    });
}

// closes and cleans up the linear video
export function closeLinearVideo() {
    // reveal and unlock map
    mapLayerMenuDropdown.removeClass("hidden");
    mapContainer.removeClass("hidden");
    window.lockDrag = false;

    // clean up video js renderer
    destroyLinearVideo();

    // hide linear video elements
    videoContainer.addClass("hidden");
    exitMediaButton.addClass("hidden");

    // reset the map in case we resize while the linear video is open
    // necessary because window resize check doesn't work when map is hidden
    mapMovement.resetMapVars(); // todo: fix to do the vertical centering if theres a resize (make the resize trigger something globally bc we need it for excluding mobile anyway?)
    mapMovement.constrainMap();
    // todo: grab hand cursor after close
}

// clean up linear video renderer
function destroyLinearVideo() {
    // only dispose if video js is initialized
    if(videojs.getPlayer("video-container")) {
        videojs("video-container").dispose();
        videoContainer = $("#video-container"); // need to set this again since it gets removed by video js
    }
}