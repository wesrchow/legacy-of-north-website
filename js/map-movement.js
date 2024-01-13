/* Map movement events and helper functions */

// jquery selector for easier css manipulation
const mediaContainer = $("#media-container");

// vanilla js selectors for element properties
const mapContainerReg = document.getElementById("map-container");
const mediaContainerReg = document.getElementById("media-container");

// map movement variables
const speed = 0.2; // speed of scale, actual transition speed is handled in css
let mapContainerSize = {w: mapContainerReg.clientWidth, h: mapContainerReg.clientHeight};
let mapContainerInitialW = mapContainerSize.w;
let mediaContainerInitialW = mediaContainerReg.clientWidth;
let position = {x: 0, y: 0};
let target = {x: 0, y: 0};
let pointer = {x: 0, y: 0};
let scale = 1;
let centeredOffset = (mediaContainerReg.clientWidth - mapContainerReg.clientWidth) / 2;
let startMouse = {x: 0, y: 0};
let currentMouse = {x: 0, y: 0};
let previousMap = {x: 0, y: 0};


// adds the events for interactive map movement
export function initMapMovementEvents() {
    // reset map on page resize
    $(window).resize(function () {
        // reset the map to the center
        centerResetMap();

        // TODO: when below a certain screen size (mobile), hide the map completely and have only the sidebar span the whole screen

    });

    // mousedown event for map panning
    mediaContainer.mousedown(function (event) {
        if (!window.lockDrag) { // check if allowed to pan
            window.mouseDragging = true;
            mediaContainer.css("cursor", "grabbing");

            startMouse.x = event.clientX;
            startMouse.y = event.clientY;

            // different transition during panning vs zoom
            mapContainerReg.style.transition = 'transform 0.03s';
        }
    });

    // mouseup event for map panning
    $(document).mouseup(function () {
        // if (!window.lockDrag) { // TODO BONUS: necessary?
        window.mouseDragging = false;
        mediaContainer.css("cursor", "grab");

        previousMap.x = position.x;
        previousMap.y = position.y;

        // add the zoom transition back
        mapContainerReg.style.transition = 'transform 0.2s';

        // release map selection
        setTimeout(function () {
            window.lockMapSelection = false;
        }, 80);
        // }
    });

    // mousemove event for map panning
    $(document).mousemove(function (event) {
        if (!window.lockDrag) {
            if (window.mouseDragging) {
                // lock map selection clicks
                setTimeout(function () {
                    window.lockMapSelection = true;
                }, 70);

                // calculate new position
                currentMouse.x = event.clientX;
                currentMouse.y = event.clientY;

                let moveX = currentMouse.x - startMouse.x;
                let moveY = currentMouse.y - startMouse.y;

                position.x = moveX + previousMap.x;
                position.y = moveY + previousMap.y;

                // constrain and apply movement transform
                constrainMap();
            }
        }
    });

    // mousewheel event for map zooming
    mediaContainerReg.addEventListener('wheel', (event) => {
        event.preventDefault();
        if (!window.mouseDragging && !window.lockDrag) { // disallow while panning and while panning is locked
            // pointer position relative to
            pointer.x = event.pageX - mediaContainerReg.offsetLeft - centeredOffset;
            pointer.y = event.pageY - mediaContainerReg.offsetTop;

            target.x = (pointer.x - position.x) / scale;
            target.y = (pointer.y - position.y) / scale;

            // determine the direction (which way the scroll delta is) and magnitude of the scale
            scale += -1 * Math.max(-1, Math.min(1, event.deltaY)) * speed * scale;

            // limit the scale within a range
            const max_scale = 4;
            const min_scale = 1;
            scale = Math.max(min_scale, Math.min(max_scale, scale));

            // calculate position for the image container using relative target with scale
            position.x = -target.x * scale + pointer.x;
            position.y = -target.y * scale + pointer.y;

            // constrain and apply movement transform
            constrainMap();

            // set variables for panning
            previousMap.x = position.x;
            previousMap.y = position.y;
        }
    });
}

// reset certain standard variables that change on page resize
export function resetMapVars() {
    mapContainerSize = {w: mapContainerReg.clientWidth, h: mapContainerReg.clientHeight};
    mapContainerInitialW = mapContainerSize.w;
    mediaContainerInitialW = mediaContainerReg.clientWidth;
    centeredOffset = (mediaContainerReg.clientWidth - mapContainerReg.clientWidth) / 2;
}

// constrain map position within media container bounds and apply the transform
export function constrainMap() {
    // horizontal constraint
    if (mapContainerInitialW * scale > mediaContainerInitialW) {
        if (position.x > -centeredOffset) position.x = -centeredOffset;
        if (position.x - centeredOffset + mapContainerSize.w * scale < mapContainerSize.w) position.x = -mapContainerSize.w * (scale - 1) + centeredOffset;
    } else {
        // to reimplement if allowing horizontal pan when map width is smaller than container
        // TODO: instead just give padding to the map container and start at a different zoom
        // if (position.x > 0) position.x = 0;
        // if (position.x + mapContainerSize.w * scale < mapContainerSize.w) position.x = -mapContainerSize.w * (scale - 1);
        position.x = -(mapContainerInitialW * scale - mapContainerInitialW) / 2;
    }

    // vertical constraint
    if (position.y > 0) position.y = 0;
    if (position.y + mapContainerSize.h * scale < mapContainerSize.h) position.y = -mapContainerSize.h * (scale - 1);

    // apply the transform
    mapContainerReg.style.transform = `translate(${position.x + centeredOffset}px,${position.y}px) scale(${scale},${scale})`;
}

// recalculate page size properties and center map
export function centerResetMap() {
    position = {x: 0, y: 0};
    scale = 1;
    resetMapVars();
    constrainMap();
}