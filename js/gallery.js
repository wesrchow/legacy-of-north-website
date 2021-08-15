/*
    Use this js script for custom js within the gallery page that are unused or conflict with other general page functions
*/

$(document).ready(function () {

    /*
    *
    * Image/Video Gallery
    *
    * */
    const mediaContainer = $("#media-container");
    const galleryIDList = ["drone-footage-gallery", "grad-classes-gallery", "new-building-timelapse-gallery"];
    // array of gallery content formatted for nanogallery2
    const galleryContent = [
        [{ src: 'dji-phantom-4.jpg', srct: 'dji-phantom-4.jpg', title: 'test 1' },
        { src: 'fpv-racing-drone.jpg', srct: 'fpv-racing-drone.jpg', title: 'test 2' },
        { src: 'search-rescue-drone.jpg', srct: 'search-rescue-drone.jpg', title: 'test 3' }],

        [{ src: 'dji-phantom-4.jpg', srct: 'dji-phantom-4.jpg', title: 'test 1' },
        { src: 'fpv-racing-drone.jpg', srct: 'fpv-racing-drone.jpg', title: 'test 2' }]
    ];

    // create the gallery with the given inputs
    function loadNanogallery2(galleryID, galleryListPos) {
        $(`#${galleryID}`).nanogallery2({
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
    *
    * Sidebar Load Galleries
    *
    * */
    function addGalleryLoading() {
        const galleryMenu = $("#gallery-menu");

        // go through all the gallery menu items and add click functions
        for (let i = 0; i < galleryMenu.children().length; i ++) {
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
    *
    * Sidebar Search
    *
    * */
    // $("#mobile-navbar-button").click(function () {
    //     const navbarLinks = $('#navbar-links');
    //
    //     navbarLinks.toggleClass('open');
    //     navbarLinks.children().toggleClass('open');
    // });

    function searchBar() {
        // Declare variables
        var input, filter, ul, li, loc, locContainer, a, i, j, k, txtValue;
        input = document.getElementById('searchBar');
        filter = input.value.toUpperCase();
        // ul = document.getElementById("location-list");
        // li = ul.getElementsByTagName('li');
        loc = document.getElementById("location-menu").getElementsByClassName("loc");
        locContainer = document.getElementById("location-menu").getElementsByClassName("sidebar-list-1");

        // Loop through all list items, and hide those who don't match the search query
        for (i = 0; i < loc.length; i++) {
            a = loc[i].getElementsByTagName("a")[0];
            txtValue = a.textContent || a.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                loc[i].style.display = "block";
                // Loop to keep opening folders
                var x = loc[i];
                while (x.parentElement !== null && x.parentElement.nodeName !== "DIV") {
                    x.parentElement.style.display = "block";
                    x = x.parentElement;
                }
            } else {
                loc[i].style.display = "none";
            }
        }

        // Loop through all location containers, hide those whose list items are no longer displaying
        for (j = 0; j < locContainer.length; j++) {
            li = locContainer[j].getElementsByClassName("loc");
            for (k = 0; k < li.length; k++) {
                if (li[k].style.display === "block") {
                    break;
                }
                if (k === li.length - 1) {
                    locContainer[j].style.display = "none";
                }
            }
        }

    }

});