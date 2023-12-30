import * as viewer360Module from "./360-viewer.js";

const northLocationMenu = $("#north-location-menu");
const southLocationMenu = "";
const outsideLocationMenu = "";

const searchBarReg = document.getElementById("search-bar");

export function initSidebar() {
    // Create arrays for locations, inject them
    jQuery.get("./csv/web-lists/north-locations-list.csv", function (data) {
        sidebarElement360PhotoInjection($.csv.toArrays(data), 1);
    }, 'text');

    jQuery.get("./csv/web-lists/south-locations-list.csv", function (data) {
        sidebarElement360PhotoInjection($.csv.toArrays(data), 2);
    }, 'text');

    jQuery.get("./csv/web-lists/outside-locations-list.csv", function (data) {
        sidebarElement360PhotoInjection($.csv.toArrays(data), 3);
    }, 'text');

    // filter the search results on key up events
    searchBarReg.addEventListener("keyup", function (e) {
        filterSearchElements(document.getElementById("north-location-menu"));
        filterSearchElements(document.getElementById("south-location-menu"));
        filterSearchElements(document.getElementById("outside-location-menu"));
    });
}


function sidebarElement360PhotoInjection(locationArray, section) {
    let selectionIDArray = []; // TODO: keep it global or no? its needed for the map scrolling and pannellum click events (the latter where its already being passed as a
    let sectionID;
    let injectionString;

    // Define section ID to be appended to
    if (section === 1) {
        sectionID = northLocationMenu;
    } else if (section === 2) {
        sectionID = southLocationMenu;
    } else {
        sectionID = outsideLocationMenu;
    }

    if (sectionID.length) { // make sure it doesnt break in case sectionID doesnt exist
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
                if (specialProperty !== "360Video") { // dont push 360video entries to the click injection list
                    selectionIDArray.push(locationNameID);
                }
                sectionID.append(`<li class="sidebar-list-2"><a href="#" id="${locationNameID}">${locationName}</\a></\li>`);
            }
        }

        // complete the functional sidebar by adding dropdowns and pannellum connections
        addDropdownClick();
        jQuery.get("./csv/web-lists/north-locations-filenames.csv", function (data) {
            viewer360Module.addPannellumClick($.csv.toArrays(data), selectionIDArray, locationArray, section);
        }, 'text');
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