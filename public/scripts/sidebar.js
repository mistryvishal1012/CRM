//Vertical navbar source: https://bootstrapious.com/p/bootstrap-vertical-navbar 

$(function() {
    // Sidebar toggle behavior
    $('#sidebarCollapse').on('click', function() {
      $('#sidebar, #content, .toggle-button').toggleClass('active');
    });
  });

  $('body,html').click(function (e) {
    var container = $("#sidebarCollapse");
    var sideBarButton = $('#sidebarButton');
    var sideBar = $('#sidebar');
    if (!container.is(e.target) && container.has(e.target).length === 0) {
      
      if(!sideBar[0].classList.contains('active')){
        $('#sidebar, #content, .toggle-button').toggleClass('active');
      }
    }
});