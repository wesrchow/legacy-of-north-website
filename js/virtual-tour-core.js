/* Core script for virtual tour that executes all initialization functions */

import * as sidebar from "./sidebar.js";
import * as mapEvents from "./map-events.js";
import * as mapMovement from "./map-movement.js";

/*
*
* Global definitions
*
* */
window.lockDrag = false;
window.lockMapSelection = false;
window.viewer360 = undefined; // maybe change to null later
window.viewer360Secondary = undefined;
window.mouseDragging = false;

mapEvents.initMap(); // Replace map SVG with inline SVG, attach clickable events and setup map controls/interaction

sidebar.initSidebar(); // Inject sidebar elements, attach clickable events, init searchbar

mapMovement.addMapMovementEvents(); // Add map events to facilitate map movement



// $(document).ready(function () {


    // const viewer360Container = $("#viewer-360-container");
    // const viewer360ContainerSecondary = $("#viewer-360-container-secondary");
    // const exit360Viewer = $("#exit-360-viewer");
    // const mapContainer = $("#map-container");
    //
    // const mapLayerMenuDropdown = $("#map-layer-menu-dropdown");
    // const mapLayerMenu = $("#map-layer-menu");

    /*
    *
    * Replace SVG with inline SVG
    *
    * */


    /*
    *
    * Generate Sidebar Locations List
    *
    * */
    // const northLocationMenu = $("#north-location-menu");
    // const southLocationMenu = "";
    // const outsideLocationMenu = "";

    // // Create arrays for locations, inject them
    // jQuery.get("./csv/web-lists/north-locations-list.csv", function (data) {
    //     sidebarInjection($.csv.toArrays(data), 1);
    // }, 'text');
    //
    // jQuery.get("./csv/web-lists/south-locations-list.csv", function (data) {
    //     sidebarInjection($.csv.toArrays(data), 2);
    // }, 'text');
    //
    // jQuery.get("./csv/web-lists/outside-locations-list.csv", function (data) {
    //     sidebarInjection($.csv.toArrays(data), 3);
    // }, 'text');

    // let selectionIDArray = []; // TODO: keep it global or no? its needed for the map scrolling and pannellum click events (the latter where its already being passed as a
    // parameter)

    // function sidebarInjection(locationArray, section) {
    //     let sectionID;
    //     let injectionString;
    //
    //     // Define section ID to be appended to
    //     if (section === 1) {
    //         sectionID = northLocationMenu;
    //     } else if (section === 2) {
    //         sectionID = southLocationMenu;
    //     } else {
    //         sectionID = outsideLocationMenu;
    //     }
    //
    //     if (sectionID.length) { // make sure it doesnt break in case sectionID doesnt exist
    //         for (let i = 1; i < locationArray.length; i++) { // iterate through the nicely formatted titles of locations
    //             let locationName = locationArray[i][0];
    //             let specialProperty = locationArray[i][1]; // multi image or 360Video flag
    //
    //             // inject sidebar button
    //             if (/^[1-9]\d*$/.test(specialProperty)) { // Check if the special property is decimal (multi image) using regex while ignoring 360Video cases
    //                 // multi image sidebar button injection
    //                 let cutLocationName = locationName.substring(0, locationName.length - 2); // get rid of numbering
    //
    //                 let locationNameID = cutLocationName.replaceAll(" ", "-").toLowerCase(); // generate well formatted ID
    //                 selectionIDArray.push(locationNameID);
    //                 injectionString = `<li class="sidebar-list-2"><a href="#" class="dropdown-btn" id="${locationNameID}">${cutLocationName}</\a><ul class="dropdown-container">`;
    //
    //                 // keep adding sidebar entries given by the number of location images (defined by specialProperty)
    //                 for (let k = 0; k < parseInt(specialProperty); k++) {
    //                     locationNameID = cutLocationName.replaceAll(" ", "-").toLowerCase() + (k + 1);
    //                     selectionIDArray.push(locationNameID);
    //                     injectionString += `<li class="sidebar-list-3"><a href="#" id="${locationNameID}">Image ` + (k + 1) + '</\a>';
    //                 }
    //
    //                 sectionID.append(injectionString);
    //                 i += parseInt(specialProperty) - 1;
    //             } else {
    //                 // normal sidebar button injection
    //                 let locationNameID = locationName.replaceAll(" ", "-").toLowerCase();
    //                 if (specialProperty !== "360Video") { // dont push 360video entries to the click injection list
    //                     selectionIDArray.push(locationNameID);
    //                 }
    //                 sectionID.append(`<li class="sidebar-list-2"><a href="#" id="${locationNameID}">${locationName}</\a></\li>`);
    //             }
    //         }
    //
    //         // complete the functional sidebar by adding dropdowns and pannellum connections
    //         addDropdownClick();
    //         jQuery.get("./csv/web-lists/north-locations-filenames.csv", function (data) {
    //             addPannellumClick($.csv.toArrays(data), selectionIDArray, locationArray, section);
    //         }, 'text');
    //     }
    // }


    /*
    *
    * Add Links to Map Locations
    *
    * */
    // function addMapLinks(filenameArray) {
    //     const hallwayVideoList = ["North_1st_Floor_Hallway", "North_2nd_Floor_Hallway", "North_3rd_Floor_Hallway", "North_Foyer"];
    //     // let hallwayVideoCounter = 0;
    //
    //     // get the top level ID of each location selection in sidebar to scroll to
    //     const selectionIDArrayTop = northLocationMenu.children();
    //     // console.log(selectionIDArrayTop)
    //     // console.log(filenameArray)
    //
    //     let elementOffset = 1;
    //
    //     // TODO: PROBABLY DEAL WITH THE HALLWAY ENTRIES HERE
    //     // need to look at/come up with naming scheme for the hallway ID sections on the map
    //     // probably write another function to manage all the hallway initialization
    //     // function: init the first pannellum view, somehow have the rest of the pannellum views ready to go, probably show more
    //     // navigation buttons compared to the regular 360photo viewer
    //
    //
    //     // add360VideoLinks();
    //
    //     // this for loop starts at 4 because it ignores the header and hallway entries (which are handled manually above?)
    //     for (let i = 1; i < filenameArray.length; i++) {
    //         // console.log(typeof filenameArray[i][0]);
    //
    //         // if (filenameArray[i][0] === hallwayVideoList[hallwayVideoCounter]) {
    //         //     add360VideoLinks(hallwayVideoList[hallwayVideoCounter]);
    //         //     hallwayVideoCounter++;
    //         // }
    //
    //         // set the way the map ID is formatted
    //         let mapIDName = $(`#${filenameArray[i].toString().split(".")[0]}`);
    //
    //         // check if the map selection exists
    //         if (mapIDName.length) {
    //             // elementOffset --;
    //             mapIDName.addClass("location"); // add css class that gives the hover effect
    //
    //             // grab the variable filenameOffset each iteration for each click function and pass it into the function as index variable
    //             (function (index) { // assumption: index is not used here because location multiple photos are ignored for the map clicks (may be able to remove function thingy
    //                 // here)
    //                 mapIDName.click(function () {
    //                     if (!window.lockMapSelection) {
    //                         // document.getElementById(selectionIDArrayTop[i].attr("id")).scrollIntoView();
    //                         // console.log(selectionIDArrayTop[i - index]);
    //
    //                         let content360 = filenameArray[i]; // somehow this works by giving it as an object
    //
    //                         // hide necessary elements, lock map and reveal the 360 viewer container
    //                         mapLayerMenuDropdown.addClass("hidden");
    //                         mapLayerMenu.addClass("hidden");
    //                         mapContainer.addClass("hidden");
    //                         viewer360Container.removeClass("hidden");
    //                         exit360Viewer.removeClass("hidden");
    //                         window.lockDrag = true;
    //
    //                         // check if there's an existing viewer already, if so destroy it
    //                         if (typeof viewer360 !== "undefined") {
    //                             viewer360.destroy();
    //                         }
    //
    //                         viewer360 = pannellum.viewer('viewer-360-container', {
    //                             "type": "equirectangular",
    //                             "panorama": `test-media/${content360}`,
    //                             "friction": 0.1,
    //                             "autoLoad": true,
    //                             "compass": false,
    //                             "keyboardZoom": false,
    //                             "disableKeyboardCtrl": true
    //                         });
    //                     }
    //                 });
    //             })(elementOffset)
    //         } else {
    //             // continue looping through filenames without doing anything
    //             elementOffset++;
    //         }
    //     }
    //     // console.log(elementOffset)
    //
    // }


    /*
    *
    * Add 360Video Links to Map Locations & Sidebar
    *
    * */
    // function addAll360VideoLinks(filename360VideoArray, initialYaw, fileCount) {
    //     // console.log(filename360VideoArray[0][0].replace(/ /g, " "));
    //
    //     const video360Range = $("#video-360-range");
    //     const video360ButtonPrev = $("#video-360-button-prev");
    //     const video360ButtonNext = $("#video-360-button-next");
    //     const mapIDName = $(`#${filename360VideoArray[0][0]}`);
    //     // define sidebar selection ID
    //     // remove 360Video from the end of the string
    //         // if csv title has "floor" then we also append "hallway" to match the sidebar ID
    //         // otherwise leave it, the other 360Videos are already matched correctly
    //
    //     let video360Toggle = true;
    //     let videoPos = 1;
    //     let tempPrevViewer = null;
    //
    //     mapIDName.addClass("location"); // add css class that gives the hover effect
    //
    //     mapIDName.click(function () {
    //         if (!window.lockMapSelection) {
    //             // document.getElementById(selectionIDArrayTop[i].attr("id")).scrollIntoView();
    //             // console.log(selectionIDArrayTop[i - index]);
    //
    //             // set up 360Video controls
    //             video360Range.attr("max", fileCount);
    //
    //             video360ButtonPrev.click(function () {
    //                 videoPos --
    //
    //                 if (videoPos < 1) {
    //                     videoPos++;
    //                 } else {
    //                     if (video360Toggle) {
    //                         tempPrevViewer = video360Transition("viewer-360-container-secondary", viewer360Container, viewer360ContainerSecondary, tempPrevViewer, viewer360Secondary);
    //                     } else {
    //                         tempPrevViewer = video360Transition("viewer-360-container", viewer360ContainerSecondary, viewer360Container, tempPrevViewer, viewer360);
    //                     }
    //
    //                     video360Toggle = !video360Toggle;
    //                 }
    //             });
    //
    //             video360ButtonNext.click(function () {
    //                 videoPos++
    //
    //                 if (videoPos >= fileCount) {
    //                     videoPos--;
    //                 } else {
    //                     if (video360Toggle) {
    //                         tempPrevViewer = video360Transition("viewer-360-container-secondary", viewer360Container, viewer360ContainerSecondary, tempPrevViewer, viewer360Secondary);
    //                     } else {
    //                         tempPrevViewer = video360Transition("viewer-360-container", viewer360ContainerSecondary, viewer360Container, tempPrevViewer, viewer360);
    //                     }
    //
    //                     video360Toggle = !video360Toggle;
    //                 }
    //             });
    //
    //             // hide necessary elements, lock map and reveal the 360 viewer container
    //             mapLayerMenuDropdown.addClass("hidden");
    //             mapLayerMenu.addClass("hidden");
    //             mapContainer.addClass("hidden");
    //             viewer360Container.removeClass("hidden-opacity-360video");
    //             exit360Viewer.removeClass("hidden");
    //             window.lockDrag = true;
    //             // FIXME: discrepancy using hidden and hidden-opacity-360video for my 360 containers
    //
    //             let content360 = filename360VideoArray[1]; // somehow this works by giving it as an object
    //
    //             // check if there's an existing viewer already, if so destroy it
    //             if (typeof viewer360 !== "undefined") {
    //                 viewer360.destroy();
    //             }
    //
    //             viewer360 = pannellum.viewer("viewer-360-container", {
    //                 "type": "equirectangular",
    //                 "panorama": `test-media/${filename360VideoArray[0][0].replaceAll("_", " ")}/${content360}`,
    //                 "friction": 0.1,
    //                 "autoLoad": true,
    //                 "compass": false,
    //                 "keyboardZoom": false,
    //                 "disableKeyboardCtrl": true,
    //                 "yaw": initialYaw
    //             });
    //
    //             // set up view switching
    //             tempPrevViewer = viewer360;
    //
    //             function video360Transition(targetContainerString, prevContainer, nextContainer, prevPannellumViewer, nextPannellumViewer) {
    //                 content360 = filename360VideoArray[videoPos];
    //
    //                 nextContainer.removeClass("hidden");
    //                 nextContainer.removeClass("hidden-opacity-360video");
    //
    //                 nextPannellumViewer = pannellum.viewer(targetContainerString, {
    //                     "type": "equirectangular",
    //                     "panorama": `test-media/${filename360VideoArray[0][0].replaceAll("_", " ")}/${content360}`,
    //                     "friction": 0.1,
    //                     "autoLoad": true,
    //                     "compass": false,
    //                     "keyboardZoom": false,
    //                     "disableKeyboardCtrl": true,
    //                     "yaw": initialYaw
    //                 });
    //
    //                 prevContainer.addClass("hidden-opacity-360video");
    //                 prevContainer.on('transitionend webkitTransitionEnd oTransitionEnd', function () {
    //                     prevPannellumViewer.destroy();
    //                     prevContainer.addClass("hidden");
    //
    //                     nextContainer.css("z-index", 1);
    //                     prevContainer.css("z-index", 0);
    //                 });
    //
    //
    //
    //                 return nextPannellumViewer;
    //             }
    //         }
    //     });
    //
    //
    // }


    /*
    *
    * Sidebar Search
    *
    * */
    // const searchBarReg = document.getElementById("search-bar");

    // // filter the search results on key up events
    // searchBarReg.addEventListener("keyup", function (e) {
    //     filterSearchElements(document.getElementById("north-location-menu"));
    //     filterSearchElements(document.getElementById("south-location-menu"));
    //     filterSearchElements(document.getElementById("outside-location-menu"));
    // });

    // repetitive search filtering for the different location areas
    // function filterSearchElements(ul) {
    //     // setup variables
    //     let filter = searchBarReg.value.toUpperCase();
    //     let li = ul.getElementsByClassName("sidebar-list-2");
    //
    //     // loop through all list items, and hide those who don't match the search query
    //     for (let i = 0; i < li.length; i++) {
    //         let a = li[i].getElementsByTagName("a")[0];
    //         if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
    //             li[i].classList.remove("hidden");
    //             li[i].classList.remove("hidden-opacity");
    //         } else {
    //             li[i].classList.add("hidden-opacity");
    //             li[i].ontransitionend = () => {
    //                 li[i].classList.add("hidden")
    //                 console.log('Transition ended');
    //             };
    //         }
    //     }
    // }


    /*
    *
    * Sidebar Dropdown Individual Click Events
    *
    * */
    // function addDropdownClick() {
    //     let dropdown = $(".dropdown-btn");
    //
    //     for (let i = 0; i < dropdown.length; i++) {
    //         // open all dropdowns
    //         // dropdown[i].classList.add("active");
    //
    //         // close all dropdowns initially
    //         let dropdownContent = dropdown[i].nextElementSibling;
    //         dropdownContent.style.display = "none"
    //
    //         // setup dropdown toggle
    //         dropdown[i].addEventListener("click", function () {
    //             this.classList.toggle("active");
    //             let dropdownContent = this.nextElementSibling;
    //             if (dropdownContent.style.display === "none") {
    //                 dropdownContent.style.display = "block";
    //             } else {
    //                 dropdownContent.style.display = "none";
    //             }
    //             // kind of terrible code but it works
    //             // adds visual toggle arrows
    //             // TODO: add back basically
    //             // var cls = this.getElementsByClassName("svg-inline--fa")[0].classList;
    //             // if (cls.contains("fa-angle-down")) {
    //             //     cls.add("fa-angle-up");
    //             //     cls.remove("fa-angle-down");
    //             // }
    //             // else if (cls.contains("fa-angle-up")) {
    //             //     cls.add("fa-angle-down");
    //             //     cls.remove("fa-angle-up");
    //             // }
    //         });
    //     }
    // }


    /*
    *
    * Interactive Map
    *
    *  */

    // const mediaContainer = $("#media-container");
    // const mapContainerReg = document.getElementById("map-container");
    // const mediaContainerReg = document.getElementById("media-container");

    // let dragging = false;

    // check if mapContainer exists
    // if (mapContainer.length) {
    // const speed = 0.2; // speed of scale, actual transition speed is handled in css
    // let mapContainerSize = {w: mapContainerReg.clientWidth, h: mapContainerReg.clientHeight};
    // let mapContainerInitialW = mapContainerSize.w;
    // let mediaContainerInitialW = mediaContainerReg.clientWidth;
    // let position = {x: 0, y: 0};
    // let target = {x: 0, y: 0};
    // let pointer = {x: 0, y: 0};
    // let scale = 1;
    // let centeredOffset = (mediaContainerReg.clientWidth - mapContainerReg.clientWidth) / 2;
    // let startMouse = {x: 0, y: 0};
    // let currentMouse = {x: 0, y: 0};
    // let previousMap = {x: 0, y: 0};

    // // constrain map within calculated bounds (can also act to center map)
    // function constrainMap() {
    //     if (mapContainerInitialW * scale > mediaContainerInitialW) {
    //         if (position.x > -centeredOffset) position.x = -centeredOffset;
    //         if (position.x - centeredOffset + mapContainerSize.w * scale < mapContainerSize.w) position.x = -mapContainerSize.w * (scale - 1) + centeredOffset;
    //     } else {
    //         // to reimplement if allowing horizontal pan when map width is smaller than container
    //         // if (position.x > 0) position.x = 0;
    //         // if (position.x + mapContainerSize.w * scale < mapContainerSize.w) position.x = -mapContainerSize.w * (scale - 1);
    //         position.x = -(mapContainerInitialW * scale - mapContainerInitialW) / 2;
    //     }
    //
    //     if (position.y > 0) position.y = 0;
    //     if (position.y + mapContainerSize.h * scale < mapContainerSize.h) position.y = -mapContainerSize.h * (scale - 1);
    //
    //     // apply the transform
    //     mapContainerReg.style.transform = `translate(${position.x + centeredOffset}px,${position.y}px) scale(${scale},${scale})`;
    // }

    // function resetMapVars() {
    //     // reset certain standard variables
    //     mapContainerSize = {w: mapContainerReg.clientWidth, h: mapContainerReg.clientHeight};
    //     mapContainerInitialW = mapContainerSize.w;
    //     mediaContainerInitialW = mediaContainerReg.clientWidth;
    //     centeredOffset = (mediaContainerReg.clientWidth - mapContainerReg.clientWidth) / 2;
    // }

    // function centerMap() {
    //     position = {x: 0, y: 0};
    //     scale = 1;
    //     resetMapVars();
    //     constrainMap();
    // }

    // // adjust map on resize
    // $(window).resize(function () {
    //     // reset the map to the center
    //     centerMap();
    //
    //     // TODO: when below a certain screen size (mobile), hide the map completely and have only the sidebar span the whole screen
    //
    // });

    // mediaContainer.mousedown(function (event) {
    //     if (!window.lockDrag) {
    //         dragging = true;
    //         mediaContainer.css("cursor", "grabbing");
    //
    //         startMouse.x = event.clientX;
    //         startMouse.y = event.clientY;
    //
    //         // different transition during panning
    //         mapContainerReg.style.transition = 'transform 0.03s';
    //     }
    // });
    //
    // $(document).mouseup(function () {
    //     if (!window.lockDrag) {
    //         dragging = false;
    //         mediaContainer.css("cursor", "grab");
    //
    //         previousMap.x = position.x;
    //         previousMap.y = position.y;
    //
    //         // add the zoom transition back
    //         mapContainerReg.style.transition = 'transform 0.2s';
    //
    //         // release map selection
    //         setTimeout(function allowLocationClick() {
    //             window.lockMapSelection = false;
    //         }, 80);
    //     }
    // });
    //
    // $(document).mousemove(function (event) {
    //     if (!window.lockDrag) {
    //         if (dragging) {
    //             // lock map selection clicks
    //             setTimeout(function allowLocationClick() {
    //                 window.lockMapSelection = true;
    //             }, 70);
    //
    //             currentMouse.x = event.clientX;
    //             currentMouse.y = event.clientY;
    //
    //             let moveX = currentMouse.x - startMouse.x;
    //             let moveY = currentMouse.y - startMouse.y;
    //
    //             position.x = moveX + previousMap.x;
    //             position.y = moveY + previousMap.y;
    //
    //             constrainMap();
    //         }
    //     }
    // });
    //
    // mediaContainerReg.addEventListener('wheel', (event) => {
    //     event.preventDefault();
    //     if (!dragging && !window.lockDrag) {
    //         // pointer position relative to
    //         pointer.x = event.pageX - mediaContainerReg.offsetLeft - centeredOffset;
    //         pointer.y = event.pageY - mediaContainerReg.offsetTop;
    //
    //         target.x = (pointer.x - position.x) / scale;
    //         target.y = (pointer.y - position.y) / scale;
    //
    //         // determine the direction (which way the scroll delta is) and magnitude of the scale
    //         scale += -1 * Math.max(-1, Math.min(1, event.deltaY)) * speed * scale;
    //
    //         // limit the scale within a range
    //         const max_scale = 4;
    //         const min_scale = 1;
    //         scale = Math.max(min_scale, Math.min(max_scale, scale));
    //
    //         // calculate position for the image container using relative target with scale
    //         position.x = -target.x * scale + pointer.x;
    //         position.y = -target.y * scale + pointer.y;
    //
    //         // constrain the container edges when zooming
    //         constrainMap();
    //
    //         // set variables for panning
    //         previousMap.x = position.x;
    //         previousMap.y = position.y;
    //     }
    // });
    //}


    /*
    *
    * Map Controls
    *
    * */

    // function setupMapControls() {
    //     // formerly dropdown and menu jquery selector here
    //
    //     const mapLayerNorth1st = $("#map-layer-north-1st");
    //     const mapLayerNorth2nd = $("#map-layer-north-2nd");
    //     const mapLayerNorth3rd = $("#map-layer-north-3rd");
    //     const mapLayerSouth1st = $("#map-layer-south-1st");
    //     const mapLayerSouth2nd = $("#map-layer-south-2nd");
    //     const mapLayerOutside = $("#map-layer-outside");
    //
    //     const mapLayerMenuNorth1st = $("#map-layer-menu-north-1st");
    //     const mapLayerMenuNorth2nd = $("#map-layer-menu-north-2nd");
    //     const mapLayerMenuNorth3rd = $("#map-layer-menu-north-3rd");
    //     const mapLayerMenuSouth1st = $("#map-layer-menu-south-1st");
    //     const mapLayerMenuSouth2nd = $("#map-layer-menu-south-2nd");
    //     const mapLayerMenuOutside = $("#map-layer-menu-outside");
    //
    //     const mapLayerMenuTitles = ["North 1st Floor", "North 2nd Floor", "North 3rd Floor", "South 1st Floor", "South 2nd Floor", "Outside"];
    //     let currentMapLayer = mapLayerNorth2nd;
    //     let currentBuilding = 1; // 1 = north, 2 = south, 3 = outside
    //
    //     // TODO: fix map drag allowed if you drag and release within the layer menu
    //     mapLayerMenuDropdown.hover(
    //         function () { // enter element
    //             if (!dragging) {
    //                 window.lockDrag = true;
    //             }
    //         }, function () { // leave element
    //             window.lockDrag = false;
    //         }
    //     );
    //
    //     mapLayerMenu.hover(
    //         function () { // enter element
    //             if (!dragging) {
    //                 window.lockDrag = true;
    //             }
    //         }, function () { // leave element
    //             window.lockDrag = false;
    //         }
    //     );
    //
    //     mapLayerMenuDropdown.click(function () {
    //         mapLayerMenu.toggleClass("hidden");
    //     });
    //
    //     mapLayerMenuNorth1st.click(function () {
    //         switchMapLayers(mapLayerNorth1st, 1, 0);
    //     });
    //
    //     mapLayerMenuNorth2nd.click(function () {
    //         switchMapLayers(mapLayerNorth2nd, 1, 1);
    //     });
    //
    //     mapLayerMenuNorth3rd.click(function () {
    //         switchMapLayers(mapLayerNorth3rd, 1, 2);
    //     });
    //
    //     mapLayerMenuSouth1st.click(function () {
    //         switchMapLayers(mapLayerSouth1st, 2, 3);
    //     });
    //
    //     mapLayerMenuSouth2nd.click(function () {
    //         switchMapLayers(mapLayerSouth2nd, 2, 4);
    //     });
    //
    //     mapLayerMenuOutside.click(function () {
    //         switchMapLayers(mapLayerOutside, 3, 5);
    //     });
    //
    //     function switchMapLayers(targetMapLayer, targetBuilding, title) {
    //         if (currentMapLayer !== targetMapLayer) {
    //             mapLayerMenuDropdown.text(mapLayerMenuTitles[title]);
    //             currentMapLayer.toggleClass("hidden");
    //             targetMapLayer.toggleClass("hidden");
    //
    //             if (targetBuilding !== currentBuilding) {
    //                 centerMap();
    //             }
    //
    //             currentBuilding = targetBuilding;
    //             currentMapLayer = targetMapLayer;
    //         }
    //     }
    // }


    /*
    *
    * 360 Viewer
    *
    * */

    // Add Pannellum viewer to each sidebar option
    // function addPannellumClick(filenameArray, selectionIDArray, locationArray, section) { // TODO: fix the offsetting when skipping the 360videos
    //     let filenameOffset = 0;
    //     let locationArrayOffset = 0;
    //     let specialProperty = null;
    //     let counter = 0;
    //     let counting = false;
    //
    //     let video360Counter = 0;
    //
    //     if (section === 1) {
    //         for (let i = 0; i < selectionIDArray.length; i++) {
    //
    //             // if (locationArray[i + 1 - locationArrayOffset][1] === "360Video") {
    //             //     video360Counter++;
    //             // }
    //
    //             // use variables to offset the array's indexing
    //             specialProperty = locationArray[i + 1 - locationArrayOffset /*+ video360Counter*/][1];
    //
    //             // if (counting) {
    //             //     counter++;
    //             // }
    //
    //             if (counting) {
    //                 locationArrayOffset++;
    //                 // counter = 0;
    //                 counting = false;
    //             }
    //
    //             // grab the variable filenameOffset each iteration for each click function and pass it into the function as index variable
    //             (function (index) {
    //                 $(`#${selectionIDArray[i]}`).click(function () {
    //                     // let test1 = (selectionIDArray[i]);
    //                     // let test2 = (i + 1 - index);
    //                     // let test3 = (filenameArray[(i + 1 - index)]);
    //                     // console.log(test1, test2, test3);
    //
    //                     let content360 = filenameArray[(i + 1 - index)];
    //
    //                     // hide necessary elements, lock map and reveal the 360 viewer container
    //                     mapLayerMenuDropdown.addClass("hidden");
    //                     mapLayerMenu.addClass("hidden");
    //                     mapContainer.addClass("hidden");
    //                     viewer360Container.removeClass("hidden");
    //                     exit360Viewer.removeClass("hidden");
    //                     window.lockDrag = true;
    //
    //                     // check if there's an existing viewer already, if so destroy it
    //                     if (typeof viewer360 !== "undefined") {
    //                         viewer360.destroy();
    //                     }
    //
    //                     viewer360 = pannellum.viewer('viewer-360-container', {
    //                         "type": "equirectangular",
    //                         "panorama": `test-media/${content360}`,
    //                         "friction": 0.1,
    //                         "autoLoad": true,
    //                         "compass": false,
    //                         "keyboardZoom": false,
    //                         "disableKeyboardCtrl": true
    //                     });
    //                 });
    //             })(filenameOffset)
    //
    //             if (/^[1-9]\d*$/.test(specialProperty)) {
    //                 filenameOffset++;
    //                 counting = true;
    //             }
    //         }
    //     }
    //
    //     exit360Viewer.click(function () {
    //         close360Viewer();
    //     });
    //
    //     $(document).keyup(function (e) { // right now this is firing always on the virtual tour page
    //         if (e.key === "Escape") {
    //             close360Viewer();
    //         }
    //     });
    //
    //     function close360Viewer() {
    //         // hide the 360 viewer container, back to map button, and reveal + unlock map
    //         mapLayerMenuDropdown.removeClass("hidden");
    //         mapContainer.removeClass("hidden");
    //         viewer360Container.addClass("hidden");
    //         exit360Viewer.addClass("hidden");
    //         // FIXME: discrepancy using hidden and hidden-opacity-360video for my 360 containers
    //
    //         viewer360Container.css("z-index", 1);
    //         viewer360ContainerSecondary.css("z-index", 0);
    //
    //         window.lockDrag = false;
    //
    //         resetMapVars();
    //         constrainMap();
    //
    //         // close the viewer renderer
    //         if (typeof viewer360 !== "undefined") {
    //             viewer360.destroy();
    //         }
    //         if (typeof viewer360Secondary !== "undefined") {
    //             viewer360Secondary.destroy();
    //         }
    //     }
    //
    // }


// });

