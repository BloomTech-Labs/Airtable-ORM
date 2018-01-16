//= require ./lib/_energize
//= require ./app/_toc
//= require ./app/_lang

$(function() {
  loadToc($('#toc'), '.toc-link', '.toc-list-h2', 10);
  setupLanguages($('body').data('languages'));
  $('.content').imagesLoaded( function() {
    window.recacheHeights();
    window.refreshToc();
  });
});

window.onpopstate = function() {
  activateLanguage(getLanguageFromQueryString());
};

window.addEventListener('load', () => {
  if (window.location.hash[0] === '#') {
    // wait until Slate finishes formatting things and then scroll to the location if it exists
    setTimeout(() => {
      const element = document.getElementById(window.location.hash.substring(1));
      if (element)
        document.getElementById(window.location.hash.substring(1)).scrollIntoView(true);
    }, 80);
  }
  setTimeout(() => {
    const popup = $(`
      <p class="copy-popup"> Link copied to clipboard! </p>
    `);
    let popupTimeout = null;
    popup.on('click', (event) => {
      event.target.remove();
    });
    $('.header-anchor').on('click', (event) => {
      const temp = $('<input>');
      $('body').append(temp);
      temp.val(`${window.location.origin}${window.location.pathname}#${event.target.parentElement.id}`);
      temp.select();
      document.execCommand('copy');
      temp.remove();
      if ($(event.target.parentElement).has(popup))
        popup.remove();
      $(event.target.parentElement).append(popup);
      if (popupTimeout)
        clearTimeout(popupTimeout);
      popupTimeout = setTimeout(() => {
        popup.remove();
      }, 3000);
    });

    $('.header-anchor').on('mouseover', (event) => {

    })
  }, 150);
})
