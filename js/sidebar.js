/* Sidebar element injection, 360Photo click events, searchbar */

import * as viewer360Module from "./360-viewer.js";
import * as linearVideo from "./linear-video.js";

// sidebar location menus
const northLocationMenu = $("#north-location-menu");
const southLocationMenu = $("#south-location-menu");
const outsideLocationMenu = $("#outside-location-menu");
const sectionMenuSelectors = ["", northLocationMenu, southLocationMenu, outsideLocationMenu];
const sectionSidebarButtons = ["", "north-sidebar-button", "south-sidebar-button", "outside-sidebar-button"];

// search bar vanilla js selector
const searchBarReg = document.getElementById("search-bar");


// Inject sidebar elements, attach clickable events, init searchbar
export function initSidebar() {
    return new Promise((resolve, reject) => {
        let sidebarLoadCounter = 0; // wait till all 3 sections are loaded before adding dropdown click events

        // use title formatted lists to inject sidebar elements
        jQuery.get("./csv/web-lists/north-locations-list.csv", function (data) {
            jQuery.get("./csv/web-lists/north-locations-filenames.csv", function (data2) {
                sidebarElement360PhotoInjection($.csv.toArrays(data), $.csv.toArrays(data2), 1);
                sidebarLoadCounter++;
                if (sidebarLoadCounter === 3) {
                    addSidebarButtonClick();
                    viewer360Module.initAll360Videos();
                    initSidebarSticky();

                    resolve(); // resolve promise once sidebar is done loading
                }
            }, 'text').fail(reject);
        }, 'text').fail(reject);

        jQuery.get("./csv/web-lists/south-locations-list.csv", function (data) {
            jQuery.get("./csv/web-lists/south-locations-filenames.csv", function (data2) {
                sidebarElement360PhotoInjection($.csv.toArrays(data), $.csv.toArrays(data2), 2);
                sidebarLoadCounter++;
                if (sidebarLoadCounter === 3) {
                    addSidebarButtonClick();
                    viewer360Module.initAll360Videos();
                    initSidebarSticky();

                    resolve(); // resolve promise once sidebar is done loading
                }
            }, 'text').fail(reject);
        }, 'text').fail(reject);

        jQuery.get("./csv/web-lists/outside-locations-list.csv", function (data) {
            jQuery.get("./csv/web-lists/outside-locations-filenames.csv", function (data2) {
                sidebarElement360PhotoInjection($.csv.toArrays(data), $.csv.toArrays(data2), 3);
                sidebarLoadCounter++;
                if (sidebarLoadCounter === 3) {
                    addSidebarButtonClick();
                    viewer360Module.initAll360Videos();
                    initSidebarSticky();

                    resolve(); // resolve promise once sidebar is done loading
                }
            }, 'text').fail(reject);
        }, 'text').fail(reject);

        searchTypeEvent();
    });
}

