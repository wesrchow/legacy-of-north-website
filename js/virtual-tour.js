/*
    DEPRECATED
*/

$(document).ready(function () {

    /* Variables Used Throughout */
    window.lockDrag = false;
    let viewer360 = undefined;

    const viewer360Container = $("#viewer-360-container");
    const exit360Viewer = $("#exit-360-viewer");
    const mapContainer = $("#map-container");

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
            jQuery.get("./csv/north-locations-filenames.csv", function(data) {
                addMapLinks($.csv.toArrays(data));
            }, 'text');

            // TODO: PUT SOUTH AND OUTSIDE FILENAMES LIST HERE TOO

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

        if (sectionID.length) {
            let selectionIDArray = [];
            for (let i = 1; i < locationArray.length; i ++) {
                let locationName = locationArray[i][0];
                let cutLocationName = locationName.substring(0, locationName.length-2);
                let specialProperty = locationArray[i][1];

                /* Check the special property
                * "" - normal
                * */
                if (/\d/.test(specialProperty)) {
                    let locationNameID = locationName.substring(0, locationName.length-2).replaceAll(" ", "-").toLowerCase();
                    selectionIDArray.push(locationNameID);
                    injectionString = `<li class="sidebar-list-2"><a href="#" class="dropdown-btn" id="${locationNameID}">${cutLocationName}</\a><ul class="dropdown-container">`;

                    for (let k = 0; k < parseInt(specialProperty); k ++) {
                        locationNameID = locationName.substring(0, locationName.length-2).replaceAll(" ", "-").toLowerCase() + (k+1);
                        selectionIDArray.push(locationNameID);
                        injectionString += `<li class="sidebar-list-3"><a href="#" id="${locationNameID}">Image ` + (k+1) + '</\a>';
                    }

                    sectionID.append(injectionString);
                    i += parseInt(specialProperty) - 1;
                } else {
                    let locationNameID = locationName.replaceAll(" ", "-").toLowerCase();
                    selectionIDArray.push(locationNameID);
                    sectionID.append(`<li class="sidebar-list-2"><a href="#" id="${locationNameID}">${locationName}</\a></\li>`);
                }
            }
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
        for (let i = 4; i < filenameArray.length; i ++) {
            // console.log(typeof filenameArray[i]);

            let mapIDName = $(`#${filenameArray[i].toString().split(".")[0] + "_Web"}`); // TODO: REMOVE THE WEB SUFFIX BECAUSE THE FINAL CSV LIST WILL INCLUDE IT

            if (mapIDName.length) {
                mapIDName.addClass("location");
                mapIDName.click(function () {

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
                });
            } else {
                // continue looping through filenames without doing anything
            }
        }

    }



    /*
    *
    * Sidebar Search
    *
    * */
    // $("#mobile-navbar-button").click(function () {
    //     const navbarLinks = $('#navbar-links');
    //
    //     navbarLinks.toggleClass('open');
    //     navbarLinks.children().toggleClass('open');
    // });

    function searchBar() {
        // Declare variables
        var input, filter, ul, li, loc, locContainer, a, i, j, k, txtValue;
        input = document.getElementById('searchBar');
        filter = input.value.toUpperCase();
        // ul = document.getElementById("location-list");
        // li = ul.getElementsByTagName('li');
        loc = document.getElementById("location-menu").getElementsByClassName("loc");
        locContainer = document.getElementById("location-menu").getElementsByClassName("sidebar-list-1");

        // Loop through all list items, and hide those who don't match the search query
        for (i = 0; i < loc.length; i++) {
            a = loc[i].getElementsByTagName("a")[0];
            txtValue = a.textContent || a.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                loc[i].style.display = "block";
                // Loop to keep opening folders
                var x = loc[i];
                while (x.parentElement !== null && x.parentElement.nodeName !== "DIV") {
                    x.parentElement.style.display = "block";
                    x = x.parentElement;
                }
            } else {
                loc[i].style.display = "none";
            }
        }

        // Loop through all location containers, hide those whose list items are no longer displaying
        for (j = 0; j < locContainer.length; j++) {
            li = locContainer[j].getElementsByClassName("loc");
            for (k = 0; k < li.length; k++) {
                if (li[k].style.display === "block") {
                    break;
                }
                if (k === li.length - 1) {
                    locContainer[j].style.display = "none";
                }
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
            dropdown[i].classList.add("active");
            dropdown[i].addEventListener("click", function() {
                this.classList.toggle("active");
                var dropdownContent = this.nextElementSibling;
                if (dropdownContent.style.display === "none") {
                    dropdownContent.style.display = "block";
                } else {
                    dropdownContent.style.display = "none";
                }
                // kind of terrible code but it works
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
    let previousMapLeft;
    let previousMapTop;

    const mediaContainer = $("#media-container");

    if (mapContainer.length) {
        // click and drag implementation
        mediaContainer.mousedown(function (event) {
            dragging = true;

            mediaContainer.css("cursor", "grabbing");

            startMouseX = event.clientX;
            startMouseY = event.clientY;
        });

        $(document).mouseup(function () { /*mediaContainer*/
            dragging = false;

            mediaContainer.css("cursor", "grab");

            previousMapLeft = parseFloat(mapContainer.css("left").split("px"));
            previousMapTop = parseFloat(mapContainer.css("top").split("px"));

            // setTimeout(function allowLocationClick(){
            //     lockDrag = false;
            // }, 20);
        });

        /* no longer need to deal with the mouse leaving the container because drag is now detected everywhere (even outside web window)*/
        // mediaContainer.mouseleave(function () {
        //     dragging = false;
        //
        //     mediaContainer.css("cursor", "grab");
        //
        //     previousMapLeft = parseFloat(schoolMap.css("left").split("px"));
        //     previousMapTop = parseFloat(schoolMap.css("top").split("px"));
        // })


            $(document).mousemove(function (event) {
                if (!window.lockDrag) {
                    if (dragging) {
                        // setTimeout(function allowLocationClick() {
                        //     lockDrag = true;
                        // }, 50);
                        currentMouseX = event.clientX;
                        currentMouseY = event.clientY;
                        // console.log(currentMouseX, startMouseX);

                        let moveX = currentMouseX - startMouseX;
                        let moveY = currentMouseY - startMouseY;

                        let newX = moveX + previousMapLeft;
                        let newY = moveY + previousMapTop;

                        let maxNegLeft = mediaContainer.width() - mapContainer.outerWidth();
                        let maxNegTop = mediaContainer.height() - mapContainer.outerHeight();

                        if (mapContainer.outerWidth() > mediaContainer.width()) {
                            if (newX > 0) {
                                mapContainer.css("left", "0");
                            } else if (newX < maxNegLeft) {
                                mapContainer.css("left", maxNegLeft);
                            } else {
                                mapContainer.css("left", newX);
                            }
                        } else {

                        }

                        if (mapContainer.outerHeight() > mediaContainer.height()) {
                            if (newY > 0) {
                                mapContainer.css("top", "0");
                            } else if (newY < maxNegTop) {
                                mapContainer.css("top", maxNegTop);
                            } else {
                                mapContainer.css("top", newY);
                            }
                        } else {

                        }

                    }
                }
            });

        // zoom implementation
        // TODO: finish zoom function (rn its taking over the sidebar width) and maybe smooth out the animation
        let maxZoomFactor = 5;
        let currentZoomFactor = 1;
        let zoomPercent = 0;
        let newTop = 0;
        let newLeft = 0;

        mediaContainer.on("wheel", function (event) {
            // console.log(currentZoomFactor);
            if (event.originalEvent.deltaY < 0) {
                if (currentZoomFactor < 11) {
                    currentZoomFactor++;
                    zoomPercent = 75 + (25 * currentZoomFactor);
                    mapContainer.css("height", zoomPercent + "%");
                    // schoolMap.animate({height: zoomPercent + "%"}, 120);

                    if (parseFloat(mapContainer.css("width").split("%")) > parseFloat(mediaContainer.css("width").split("px"))) {
                        mapContainer.css("left", 0);
                        mapContainer.css("transform", "none");
                    }
                }

            } else {
                if (currentZoomFactor > 1) {
                    currentZoomFactor--;
                    zoomPercent = 75 + (25 * currentZoomFactor);
                    mapContainer.css("height", zoomPercent + "%");
                    // schoolMap.animate({height: zoomPercent + "%"}, 120);

                    if (parseFloat(mapContainer.css("width").split("%")) <= parseFloat(mediaContainer.css("width").split("px"))) {
                        mapContainer.css("left", "50%");
                        mapContainer.css("transform", "translate(-50%, 0)");
                    }
                }

            }
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
                (function(index){
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
                        lockDrag = true;

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
            lockDrag = false;

            // close the viewer renderer
            if (typeof viewer360 !== "undefined") {
                viewer360.destroy();
            }
        });

    }


});