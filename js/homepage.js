const fullpageArrow = $("#fullpage-arrow");

new fullpage('#fullpage', {
    licenseKey: 'gzwV0RK%h9',
    scrollOverflow: true,
    scrolloverflowmacstyle: false
});

fullpageArrow.click(function () {
    fullpage_api.moveSectionDown();
});