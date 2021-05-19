/*
    Use this js script for custom js within the "media" pages (virtual tour, gallery) that are unused or conflict with other general page functions
*/

$(document).ready(function () {

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
        loc = document.getElementById("location-list").getElementsByClassName("loc");
        locContainer = document.getElementById("location-list").getElementsByClassName("sidebar-list-1");

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

    if  ($(schoolMap).length) {
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
            "panorama": "test-media/Room212_360Photo.JPG",
            "autoLoad": true
        });
    });


});