/* Map movement events and helper functions */

// jquery selector for easier css manipulation
const mediaContainer = $("#media-container");
const viewer360Container = $("#viewer-360-container");

// vanilla js selectors for element properties
const mapContainerReg = document.getElementById("map-container");
const mediaContainerReg = document.getElementById("media-container");

// map movement variables (not properly defined values here since we alter them later)
const zoomSpeed = 0.18; // speed of scale, actual transition speed is handled in css
let mapContainerSize = {w: mapContainerReg.clientWidth, h: mapContainerReg.clientHeight};
let mapContainerInitialW = mapContainerSize.w;
let mediaContainerInitialW = mediaContainerReg.clientWidth;
let position = {x: 0, y: 0};
let target = {x: 0, y: 0};
let pointer = {x: 0, y: 0};
let scale = 1;
const maxScale = 5;
let minScale = 1.3; // can't be const, must be set programatically
let zoomTimeout;
let zoomOutCenterCounter = 0;
let centeredOffsetX = (mediaContainerReg.clientWidth - mapContainerReg.clientWidth) / 2;
let centeredOffsetY;
let startMouse = {x: 0, y: 0};
let currentMouse = {x: 0, y: 0};
let previousMap = {x: 0, y: 0};



// adds the events for interactive map movement
export function initMapMovementEvents() {
    // reset map on page resize
    $(window).resize(function () {
        if (window.activeMedia === undefined) {
            // reset the map to the center
            centerResetMap();
        } else {
            // todo: track a resize and center when thats NOT a fullscreen when media is open. use fullscreen api?
        }

        // TODO bonus: when below a certain screen size (mobile), hide the map completely and have only the sidebar span the whole screen

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
            // todo: keep at all? it just makes it lag behind the cursor a bit causing a "smooth" effect but every pan also triggers transition which impacts performance
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
        if (!zoomTimeout) {
            event.preventDefault();

            zoomTimeout = true;
            startZoomTimeout();
            if (!window.mouseDragging && !window.lockDrag) { // disallow while panning and while panning is locked
                // TODO bonus: make zoom buttons that zoom relative to the center of the media container
                // pointer position relative to
                pointer.x = event.pageX - mediaContainerReg.offsetLeft - centeredOffsetX;
                pointer.y = event.pageY - mediaContainerReg.offsetTop;

                target.x = (pointer.x - position.x) / scale;
                target.y = (pointer.y - position.y) / scale;

                // determine the direction (which way the scroll delta is) and magnitude of the scale
                scale += -1 * Math.max(-1, Math.min(1, event.deltaY)) * zoomSpeed * scale;

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

                // if we scroll out through min scale, center the map vertically
                if (scale === minScale) {
                    zoomOutCenterCounter++;
                    if (zoomOutCenterCounter === 3) {
                        // vertically center calculation
                        let heightY = mapContainerReg.clientHeight;
                        centeredOffsetY = (heightY*scale - mediaContainerReg.clientHeight) / 2;
                        position = {x: 0, y: -centeredOffsetY};
                        previousMap = {x: 0, y: -centeredOffsetY};

                        constrainTransformMap();

                        zoomOutCenterCounter = 0;
                    }
                }
            }
        }
    });
}

function startZoomTimeout() {
    setTimeout(function () {
        zoomTimeout = false;
    }, 30);
}