// Inject sidebar elements and add 360Photo events
function sidebarElement360PhotoInjection(locationArray, filenameArray, section) {
    let selectionIDArray = [];
    let sectionID = sectionMenuSelectors[section];
    let injectionString;

    if (sectionID.length) { // TODO bonus: remove, section is always valid
        for (let i = 1; i < locationArray.length; i++) { // iterate through the nicely formatted titles of locations
            let locationName = locationArray[i][0];
            let specialProperty = locationArray[i][1]; // multi image or 360Video flag

            // inject sidebar button
            if (/^[1-9]\d*$/.test(specialProperty)) { // Check if the special property is decimal (multi image) using regex while ignoring 360Video cases
                // multi image sidebar button injection
                let cutLocationName = locationName.substring(0, locationName.length - 2); // get rid of numbering

                let locationNameID = cutLocationName.replaceAll(" ", "-").toLowerCase(); // generate well formatted ID
                selectionIDArray.push(locationNameID);
                injectionString = `<li class="sidebar-list-2"><a href="#" class="dropdown-btn" id="${locationNameID}">${cutLocationName}</\a><ul class="dropdown-container">`;

                // keep adding sidebar entries given by the number of location images (defined by specialProperty)
                for (let k = 0; k < parseInt(specialProperty); k++) {
                    locationNameID = cutLocationName.replaceAll(" ", "-").toLowerCase() + (k + 1);
                    selectionIDArray.push(locationNameID);
                    injectionString += `<li class="sidebar-list-3"><a href="#" id="${locationNameID}">Image ` + (k + 1) + '</\a>';
                }

                sectionID.append(injectionString);
                i += parseInt(specialProperty) - 1;
            } else {
                // normal sidebar button injection
                let locationNameID = locationName.replaceAll(" ", "-").toLowerCase();
                if (specialProperty !== "360Video") { // don't push 360video entries to the click event list
                    selectionIDArray.push(locationNameID);
                }
                sectionID.append(`<li class="sidebar-list-2"><a href="#" id="${locationNameID}">${locationName}</\a></\li>`);
            }
        }

        // add 360Photo click events for sidebar
        add360PhotoSidebarLinks(filenameArray, selectionIDArray, locationArray, section);
    }
}

// Add 360Photo click events for sidebar
function add360PhotoSidebarLinks(filenameArray, selectionIDArray, locationArray, section) {
    let filenameOffset = 0;
    let locationArrayOffset = 0;
    let specialProperty = null;
    let counting = false;

    let video360Counter = 0;

    for (let i = 0; i < selectionIDArray.length; i++) { // go through indicated sidebar elements

        // Check for 360Video special property to offset
        while (locationArray[i + 1 - locationArrayOffset + video360Counter][1] === "360Video") {
            video360Counter++;
        }

        // + 1 since CSV files have a header
        // - locationArrayOffset to resync multi image locations list and filename list target after adding dropdown
            // and image 1 with the same filename
        // + video360Counter to skip past 360Video entries in locations list
        specialProperty = locationArray[i + 1 - locationArrayOffset + video360Counter][1];

        // when we're counting multi image locations, offset for the next specialProperty check iteration
        if (counting) {
            locationArrayOffset++;
            counting = false;
        }

        // check linear video branch
        let menuIDString = selectionIDArray[i].toString();
        let filenameParam = filenameArray[(i + 1 - filenameOffset)].toString();
        if (!filenameParam.includes("LinearVideo")) {
            // add the actual 360Photo viewer click event
            viewer360Module.create360PhotoViewerEvent(menuIDString, filenameParam, section);
        } else {
            // add linear video click event
            linearVideo.createLinearVideoEvent(menuIDString, filenameParam, section);
        }


        // Check if the special property is decimal (multi image) using regex while ignoring 360Video cases
        // offset the filename for multi images so it matches up with the sidebar elements
        if (/^[1-9]\d*$/.test(specialProperty)) {
            filenameOffset++;
            counting = true;
        }
    }
}

