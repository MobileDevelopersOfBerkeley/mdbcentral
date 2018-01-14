// returns a promise that resolve the link of the file if it was uploaded
function upload(file) {
  return new Promise(function(resolve, reject) {
    // read in file
    var reader = new FileReader();
    reader.onload = function(event) {
      var binary = event.target.result;
      // generate md5 hash
      var md5 = CryptoJS.MD5(binary).toString();
      resolve(md5);
    };
    reader.readAsBinaryString(file);
  }).then(function(hash) {
    // setup uploadTask to upload file under the generated hash
    var uploadTask = firebase.storage().ref().child(hash).put(file, {
      'contentType': file.type
    });
    return new Promise(function(resolve, reject) {
      uploadTask.on('state_changed', null, function(error) {
        reject(error);
      }, function() {
        // resolve url of uploaded file
        var url = uploadTask.snapshot.metadata.downloadURLs[0];
        resolve(url);
      });
    });
  });
}

function getElapsedTime(endDate) {
  var startDate = new Date();
  var different = endDate.getTime() - startDate.getTime();
  var secondsInMilli = 1000;
  var minutesInMilli = secondsInMilli * 60;
  var hoursInMilli = minutesInMilli * 60;
  var daysInMilli = hoursInMilli * 24;
  var elapsedDays = different / daysInMilli;
  different = different % daysInMilli;
  var elapsedHours = different / hoursInMilli;
  different = different % hoursInMilli;
  var elapsedMinutes = different / minutesInMilli;
  different = different % minutesInMilli;
  var elapsedSeconds = different / secondsInMilli;
  elapsedDays = Math.round(elapsedDays);
  elapsedHours = Math.round(elapsedHours);
  elapsedMinutes = Math.round(elapsedMinutes);
  elapsedSeconds = Math.round(elapsedSeconds);
  if (elapsedDays > 0) return elapsedDays + " days left";
  if (elapsedDays < 0) return -1 * elapsedDays + " days ago";
  if (elapsedHours > 0) return elapsedHours + " hours left";
  if (elapsedHours < 0) return -1 * elapsedHours + " hours ago";
  if (elapsedMinutes > 0) return elapsedMinutes + " minutes left";
  if (elapsedMinutes < 0) return -1 * elapsedMinutes + " minutes ago";
  if (elapsedSeconds > 0) return elapsedSeconds + " seconds left";
  if (elapsedSeconds < 0) return -1 * elapsedSeconds + " seconds ago";
  return "???";
}

function dateToString(date) {
  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return date.getDate() + " " + monthNames[date.getMonth()] + " " + date.getFullYear();
}

function dateToStringShort(date) {
  return (date.getMonth() + 1) + "/" + date.getDate();
}

function showErrorModal(message) {
  showNotification("danger", message);
}

function showSuccessModal(message) {
  showNotification("success", message);
}