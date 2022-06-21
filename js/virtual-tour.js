/*
    Use this js script for custom js within the virtual tour page that are unused or conflict with other general page functions
*/

$(document).ready(function () {

    /* Variables Used Throughout */
    window.lockDrag = false;
    window.lockMapSelection = false;
    let viewer360 = undefined;

    const viewer360Container = $("#viewer-360-container");
    const exit360Viewer = $("#exit-360-viewer");
    const mapContainer = $("#map-container");

    // TODO: DECIDE ABOUT HOW TO HIDE OTHER FLOORS AND BUILDINGS MAPS. SETUP ITS VIEWING NAVIGATION HERE BEFORE DOING INLINE SVG?
    // need to take performance into account? new css classes for hiding them

    /*
    *
    * Replace SVG with inline SVG
    *
    * */
    let injectedSVG = false;
    jQuery('img.svg').each(function(){
        const $img = jQuery(this);
        const imgID = $img.attr('id');
        const imgClass = $img.attr('class');
        const imgURL = $img.attr('src');

        jQuery.get(imgURL, function(data) {
            // Get the SVG tag, ignore the rest
            let $svg = jQuery(data).find('svg');

            // Add replaced image's ID to the new SVG
            if(typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
            if(typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass+' replaced-svg');
            }

            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');

            // Replace image with new SVG
            $img.replaceWith($svg);

            // add map selection links
            jQuery.get("./csv/north-locations-filenames.csv", function(data) {
                addMapLinks($.csv.toArrays(data));
            }, 'text');

            // TODO: PUT SOUTH AND OUTSIDE FILENAMES LIST HERE TOO

            // center map when svg is finished fully loading
            centerMap();

        }, 'xml');

    });


    /*
    *
    * Generate Sidebar Locations List
    *
    * */
    const northLocationMenu = $("#north-location-menu");
    const southLocationMenu = "";
    const outsideLocationMenu = "";

    // Create arrays for locations, inject them
    jQuery.get("./csv/north-locations-list.csv", function(data) {
        sidebarInjection($.csv.toArrays(data), 1);
    }, 'text');

    jQuery.get("./csv/south-locations-list.csv", function(data) {
        sidebarInjection($.csv.toArrays(data), 2);
    }, 'text');

    jQuery.get("./csv/outside-locations-list.csv", function(data) {
        sidebarInjection($.csv.toArrays(data), 3);
    }, 'text');

    let injectionString = "";
    let selectionIDArray = [];

    function sidebarInjection(locationArray, section) {
        let sectionID;

        // Define section ID to be appended to
        if (section === 1) {
            sectionID = northLocationMenu;
        } else if (section === 2) {
            sectionID = southLocationMenu;
        } else {
            sectionID = outsideLocationMenu;
        }

        // make sure it doesnt break in case sectionID has nothing
        if (sectionID.length) {

            for (let i = 1; i < locationArray.length; i ++) {
                let locationName = locationArray[i][0];
                // only use the following variables if multiple location images
                let cutLocationName = locationName.substring(0, locationName.length-2);
                let specialProperty = locationArray[i][1];

                /* Check if the special property is decimal using regex
                * "" - normal
                * */
                if (/\d/.test(specialProperty)) {
                    // inject a sidebar button with a specific format title and id
                    let locationNameID = locationName.substring(0, locationName.length-2).replaceAll(" ", "-").toLowerCase();
                    selectionIDArray.push(locationNameID);
                    injectionString = `<li class="sidebar-list-2"><a href="#" class="dropdown-btn" id="${locationNameID}">${cutLocationName}</\a><ul class="dropdown-container">`;

                    // keep adding sidebar entries given by the number of location images (defined by specialProperty)
                    for (let k = 0; k < parseInt(specialProperty); k ++) {
                        locationNameID = locationName.substring(0, locationName.length-2).replaceAll(" ", "-").toLowerCase() + (k+1);
                        selectionIDArray.push(locationNameID);
                        injectionString += `<li class="sidebar-list-3"><a href="#" id="${locationNameID}">Image ` + (k+1) + '</\a>';
                    }

                    sectionID.append(injectionString);
                    i += parseInt(specialProperty) - 1;
                } else {
                    // normal sidebar button injection
                    let locationNameID = locationName.replaceAll(" ", "-").toLowerCase();
                    selectionIDArray.push(locationNameID);
                    sectionID.append(`<li class="sidebar-list-2"><a href="#" id="${locationNameID}">${locationName}</\a></\li>`);
                }
            }

            // complete the functional sidebar by adding dropdowns and pannellum connections
            addDropdownClick();
            jQuery.get("./csv/north-locations-filenames.csv", function(data) {
                addPannellumClick($.csv.toArrays(data), selectionIDArray, locationArray, section);
            }, 'text');
        }
    }


    /*
    *
    * Add Links to Map Locations
    *
    * */
    function addMapLinks(filenameArray) {
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
        //addHallwayMapsLinks();

        // this for loop starts at 4 because it ignores the header and hallway entries (which are handled manually above?)
        for (let i = 4; i < filenameArray.length; i++) {
            // console.log(typeof filenameArray[i]);

            // set the way the map ID is formatted
            let mapIDName = $(`#${filenameArray[i].toString().split(".")[0] + "_Web"}`); // TODO: REMOVE THE WEB SUFFIX HERE BECAUSE THE FINAL CSV LIST WILL INCLUDE IT

            // check if the map selection exists
            if (mapIDName.length) {
                // elementOffset --;
                mapIDName.addClass("location"); // add css class that gives the hover effect
                (function (index) { // assumption: index is not used here because location multiple photos are ignored for the map clicks
                    mapIDName.click(function () {
                        if (!window.lockMapSelection) {
                            // document.getElementById(selectionIDArrayTop[i].attr("id")).scrollIntoView();
                            // console.log(selectionIDArrayTop[i - index]);

                            let content360 = filenameArray[i];

                            // hide + lock map and reveal the 360 viewer container
                            mapContainer.addClass("hidden");
                            viewer360Container.removeClass("hidden");
                            exit360Viewer.removeClass("hidden");
                            window.lockDrag = true;

                            // check if there's an existing viewer already, if so destroy it
                            if (typeof viewer360 !== "undefined") {
                                viewer360.destroy();
                            }

                            viewer360 = pannellum.viewer('viewer-360-container', {
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



    /*
    *
    * Add Hallway Links to Map Locations
    *
    * */
    function addHallwayMapsLinks() {
        
    }



    /*
    *
    * Sidebar Search
    *
    * */
    const searchBarReg = document.getElementById("search-bar");

    // filter the search results on key up events
    searchBarReg.addEventListener("keyup", function (e) {
        filterSearchElements(document.getElementById("north-location-menu"));
        filterSearchElements(document.getElementById("south-location-menu"));
        filterSearchElements(document.getElementById("outside-location-menu"));
    });

    // repetitive search filtering for the different location areas
    function filterSearchElements (ul) {
        // setup variables
        let filter = searchBarReg.value.toUpperCase();
        let li = ul.getElementsByClassName("sidebar-list-2");

        // loop through all list items, and hide those who don't match the search query
        for (let i = 0; i < li.length; i ++) {
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



    /*
    *
    * Sidebar Dropdown Individual Click Events
    *
    * */
    function addDropdownClick() {
        let dropdown = $(".dropdown-btn");

        for (let i = 0; i < dropdown.length; i++) {
            // open all dropdowns
            // dropdown[i].classList.add("active");

            // close all dropdowns initially
            let dropdownContent = dropdown[i].nextElementSibling;
            dropdownContent.style.display = "none"

            // setup dropdown toggle
            dropdown[i].addEventListener("click", function() {
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


    /*
    *
    * Draggable Map
    *
    *  */
    // TODO: fix when the map is smaller than the media container (maybe use another container around the map image?), allow the map to be centered
    let dragging = false;
    let startMouseX;
    let startMouseY;
    let currentMouseX;
    let currentMouseY;
    let previousMapX = 0;
    let previousMapY = 0;
    const position = { x: 0, y: 0, offsetX: 0, offsetY: 0, centeredX: 0 }

    const mediaContainer = $("#media-container");
    const mapContainerReg = document.getElementById("map-container");
    const mediaContainerReg = document.getElementById("media-container");

    if (mapContainer.length) {
        // center map on load
        function centerMap () {
            position.centeredX = (mediaContainer.outerWidth() - mapContainer.outerWidth()) / 2

            mapContainerReg.style.transform = `translate(${position.centeredX}px, 0px)`;
            previousMapX = position.centeredX;
            // previousMapX = parseFloat(mapContainer.css("left").split("px"));
        }

        // click and drag implementation
        mediaContainer.mousedown(function (event) {
            dragging = true;

            mediaContainer.css("cursor", "grabbing");

            startMouseX = event.clientX;
            startMouseY = event.clientY;

            // console.log(window.lockMapSelection)
        });

        $(document).mouseup(function () { /*mediaContainer*/
            dragging = false;

            mediaContainer.css("cursor", "grab");

            // previousMapX = parseFloat(mapContainer.css("left").split("px"));
            // previousMapY = parseFloat(mapContainer.css("top").split("px"));

            previousMapX = position.x;
            previousMapY = position.y;

            // release map selection
            setTimeout(function allowLocationClick(){
                window.lockMapSelection = false;
            }, 80);
        });

        $(document).mousemove(function (event) {
            if (!window.lockDrag) {
                if (dragging) {
                    // lock map selection clicks
                    setTimeout(function allowLocationClick(){
                        window.lockMapSelection = true;
                    }, 70);

                    // setTimeout(function allowLocationClick() {
                    //     lockDrag = true;
                    // }, 50);
                    let maxNegLeft = mediaContainer.width() - mapContainer.outerWidth();
                    let maxNegTop = mediaContainer.height() - mapContainer.outerHeight();

                    currentMouseX = event.clientX;
                    currentMouseY = event.clientY;

                    let moveX = currentMouseX - startMouseX;
                    let moveY = currentMouseY - startMouseY;

                    position.x = moveX + previousMapX;
                    position.y = moveY + previousMapY;

                    if (mapContainerReg.getBoundingClientRect().width > mediaContainerReg.getBoundingClientRect().width) {
                    position.offsetX = (mapContainerReg.getBoundingClientRect().width - mediaContainerReg.getBoundingClientRect().width) / 2;
                        if (position.x > position.offsetX + position.centeredX) {
                            position.x = position.offsetX + position.centeredX;
                            // mapContainer.css("left", "0");
                        } else if (position.x < position.centeredX - position.offsetX) {
                            position.x = position.centeredX - position.offsetX;
                            // mapContainer.css("left", maxNegLeft);
                        } else {
                            // mapContainer.css("left", positionx);
                        }
                    } else {
                        position.x = previousMapX;
                    }

                    if (mapContainerReg.getBoundingClientRect().height > mediaContainerReg.getBoundingClientRect().height) {
                    position.offsetY = (mapContainerReg.getBoundingClientRect().height - mediaContainerReg.getBoundingClientRect().height) / 2;
                        if (position.y > position.offsetY) {
                            position.y = position.offsetY;
                            // mapContainer.css("top", "0");
                        } else if (position.y < -position.offsetY) {
                            position.y = -position.offsetY;
                            // mapContainer.css("top", maxNegTop);
                        } else {
                            // mapContainer.css("top", position.y);
                        }
                    } else {
                        position.y = previousMapY;
                    }

                    let previousTransform = "";
                    let newTransform = "";
                    const regexTranslate = /translate\(.*x\)/; // regex for finding the transform translate()

                    // get the previous transform values
                    previousTransform = mapContainerReg.style.transform;

                    // if there's already an existing translate() value, replace it
                    if (regexTranslate.test(previousTransform)) {
                        newTransform = previousTransform.replace(regexTranslate,`translate(${position.x}px, ${position.y}px)`);
                    } else {
                        newTransform = previousTransform + `translate(${position.x}px, ${position.y}px)`;
                    }

                    // set the new transform value to the element
                    mapContainerReg.style.transform = newTransform;

                }
            }
        });

        // zoom implementation
        // TODO: finish zoom function (rn its taking over the sidebar width) and maybe smooth out the animation
        let scale = 1;
        let currentZoomFactor = 1;
        let previousTransform = "";
        let newTransform = "";
        const regexScale = /scale\(.*\)/; // regex for finding the transform scale()

        mediaContainer.on("wheel", function (event) {

            if (event.originalEvent.deltaY < 0) {
                if (currentZoomFactor < 11) {
                    currentZoomFactor++;
                    scale = 0.75 + (0.25 * currentZoomFactor);
                    // mapContainer.css("transform",`scale(${scale})`);

                    // if (parseFloat(mapContainer.css("width").split("%")) > parseFloat(mediaContainer.css("width").split("px"))) {
                    //     // mapContainer.css("left", 0);
                    //     // mapContainer.css("transform", "none");
                    // }
                }
            } else {
                if (currentZoomFactor > 1) {
                    currentZoomFactor--;
                    scale = 0.75 + (0.25 * currentZoomFactor);

                    // if ()
                    // mapContainer.css("transform",`scale(${scale})`);

                    // if (parseFloat(mapContainer.css("width").split("%")) <= parseFloat(mediaContainer.css("width").split("px"))) {
                        // mapContainer.css("left", "50%");
                        // mapContainer.css("transform", "translate(-50%, 0)");
                    // }
                }

            }

            // get the previous transform values
            previousTransform = mapContainerReg.style.transform;

            // if there's already an existing scale() value, replace it
            if (regexScale.test(previousTransform)) {
                newTransform = previousTransform.replace(regexScale,`scale(${scale})`);
            } else {
                newTransform = previousTransform + `scale(${scale})`;
            }

            // set the new transform value to the element
            mapContainerReg.style.transform = newTransform;

        });
    }


    /*
    *
    * 360 Viewer
    *
    * */
    // Add Pannellum viewer to each sidebar option
    function addPannellumClick(filenameArray, selectionIDArray, locationArray, section) {
        let filenameOffset = 0;
        let locationArrayOffset = 0;
        let specialProperty = null;
        let counter = 0;
        let counting = false;


        if (section === 1) {
            for (let i = 0; i < selectionIDArray.length; i ++) {

                // use variables to offset the array's indexing
                specialProperty = locationArray[i + 1 - locationArrayOffset][1];

                if (counting) {
                    counter++;
                }

                if (counter === 1) {
                    locationArrayOffset ++;
                    counter = 0;
                    counting = false;
                }

                // grab the variable filenameOffset each iteration for each click function
                (function (index) {
                    $(`#${selectionIDArray[i]}`).click(function () {
                        // let test1 = (selectionIDArray[i]);
                        // let test2 = (i + 1 - index);
                        // let test3 = (filenameArray[(i + 1 - index)]);
                        // console.log(test1, test2, test3);

                        let content360 = filenameArray[(i + 1 - index)];

                        // hide + lock map and reveal the 360 viewer container
                        mapContainer.addClass("hidden");
                        viewer360Container.removeClass("hidden");
                        exit360Viewer.removeClass("hidden");
                        window.lockDrag = true;

                        // check if there's an existing viewer already, if so destroy it
                        if (typeof viewer360 !== "undefined") {
                            viewer360.destroy();
                        }

                        viewer360 = pannellum.viewer('viewer-360-container', {
                            "type": "equirectangular",
                            "panorama": `test-media/${content360}`,
                            "friction": 0.1,
                            "autoLoad": true,
                            "compass": false,
                            "keyboardZoom": false,
                            "disableKeyboardCtrl": true
                        });
                    });
                })(filenameOffset)

                if (/\d/.test(specialProperty)) {
                    filenameOffset ++;
                    counting = true;
                }
            }
        }

        exit360Viewer.click(function () {
            // hide the 360 viewer container, back to map button, and reveal + unlock map
            mapContainer.removeClass("hidden");
            viewer360Container.addClass("hidden");
            exit360Viewer.addClass("hidden");
            window.lockDrag = false;

            // close the viewer renderer
            if (typeof viewer360 !== "undefined") {
                viewer360.destroy();
            }
        });

    }


});

