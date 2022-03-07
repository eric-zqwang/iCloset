
var showimg = function (event) {
  let reader = new FileReader();

  reader.onload = function () {
    var output = document.getElementById('outputImage');
    output.src = reader.result;
  };
  reader.onloadend = () => { 

  };
  reader.readAsDataURL(event.target.files[0]);

}
