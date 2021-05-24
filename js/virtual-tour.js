/*
    Use this js script for custom js within the virtual tour page that are unused or conflict with other general page functions
*/

$(document).ready(function () {

    /* Variables Used Throughout */
    let noDrag = true;

    /*
    *
    * Replace SVG with inline SVG
    *
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
            addMapLinks();

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

    function sidebarInjection(inputArray, section) {
        let sectionID;

        if (section === 1) {
            sectionID = northLocationMenu;
        } else if (section === 2) {
            sectionID = southLocationMenu;
        } else {
            sectionID = outsideLocationMenu;
        }

        if (sectionID.length) {
            let selectionIDArray = [];
            for (let i = 1; i < inputArray.length; i ++) {
                let locationName = inputArray[i][0];
                let cutLocationName = locationName.substring(0, locationName.length-2);
                let specialProperty = inputArray[i][1];

                if (specialProperty === "") {
                    let locationNameID = locationName.replaceAll(" ", "-").toLowerCase();
                    selectionIDArray.push(locationNameID);
                    sectionID.append(`<li class="sidebar-list-2"><a href="#" id="${locationNameID}">${locationName}</\a></\li>`);
                } else if (specialProperty === "multi-room") {
                    let locationNameID = locationName.replaceAll(" ", "-").toLowerCase();
                    selectionIDArray.push(locationNameID);
                    sectionID.append(`<li class="sidebar-list-2"><a href="#" id="${locationNameID}">${locationName}</\a></\li>`);
                } else {
                    let locationNameID = locationName.substring(0, locationName.length-2).replaceAll(" ", "-").toLowerCase();
                    selectionIDArray.push(locationNameID);
                    injectionString = `<li class="sidebar-list-2"><a href="#" class="dropdown-btn" id="${locationNameID}">${cutLocationName}</\a><ul class="dropdown-container">`;

                    for (let k = 0; k < parseInt(specialProperty); k ++) {
                        locationNameID = locationName.substring(0, locationName.length-2).replaceAll(" ", "-").toLowerCase() + (k+1);
                        injectionString += `<li class="sidebar-list-3"><a href="#" id="${locationNameID}">Image`  + (k+1) + '</\a>';
                    }

                    sectionID.append(injectionString);
                    i += parseInt(specialProperty) - 1;
                }
            }
            addDropdownClick();
            jQuery.get("./csv/north-locations-filenames.csv", function(data) {
                addPannellumClick($.csv.toArrays(data), selectionIDArray, section);
            }, 'text');
        }
    }


    /*
    *
    * Add Links to Map Locations
    *
    * */
    function addMapLinks() {
            const test = $("#test-inside");
            const test2 = $("#test-inside2");
            test.click(function () {
                console.log("click triggered");
                if (noDrag) {
                    window.alert("it freaking works");
                }
            });
            test2.click(function () {
                window.alert("this one also works!!");
            });
    }



    /* Sidebar */
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
                var cls = this.getElementsByClassName("svg-inline--fa")[0].classList;
                if (cls.contains("fa-angle-down")) {
                    cls.add("fa-angle-up");
                    cls.remove("fa-angle-down");
                }
                else if (cls.contains("fa-angle-up")) {
                    cls.add("fa-angle-down");
                    cls.remove("fa-angle-up");
                }
            });
        }
    }


    /* Draggable Map */
    // TODO: fix when the map is smaller than the media container (maybe use another container around the map image?), allow the map to be centered
    let dragging = false;
    let startMouseX;
    let startMouseY;
    let currentMouseX;
    let currentMouseY;
    let previousMapLeft;
    let previousMapTop;

    const mediaContainer = $("#media-container");
    const schoolMap = $("#school-map");

    if  (schoolMap.length) {
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

            previousMapLeft = parseFloat(schoolMap.css("left").split("px"));
            previousMapTop = parseFloat(schoolMap.css("top").split("px"));

            setTimeout(function allowLocationClick(){
                noDrag = true;
            }, 20);
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
            if (dragging) {
                setTimeout(function allowLocationClick(){
                    noDrag = false;
                }, 50);
                currentMouseX = event.clientX;
                currentMouseY = event.clientY;
                // console.log(currentMouseX, startMouseX);

                let moveX = currentMouseX - startMouseX;
                let moveY = currentMouseY - startMouseY;

                let newX = moveX + previousMapLeft;
                let newY = moveY + previousMapTop;

                let maxNegLeft = mediaContainer.width() - schoolMap.outerWidth();
                let maxNegTop = mediaContainer.height() - schoolMap.outerHeight();

                if (schoolMap.outerWidth() > mediaContainer.width()) {
                    if (newX > 0) {
                        schoolMap.css("left", "0");
                    } else if (newX < maxNegLeft) {
                        schoolMap.css("left", maxNegLeft);
                    } else {
                        schoolMap.css("left", newX);
                    }
                } else {

                }

                if (schoolMap.outerHeight() > mediaContainer.height()) {
                    if (newY > 0) {
                        schoolMap.css("top", "0");
                    } else if (newY < maxNegTop) {
                        schoolMap.css("top", maxNegTop);
                    } else {
                        schoolMap.css("top", newY);
                    }
                } else {

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
                if (currentZoomFactor < 7) {
                    currentZoomFactor++;
                    zoomPercent = 75 + (25 * currentZoomFactor);
                    schoolMap.css("height", zoomPercent + "%");
                    // schoolMap.animate({height: zoomPercent + "%"}, 120);

                    if (parseFloat(schoolMap.css("width").split("%")) > parseFloat(mediaContainer.css("width").split("px"))) {
                        schoolMap.css("left", 0);
                        schoolMap.css("transform", "none");
                    }
                }

            } else {
                if (currentZoomFactor > 1) {
                    currentZoomFactor--;
                    zoomPercent = 75 + (25 * currentZoomFactor);
                    schoolMap.css("height", zoomPercent + "%");
                    // schoolMap.animate({height: zoomPercent + "%"}, 120);

                    if (parseFloat(schoolMap.css("width").split("%")) <= parseFloat(mediaContainer.css("width").split("px"))) {
                        schoolMap.css("left", "50%");
                        schoolMap.css("transform", "translate(-50%, 0)");
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

    function addPannellumClick(filenameArray, selectionIDArray, section) {
            if (section === 1) {
                for (let i = 0; i < selectionIDArray.length; i ++) {
                    $(`#${selectionIDArray[i]}`).click(function () {
                        console.log(selectionIDArray[i]);
                        console.log(filenameArray[i + 1]);

                        // pannellum.viewer('media-container', {
                        //     "type": "equirectangular",
                        //     "panorama": `test-media/${selectionIDArray[i]}`,
                        //     "autoLoad": true
                        // });
                    });
                }

            } else if (section === 2) {

            }
    }

    $("#north-gym").click(function () {
        pannellum.viewer('media-container', {
            "type": "equirectangular",
            "panorama": "test-media/North_Gym_360Photo_1.JPG",
            "autoLoad": true
        });
    });

    $("#room-212").click(function () {
        pannellum.viewer('media-container', {
            "type": "equirectangular",
            "panorama": "test-media/Room211_360Photo copy.JPG",
            "autoLoad": true
        });
    });


});