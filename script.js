function saveWish() {
  const name = document.getElementById("name").value;
  const wish = document.getElementById("wish").value;
  const date = document.getElementById("date").value;

  if (!name || !wish || !date) {
    alert("Please fill all fields 🎯");
    return;
  }

  localStorage.setItem("bName", name);
  localStorage.setItem("bWish", wish);
  localStorage.setItem("bDate", date);

  alert("Wish saved successfully 🎉");
}

function checkBirthday() {
  const today = new Date();
  const savedDate = localStorage.getItem("bDate");

  if (!savedDate) return;

  const birthday = new Date(savedDate);
  const diff = birthday - today;

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const countdown = document.getElementById("countdown");

  if (days > 0) {
    countdown.innerText = `⏳ ${days} days left for the birthday`;
  } else if (days === 0) {
    const name = localStorage.getItem("bName");
    const wish = localStorage.getItem("bWish");
    document.getElementById("result").innerText =
      `🎉 Happy Birthday ${name}! 🎂\n${wish}`;
  }
}

setInterval(checkBirthday, 1000);
