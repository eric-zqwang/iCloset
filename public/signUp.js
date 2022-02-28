function validatePassword(){
    var password = document.getElementById("pswd").value;
    var repeat_password = document.getElementById("repeatPswd").value;
    // if(password != repeat_password) {
    //     repeat_password.setCustomValidity("Passwords Don't Match");
    // }
    if(password != repeat_password){
        window.alert("Pswd don't Match");
    }

}