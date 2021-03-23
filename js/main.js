$(document).ready(function () {

    /* Navbar */
    $("#mobile-navbar-button").click(function () {
        const navbarLinks = $('#navbar-links');

        navbarLinks.toggleClass('open');
        navbarLinks.children().toggleClass('open');
    });
    
});

// If the window size is larger than the mobile nav criteria, remove the mobile nav classes
$(window).on('resize',function() {
    if (!window.matchMedia("(max-width: 900px)").matches) {
        const navbarLinks = $('#navbar-links');

        navbarLinks.removeClass('open');
        navbarLinks.children().removeClass('open');
    }
}).trigger('resize');
