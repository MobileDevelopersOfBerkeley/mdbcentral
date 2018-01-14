function showPDF(tag) {
  var parent_width = $(tag).parent().width();
  $(tag).media({
    width: parent_width * .96,
    height: 1150
  });
}