// Add sidebar button click events for dropdowns and active media
function addSidebarButtonClick() {
    // setup list of sidebar buttons
    const sidebarButtons = $("#location-menu a");

    // let sidebarClickTimeout = [];

    // go through sidebar and close dropdowns, add click events
    for (let i = 0; i < sidebarButtons.length; i++) {
        if (sidebarButtons[i].classList.contains("dropdown-btn")) { // close all dropdown initially
            sidebarAnimHide(sidebarButtons.eq(i).next(), true);
        }

        // sidebarClickTimeout[i] = false; // todo bonus: prevent fast double clicks for dropdown anims and other breakables when clicking around fast (latter seems to be fine now)
        // add click event to sidebar buttons
        sidebarButtons[i].addEventListener("click", function () {
            // if (sidebarClickTimeout[i]) return; // ignore clicks if already clicked
            // sidebarClickTimeout[i] = true;
            // setTimeout(function () { sidebarClickTimeout[i] = false; }, 400);

            if (window.activeMediaSecondary !== this) {
                this.classList.toggle("active");
            }

            // active buttons handling
            if (!sectionSidebarButtons.includes(this.id)) { // ignore section dropdowns
                if (this.parentElement.classList.contains("sidebar-list-3")) { // if clicking sub media

                    if (window.activeMediaSecondary !== this && window.activeMediaSecondary !== undefined) { // within same dropdown
                        // remove other active sub media, set new current as active secondary
                        window.activeMediaSecondary.classList.remove("active");
                        $(window.activeMediaSecondary).data("mediaActive", false);
                        this.classList.add("active");
                        window.activeMediaSecondary = this;
                    } // otherwise it's a map clicking a sub media and we simulate a dropdown click to open it

                } else if (window.activeMedia !== this) { // if not clicking same media again

                    if (window.activeMedia !== undefined) { // not first button / only button action
                         if (window.activeMedia.classList.contains("dropdown-btn")) { // if previous is dropdown, close it properly
                                 sidebarAnimHide($(window.activeMedia.nextElementSibling), false);
                                if (window.activeMediaSecondary !== undefined) { // will already be undefined if closed itself
                                    window.activeMediaSecondary.classList.remove("active"); // clear secondary active
                                    $(window.activeMediaSecondary).data("mediaActive", false);
                                    window.activeMediaSecondary = undefined;
                                }
                        }

                        window.activeMedia.classList.remove("active");
                        $(window.activeMedia).data("mediaActive", false);
                    }

                    window.activeMedia = this; // sets the new current active media

                } else { // must be self, closes current media
                    viewer360Module.close360Viewer();
                    linearVideo.closeLinearVideo();
                    setTimeout(function () { // delay to allow media opener click block to check first
                        $(window.activeMedia).data("mediaActive", false);
                        window.activeMedia = undefined;
                    }, 8);

                }
            }


            // only for dropdowns toggle display and deal with active sub buttons
            if (sidebarButtons[i].classList.contains("dropdown-btn")) {
                let dropdownContent = this.nextElementSibling;
                let dropdownContentJ = $(this).next();

                // dropdown active status toggling
                if (!sectionSidebarButtons.includes(this.id)) { // ignore section dropdowns
                    if (window.activeMediaSecondary === undefined) { // switched from elsewhere or opening new
                        // active first image when opening a media dropdown
                        let firstImage = dropdownContent.firstChild.firstChild;
                        firstImage.classList.toggle("active");
                        $(firstImage).data("mediaActive", true);
                        window.activeMediaSecondary = firstImage;
                    } else { // closing current dropdown
                        window.activeMediaSecondary.classList.remove("active");
                        $(window.activeMediaSecondary).data("mediaActive", false);
                        window.activeMediaSecondary = undefined;
                    }

                }

                // hiding and revealing dropdown content
                if (dropdownContent.style.display === "none") {
                    sidebarAnimReveal(dropdownContentJ);
                } else {
                    sidebarAnimHide(dropdownContentJ, false); // todo: fix dropdown not reopening. when closing section, then closing media that has dropdown (height probably
                    // reading 0 because of the display none)
                }
            }

            // todo bonus: add toggle arrows
        });
    }
}

function searchTypeEvent() {
    let typingTimer;
    // filter the search results on key up events
    searchBarReg.addEventListener("keyup", function () {
        clearTimeout(typingTimer);

        typingTimer = setTimeout(function () {
            filterSearchElements();
        }, 150);

    });
}

