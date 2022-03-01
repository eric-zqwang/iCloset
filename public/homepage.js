
var showimg = function (event) {
  var reader = new FileReader();
  reader.onload = function () {
    var output = document.getElementById('outputImage');
    output.src = reader.result;
  };
  reader.readAsDataURL(event.target.files[0]);
};
