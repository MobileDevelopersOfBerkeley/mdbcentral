types = ['', 'info', 'success', 'warning', 'danger'];

function showNotification(type, message) {
  // $.notify({
  //   icon: "pe-7s-bell",
  //   message: message
  // }, {
  //   type: type,
  //   timer: 4000,
  //   placement: {
  //     from: from,
  //     align: align
  //   }
  // });
  $.notify({
    icon: 'pe-7s-bell',
    message: message
  }, {
    type: type,
    timer: 4000
  });
}