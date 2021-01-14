$(document).ready(function () {

    $("button").click(function(){
        $("test").animate({left: '250px'});
    });

    /* When the user scrolls down, hide the navbar. When the user scrolls up, show the navbar */
    // var prevScrollpos = window.pageYOffset;
    // window.onscroll = function() {
    //     var currentScrollPos = window.pageYOffset;
    //     if (prevScrollpos > currentScrollPos) {
    //         $("navbar").style.top = "0";
    //     } else {
    //         document.getElementById("navbar").style.top = "-50px";
    //     }
    //     prevScrollpos = currentScrollPos;
    // }


});
