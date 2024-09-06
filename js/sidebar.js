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
    let sidebarLoadCounter = 0; // wait till all 3 sections are loaded before adding dropdown click events

    // use title formatted lists to inject sidebar elements
    jQuery.get("./csv/web-lists/north-locations-list.csv", function (data) {
        jQuery.get("./csv/web-lists/north-locations-filenames.csv", function (data2) {
            sidebarElement360PhotoInjection($.csv.toArrays(data), $.csv.toArrays(data2), 1);
            sidebarLoadCounter++;
            if (sidebarLoadCounter === 3) {
                addSidebarButtonClick();
                viewer360Module.initAll360Videos();
            }
        }, 'text');
    }, 'text');

    jQuery.get("./csv/web-lists/south-locations-list.csv", function (data) {
        jQuery.get("./csv/web-lists/south-locations-filenames.csv", function (data2) {
            sidebarElement360PhotoInjection($.csv.toArrays(data), $.csv.toArrays(data2), 2);
            sidebarLoadCounter++;
            if (sidebarLoadCounter === 3) {
                addSidebarButtonClick();
                viewer360Module.initAll360Videos();
            }
        }, 'text');
    }, 'text');

    jQuery.get("./csv/web-lists/outside-locations-list.csv", function (data) {
        jQuery.get("./csv/web-lists/outside-locations-filenames.csv", function (data2) {
            sidebarElement360PhotoInjection($.csv.toArrays(data), $.csv.toArrays(data2), 3);
            sidebarLoadCounter++;
            if (sidebarLoadCounter === 3) {
                addSidebarButtonClick();
                viewer360Module.initAll360Videos();
            }
        }, 'text');
    }, 'text');

    // filter the search results on key up events
    searchBarReg.addEventListener("keyup", function () {
        filterSearchElements();
    });
}

// Inject sidebar elements and add 360Photo events
function sidebarElement360PhotoInjection(locationArray, filenameArray, section) {
    let selectionIDArray = []; // TODO: keep it global or no? its contents are needed for the map selection, scrolling to sidebar entry
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
    let sidebarButtons = $("#location-menu a");

    // close section dropdowns initially
    for (let i = 0; i < sidebarButtons.length; i++) {
        if (sidebarButtons[i].classList.contains("dropdown-btn")) { // close only all dropdowns initially
            sidebarButtons[i].nextElementSibling.style.display = "none"
        }

        // add click event to sidebar buttons
        sidebarButtons[i].addEventListener("click", function () {
            this.classList.toggle("active");

            // active buttons handling
            if (!sectionSidebarButtons.includes(this.id)) { // ignore section dropdowns
                if (this.parentElement.classList.contains("sidebar-list-3")) { // if clicking sub media within same dropdown

                    if (window.activeMediaSecondary !== self) {
                        // remove other active sub media, set new current as active secondary
                        window.activeMediaSecondary.classList.remove("active");
                        this.classList.add("active");
                        window.activeMediaSecondary = this;
                    }

                } else if (window.activeMedia !== this) { // if not clicking same media again

                    if (window.activeMedia !== undefined) { // not first button
                         if (window.activeMedia.classList.contains("dropdown-btn")) { // if previous is dropdown, close it properly
                                window.activeMedia.nextElementSibling.style.display = "none";
                                if (window.activeMediaSecondary !== undefined) { // will already be undefined if closed itself
                                    window.activeMediaSecondary.classList.remove("active"); // clear secondary active
                                    window.activeMediaSecondary = undefined;
                                }
                        }

                        window.activeMedia.classList.remove("active");
                    }

                    window.activeMedia = this; // sets the new current active media

                } else { // todo: must be self?, closes current media
                    viewer360Module.close360Viewer();
                    linearVideo.closeLinearVideo();
                    window.activeMedia = undefined;
                }
            }


            // only for dropdowns toggle display and deal with active sub buttons
            if (sidebarButtons[i].classList.contains("dropdown-btn")) {
                let dropdownContent = this.nextElementSibling;

                if (!sectionSidebarButtons.includes(this.id)) { // ignore section dropdowns
                    if (window.activeMediaSecondary === undefined) { // switched from elsewhere or opening new
                        // active first image when opening a media dropdown
                        let firstImage = dropdownContent.firstChild.firstChild;
                        firstImage.classList.toggle("active");
                        window.activeMediaSecondary = firstImage;
                    } else { // closing current dropdown
                        window.activeMediaSecondary.classList.remove("active");
                        window.activeMediaSecondary = undefined;
                    }

                }

                // hiding and revealing dropdown content
                if (dropdownContent.style.display === "none") {
                    dropdownContent.style.display = "block";
                } else {
                    dropdownContent.style.display = "none";
                }
            }

            // todo bonus: add toggle arrows
        });
    }
}

// locatin search filtering
// TODO bonus: merge with gallery searching
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

            // sidebarLocationElements.eq(i).show('fast'); // reveal element
            sidebarLocationElements.eq(i).stop().css({
                display: "block",     // Set display to block to make the element visible
                overflow: "hidden",
                height: 0,            // Start with height of 0 (collapsed)
                opacity: 0            // Start with opacity 0 (invisible)
            }).animate({
                height: "100%",       // Animate to full height (or set to a specific height)
                opacity: 1            // Animate to full opacity
            }, 800);
        } else {
            sidebarLocationElements.eq(i).stop().animate({
                height: 0,         // Squish the height to 0
                opacity: 0         // Reduce the opacity to 0
            }, 800, function() {    // Adjust duration (400ms) as needed
                $(this).css("display", "none"); // After the animation, set display to none
            });
            /*sidebarLocationElements.eq(i).hide();animate({
                opacity: 0
            }, 500, function() {
                $(this).hide(); // applies display: none; to the element .panel
            }); // hide element*/
        }
    }

    if (filter === "") { // shut all sections if search bar is empty
        sectionCheck = ["", false, false, false];
    }

    verifySectionCheck(sectionCheck); // shuts sections if no elements are searched from them
}

// section search filtering for indexing
function sectionCheckFilter (sectionLink) {
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
function verifySectionCheck (sectionCheck) {
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