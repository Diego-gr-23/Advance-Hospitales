// Add this script at the end of the body or after the navbar
$(document).ready(function () {
    // Add scroll event listener to keep aside scrolling
    $(window).scroll(function () {
        // Get scroll position
        var scroll = $(window).scrollTop();

        // Set aside's top position to keep it scrolling
        $(".aside").css("top", scroll + "px");
    });
});