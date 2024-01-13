/* Sidebar element injection, 360Photo click events, searchbar */

import * as viewer360Module from "./360-viewer.js";

// sidebar location menus
const northLocationMenu = $("#north-location-menu");
const southLocationMenu = $("#south-location-menu");
const outsideLocationMenu = $("#outside-location-menu");
const sectionMenuSelectors = ["", northLocationMenu, southLocationMenu, outsideLocationMenu];

// search bar vanilla js selector
const searchBarReg = document.getElementById("search-bar");


// Inject sidebar elements, attach clickable events, init searchbar
export function initSidebar() {
    let sidebarLoadCounter = 0; // wait till all 3 sections are loaded before adding dropdown click events
    // TODO bonus: properly synchronize this

    // use title formatted lists to inject sidebar elements
    jQuery.get("./csv/web-lists/north-locations-list.csv", function (data) {
        jQuery.get("./csv/web-lists/north-locations-filenames.csv", function (data2) {
            sidebarElement360PhotoInjection($.csv.toArrays(data), $.csv.toArrays(data2), 1);
            sidebarLoadCounter++;
            if (sidebarLoadCounter === 3) {
                addDropdownClick();
                viewer360Module.initAll360Videos();
            }
        }, 'text');
    }, 'text');

    jQuery.get("./csv/web-lists/south-locations-list.csv", function (data) {
        jQuery.get("./csv/web-lists/south-locations-filenames.csv", function (data2) {
            sidebarElement360PhotoInjection($.csv.toArrays(data), $.csv.toArrays(data2), 2);
            sidebarLoadCounter++;
            if (sidebarLoadCounter === 3) {
                addDropdownClick();
                viewer360Module.initAll360Videos();
            }
        }, 'text');
    }, 'text');

    jQuery.get("./csv/web-lists/outside-locations-list.csv", function (data) {
        jQuery.get("./csv/web-lists/outside-locations-filenames.csv", function (data2) {
            sidebarElement360PhotoInjection($.csv.toArrays(data), $.csv.toArrays(data2), 3);
            sidebarLoadCounter++;
            if (sidebarLoadCounter === 3) {
                addDropdownClick();
                viewer360Module.initAll360Videos();
            }
        }, 'text');
    }, 'text');

    // filter the search results on key up events
    searchBarReg.addEventListener("keyup", function () {
        filterSearchElements(document.getElementById("north-location-menu"));
        filterSearchElements(document.getElementById("south-location-menu"));
        filterSearchElements(document.getElementById("outside-location-menu"));
    });
}

// Inject sidebar elements and add 360Photo events
function sidebarElement360PhotoInjection(locationArray, filenameArray, section) {
    let selectionIDArray = []; // TODO: keep it global or no? its needed for the map scrolling
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
    // TODO: fix iterating past hallways, add comments
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

        // add the actual 360Photo viewer click event
        viewer360Module.create360PhotoViewerEvent(selectionIDArray[i].toString(), filenameArray[(i + 1 - filenameOffset)].toString(), section);

        // Check if the special property is decimal (multi image) using regex while ignoring 360Video cases
        // offset the filename for multi images so it matches up with the sidebar elements
        if (/^[1-9]\d*$/.test(specialProperty)) {
            filenameOffset++;
            counting = true;
        }
    }
}

function addDropdownClick() {
    let dropdown = $(".dropdown-btn");

    for (let i = 0; i < dropdown.length; i++) {
        // open all dropdowns
        // dropdown[i].classList.add("active");

        // close all dropdowns initially
        let dropdownContent = dropdown[i].nextElementSibling;
        dropdownContent.style.display = "none"

        // setup dropdown toggle
        dropdown[i].addEventListener("click", function () {
            this.classList.toggle("active");
            let dropdownContent = this.nextElementSibling;
            if (dropdownContent.style.display === "none") {
                dropdownContent.style.display = "block";
            } else {
                dropdownContent.style.display = "none";
            }
            // kind of terrible code but it works
            // adds visual toggle arrows
            // TODO: add back basically
            // var cls = this.getElementsByClassName("svg-inline--fa")[0].classList;
            // if (cls.contains("fa-angle-down")) {
            //     cls.add("fa-angle-up");
            //     cls.remove("fa-angle-down");
            // }
            // else if (cls.contains("fa-angle-up")) {
            //     cls.add("fa-angle-down");
            //     cls.remove("fa-angle-up");
            // }
        });
    }
}

// repetitive search filtering for the different location areas
// TODO bonus: merge with gallery searching
function filterSearchElements(ul) {
    // setup variables
    let filter = searchBarReg.value.toUpperCase();
    let li = ul.getElementsByClassName("sidebar-list-2");

    // loop through all list items, and hide those who don't match the search query
    for (let i = 0; i < li.length; i++) {
        let a = li[i].getElementsByTagName("a")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].classList.remove("hidden");
            li[i].classList.remove("hidden-opacity");
        } else {
            li[i].classList.add("hidden-opacity");
            li[i].ontransitionend = () => {
                li[i].classList.add("hidden")
                console.log('Transition ended');
            };
        }
    }
}