/* Gallery sidebar, media handling */
// noinspection DuplicatedCode

const mediaContainer = $("#media-container");
const searchBarReg = document.getElementById("search-bar");
const galleryIDList = ["drone-footage-gallery", "grad-classes-gallery", "new-building-timelapse-gallery"];
// array of gallery content formatted for nanogallery2
const galleryContent = [
    [{src: 'Burnaby_North_Viking.jpg', srct: 'Burnaby_North_Viking.jpg', title: 'test 1'},
        {src: 'DJI_0019.jpg', srct: 'DJI_0019.jpg', title: 'test 2'},
        {src: 'DJI_0023.jpg', srct: 'DJI_0023.jpg', title: 'test 3'}],

    [{src: 'dji-phantom-4.jpg', srct: 'dji-phantom-4.jpg', title: 'test 1'},
        {src: 'fpv-racing-drone.jpg', srct: 'fpv-racing-drone.jpg', title: 'test 2'}]
];

window.sidebarClickTimeout = false; // prevent sidebar double clicks
window.activeMedia = undefined; // handles media switching and closing


/*
* Initialization calls
* */
addGalleryClicks(); // add click events to the sidebar gallery menu
searchTypeEvent(); // add search querying event



/*
* Gallery & sidebar
* */
function addGalleryClicks() {
    const galleryMenu = $("#gallery-menu a");

    // go through all the gallery menu items and add click functions
    for (let i = 0; i < galleryMenu.length; i++) {
        galleryMenu[i].addEventListener("click", function () {
            if (!window.sidebarClickTimeout) {

                //
                // active buttons handling
                //
                this.classList.toggle("active");

                // manage click timeouts
                window.sidebarClickTimeout = true;
                startSidebarClickTimeout();

                if (window.activeMedia !== this) { // if not clicking same media again
                    if (window.activeMedia !== undefined) { // not first button / not only button action
                        window.activeMedia.classList.remove("active");
                        closeGallery();
                    }

                    // sometimes first open
                    window.activeMedia = this; // sets the new current active media
                    openGallery(i);
                } else { // must be self, closes current media
                    window.activeMedia = undefined;
                    closeGallery();
                }
            }
        });
    }
}

function openGallery(index) {
    // create the element and open the given gallery
    mediaContainer.append(`<div class="gallery-container" id="${galleryIDList[index]}"></div>`);
    loadNanogallery2(galleryIDList[index], index);
}

function closeGallery() {
    try { // todo: get rid of this try catch. it doesnt ever trigger anyways (will vary depending on which library i end up choosing)
        mediaContainer.children().eq(0).nanogallery2("destroy"); // destroy the nanogallery element
        mediaContainer.empty(); // remove the gallery containing element
        console.log("removing old gallery")
    } catch (error) {
        console.error(error);
    }
}

// create the gallery with the given inputs
function loadNanogallery2(galleryID, galleryListPos) {
    $(`#${galleryID}`).nanogallery2({
        // gallery settings
        itemsBaseURL: 'test-media/',
        thumbnailHeight: 200,
        thumbnailWidth: 200,
        thumbnailBorderVertical: 1,
        thumbnailBorderHorizontal: 1,
        thumbnailDisplayTransition: 'slideUp',
        thumbnailDisplayTransitionDuration: 800,
        thumbnailDisplayInterval: 20,
        thumbnailLabel: {
            position: 'overImageOnBottom'
        },
        thumbnailHoverEffect2: 'scale120',
        thumbnailAlignment: 'center',
        thumbnailOpenImage: true,

        // lightbox settings
        imageTransition: 'swipe2',
        viewerTools: {
            topLeft: "pageCounter",
            topRight: "zoomButton, fullscreenButton, closeButton"
        },

        // gallery content
        items: galleryContent[galleryListPos]
    });
}

function startSidebarClickTimeout() {
    setTimeout(function () {
        window.sidebarClickTimeout = false;
    }, 290);
}


/*
* Sidebar search
* */
function searchTypeEvent() {
    const sidebarLocationElements = $(".sidebar-list-1"); // get all the li location elements
    let typingTimer;
    // filter the search results on key up events
    searchBarReg.addEventListener("keyup", function () {
        clearTimeout(typingTimer);

        typingTimer = setTimeout(function () {
            filterSearchElements(sidebarLocationElements);
        }, 150);

    });
}

// repetitive search filtering
function filterSearchElements(sidebarLocationElements) {
    let filter = searchBarReg.value.toUpperCase(); // comparison search string

    // loop through all list items, do the filtering
    for (let i = 0; i < sidebarLocationElements.length; i++) {
        let locationName = sidebarLocationElements.eq(i).find("a").eq(0).text().toUpperCase(); // get formatted location name

        if (locationName.indexOf(filter) > -1) { // exact match somewhere in the name
            if (sidebarLocationElements.eq(i).hasClass("sidebar-selection-hidden")) { // don't do anything if already visible
                sidebarAnimReveal(sidebarLocationElements.eq(i));
            }
        } else {
            if (!sidebarLocationElements.eq(i).hasClass("sidebar-selection-hidden")) { // don't do anything if already hidden
                sidebarAnimHide(sidebarLocationElements.eq(i));
            }
        }
    }
}

// sidebar reveal display and animation
function sidebarAnimReveal(sidebarElementJ) {
    sidebarElementJ.css("display", "block");
    sidebarElementJ.height(sidebarElementJ[0].scrollHeight); // temp set height for animation
    sidebarElementJ.removeClass("sidebar-selection-hidden"); // remove hidden class

    sidebarElementJ[0].ontransitionend = () => {
        sidebarElementJ.height("auto"); // set back to auto to allow dropdown to expand properly
    };
}

// sidebar hide display and animation
function sidebarAnimHide(sidebarElementJ) {
    sidebarElementJ.height(sidebarElementJ[0].scrollHeight); // temp set height for animation

    setTimeout(function () { // delay to allow height to be set first
        sidebarElementJ.addClass("sidebar-selection-hidden"); // add hidden class

    }, 5);

    sidebarElementJ[0].ontransitionend = () => { // once transition is done, display hide it
        sidebarElementJ.css("display", "none");
    };
}
