/* Custom Script For Gallery */
$(document).ready(function () {
    /*
    * ===================
    * Image/Video Gallery
    * ===================
    * */
    const mediaContainer = $("#media-container");
    const galleryIDList = ["drone-footage-gallery", "grad-classes-gallery", "new-building-timelapse-gallery"];
    // array of gallery content formatted for nanogallery2
    const galleryContent = [
        [{src: 'dji-phantom-4.jpg', srct: 'dji-phantom-4.jpg', title: 'test 1'},
         {src: 'fpv-racing-drone.jpg', srct: 'fpv-racing-drone.jpg', title: 'test 2'},
         {src: 'search-rescue-drone.jpg', srct: 'search-rescue-drone.jpg', title: 'test 3'}],

        [{src: 'dji-phantom-4.jpg', srct: 'dji-phantom-4.jpg', title: 'test 1'},
         {src: 'fpv-racing-drone.jpg', srct: 'fpv-racing-drone.jpg', title: 'test 2'}]
    ];

    // create the gallery with the given inputs
    function loadNanogallery2(galleryID, galleryListPos) {
        $(`#${galleryID}`).nanogallery2({
            // gallery settings
            itemsBaseURL: 'https://www.bnsdroneclub.ca/images/about/',
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

    /*galleryContainer.nanogallery2({
        // gallery settings
        itemsBaseURL:     'https://www.bnsdroneclub.ca/images/about/',
        thumbnailHeight:  200,
        thumbnailWidth:   200,
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

        // gallery content
        items: [
            { src: 'dji-phantom-4.jpg', srct: 'dji-phantom-4.jpg', title: 'test 1' },
            { src: 'fpv-racing-drone.jpg', srct: 'fpv-racing-drone.jpg', title: 'test 2' },
            { src: 'search-rescue-drone.jpg', srct: 'search-rescue-drone.jpg', title: 'test 3' }
        ]

    });*/


    /*
    * ======================
    * Sidebar Load Galleries
    * ======================
    * */
    function addGalleryLoading() {
        const galleryMenu = $("#gallery-menu");

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
                loadNanogallery2(galleryIDList[i], i);
            });
        }
    }

    addGalleryLoading();


    /*
    * ==============
    * Sidebar Search
    * ==============
    * */
    const searchBarReg = document.getElementById("search-bar");

    // filter the search results on key up events
    searchBarReg.addEventListener("keyup", function (e) {
        filterSearchElements(document.getElementById("gallery-menu"));
    });

    // repetitive search filtering for the different location areas
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

});