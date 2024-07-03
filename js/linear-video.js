/* Linear video stuff */

import * as viewer360Module from "./360-viewer.js";
import * as mapMovement from "./map-movement.js";

// map jquery selectors
const mapLayerMenu = $("#map-layer-menu");
const mapLayerMenuDropdown = $("#map-layer-menu-dropdown");
const mapContainer = $("#map-container");

// linear video jquery selectors
let videoContainer = $("#video-container");
const exitLinearViewer = $("#exit-linear-video");

// other jquery selectors
const mediaContainer = $("#media-container");

const videoContainerReg = document.getElementById("video-container");

// set up linear video controls
export function initLinearVideoControls() {
    // linear video exit button
    exitLinearViewer.click(function () {
        closeLinearVideo();
    });

    // escape shortcut to exit viewer
    $(document).keyup(function (e) {
        // note: always active on the virtual tour page. kept this way so we can always close the viewer in case something else goes wrong
        if (e.key === "Escape") {
            closeLinearVideo();
        }
    });
}

// creates and adds linear video event to input selector using input media info
export function createLinearVideoEvent(selectorIDString, contentVideoFilename, section) {
    $(`#${selectorIDString}`).click(function () {
        if (!window.lockMapSelection) {
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
            exitLinearViewer.removeClass("hidden");

            // initialize video js and set params (required to be after reveal)
            console.log(contentVideoFilename);
            videojs("video-container", {
                sources: [{
                    src: `test-media/${contentVideoFilename}`, /*media/virtual-tour/${sectionFilepath[section]}/${content360Filename}*/
                    type: 'video/mp4'
                }],
                controls: true,
                autoplay: false,
                preload: 'auto',
                restoreEl: true
            }); // todo: finalize these options and do proper pathing

            window.lockDrag = true; // lock map movement
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
    exitLinearViewer.addClass("hidden");

    // reset the map in case we resize while the linear video is open
    // necessary because window resize check doesn't work when map is hidden
    mapMovement.resetMapVars(); // todo: fix to do the vertical centering if theres a resize (make the resize trigger something globally bc we need it for excluding mobile anyway?)
    mapMovement.constrainMap();
}

// clean up linear video renderer
function destroyLinearVideo() {
    // only dispose if video js is initialized
    if(videojs.getPlayer("video-container")) {
        videojs("video-container").dispose();
        videoContainer = $("#video-container"); // need to set this again since it gets removed by video js
    }
}