/* Map SVG replacement and events such as media opening clicks */

import * as mapMovement from "./map-movement.js";
import * as mapMenu from "./map-menu.js";

/*
*
* Replace map SVG with inline SVG, attach clickable events and setup map controls/interaction
*
* */
export function initMap() {
    let counter = 0;

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

            counter++;
            if (counter === 4) { // let the SVGs finish loading before adding the map links TODO: change this to 6 later when all map svgs are added
                // add map selection links
                jQuery.get("./csv/web-lists/north-locations-filenames.csv", function (data) {
                    add360PhotoMapLinks($.csv.toArrays(data));
                }, 'text');

                // TODO: PUT SOUTH AND OUTSIDE FILENAMES LIST HERE TOO


                // add 360Video links for map and sidebar
                jQuery.get("./csv/360Video/north-2nd-floor-filenames.csv", function (data) {
                    addAll360VideoLinks($.csv.toArrays(data), 235, 46);

                }, 'text');

                jQuery.get("./csv/360Video/north-foyer-filenames.csv", function (data) {
                    addAll360VideoLinks($.csv.toArrays(data), 100, 5);

                }, 'text');

                // center map when svg is finished fully loading
                mapMovement.centerMap();

                // defer setting up map controls until SVG has finished loading
                mapMenu.initMapLayerMenu();
            }
        }, 'xml');
    });
}


const northLocationMenu = $("#north-location-menu");

const viewer360Container = $("#viewer-360-container");
const viewer360ContainerSecondary = $("#viewer-360-container-secondary");
const exit360Viewer = $("#exit-360-viewer");
const mapContainer = $("#map-container");

const mapLayerMenuDropdown = $("#map-layer-menu-dropdown");
const mapLayerMenu = $("#map-layer-menu");

function add360PhotoMapLinks(filenameArray) {
    const hallwayVideoList = ["North_1st_Floor_Hallway", "North_2nd_Floor_Hallway", "North_3rd_Floor_Hallway", "North_Foyer"];
    // let hallwayVideoCounter = 0;

    // get the top level ID of each location selection in sidebar to scroll to
    const selectionIDArrayTop = northLocationMenu.children();
    // console.log(selectionIDArrayTop)
    // console.log(filenameArray)

    let elementOffset = 1;

    // TODO: PROBABLY DEAL WITH THE HALLWAY ENTRIES HERE
    // need to look at/come up with naming scheme for the hallway ID sections on the map
    // probably write another function to manage all the hallway initialization
    // function: init the first pannellum view, somehow have the rest of the pannellum views ready to go, probably show more
    // navigation buttons compared to the regular 360photo viewer


    // add360VideoLinks();

    // this for loop starts at 4 because it ignores the header and hallway entries (which are handled manually above?)
    for (let i = 1; i < filenameArray.length; i++) {
        // console.log(typeof filenameArray[i][0]);

        // if (filenameArray[i][0] === hallwayVideoList[hallwayVideoCounter]) {
        //     add360VideoLinks(hallwayVideoList[hallwayVideoCounter]);
        //     hallwayVideoCounter++;
        // }

        // set the way the map ID is formatted
        let mapIDName = $(`#${filenameArray[i].toString().split(".")[0]}`);

        // check if the map selection exists
        if (mapIDName.length) {
            // elementOffset --;
            mapIDName.addClass("location"); // add css class that gives the hover effect

            // grab the variable filenameOffset each iteration for each click function and pass it into the function as index variable
            (function (index) { // assumption: index is not used here because location multiple photos are ignored for the map clicks (may be able to remove function thingy
                // here)
                mapIDName.click(function () {
                    if (!window.lockMapSelection) {
                        // document.getElementById(selectionIDArrayTop[i].attr("id")).scrollIntoView();
                        // console.log(selectionIDArrayTop[i - index]);

                        let content360 = filenameArray[i]; // somehow this works by giving it as an object

                        // hide necessary elements, lock map and reveal the 360 viewer container
                        mapLayerMenuDropdown.addClass("hidden");
                        mapLayerMenu.addClass("hidden");
                        mapContainer.addClass("hidden");
                        viewer360Container.removeClass("hidden");
                        exit360Viewer.removeClass("hidden");
                        window.lockDrag = true;

                        // check if there's an existing viewer already, if so destroy it
                        if (typeof window.viewer360 !== "undefined") {
                            window.viewer360.destroy();
                        }

                        window.viewer360 = pannellum.viewer('viewer-360-container', {
                            "type": "equirectangular",
                            "panorama": `test-media/${content360}`,
                            "friction": 0.1,
                            "autoLoad": true,
                            "compass": false,
                            "keyboardZoom": false,
                            "disableKeyboardCtrl": true
                        });
                    }
                });
            })(elementOffset)
        } else {
            // continue looping through filenames without doing anything
            elementOffset++;
        }
    }
    // console.log(elementOffset)

}


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
                videoPos --

                if (videoPos < 1) {
                    videoPos++;
                } else {
                    if (video360Toggle) {
                        tempPrevViewer = video360Transition("viewer-360-container-secondary", viewer360Container, viewer360ContainerSecondary, tempPrevViewer, viewer360Secondary);
                    } else {
                        tempPrevViewer = video360Transition("viewer-360-container", viewer360ContainerSecondary, viewer360Container, tempPrevViewer, viewer360);
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
                        tempPrevViewer = video360Transition("viewer-360-container-secondary", viewer360Container, viewer360ContainerSecondary, tempPrevViewer, viewer360Secondary);
                    } else {
                        tempPrevViewer = video360Transition("viewer-360-container", viewer360ContainerSecondary, viewer360Container, tempPrevViewer, viewer360);
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