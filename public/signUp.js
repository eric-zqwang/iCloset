function check_password(){
    var password = document.getElementById("pswd").value;
    var repeat_password = document.getElementById("repeatPswd").value;

    if(password != repeat_password) {
        document.getElementById("message").style.color = 'red';
        document.getElementById("message").innerHTML = 'not matching';
        document.getElementById("submitButton").disabled = true;
    }
    else{
        document.getElementById("message").style.color = 'green';
        document.getElementById("message").innerHTML = 'matching';
        document.getElementById("submitButton").disabled = false;
    }
}

function validate_password(){
    var password = document.getElementById("pswd").value;
    var passw=  /^[A-Za-z]\w{6,14}$/;
    if (!password.match(passw)){
        document.getElementById("message1").style.color = 'red';
        document.getElementById("message1").innerHTML = 'password is too simple!';
        document.getElementById("submitButton").disabled = true;
    }
    else{
        document.getElementById("message1").innerHTML = '';
        document.getElementById("submitButton").disabled = false;
    }
}

function cancel(){
    window.location.href = "/userlogin.html";
}