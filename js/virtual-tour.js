/*
    Use this js script for custom js within the virtual tour page that are unused or conflict with other general page functions
*/

$(document).ready(function () {

    /* Generate Sidebar Locations List */
    const northLocationMenu = $("#north-location-menu");
    const northLocationsList = ["Room101_360Photo",
        "Room103_360Photo",
        "Room105_360Photo",
        "Room107_360Photo",
        "Room108_360Photo",
        "Room109_360Photo",
        "Room110_360Photo",
        "Room111_360Photo",
        "Room112_360Photo",
        "Room113_360Photo_1",
        "Room113_360Photo_2",
        "Room114_360Photo_1",
        "Room114_360Photo_2",
        "Room115_360Photo_1",
        "Room115_360Photo_2",
        "Room115_360Photo_3",
        "Room115_360Photo_4",
        "Room116a_360Photo",
        "Room116_360Photo",
        "Room201_360Photo",
        "Room202_360Photo",
        "Room203_360Photo",
        "Room204_360Photo",
        "Room205_360Photo",
        "Room206_360Photo",
        "Room207_360Photo",
        "Room208_360Photo_1",
        "Room208_360Photo_2",
        "Room209_360Photo",
        "Room210_360Photo",
        "Room211_360Photo",
        "Room212_360Photo",
        "Room213_360Photo",
        "Room214_360Photo_1",
        "Room214_360Photo_2",
        "Room215_360Photo",
        "Room218_360Photo_1",
        "Room218_360Photo_2",
        "Room219_360Photo",
        "Room221_360Photo_1",
        "Room221_360Photo_2",
        "Room402_360Photo_1",
        "Room402_360Photo_2",
        "Room402_360Photo_3",
        "Room402_360Photo_4",
        "Room402_360Photo_5",
        "Room402_360Photo_6",
        "Room402_360Photo_7",
        "Room402_360Photo_8",
        "Room402_360Photo_9",
        "Room406_360Photo_1",
        "Room406_360Photo_2",
        "Room406_360Photo_3",
        "Room406_360Photo_4",
        "Room406_360Photo_5",
        "Room406_360Photo_6",
        "Room408_360Photo",
        "Room410_360Photo_1",
        "Room410_360Photo_2",
        "Room410_360Photo_3"];
    let locationDisplayName = "";

    if (typeof (pannellum) === 'undefined') {document.write('<script src="local/pannellum.js"></\script>')}

    if (northLocationMenu.length) {
        northLocationsList.forEach(injectMenuElements);

        function injectMenuElements(value) {
            locationDisplayName = value.substr(0, value.indexOf("_360"))
            northLocationMenu.append('<li class="sidebar-list-2"><a href="#">' + locationDisplayName + '</\a></\li>');
        }

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

        const testImage = $("#test-img");
        const testImageOriginalTop = parseFloat(testImage.css("top").split("px"));
        const testImageOriginalLeft = parseFloat(testImage.css("left").split("px"));

        const testDiv = $("#map-click-test");
        const testDivOriginalTop = parseFloat(testDiv.css("top").split("px"));
        const testDivOriginalLeft = parseFloat(testDiv.css("left").split("px"));

        mediaContainer.on("wheel", function (event) {
            console.log(currentZoomFactor);
            if (event.originalEvent.deltaY < 0) {
                if (currentZoomFactor < 7) {
                    currentZoomFactor++;
                    zoomPercent = 75 + (25 * currentZoomFactor);
                    schoolMap.css("height", zoomPercent + "%");
                    // schoolMap.animate({height: zoomPercent + "%"}, 120);

                    newTop = testImageOriginalTop * (0.75 + ((25 * currentZoomFactor) * 0.01));
                    testImage.css("top", newTop + "px");
                    // testImage.animate({top: newTop + "px"}, 120);
                    newLeft = testImageOriginalLeft * (0.75 + ((25 * currentZoomFactor) * 0.01));
                    testImage.css("left", newLeft + "px");
                    // testImage.animate({left: newLeft + "px"}, 120);

                    newTop = testDivOriginalTop * (0.75 + ((25 * currentZoomFactor) * 0.01));
                    testDiv.css("top", newTop + "px");
                    // testImage.animate({top: newTop + "px"}, 120);
                    newLeft = testDivOriginalLeft * (0.75 + ((25 * currentZoomFactor) * 0.01));
                    testDiv.css("left", newLeft + "px");
                    // testImage.animate({left: newLeft + "px"}, 120);

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

                    newTop = testImageOriginalTop * (0.75 + ((25 * currentZoomFactor) * 0.01));
                    testImage.css("top", newTop + "px");
                    // testImage.animate({top: newTop + "px"}, 120);
                    newLeft = testImageOriginalLeft * (0.75 + ((25 * currentZoomFactor) * 0.01));
                    testImage.css("left", newLeft + "px");
                    // testImage.animate({left: newLeft + "px"}, 120);

                    newTop = testDivOriginalTop * (0.75 + ((25 * currentZoomFactor) * 0.01));
                    testDiv.css("top", newTop + "px");
                    // testImage.animate({top: newTop + "px"}, 120);
                    newLeft = testDivOriginalLeft * (0.75 + ((25 * currentZoomFactor) * 0.01));
                    testDiv.css("left", newLeft + "px");
                    // testImage.animate({left: newLeft + "px"}, 120);

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