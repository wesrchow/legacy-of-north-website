/* Misc media page helper functions */
// try to not rely on dependencies so things can happen here separated
// things were copied into gallery.js manually since they differed in implementation


// element reveal display and height animation
export function heightAnimReveal(animElementJ) {
    animElementJ.css("display", "block");
    animElementJ.height(animElementJ[0].scrollHeight); // temp set height for animation
    animElementJ.removeClass("sidebar-selection-hidden"); // remove hidden class

    animElementJ[0].ontransitionend = () => { // todo: CONDITION TRIGGER CHECK
        animElementJ.height("auto"); // set back to auto to allow dropdown to expand properly
    };
}

// element hide display and height animation
export function heightAnimHide(animElementJ, setup) {
    animElementJ.height(animElementJ[0].scrollHeight); // temp set height for animation

    setTimeout(function () { // delay to allow height to be set first
        if (setup) animElementJ.addClass("no-transition"); // prevent animation on first load

        animElementJ.addClass("sidebar-selection-hidden"); // add hidden class

        if (setup) { // bring back animation after first load
            animElementJ.css("display", "none");
            animElementJ[0].offsetHeight; // force reflow
            animElementJ.removeClass("no-transition");
        }
    }, 5);

    if (!setup) {
        animElementJ[0].ontransitionend = () => { // once transition is done, display hide it todo: CONDITION TRIGGER CHECK
            setTimeout(function () {
                animElementJ.css("display", "none");
            }, 120); // allow dropdown to fully collapse (transitionend takes longer than exact transition time) todo: play with this timing
        };
    }
}


// helper to trace back target map layer
let targetMapLayer = null;

// media opacity transition reveal
export function mediaTransReveal(transElementJ, mapElement) {
    if (mapElement) {
        transElementJ.addClass("absolute-map");
        targetMapLayer = transElementJ;
    }

    transElementJ.removeClass("hidden");
    setTimeout(function () { // force reflow (timeout necessary because of otherwise strong layering optimizations)
        transElementJ[0].offsetHeight;
        transElementJ.removeClass("media-trans-hidden");
    }, 1);
}

// media opacity transition hide
export function mediaTransHide(transElementJ) {
    transElementJ.addClass("media-trans-hidden");
    transElementJ[0].offsetHeight; // force reflow (necessary? seems to work okay without)

    // TRANSITION END TRIGGER HERE
}

// selectors here to handle transition end
// media transition cover selector
const mediaTransCover = $("#media-trans-cover");

// mediaTransHide TRANSITION END TRIGGERS
mediaTransCover[0].ontransitionend = () => {
    if (mediaTransCover.hasClass("media-trans-hidden")) { // only trigger on hide
        setTimeout(function () {
            mediaTransCover.addClass("hidden");
        }, 120); // allow cover to fully fade (transitionend takes longer than exact transition time) todo: play with this timing
    }
};

// mediaTransHide TRANSITION END TRIGGERS for map layers
// setup called from virtual tour core after waiting for maps to load
export function initMapLayerAnim() {
    // map layer selectors
    window.mapLayers = [
        $("#map-layer-north-1st"),
        $("#map-layer-north-2nd"),
        $("#map-layer-north-3rd"),
        $("#map-layer-south-1st"),
        $("#map-layer-south-2nd"),
        $("#map-layer-outside")
    ];

    mapLayers.forEach((mapLayer) => {
        mapLayer[0].ontransitionend = () => {
            if (mapLayer.hasClass("media-trans-hidden")) { // only trigger on hide
                setTimeout(function () {
                    mapLayer.addClass("hidden");
                    targetMapLayer.removeClass("absolute-map");
                }, 120); // allow cover to fully fade
            }
        };
    });
}