// location search filtering
// TODO bonus: merge with gallery searching (but theres no dropdowns there)
function filterSearchElements() {
    let filter = searchBarReg.value.toUpperCase(); // comparison search string
    const sidebarLocationElements = $(".sidebar-list-2"); // get all the li location elements
    let sectionCheck = ["", false, false, false]; // check if the section should be active

    // loop through all list items, do the filtering
    for (let i = 0; i < sidebarLocationElements.length; i++) {
        let locationName = sidebarLocationElements.eq(i).find("a").eq(0).text().toUpperCase(); // get formatted location name
        let sectionLink = sidebarLocationElements.eq(i).parent().prev(); // get the section of the location

        if (locationName.indexOf(filter) > -1) { // exact match somewhere in the name
            sectionCheck[sectionCheckFilter(sectionLink)] = true; // set section to active

            if (!sectionLink.hasClass("active")) { // open relevant section once
                sectionLink[0].click();
            }

            if (sidebarLocationElements.eq(i).hasClass("sidebar-selection-hidden")) { // don't do anything if already visible
                sidebarAnimReveal(sidebarLocationElements.eq(i));
            }
        } else {
            if (!sidebarLocationElements.eq(i).hasClass("sidebar-selection-hidden")) { // don't do anything if already hidden
                sidebarAnimHide(sidebarLocationElements.eq(i), false);
            }
        }
    }

    if (filter === "") { // shut all sections if search bar is empty
        sectionCheck = ["", false, false, false];
    }

    verifySectionCheck(sectionCheck); // shuts sections if no elements are searched from them
}

// section search filtering for indexing
function sectionCheckFilter(sectionLink) {
    let sectionText = sectionLink.text();
    if (sectionText === "North Building") {
        return 1;
    } else if (sectionText === "South Building") {
        return 2;
    } else {
        return 3;
    }
}

// verify if sections should be closed
function verifySectionCheck(sectionCheck) {
    // give the section a click if its active but should be closed
    if (sectionCheck[1] === false && northLocationMenu.prev().hasClass("active")) {
        northLocationMenu.prev()[0].click();
    }

    if (sectionCheck[2] === false && southLocationMenu.prev().hasClass("active")) {
        southLocationMenu.prev()[0].click();
    }

    if (sectionCheck[3] === false && outsideLocationMenu.prev().hasClass("active")) {
        outsideLocationMenu.prev()[0].click();
    }
}

// sidebar reveal display and animation
function sidebarAnimReveal(sidebarElementJ) {
    sidebarElementJ.css("display", "block");
    sidebarElementJ.height(sidebarElementJ[0].scrollHeight); // temp set height for animation
    sidebarElementJ.removeClass("sidebar-selection-hidden"); // remove hidden class

    sidebarElementJ[0].ontransitionend = () => {
        sidebarElementJ.height("auto"); // set back to auto to allow dropdown to expand properly
    };
}

// sidebar hide display and animation
function sidebarAnimHide(sidebarElementJ, setup) {
    sidebarElementJ.height(sidebarElementJ[0].scrollHeight); // temp set height for animation

    setTimeout(function () { // delay to allow height to be set first
        if (setup) sidebarElementJ.addClass("no-transition"); // prevent animation on first load

        sidebarElementJ.addClass("sidebar-selection-hidden"); // add hidden class

        if (setup) { // bring back animation after first load
            sidebarElementJ.css("display", "none");
            sidebarElementJ[0].offsetHeight;
            sidebarElementJ.removeClass("no-transition");
        }
    }, 5);

    if (!setup) {
        sidebarElementJ[0].ontransitionend = () => { // once transition is done, display hide it
            sidebarElementJ.css("display", "none");
        };
    }
}

// Setup sidebar stick headers for search and sections
function initSidebarSticky() {
    const searchHeight = searchBarReg.scrollHeight;
    const northSidebarButton = $("#north-sidebar-button");
    const southSidebarButton = $("#south-sidebar-button");
    const outsideSidebarButton = $("#outside-sidebar-button");

    northSidebarButton.css("top", searchHeight - 0.5);
    southSidebarButton.css("top", searchHeight - 0.5);
    outsideSidebarButton.css("top", searchHeight - 0.5);
}