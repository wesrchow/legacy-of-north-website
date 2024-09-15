/* Map SVG inline replacement and 360Photo click events */

import * as mapMovement from "./map-movement.js";
import * as mapMenu from "./map-menu.js";
import * as viewer360Module from "./360-viewer.js";
import * as linearVideo from "./linear-video.js";

// repeated locations helper
const repeatedMapLocations = ["north-stairway-1-map", "north-stairway-12-map", "north-stairway-2-map", "north-stairway-22-map", "north-stairway-3-map",
    "north-stairway-32-map", "north-stairway-42-map", "north-stairway-43-map", "south-stairway-3-map", "south-stairway-2-map", "south-stairway-4-map"];

// replace map SVG with inline SVG, attach 360Photo click events and setup map menu
export function initMap() {
    return new Promise((resolve, reject) => {
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
                    // jQuery.get("./csv/web-lists/north-locations-filenames.csv", function (data) {
                    //     addMediaMapLinks($.csv.toArrays(data), 1);
                    // }, 'text').fail(reject);
                    //
                    // jQuery.get("./csv/web-lists/south-locations-filenames.csv", function (data) {
                    //     addMediaMapLinks($.csv.toArrays(data), 2);
                    // }, 'text').fail(reject);
                    //
                    // jQuery.get("./csv/web-lists/outside-locations-filenames.csv", function (data) {
                    //     addMediaMapLinks($.csv.toArrays(data), 3);
                    // }, 'text').fail(reject);

                    // center map when svg is finished fully loading (excluding media clicks)
                    mapMovement.centerResetMap();

                    // defer setting up map menu until SVGs have finished loading (excluding media clicks)
                    mapMenu.initMapLayerMenu();

                    resolve();
                }
            }, 'xml').fail(reject);
        });
    });
}

// Add 360Photo click events for map
// function addMediaMapLinks(filenameArray, section) {
//     for (let i = 1; i < filenameArray.length; i++) {
//         // loop through filename array and directly use filenames (minus file extension) as ID selector
//         let mapIDString = filenameArray[i].toString().split(".")[0];
//         let mapIDSelector = $(`#${mapIDString}`);
//
//         if (mapIDSelector.length) { // check if the map selection exists (further multi image locations won't)
//             mapIDSelector.addClass("location"); // give location link custom css
//
//             if (!mapIDString.includes("LinearVideo")) {
//                 // Add the actual 360Photo viewer click event
//                 viewer360Module.create360PhotoViewerEvent(mapIDString, filenameArray[i].toString(), section);
//
//                 if (repeatedMapLocations.includes(mapIDString)) { // add known repeated locations again with altered map ID
//                     let mapIDSelectorRepeat = $(`#${mapIDString}_Repeat`);
//                     mapIDSelectorRepeat.addClass("location");
//                     viewer360Module.create360PhotoViewerEvent(mapIDString + "_Repeat", filenameArray[i].toString(), section);
//                 }
//             } else {
//                 // add linear video click event
//                 linearVideo.createLinearVideoEvent(mapIDString, filenameArray[i].toString(), section);
//
//                 if (repeatedMapLocations.includes(mapIDString)) { // add known repeated locations again with altered map ID
//                     let mapIDSelectorRepeat = $(`#${mapIDString}_Repeat`);
//                     mapIDSelectorRepeat.addClass("location");
//                     linearVideo.createLinearVideoEvent(mapIDString + "_Repeat", filenameArray[i].toString(), section);
//                 }
//             }
//         } else {
//             // console.log(mapIDString + " does not exist in the map SVG");
//             // TODO: confirm its only the further multi image locations that are being skipped (and roof)
//         }
//     }
// }

export function addMapLinksNew(idArray) {
    for (let i = 1; i < idArray.length; i++) {
        let mapIDString = idArray[i].toString();
        let mapIDSelector = $(`#${mapIDString}`);
        let sidebarIDSelector = $(`#${mapIDString.slice(0,-4)}`); // sidebar button to click
        let sectionLink; // section of the location
        let dropdownLink = undefined; // dropdown link of the location if it exists

        if (sidebarIDSelector.parent().hasClass("sidebar-list-3")) {
            sectionLink = sidebarIDSelector.parent().parent().parent().parent().prev(); // get the section of the location
            dropdownLink = sidebarIDSelector.parent().parent().prev(); // get the dropdown of the location
        } else {
            sectionLink = sidebarIDSelector.parent().parent().prev(); // get the section of the location
        }

        addMapLinkClickNew(mapIDSelector, sidebarIDSelector, sectionLink, dropdownLink); // add the actual click event

        if (repeatedMapLocations.includes(mapIDString)) { // for repeated locations add it again to the repeated map location
            addMapLinkClickNew($(`#${mapIDString + "-repeat"}`), sidebarIDSelector, sectionLink, dropdownLink);
        }
    }
}

function addMapLinkClickNew(mapIDSelector, sidebarIDSelector, sectionLink, dropdownLink) {
    mapIDSelector.addClass("location"); // give location link custom css

    // add click event to map location that triggers sidebar click
    mapIDSelector.click(function (e) {
        e.preventDefault()
        if (!window.lockMapSelection && !window.mapClickTimeout) {
            // manage click timeout
            window.mapClickTimeout = true;
            startMapClickTimeout();

            if (!sectionLink.hasClass("active")) { // open relevant section once
                sectionLink[0].click();
            }

            if (dropdownLink !== undefined && !dropdownLink.hasClass("active")) { // open relevant dropdown once
                dropdownLink.data("mediaActive", true); // stop the dropdown from rendering the first image event todo bonus: make sure this always fires before the click and check
                dropdownLink[0].click();
            }

            setTimeout(() => {
                sidebarIDSelector[0].scrollIntoView({behavior: "smooth", block: "center"}); // todo: fix block center? shifting when theres sub buttons
            }, 130);// todo: do something better than a timeout?

            sidebarIDSelector[0].click();
        }
    });

}

function startMapClickTimeout() {
    setTimeout(() => {
        window.mapClickTimeout = false;
    }, 380);
}