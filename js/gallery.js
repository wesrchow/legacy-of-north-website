/* Gallery sidebar, media handling */
// noinspection DuplicatedCode

const mediaContainer = $("#media-container");
const searchBarReg = document.getElementById("search-bar");

const galleryIDList = ["drone-footage-1", "grad-classes-plaques", "yearbook-covers"];

window.galleryViewer = undefined; // lightgallery object
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

// create the gallery html elements and activate the given gallery
function openGallery(index) {
    mediaContainer.append(`<div class="gallery-container" id="${galleryIDList[index]}"></div>`);
    let galleryContainer = $(`#${galleryIDList[index]}`); // let the gallery container be created first

    // load the gallery items list and inject elements
    jQuery.get(`csv/gallery/${galleryIDList[index]}.csv`, function (data) {
        let galleryInfoArray = $.csv.toArrays(data);
        for (let i = 1; i < galleryInfoArray.length; i++) { // inject gallery item with sources, captions
            if (galleryInfoArray[i][1].toString() === "image") {
                galleryContainer.append(`<a href="test-media/${galleryInfoArray[i][0]}" data-sub-html="<p>${galleryInfoArray[i][2]}</p>"><img alt="${galleryInfoArray[i][0]}" src="test-media/${galleryInfoArray[i][0]}" /></a>`)
            } else { // otherwise video
                // todo: create a video lightgallery object first
                    // maybe give the a tag an id so we can target it and inject the data-video stuff
                galleryContainer.append(`<a data-video='{
    "source": [
        {
            "src": "test-media/${galleryInfoArray[i][0]}",
            "type": "video/mp4",
        },
        ...
    ],"attributes": { "preload": false, "controls": true },
};' data-sub-html="<p>${galleryInfoArray[i][2]}</p>"><img alt="${galleryInfoArray[i][0]}" src="test-media/${galleryInfoArray[i][0]}" /></a>`)
            }
        }

        window.galleryViewer = lightGallery(document.getElementById(`${galleryIDList[index]}`), { // load the lightgallery on the setup gallery container
            plugins: [lgPager, lgFullscreen, lgZoom, lgVideo],
            licenseKey: '0000-0000-000-0000',
            preload: 2,
            loop: false,
            // allowMediaOverlap: true,
            speed: 500, // transition within gallery speed
            backdropDuration: 300, // open/close speed
            download: false, // button
            hideBarsDelay: 2000, // hide controls
            hideScrollbar: true,
            numberOfSlideItemsInDom: 5,
            swipeToClose: false,
            actualSize: false, // zoom button
            showZoomInOutIcons: true,
            videojs: true
        }); // todo: fill in other settings
    }, 'text');
}

function closeGallery() {
    window.galleryViewer.destroy();
    mediaContainer.empty();
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
