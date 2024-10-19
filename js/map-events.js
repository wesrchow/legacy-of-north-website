/* Map SVG inline replacement and 360Photo click events */

import {centerResetMap} from "./map-movement.js";
import {initMapLayerMenu} from "./map-menu.js";

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

                    // center map when svg is finished fully loading (excluding media clicks)
                    centerResetMap();

                    // defer setting up map menu until SVGs have finished loading (excluding media clicks)
                    initMapLayerMenu();

                    resolve();
                }
            }, 'xml').fail(reject);
        });
    });
}

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
        if (!window.lockMapSelection && !window.mapClickTimeout && !window.sidebarClickTimeout) {
            // manage click timeout
            window.mapClickTimeout = true;
            startMapClickTimeout();

            if (!sectionLink.hasClass("active")) { // open relevant section once
                sectionLink[0].click();
            }

            // selecting sub media
            if (dropdownLink !== undefined && !dropdownLink.hasClass("active")) { // open relevant dropdown once
                dropdownLink.data("mediaActive", true); // stop the dropdown from rendering the first image event todo bonus: make sure this always fires before the click and check
                dropdownLink[0].click(); // click the sub media's parent dropdown
            }

            setTimeout(() => {
                sidebarIDSelector[0].scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"}); // todo: double check theres no shifting from these settings,
                // todo bonus: fix sections pixel gap when animating an element close to the end
            }, 250); // must match element height animation time (defined in css)

            sidebarIDSelector[0].click(); // click the target media button
        }
    });

}

function startMapClickTimeout() {
    setTimeout(() => {
        window.mapClickTimeout = false;
    }, 380);
}