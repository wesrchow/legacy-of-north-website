/* Map SVG inline replacement and 360Photo click events */

import * as mapMovement from "./map-movement.js";
import * as mapMenu from "./map-menu.js";
import * as viewer360Module from "./360-viewer.js";
import * as linearVideo from "./linear-video.js";

// repeated locations helper
const repeatedMapLocations = ["North_Stairway1_360Photo_1_Web", "North_Stairway2_360Photo_1_Web", "North_Stairway3_360Photo_1_Web", "North_Stairway4_360Photo_2_Web",
    "North_Stairway1_360Photo_2_Web", "North_Stairway2_360Photo_2_Web", "North_Stairway3_360Photo_2_Web", "North_Stairway4_360Photo_3_Web"];

// replace map SVG with inline SVG, attach 360Photo click events and setup map menu
export function initMap() {
    let mapLoadCounter = 0;

    // inline SVG replacement for all the maps
    jQuery('img.svg').each(function () {
        const $img = jQuery(this);
        const imgID = $img.attr('id');
        const imgClass = $img.attr('class');
        const imgURL = $img.attr('src');

        jQuery.get(imgURL, function (data) {
            // Get the SVG tag, ignore the rest
            let $svg = jQuery(data).find('svg');

            // Add replaced image's ID to the new SVG
            if (typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
            if (typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass + ' replaced-svg');
            }

            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');

            // Replace image with new SVG
            $img.replaceWith($svg);

            mapLoadCounter++;
            if (mapLoadCounter === 6) { // Wait till all 6 maps are replaced then execute the following once

                // add 360Photo links for map
                jQuery.get("./csv/web-lists/north-locations-filenames.csv", function (data) {
                    addMediaMapLinks($.csv.toArrays(data), 1);
                }, 'text');

                jQuery.get("./csv/web-lists/south-locations-filenames.csv", function (data) {
                    addMediaMapLinks($.csv.toArrays(data), 2);
                }, 'text');

                jQuery.get("./csv/web-lists/outside-locations-filenames.csv", function (data) {
                    addMediaMapLinks($.csv.toArrays(data), 3);
                }, 'text');

                // center map when svg is finished fully loading
                mapMovement.centerResetMap();

                // defer setting up map menu until SVGs have finished loading
                mapMenu.initMapLayerMenu();
            }
        }, 'xml');
    });
}

// Add 360Photo click events for map
function addMediaMapLinks(filenameArray, section) {
    for (let i = 1; i < filenameArray.length; i++) {
        // loop through filename array and directly use filenames (minus file extension) as ID selector
        let mapIDString = filenameArray[i].toString().split(".")[0];
        let mapIDSelector = $(`#${mapIDString}`);

        if (mapIDSelector.length) { // check if the map selection exists (further multi image locations won't)
            mapIDSelector.addClass("location"); // give location link custom css

            if (!mapIDString.includes("LinearVideo")) {
                // Add the actual 360Photo viewer click event
                viewer360Module.create360PhotoViewerEvent(mapIDString, filenameArray[i].toString(), section);

                if (repeatedMapLocations.includes(mapIDString)) { // add known repeated locations again with altered map ID
                    let mapIDSelectorRepeat = $(`#${mapIDString}_Repeat`);
                    mapIDSelectorRepeat.addClass("location");
                    viewer360Module.create360PhotoViewerEvent(mapIDString + "_Repeat", filenameArray[i].toString(), section);
                }
            } else {
                // add linear video click event
                linearVideo.createLinearVideoEvent(mapIDString, filenameArray[i].toString(), section); // todo: write this function
            }
        } else {
            // console.log(mapIDString + " does not exist in the map SVG");
            // TODO: confirm its only the further multi image locations that are being skipped (and roof)
        }
    }
}