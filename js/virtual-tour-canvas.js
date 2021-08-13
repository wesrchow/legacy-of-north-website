/*
    Use this js script for custom js within the virtual tour page that are unused or conflict with other general page functions
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
            // jQuery.get("./csv/north-locations-filenames.csv", function(data) {
            //     addMapLinks($.csv.toArrays(data));
            // }, 'text');

            // TODO: PUT SOUTH AND OUTSIDE FILENAMES LIST HERE TOO

        }, 'xml');

    });


    /*
    *
    * Canvas stuff
    *
    * */
    const mapCanvas = $("#map-canvas"); // jquery selector
    const canvas = document.getElementById("map-canvas"); // HTML canvas access
    const ctx = canvas.getContext("2d");

    $(window).on('resize',function() {
        // set canvas dimensions while properly keeping resolution and scale
        canvas.width = mapContainer[0].clientWidth;
        canvas.height = mapContainer[0].clientHeight;

        // redraw the canvas when the window is resized
        ctx.save();
        drawMap();
        ctx.restore();

    }).trigger('resize');


    let dragging = false;
    let startMouseX;
    let startMouseY;
    let currentMouseX;
    let currentMouseY;
    let previousMapX = 0;
    let previousMapY = 0;

    window.moveX;
    window.moveY;

    const mediaContainer = $("#media-container");

    //
    // click and drag implementation
    //
    // mouse down drag
    mediaContainer.mousedown(function (event) {
        dragging = true;

        mediaContainer.css("cursor", "grabbing");

        startMouseX = event.clientX - canvas.offsetLeft;
        startMouseY = event.clientY - canvas.offsetTop;
    });

    // mouse up drag
    $(document).mouseup(function () { /*mediaContainer*/
        dragging = false;

        mediaContainer.css("cursor", "grab");

        // previousMapX = mapCanvas.offsetLeft;
        // previousMapY = mapCanvas.offsetTop;
        // console.log(previousMapX);
        // console.log(previousMapY);

        // setTimeout(function allowLocationClick(){
        //     lockDrag = false;
        // }, 20);
    });

    window.originX = 0;
    window.originY = 0;

    // mouse move canvas
    $(document).mousemove(function (event) {
        if (!window.lockDrag) {
            if (dragging) {
                // setTimeout(function allowLocationClick() {
                //     lockDrag = true;
                // }, 50);
                currentMouseX = event.clientX - canvas.offsetLeft;
                currentMouseY = event.clientY - canvas.offsetTop;
                // console.log(currentMouseX, startMouseX);

                window.moveX = currentMouseX - startMouseX;
                window.moveY = currentMouseY - startMouseY;

                // let newX = moveX - previousMapX;
                // let newY = moveY - previousMapY;

                // console.log(previousMapX);
                ctx.translate(moveX/scale, moveY/scale);
                startMouseX = currentMouseX;
                startMouseY = currentMouseY;

                // Get transform offset
                let storedTransform = ctx.getTransform();
                let iMatrix = storedTransform.invertSelf();

                // window.originX = -iMatrix.e - window.originX;
                // window.originY = -iMatrix.f - window.originY;
                // console.log(iMatrix.e);
                // console.log(window.originX);
            }
        }
    });

    // map zoom
    let zoomFactor = 0.15;
    let scale = 1;

    let width = canvas.width;
    let height = canvas.height;
    // let visibleWidth = width;
    // let visibleHeight = height;
    // let canvasOffset = mapCanvas.offset();


    mapCanvas.on("wheel", function (event) {
    // mediaContainer.onwheel = function (event){
        event.preventDefault();

        // Get transform offset
        let storedTransform = ctx.getTransform();
        let iMatrix = storedTransform.invertSelf();
        // console.log(iMatrix.e);
        // console.log(iMatrix.f);

        // Get mouse offset.
        const mouseX = event.clientX - canvas.getBoundingClientRect().left /*- imatrix.e*/;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top /*- imatrix.f*/;
        // console.log("mouse x:" + event.clientX);
        // console.log("mouse y:" + event.clientY);
        //
        // console.log("left:" + canvas.getBoundingClientRect().left);
        // console.log("top:" + canvas.getBoundingClientRect().top);

        // Normalize mouse wheel movement to +1 or -1 to avoid unusual jumps.
        const wheel = event.originalEvent.deltaY > 0 ? -1 : 1;

        // Compute zoom factor.
        const zoom = Math.exp(wheel * zoomFactor);

        // Translate so the visible origin is at the context's origin.
        ctx.translate(window.originX, window.originY);

        // Compute the new visible origin. Originally the mouse is at a
        // distance mouse/scale from the corner, we want the point under
        // the mouse to remain in the same place after the zoom, but this
        // is at mouse/new_scale away from the corner. Therefore we need to
        // shift the origin (coordinates of the corner) to account for this.
        window.originX -= mouseX/(scale*zoom) - mouseX/scale /*- window.moveX*/;
        window.originY -= mouseY/(scale*zoom) - mouseY/scale /*- window.moveY*/;

        // Scale it (centered around the origin due to the translate above).
        ctx.scale(zoom, zoom);
        // Offset the visible origin to it's proper position.
        ctx.translate(-window.originX, -window.originY);
        console.log(window.moveX);

        // Update scale and others.
        scale *= zoom;
        // visibleWidth = width / scale;
        // visibleHeight = height / scale;  

    });

    // clear canvas
    function clearCanvas() {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, mapCanvas.width(), mapCanvas.height());
        ctx.restore();
    }

    // draw the map
    function drawMap() {
        clearCanvas();

        // TODO: get all DOM children of the layer that consists of all the room hover sections and path and draw them all individually. then, get all the children of the other
        //  layer (perimeter lines) and draw them all somehow (maybe in inkscape merge it all into one path or use path2D polyline function)
        // let svgPath = $("#Room415_360Photo_1_Web");


        ctx.lineWidth = 15;
        ctx.strokeStyle = "#8c8c8c";
        let p = new Path2D('M 0 0 L 1400 200 L 300 900 z');
        // ctx.fill(p);

        // ctx.moveTo(0, 0);
        // ctx.lineTo(parseFloat(mapContainer.css("width").split("px")), parseFloat(mapContainer.css("height").split("px")));
        ctx.stroke(p);

        // Schedule the redraw for the next display refresh.
        window.requestAnimationFrame(drawMap);
    }
    drawMap();


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