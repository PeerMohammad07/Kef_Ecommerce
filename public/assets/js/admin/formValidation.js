// <<<<<<<<<<<<<<<<<<<<<<<<<<<OTP resend>>>>>>>>>>>>>>>>>>>>>>>>>>




  function resend() {
    console.log("Hello");
    clearInterval(countdownInterval);
    startCountdown(60);
  }

  let countdownInterval;

  function startCountdown(initialValue) {
    let val = initialValue;
    countdownInterval = setInterval(() => {
      if(val===0){
        clearInterval(countdownInterval)
      }
      document.querySelector('#time').innerHTML = `${val}`;
      val = val - 1;
    }, 1000);
  }

  startCountdown(60);

  document.getElementById('resend').addEventListener('click', function () {
    resend();
  });





// signupPage validation
function validate(){
  let username = document.getElementById('uname')
  let password = document.getElementById('pass')
  let phone = document.getElementById('uphone')
  let confirmpass = document.getElementById('confpass')

  if(!/^\w+$/.test(username.value)){
    username.style.border = 'solid 1px red'
    userError.textContent = "only allow letters numbers and underscores"
  
  setTimeout(()=>{
    username.style.border ='' ;
    userError.textContent ='' ;
  },3000)

  return false
}

else if(phone.value.trim().length < 10 || !/^\d+$/.test(phone.value)||!/^(?!0{10}$)\d+$/.test(phone.value)){
  phone.style.border = 'solid 1px red'
  phoneErr.textContent = "Mobile number should be an Number with  10 digits"
  setTimeout(()=>{
    phone.style.border = ''
    phoneErr.textContent = ''
  },3000)
  return false
}

  else if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(password.value)){
    password.style.border = 'solid 1px red'
    passwordError.textContent = 'Password must be atleast 6 charcaters long and contain at least one uppercase letter one lowercase letter,and one number'
    setTimeout(()=>{
      password.style.border = '';
      passwordError.textContent = '';
    },3000)
    return false
  }


  else if(password.value !== confirmpass.value){
    confirmpass.style.border = 'solid 1px red'
    passwordError2.textContent= 'Password should be same'
    setTimeout(()=>{
      confirmpass.style.border = '';
      passwordError2.textContent = '';
    },3000)
    return false
  }

  else{
    true
  }
}