// reset certain standard variables that change on page resize
export function resetMapVars() {
    // let mapContainerRegStyle = getComputedStyle(mapContainerReg);

    mapContainerSize = {w: mapContainerReg.clientWidth, h: mapContainerReg.clientHeight};
    mapContainerInitialW = mapContainerSize.w;
    mediaContainerInitialW = mediaContainerReg.clientWidth;

    // let mapHeightNoPadding = mapContainerReg.clientHeight - parseFloat(mapContainerRegStyle.paddingTop)*2;
    // minScale = mediaContainerReg.clientHeight / mapHeightNoPadding;

    /*if ((mapContainerReg.clientWidth - parseFloat(mapContainerRegStyle.paddingLeft)*2)*minScale > mediaContainerReg.clientWidth - 200) {
        centeredOffsetX = 0/!*(mapContainerReg.clientWidth*minScale - mediaContainerReg.clientWidth) / 2*!/;
    } else {
        centeredOffsetX = (mediaContainerReg.clientWidth - mapContainerReg.clientWidth) / 2;
    } TODO bonus: proper initial centering when map width is larger than media container. (need to edit constrain fn accordingly?)*/

    centeredOffsetX = (mediaContainerReg.clientWidth - mapContainerReg.clientWidth) / 2;
    centeredOffsetY = (mapContainerReg.clientHeight*minScale - mediaContainerReg.clientHeight) / 2;

}

// constrain map position within media container bounds and apply the transform
export function constrainTransformMap() {
    // horizontal constraint
    if (mapContainerInitialW * scale > mediaContainerInitialW) { // regular edge constraint
        if (position.x > -centeredOffsetX) position.x = -centeredOffsetX;
        if (position.x - centeredOffsetX + mapContainerSize.w * scale < mapContainerSize.w) position.x = -mapContainerSize.w * (scale - 1) + centeredOffsetX;
    } else {
        // allows pan when map width is smaller than container
        // if (position.x > 0) position.x = 0;
        // if (position.x + mapContainerSize.w * scale < mapContainerSize.w) position.x = -mapContainerSize.w * (scale - 1);

        // locks the map center when smaller than the media container
        position.x = -(mapContainerInitialW * scale - mapContainerInitialW) / 2;
    }

    // vertical constraint
    if (position.y > 0) position.y = 0;
    if (position.y + mapContainerSize.h * scale < mapContainerSize.h) position.y = -mapContainerSize.h * (scale - 1);

    // apply the transform
    mapContainerReg.style.transform = `translate(${position.x + centeredOffsetX}px,${position.y}px) scale(${scale},${scale})`;
}

// recalculate page size properties and center map
export function centerResetMap() {
    let mapContainerRegStyle = getComputedStyle(mapContainerReg);

    // set padding relative to media container height
    // use a fixed divisor so its consistent
    mapContainerReg.style.padding = `${mediaContainerReg.clientHeight/8.5}px 0`;

    // fit the actual map edges (ignoring padding) to the media container height
    let mapHeightNoPadding = mapContainerReg.clientHeight - parseFloat(mapContainerRegStyle.paddingTop)*2;
    scale = mediaContainerReg.clientHeight / mapHeightNoPadding;
    minScale = scale;

    // after scale calculated, set padding accordingly
    let mapSidePadding;
    if (mapContainerReg.clientWidth*scale > mediaContainerReg.clientWidth - 200) { // if map gets wider than media container
        mapSidePadding = mapContainerReg.clientWidth/7; // set padding using a fixed divisor
    } else { // normal behaviour
        // first calculate padding if map was scaled to min, then divide it by scale back down to pre scale, divide 2 for each side, subtract off some space so map always starts middle
        mapSidePadding = (mediaContainerReg.clientWidth - mapContainerReg.clientWidth*scale)/(2*scale) - 25;
    }
    mapContainerReg.style.padding = `${mediaContainerReg.clientHeight/8.5}px ${mapSidePadding}px`;

    resetMapVars();

    // vertically center since padding extends beyond the media container
    // centeredOffsetY = (mapContainerReg.clientHeight*scale - mediaContainerReg.clientHeight) / 2;
    position = {x: 0, y: -centeredOffsetY};
    previousMap = {x: 0, y: -centeredOffsetY};

    // turn off transitions since we're just loading, apply the transform
    mapContainerReg.style.transition = 'none';
    constrainTransformMap();
    mapContainerReg.offsetHeight; // force reflow
    mapContainerReg.style.transition = 'transform 0.2s';
}