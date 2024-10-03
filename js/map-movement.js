/* Map movement events and helper functions */

// jquery selector for easier css manipulation
const mediaContainer = $("#media-container");

// vanilla js selectors for element properties
const mapContainerReg = document.getElementById("map-container");
const mediaContainerReg = document.getElementById("media-container");

// map movement variables (not properly defined values here since we alter them later)
const speed = 0.2; // speed of scale, actual transition speed is handled in css
let mapContainerSize = {w: mapContainerReg.clientWidth, h: mapContainerReg.clientHeight};
let mapContainerInitialW = mapContainerSize.w;
let mediaContainerInitialW = mediaContainerReg.clientWidth;
let position = {x: 0, y: 0};
let target = {x: 0, y: 0};
let pointer = {x: 0, y: 0};
let scale = 1;
const maxScale = 4;
let minScale = 1.3;
let centeredOffsetX = (mediaContainerReg.clientWidth - mapContainerReg.clientWidth) / 2;
let centeredOffsetY;
let startMouse = {x: 0, y: 0};
let currentMouse = {x: 0, y: 0};
let previousMap = {x: 0, y: 0};

// other
let currentBuilding;


// adds the events for interactive map movement
export function initMapMovementEvents() {
    // reset map on page resize
    $(window).resize(function () {
        // reset the map to the center
        centerResetMap(currentBuilding); // todo bonus: use a state variable to check this trigger and have it run at a media close function

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
        if (!window.lockDrag) {
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
        }
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
                constrainTransformMap();
            }
        }
    });

    // mousewheel event for map zooming
    mediaContainerReg.addEventListener('wheel', (event) => {
        event.preventDefault();
        if (!window.mouseDragging && !window.lockDrag) { // disallow while panning and while panning is locked
            // TODO bonus: make zoom buttons that zoom relative to the center of the media container
            // pointer position relative to
            pointer.x = event.pageX - mediaContainerReg.offsetLeft - centeredOffsetX;
            pointer.y = event.pageY - mediaContainerReg.offsetTop;

            target.x = (pointer.x - position.x) / scale;
            target.y = (pointer.y - position.y) / scale;

            // determine the direction (which way the scroll delta is) and magnitude of the scale
            scale += -1 * Math.max(-1, Math.min(1, event.deltaY)) * speed * scale;

            // limit the scale within a range
            scale = Math.max(minScale, Math.min(maxScale, scale));

            // calculate position for the image container using relative target with scale
            position.x = -target.x * scale + pointer.x;
            position.y = -target.y * scale + pointer.y;

            // constrain and apply movement transform
            constrainTransformMap();

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
    centeredOffsetX = (mediaContainerReg.clientWidth - mapContainerReg.clientWidth) / 2;
}

// constrain map position within media container bounds and apply the transform
export function constrainTransformMap() {
    // horizontal constraint
    if (mapContainerInitialW * scale > mediaContainerInitialW) {
        if (position.x > -centeredOffsetX) position.x = -centeredOffsetX;
        if (position.x - centeredOffsetX + mapContainerSize.w * scale < mapContainerSize.w) position.x = -mapContainerSize.w * (scale - 1) + centeredOffsetX;
    } else {
        // to reimplement if allowing horizontal pan when map width is smaller than container
        // TODO: instead just give padding to the map container and start at a different zoom. dont bother reimplementing this since media container is usually way wider. code
        //  wasnt designed for map wider than media container. vertical centering is implemented okay though. maybe when map is wider than media container assume mobile and
        //  block user?
        // if (position.x > 0) position.x = 0;
        // if (position.x + mapContainerSize.w * scale < mapContainerSize.w) position.x = -mapContainerSize.w * (scale - 1);
        position.x = -(mapContainerInitialW * scale - mapContainerInitialW) / 2;
    }

    // vertical constraint
    if (position.y > 0) position.y = 0;
    if (position.y + mapContainerSize.h * scale < mapContainerSize.h) position.y = -mapContainerSize.h * (scale - 1);

    // apply the transform
    mapContainerReg.style.transform = `translate(${position.x + centeredOffsetX}px,${position.y}px) scale(${scale},${scale})`;
}

// recalculate page size properties and center map
export function centerResetMap(building) {
    currentBuilding = building;
    let mapContainerRegStyle = getComputedStyle(mapContainerReg);

    // set padding relative to media container height
/*    let paddingWidthDivisor;
    if (building === 1) {
        paddingWidthDivisor = 7;
    } else if (building === 2) {
        paddingWidthDivisor = 4.5;
    } else { // outside
        paddingWidthDivisor = 5.5;
    }*/
    // use a fixed divisor so its consistent
    mapContainerReg.style.padding = `${mediaContainerReg.clientHeight/8.5}px 0`; /*${mediaContainerReg.clientWidth/paddingWidthDivisor}px*/

    // fit the actual map edges (ignoring padding) to the media container
    let mapHeightNoPadding = mapContainerReg.clientHeight - parseFloat(mapContainerRegStyle.paddingTop) - parseFloat(mapContainerRegStyle.paddingBottom);
    scale = mediaContainerReg.clientHeight / mapHeightNoPadding;
    minScale = scale;

    // after scale calculated, set padding relative to media container width
    // first calculate padding if map was scaled to min, then divide it by scale back down to pre scale, divide 2 for each side, subtract off some space so map always starts middle
    mapContainerReg.style.padding = `${mediaContainerReg.clientHeight/8.5}px ${(mediaContainerReg.clientWidth - mapContainerReg.clientWidth*scale)/(2*scale)-25}px`;

    resetMapVars();

    // vertically center since padding extends beyond the media container
    let heightY = mapContainerReg.clientHeight;
    centeredOffsetY = (heightY*scale - mediaContainerReg.clientHeight) / 2;
    position = {x: 0, y: -centeredOffsetY};
    previousMap = {x: 0, y: -centeredOffsetY};

    constrainTransformMap();
}