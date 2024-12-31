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


const mediaTransCover = $("#media-trans-cover");

export function mediaTransReveal() {
    mediaTransCover.removeClass("hidden");
    mediaTransCover[0].offsetHeight; // force reflow
    mediaTransCover.removeClass("media-trans-hidden");

    // add loading indicator (but probably not "location text" because the load is quite quick)
}

export function mediaTransHide() {
    mediaTransCover.addClass("media-trans-hidden");
    mediaTransCover[0].offsetHeight; // force reflow (necessary? seems to work okay without, not working for throttled testing)

    // add loading indicator (but probably not "back to map text" because the load is quite quick)

    // TRANSITION END TRIGGER HERE
}

// mediaTransHide TRANSITION END TRIGGER
mediaTransCover[0].ontransitionend = () => {
    if (mediaTransCover.hasClass("media-trans-hidden")) { // only trigger on hide
        setTimeout(function () {
            mediaTransCover.addClass("hidden");
        }, 120); // allow cover to fully fade (transitionend takes longer than exact transition time) todo: play with this timing
    }
};