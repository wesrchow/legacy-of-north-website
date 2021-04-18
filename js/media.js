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
    var dragging = false;
    var startMouseX;
    var startMouseY;
    var currentMouseX;
    var currentMouseY;
    var previousMapLeft;
    var previousMapTop;

    const mediaContainer = $("#media-container");
    const schoolMap = $("#school-map");

    // click and drag implementation
    mediaContainer.mousedown(function (event) {
        dragging = true;

        mediaContainer.css("cursor","grabbing");

        startMouseX = event.clientX;
        startMouseY = event.clientY;
    });

    mediaContainer.mouseup(function () {
        dragging = false;

        mediaContainer.css("cursor", "grab");

        previousMapLeft = parseFloat(schoolMap.css("left").split("px"));
        previousMapTop = parseFloat(schoolMap.css("top").split("px"));
    });

    mediaContainer.mouseleave(function () {
        dragging = false;

        mediaContainer.css("cursor", "grab");

        previousMapLeft = parseFloat(schoolMap.css("left").split("px"));
        previousMapTop = parseFloat(schoolMap.css("top").split("px"));
    })

    mediaContainer.mousemove(function (event) {
        if (dragging) {
            currentMouseX = event.clientX;
            currentMouseY = event.clientY;
            // console.log(currentMouseX, startMouseX);

            var moveX = currentMouseX - startMouseX;
            var moveY = currentMouseY - startMouseY;

            var newX = moveX + previousMapLeft;
            var newY = moveY + previousMapTop;

            var maxNegLeft = mediaContainer.width() - schoolMap.width();
            var maxNegTop = mediaContainer.height() - schoolMap.height();

            if (newX > 0) {
                schoolMap.css("left", "0");
            } else if (newX < maxNegLeft) {
                schoolMap.css("left", maxNegLeft);
            }
            else {
                schoolMap.css("left", newX);
            }

            if (newY > 0) {
                schoolMap.css("top", "0");
            } else if (newY < maxNegTop) {
                schoolMap.css("top", maxNegTop);
            }
            else {
                schoolMap.css("top", newY);
            }
        }
    });

    // zoom implementation
    // TODO: finish zoom function (rn its taking over the sidebar width) and maybe smooth out the animation
    var maxZoomFactor = 5;
    var currentZoomFactor = 1;
    var zoomPercent = 0;

    mediaContainer.on("wheel", function (event) {
        console.log(currentZoomFactor);
        if(event.originalEvent.deltaY < 0) {
            if (currentZoomFactor < 5) {
                currentZoomFactor++;
                zoomPercent = 75 + (25 * currentZoomFactor);
                schoolMap.animate({height: zoomPercent + "%"}, 120);
            }


        }
        else {
            if (currentZoomFactor > 0) {
                currentZoomFactor--;
                zoomPercent = 75 + (25 * currentZoomFactor);
                schoolMap.animate({height: zoomPercent + "%"}, 120);
            }


        }
    });


});