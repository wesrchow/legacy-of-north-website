/* All gallery related functions */

// vanilla js selectors
const searchBarReg = document.getElementById("search-bar");

// jquery selectors
const mediaContainer = $("#media-container");
const galleryMenu = $("#gallery-menu");

// nanogallery helper content
const galleryIDList = ["drone-footage-gallery", "grad-classes-gallery", "new-building-timelapse-gallery"];
// gallery content (media) formatted for nanogallery
const galleryContent = [
    [{src: 'Burnaby_North_Viking.jpg', srct: 'Burnaby_North_Viking.jpg', title: 'test 1'},
        {src: 'DJI_0019.jpg', srct: 'DJI_0019.jpg', title: 'test 2'},
        {src: 'DJI_0023.jpg', srct: 'DJI_0023.jpg', title: 'test 3'}],

    [{src: 'endgame_trailer.mp4', srct: '', title: 'test 1'},
        {src: 'fpv-racing-drone.jpg', srct: '', title: 'test 2'}]
];



// Gallery initialization
addGalleryLoading();



// gallery creation function
function loadNanogallery(galleryID, galleryListPos) {
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


// Gallery menu click events for loading nanogallery
function addGalleryLoading() {
    // go through all the gallery menu items and add click functions
    for (let i = 0; i < galleryMenu.children().length; i++) {
        galleryMenu.children().eq(i).click(function () {
            // delete any previous gallery content
            try {
                mediaContainer.children().eq(0).nanogallery2("destroy");
                mediaContainer.empty();
            } catch (error) {
                console.error(error);
            }


            // create the element and open the given gallery
            mediaContainer.append(`<div class="gallery-container" id="${galleryIDList[i]}"></div>`);
            loadNanogallery(galleryIDList[i], i);
        });
    }
}



// sidebar search
// filter the search results on key up events
searchBarReg.addEventListener("keyup", function (e) {
    filterSearchElements(document.getElementById("gallery-menu"));
});

// repetitive search filtering for the different location areas
// TODO bonus: merge with virtual tour searching
function filterSearchElements(ul) {
    // setup variables
    let filter = searchBarReg.value.toUpperCase();
    let li = ul.getElementsByClassName("sidebar-list-1");

    // loop through all list items, and hide those who don't match the search query
    for (let i = 0; i < li.length; i++) {
        let a = li[i].getElementsByTagName("a")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].classList.remove("hidden");
            li[i].classList.remove("hidden-opacity");
        } else {
            li[i].classList.add("hidden-opacity");
            li[i].ontransitionend = () => {
                li[i].classList.add("hidden")
                console.log('Transition ended');
            };
        }
    }
}