/* Sidebar element injection, 360Photo click events, searchbar */

import * as viewer360Module from "./360-viewer.js";
import * as linearVideo from "./linear-video.js";
import * as mediaHelper from "./media.js";

// sidebar location menus
const northLocationMenu = $("#north-location-menu");
const southLocationMenu = $("#south-location-menu");
const outsideLocationMenu = $("#outside-location-menu");
const northSidebarButton = $("#north-sidebar-button");
const southSidebarButton = $("#south-sidebar-button");
const outsideSidebarButton = $("#outside-sidebar-button");
const sectionMenuSelectors = ["", northLocationMenu, southLocationMenu, outsideLocationMenu];
const sectionSidebarButtons = ["", "north-sidebar-button", "south-sidebar-button", "outside-sidebar-button"];

// search bar vanilla js selector
const searchBarReg = document.getElementById("search-bar");

// other selectors
const mediaTransCover = $("#media-trans-cover");


// Inject sidebar elements, attach clickable events, init searchbar
export function initSidebar() {
    return new Promise((resolve, reject) => {
        let sidebarLoadCounter = 0; // wait till all 3 sections are loaded before adding dropdown click events

        // use title formatted lists to inject sidebar elements
        jQuery.get("./csv/virtual-tour/north-locations-list.csv", function (data) {
            jQuery.get("./csv/virtual-tour/north-locations-filenames.csv", function (data2) {
                sidebarElement360PhotoInjection($.csv.toArrays(data), $.csv.toArrays(data2), 1);
                sidebarLoadCounter++;
                if (sidebarLoadCounter === 3) {
                    addSidebarButtonClick();
                    viewer360Module.init360Videos();
                    initSidebarSticky();
                    searchTypeEvent();

                    resolve(); // resolve promise once sidebar is done loading
                }
            }, 'text').fail(reject);
        }, 'text').fail(reject);

        jQuery.get("./csv/virtual-tour/south-locations-list.csv", function (data) {
            jQuery.get("./csv/virtual-tour/south-locations-filenames.csv", function (data2) {
                sidebarElement360PhotoInjection($.csv.toArrays(data), $.csv.toArrays(data2), 2);
                sidebarLoadCounter++;
                if (sidebarLoadCounter === 3) {
                    addSidebarButtonClick();
                    viewer360Module.init360Videos();
                    initSidebarSticky();
                    searchTypeEvent();

                    resolve(); // resolve promise once sidebar is done loading
                }
            }, 'text').fail(reject);
        }, 'text').fail(reject);

        jQuery.get("./csv/virtual-tour/outside-locations-list.csv", function (data) {
            jQuery.get("./csv/virtual-tour/outside-locations-filenames.csv", function (data2) {
                sidebarElement360PhotoInjection($.csv.toArrays(data), $.csv.toArrays(data2), 3);
                sidebarLoadCounter++;
                if (sidebarLoadCounter === 3) {
                    addSidebarButtonClick();
                    viewer360Module.init360Videos();
                    initSidebarSticky();
                    searchTypeEvent();

                    resolve(); // resolve promise once sidebar is done loading
                }
            }, 'text').fail(reject);
        }, 'text').fail(reject);
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
                injectionString = `<li class="sidebar-list-2"><div class="dropdown-header-container"><button class="dropdown-btn" id="${locationNameID}">${cutLocationName}</button>
                    <img src="media/site-assets/dropdown-svgrepo-com-cropped.svg" alt="\/" class="sidebar-dropdown-arrow"></div><ul class="dropdown-container">`;

                // keep adding sidebar entries given by the number of location images (defined by specialProperty)
                for (let k = 0; k < parseInt(specialProperty); k++) {
                    locationNameID = cutLocationName.replaceAll(" ", "-").toLowerCase() + (k + 1);
                    selectionIDArray.push(locationNameID);
                    injectionString += `<li class="sidebar-list-3"><button id="${locationNameID}">Image ` + (k + 1) + '</button>';
                }

                sectionID.append(injectionString);
                i += parseInt(specialProperty) - 1;
            } else {
                // normal sidebar button injection
                let locationNameID = locationName.replaceAll(" ", "-").toLowerCase();
                if (specialProperty !== "360Video") { // don't push 360video entries to the click event list
                    selectionIDArray.push(locationNameID);
                }
                sectionID.append(`<li class="sidebar-list-2"><button id="${locationNameID}">${locationName}</button></li>`);
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
    const sidebarButtons = $("#location-menu button");

    // go through sidebar and close dropdowns, add click events
    for (let i = 0; i < sidebarButtons.length; i++) {
        if (sidebarButtons[i].classList.contains("dropdown-btn")) { // close all dropdown initially
            mediaHelper.heightAnimHide(sidebarButtons.eq(i).parent().next(), true);
        }

        // add click event to sidebar buttons
        sidebarButtons[i].addEventListener("click", function () {
            if (!window.sidebarClickTimeout) {

                // active buttons & media handling
                if (!sectionSidebarButtons.includes(this.id)) { // ignore section dropdowns
                    // manage click timeouts for sidebar buttons & map
                    window.sidebarClickTimeout = true;
                    startSidebarClickTimeout();
                    window.sidebarSecClickTimeout = false; // skip section timeout if media is being clicked (fast section -> media click; aka map click behaviour)
                    window.lockDrag = true; // lock map movement (where all media opens trigger immediately here)

                    if (this.parentElement.classList.contains("sidebar-list-3")) { // if clicking sub media

                        if (window.activeMediaSecondary !== this && window.activeMediaSecondary !== undefined) { // within same dropdown, not self
                            mediaHelper.mediaTransReveal(mediaTransCover, false); // media trans cover

                            // remove other active sub media, set new current as active secondary
                            window.activeMediaSecondary.classList.remove("active");
                            $(window.activeMediaSecondary).data("mediaActive", false);
                            this.classList.add("active");
                            window.activeMediaSecondary = this;
                        } // otherwise it's a map clicking a sub media and we simulate a dropdown click to open it

                    } else if (window.activeMedia !== this) { // if not clicking same media again
                        mediaHelper.mediaTransReveal(mediaTransCover, false); // media trans cover

                        if (window.activeMedia !== undefined) { // not first button / not only button action
                            if (window.activeMedia.classList.contains("dropdown-btn")) { // if previous is dropdown, close it properly
                                mediaHelper.heightAnimHide($(window.activeMedia.parentElement.nextElementSibling), false);
                                $(window.activeMedia.nextElementSibling).toggleClass("dropdown-flip");
                                if (window.activeMediaSecondary !== undefined) { // will already be undefined if closed itself
                                    window.activeMediaSecondary.classList.remove("active"); // clear secondary active
                                    $(window.activeMediaSecondary).data("mediaActive", false);
                                    window.activeMediaSecondary = undefined;
                                }
                            }

                            window.activeMedia.classList.remove("active");
                            $(window.activeMedia).data("mediaActive", false);
                        }

                        window.activeMedia = this; // (sometimes first open) sets the new current active media

                    } else { // must be self, closes current media
                        mediaHelper.mediaTransReveal(mediaTransCover, false); // media trans cover

                        // lock media clicks when closing self media
                        window.mediaClickTimeout = true;
                        viewer360Module.startMediaClickTimeout();

                        setTimeout(function () { // delay to allow media opener click block to check first
                            $(window.activeMedia).data("mediaActive", false);
                            window.activeMedia = undefined;
                        }, 10);

                        setTimeout(function () { // allow trans cover to show first
                            // allow closes time to process before hiding cover (below)
                            viewer360Module.close360Viewer();
                            linearVideo.closeLinearVideo();
                        }, 320); // relative to trans cover animation delay (300)

                        setTimeout(function () { // allow trans cover to show first
                            mediaHelper.mediaTransHide(mediaTransCover); // hide trans cover & reveal map
                        }, 350); // relative to trans cover animation delay (held a bit longer so it's natural compared to media load time, map trans cover sync)
                    }
                }

                // general sidebar button click behaviour (sections only execute this)
                if (!window.sidebarSecClickTimeout) {
                    if (window.activeMediaSecondary !== this) {
                        this.classList.toggle("active");
                    }

                    // only for dropdowns toggle display and deal with active sub buttons
                    if (sidebarButtons[i].classList.contains("dropdown-btn")) {
                        let dropdownContent = this.parentElement.nextElementSibling;
                        let dropdownContentJ = $(this).parent().next();
                        let dropdownArrow = $(this).next();

                        dropdownArrow.toggleClass("dropdown-flip"); // flip dropdown arrow

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
                            mediaHelper.heightAnimReveal(dropdownContentJ);
                        } else {
                            mediaHelper.heightAnimHide(dropdownContentJ, false); // todo: fix dropdown not reopening. when closing section, then closing media that has dropdown (height probably reading 0 because of the display none)
                        }
                    }

                    // section sidebar timeout at end of function to allow media click to skip it (fast section -> media click; aka map click behaviour)
                    if (sectionSidebarButtons.includes(this.id)) {
                        window.sidebarSecClickTimeout = true;
                        startSecSidebarClickTimeout();
                    }
                }
            }
        });
    }
}


// main search event listener
function searchTypeEvent() {
    const sidebarLocationElements = $(".sidebar-list-2"); // get all the li location elements
    let typingTimer;

    // filter the search results on key up events
    searchBarReg.addEventListener("keyup", function () {
        clearTimeout(typingTimer);

        typingTimer = setTimeout(function () {
            filterSearchElements(sidebarLocationElements);
        }, 400); // todo: finalize timing (50 wpm = 250 cpm = 240 ms), but also section sidebar animation delay is (450), even 300 seems to work okay?

    });
}

// location search filtering
export function filterSearchElements(sidebarLocationElements) {
    let filter = searchBarReg.value.toUpperCase(); // comparison search string
    let sectionCheck = ["", false, false, false]; // check if the section should be active
    let revealList = [];
    let hideList = [];

    // loop through all list items, do the filtering
    for (let i = 0; i < sidebarLocationElements.length; i++) {
        let locationName = sidebarLocationElements.eq(i).find("button").eq(0).text().toUpperCase(); // get formatted location name
        let sectionLink = sidebarLocationElements.eq(i).parent().prev().children().eq(0); // get the section of the location

        // organize reveal and hide lists first so we can know section actions ahead of time
        if (locationName.indexOf(filter) > -1) { // exact match somewhere in the name
            // ignore empty search bar that would match everything
            if (filter !== "") sectionCheck[sectionCheckFilter(sectionLink)] = true; // set section to active
            revealList.push(sidebarLocationElements.eq(i));
        } else {
            hideList.push(sidebarLocationElements.eq(i));
        }
    }

    if (filter === "") sectionCheck = ["", false, false, false]; // shut all sections if search bar is empty

    // loop through reveal and hide lists
    for (let i = 0; i < revealList.length; i++) {
        if (revealList[i].hasClass("sidebar-selection-hidden")) { // don't do anything if already visible
            mediaHelper.heightAnimReveal(revealList[i]);
        }
    }

    for (let i = 0; i < hideList.length; i++) {
        let sectionLink = sidebarLocationElements.eq(i).parent().prev().children().eq(0); // get the section of the location

        if (!hideList[i].hasClass("sidebar-selection-hidden") && sectionCheck[sectionCheckFilter(sectionLink)] === true) {
            // don't do anything if already hidden, only hide if section is active
            mediaHelper.heightAnimHide(hideList[i], false);
        }
    }

    searchSectionCheck(sectionCheck);
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

function searchSectionCheck(sectionCheck) {
    // handles both active click and close click
    if (sectionCheck[1] !== northSidebarButton.hasClass("active")) {
        northSidebarButton[0].click();
        window.sidebarSecClickTimeout = false;
    }

    if (sectionCheck[2] !== southSidebarButton.hasClass("active")) {
        southSidebarButton[0].click();
        window.sidebarSecClickTimeout = false;
    }

    if (sectionCheck[3] !== outsideSidebarButton.hasClass("active")) {
        outsideSidebarButton[0].click();
        window.sidebarSecClickTimeout = false;
    }
}


// Setup sidebar stick headers for search and sections
function initSidebarSticky() {
    const searchHeight = searchBarReg.scrollHeight;
    const northSidebarHeader = $("#north-sidebar-header");
    const southSidebarHeader = $("#south-sidebar-header");
    const outsideSidebarHeader = $("#outside-sidebar-header");

    northSidebarHeader.css("top", searchHeight - 0.5);
    southSidebarHeader.css("top", searchHeight - 0.5);
    outsideSidebarHeader.css("top", searchHeight - 0.5);
}


function startSidebarClickTimeout() {
    setTimeout(function () {
        window.sidebarClickTimeout = false;
    }, 970); // relative to sidebar animation delay / media load stall (305) + trans cover fade out (300) + extra (365)
}

function startSecSidebarClickTimeout() {
    setTimeout(function () {
        window.sidebarSecClickTimeout = false;
    }, 500); // relative to section sidebar animation delay (450)
}