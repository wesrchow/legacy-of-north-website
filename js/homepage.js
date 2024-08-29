new fullpage('#fullpage', {
    scrollOverflow: true,
    scrolloverflowmacstyle: false
});

const fullpageArrow = $("#fullpage-arrow");

fullpageArrow.click(function () {
    fullpage_api.moveSectionDown();
});