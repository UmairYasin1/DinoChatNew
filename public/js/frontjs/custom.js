$(document).ready(function(){
    
    $(".closeWin, .chatoverlay").click(function(){
        $('.userChatPupopWrap').hide();
        $('.chatoverlay').hide();
    });

    $(".openchat").click(function(){
        $('.userChatPupopWrap').show();
        $('.chatoverlay').show();
    });
    
    $(document).keyup(function(e) {
        if (e.key === "Escape") { // escape key maps to keycode `27`
        $('.userChatPupopWrap').hide();
        $('.chatoverlay').hide();
       }
   });

   $(document).on("click",".minimizeChat2",function(){
  
    $("#chatframe2").toggleClass('active');
    
    $(".fa-window-minimize").toggleClass("fa-window-restore");
});
    
$('.mainMenuUL > li').on('click', function() { 
    if(!$(this).hasClass("active")){
        $('.mainMenuUL > li').children('ul').slideUp('slow'); 
       $(this).children('ul').slideToggle('slow'); 
        $('.mainMenuUL > li').removeClass("active");
        $(this).toggleClass("active");
    } 
});
 // menu  - mossawir   
    
    
    
$('.AccordianChat .AccordianToggle').on('click', function() {
    
$('.AccordianChat .AccordianBody').slideUp();
$(this).parents(".AccordianChat").children(".AccordianBody").slideDown();

$('.AccordianChat').removeClass('active');
$(this).parents(".AccordianChat").toggleClass("active");   
    
$(".AccordianToggle").html('<i class="far fa-chevron-down"></i>');
$(this).html('<i class="far fa-chevron-up"></i>');

});
      
    
/*
$('.AccordianChat .AccordianToggle').on('click', function() { 
$('.AccordianChat').removeClass('active');
$(this).parents(".AccordianChat").toggleClass("active");
$(".AccordianToggle").html('<i class="far fa-chevron-down"></i>');
$(this).html('<i class="far fa-chevron-up"></i>');
});
 */
    
$(document).on("click",".minimizeChat",function(){
  
    document.getElementById("chatframe").classList.toggle('active');
    
    $(".fa-window-minimize").toggleClass("fa-window-restore");
   
   
});    
    
    
});
//Document ready

