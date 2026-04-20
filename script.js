timeNow = new Date().getTime();
targetDate = new Date("2026-04-25T23:59:59").getTime();
fetch('https://api.ipify.org?format=json')
  .then(response => response.json())
  .then(data => {
    console.log("User's Public IPv4:", data.ip);
    userIPv4 = data.ip;
  })
fetch(`https://ipapi.co/${userIPv4}/json/`)
  .then(response => response.json())
  .then(data => {
    userLongitude = data.longitude;
    userLatitude = data.latitude;
  }
)


function updateTimer() {
    timeNow = new Date().getTime();
    timeLeft = targetDate - timeNow;
    
    days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    milliseconds = timeLeft % 1000;

}

setInterval(updateTimer, 100);

if (timeLeft < 0) {
    document.getElementById("timer").innerHTML = "Tempo esgotado!";
    document.getElementById("timer").innerHTML = "Prepare-se para morrer...";
    document.getElementById("timer").innerHTML = "Você mora em: " + userLatitude + ", " + userLongitude;
    document.getElementById("timer").innerHTML = "Seu IP é: " + userIPv4;
    document.getElementById("timer").innerHTML = "Não é magia, é habilidade isto...";
  }