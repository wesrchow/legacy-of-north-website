/*
    Use this js script for custom js within the virtual tour page that are unused or conflict with other general page functions
*/

$(document).ready(function () {

    /* Variables Used Throughout */
    let noDrag = true;

    /* Replace SVG with inline SVG */
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

    /* Generate Sidebar Locations List */
    const northLocationMenu = $("#north-location-menu");
    const northLocationsList = ["1st Floor Hallway",
        "2nd Floor Hallway",
        "3rd Floor Hallway",
        "3rd Floor North Staffroom 1",
        "3rd Floor North Staffroom 2",
        "3rd Floor North Staffroom 3",
        "3rd Floor North Staffroom 4",
        "400Wing Back Storage 1",
        "400Wing Back Storage 2",
        "400Wing Back Storage 3",
        "400Wing Staffroom",
        "400Wing Tech Ed Hallway 1",
        "400Wing Tech Ed Hallway 2",
        "400Wing Tech Ed Hallway 3",
        "Auto Shop Center Room1",
        "Auto Shop Center Room2",
        "Aux Gym 1",
        "Aux Gym 2",
        "Aux Gym 3",
        "Aux Gym Equipment Room",
        "Aux Gym Hallway",
        "Band Room Hallway 1",
        "Band Room Hallway 2",
        "Band Room Hallway 3",
        "Black Room 1",
        "Black Room 2",
        "Commentary Box",
        "Drama Studio 1",
        "Drama Studio 2",
        "Drama Studio 3",
        "Drama Studio 4",
        "Drama Studio 5",
        "Drama Studio 6",
        "Drama Studio 7",
        "Drama Studio 8",
        "Drama Studio 9",
        "Drama Studio 10",
        "Drama Studio Hallway",
        "Gallery 1",
        "Gallery 2",
        "Left Stage Stairs 1",
        "Left Stage Stairs 2",
        "Math Resource 1",
        "Math Resource 2",
        "Media Room Hallway",
        "North Foyer",
        "North Bleachers 1",
        "North Bleachers 2",
        "North Boys Changeroom",
        "North Cafeteria 1",
        "North Cafeteria 2",
        "North Cafeteria 3",
        "North Cafeteria 4",
        "North Girls Changeroom",
        "North Gym 1",
        "North Gym 2",
        "North Gym 3",
        "North Gym 4",
        "North Gym Equipment Room1 1",
        "North Gym Equipment Room1 2",
        "North Gym Equipment Room2",
        "North Gym Equipment Room3",
        "North Gym Stage 1",
        "North Gym Stage 2",
        "North Gym Stage 3",
        "North Gym Stage 4",
        "North Gym Stage 5",
        "North Gym Stage 6",
        "North Gym Stage 7",
        "North Gym Stage 8",
        "North School Store 1",
        "North School Store 2",
        "North Science Supply1 1",
        "North Science Supply1 2",
        "North Science Supply1 3",
        "North Science Supply1 4",
        "North Science Supply2",
        "North Science Supply3",
        "North Science Supply4",
        "North Stairway1 1",
        "North Stairway1 2",
        "North Stairway2 1",
        "North Stairway2 2",
        "North Stairway3 1",
        "North Stairway3 2",
        "North Stairway4 1",
        "North Stairway4 2",
        "North Stairway4 3",
        "North Stairway5",
        "Right Stage Stairs 1",
        "Right Stage Stairs 2",
        "Right Stage Stairs 3",
        "Room 101",
        "Room 103",
        "Room 105",
        "Room 107",
        "Room 108",
        "Room 109",
        "Room 110",
        "Room 111",
        "Room 112",
        "Room 113 1",
        "Room 113 2",
        "Room 114 1",
        "Room 114 2",
        "Room 115 1",
        "Room 115 2",
        "Room 115 3",
        "Room 115 4",
        "Room 116",
        "Room 116a",
        "Room 201",
        "Room 202",
        "Room 203",
        "Room 204",
        "Room 205",
        "Room 206",
        "Room 207",
        "Room 208 1",
        "Room 208 2",
        "Room 209",
        "Room 210",
        "Room 211",
        "Room 212",
        "Room 213",
        "Room 214 1",
        "Room 214 2",
        "Room 215",
        "Room 218 1",
        "Room 218 2",
        "Room 219",
        "Room 221 1",
        "Room 221 2",
        "Room 303",
        "Room 304 1",
        "Room 304 2",
        "Room 305",
        "Room 306",
        "Room 307",
        "Room 308",
        "Room 309 1",
        "Room 309 2",
        "Room 310 1",
        "Room 310 2",
        "Room 311",
        "Room 312 1",
        "Room 312 2",
        "Room 313",
        "Room 314",
        "Room 315 1",
        "Room 315 2",
        "Room 316",
        "Room 317",
        "Room 319",
        "Room 402 1",
        "Room 402 2",
        "Room 402 3",
        "Room 402 4",
        "Room 402 5",
        "Room 402 6",
        "Room 402 7",
        "Room 402 8",
        "Room 402 9",
        "Room 406 1",
        "Room 406 2",
        "Room 406 3",
        "Room 406 4",
        "Room 406 5",
        "Room 406 6",
        "Room 408",
        "Room 410 1",
        "Room 410 2",
        "Room 410 3",
        "Room 411 1",
        "Room 411 2",
        "Room 411 3",
        "Room 412 1",
        "Room 412 2",
        "Room 412 3",
        "Room 413 1",
        "Room 413 2",
        "Room 414 1",
        "Room 414 2",
        "Room 415 1",
        "Room 415 2",
        "Room 415 3",
        "Room 415 4",
        "Room 415 5",
        "Room 416 1",
        "Room 416 2",
        "School Clothing Store 1",
        "School Clothing Store 2",
        "Science Book Room",
        "Social Studies Resource Room 1",
        "Social Studies Resource Room 2",
        "Student Services 1",
        "Student Services 2",
        "Student Services 3",
        "Student Services 4",
        "Student Services 5",
        "The Dungeon 1",
        "The Dungeon 2",
        "Vision Services"];
    const southLocationsList = [];
    const outsideLocationsList = [];
    let cutLocationName = "";
    let previousLocation = "";
    let cutPreviousLocationName = "";
    let locationDisplayName = "";

    // if (northLocationMenu.length) {
    //     northLocationsList.forEach(injectMenuElements);
    //
    //     function injectMenuElements(value) {
    //         cutLocationName = value.charAt(value.length-2);
    //
    //         if (cutLocationName.localeCompare(" ") === 0) {
    //             if (value.localeCompare(previousLocation) === 0) {
    //
    //             } else {
    //                 locationDisplayName = value;
    //                 northLocationMenu.append('<li class="sidebar-list-2"><a href="#">' + locationDisplayName + '</\a></\li>');
    //                 previousLocation = value;
    //             }
    //
    //         }
    //         cutLocationName = value.substr(0,value.length-2);
    //
    //
    //
    //     }
    //
    // }


    /* Add Links to Map Locations */
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

    /* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content - This allows the user to have multiple dropdowns without any conflict */
    var dropdown = document.getElementsByClassName("dropdown-btn");
    var i;

    for (i = 0; i < dropdown.length; i++) {
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
                console.log("allowed map click");
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
                    console.log("allowed map click");
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

    /* 360 Viewer */
    const _360Viewer = $("#360-viewer");

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