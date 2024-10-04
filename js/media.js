/* Misc media page helper functions */
// try to not rely on dependencies so things can happen here separated


// element reveal display and height animation
export function sidebarAnimReveal(sidebarElementJ) {
    sidebarElementJ.css("display", "block");
    sidebarElementJ.height(sidebarElementJ[0].scrollHeight); // temp set height for animation
    sidebarElementJ.removeClass("sidebar-selection-hidden"); // remove hidden class

    sidebarElementJ[0].ontransitionend = () => {
        sidebarElementJ.height("auto"); // set back to auto to allow dropdown to expand properly
    };
}

// element hide display and height animation
export function sidebarAnimHide(sidebarElementJ, setup) {
    sidebarElementJ.height(sidebarElementJ[0].scrollHeight); // temp set height for animation

    setTimeout(function () { // delay to allow height to be set first
        if (setup) sidebarElementJ.addClass("no-transition"); // prevent animation on first load

        sidebarElementJ.addClass("sidebar-selection-hidden"); // add hidden class

        if (setup) { // bring back animation after first load
            sidebarElementJ.css("display", "none");
            sidebarElementJ[0].offsetHeight; // force reflow
            sidebarElementJ.removeClass("no-transition");
        }
    }, 5);

    if (!setup) {
        sidebarElementJ[0].ontransitionend = () => { // once transition is done, display hide it
            sidebarElementJ.css("display", "none");
        };
    }
}


// todo: media load / transition covers