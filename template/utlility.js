$(document).ready(function() {
    var $header = $("header"),
        $clone = $header.before($header.clone().addClass("clone")),
        $headerHeight = $("header").height();
    
    $(function() {
        $("header").load("template/header.html");
    });
    
    
    $(function() {
        $("footer").load("template/footer.html");
    });
    
//    $(window).on("scroll", function() {
//        var fromTop = $(window).scrollTop();
//        $("body").toggleClass("down", (fromTop > $headerHeight*1.5));
//    });
});