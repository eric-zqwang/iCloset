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

function check_email(){
    var mail = document.getElementById("email").value;
    var mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!mail.match(mailFormat))
    {
        document.getElementById("message2").style.color = 'red';
        document.getElementById("message2").innerHTML = 'invalid format of email';
        document.getElementById("submitButton").disabled = true;
    }
    else{
        document.getElementById("message2").innerHTML = '';
        document.getElementById("submitButton").disabled = false;
    }
}

function validate_password(){
    var password = document.getElementById("pswd").value;
    var passw=  /^[A-Za-z]\w{6,14}$/;
    if (!password.match(passw)){
        document.getElementById("message1").style.color = 'red';
<<<<<<< HEAD
        document.getElementById("message1").innerHTML = 'password is too simple! You should begin with letter and at least 7 bits';
=======
        document.getElementById("message1").innerHTML = 'Password is too simple! You should begin with letter and at least 7 bits';
>>>>>>> 58b97671e16e21c50e20bb499ce55a4a3872cb72
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
