// DOM Elements
const form = document.getElementById("checkInForm");
const attendeeCountEl = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");

const waterCountEl = document.getElementById("waterCount");
const zeroCountEl = document.getElementById("zeroCount");
const powerCountEl = document.getElementById("powerCount");

const attendeeListEl = document.getElementById("attendeeList");
const clearBtn = document.getElementById("clearBtn");

let totalAttendees = 0;
const maxAttendees = 50;
let teamCounts = { water: 0, zero: 0, power: 0 };

// Animate Number
function animateNumber(el, start, end, duration = 600) {
  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    el.textContent = Math.floor(progress * (end - start) + start);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Animate Progress Bar
function animateProgressBar(el, newWidth) {
  el.style.transition = "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
  el.style.width = newWidth + "%";
}

// Fade In Greeting
function fadeIn(el, text, className) {
  el.textContent = text;
  el.className = className;
  el.style.opacity = 0;
  el.style.display = "block";

  let opacity = 0;
  const timer = setInterval(() => {
    opacity += 0.05;
    el.style.opacity = opacity;
    if (opacity >= 1) clearInterval(timer);
  }, 30);
}

// Confetti Burst
function confettiBurst(count = 100) {
  const colors = [
    "#00c7fd", "#0071c5", "#38bdf8", "#34d399",
    "#facc15", "#f97316", "#ec4899", "#8b5cf6", "#ffffff"
  ];

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement("span");
    confetti.classList.add("confetti-piece");

    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.width = Math.random() * 8 + 6 + "px";
    confetti.style.height = Math.random() * 14 + 8 + "px";

    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];

    const duration = 2 + Math.random() * 3;
    const drift = Math.random() < 0.5 ? -1 : 1;
    confetti.style.setProperty("--driftX", drift * (Math.random() * 60) + "px");
    confetti.style.animationDuration = duration + "s";

    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), duration * 1000);
  }
}

// Big Celebration (when full)
function bigCelebration() {
  const overlay = document.createElement("div");
  overlay.classList.add("big-celebration");
  overlay.innerHTML = `<h2>🎉 Event Full! 50 Attendees 🎉</h2>`;
  document.body.appendChild(overlay);

  confettiBurst(300);

  setTimeout(() => overlay.remove(), 6000);
}

// Helper: Team Label
function teamLabel(team) {
  switch (team) {
    case "water":
      return "🌊 Team Water Wise";
    case "zero":
      return "🌿 Team Net Zero";
    case "power":
      return "⚡ Team Renewables";
    default:
      return "";
  }
}

// Add to visible attendee list with fade-in
function addToAttendeeList(name, team) {
  const li = document.createElement("li");
  li.textContent = `✅ ${name} – ${teamLabel(team)}`;
  li.classList.add("attendee-item");
  attendeeListEl.appendChild(li);

  requestAnimationFrame(() => {
    li.classList.add("show");
  });
}

// Save data to localStorage
function saveData(name, team) {
  const saved = JSON.parse(localStorage.getItem("attendanceData")) || {
    totalAttendees: 0,
    teamCounts: { water: 0, zero: 0, power: 0 },
    attendees: []
  };

  saved.totalAttendees = totalAttendees;
  saved.teamCounts = teamCounts;
  saved.attendees.push({ name, team });

  localStorage.setItem("attendanceData", JSON.stringify(saved));
}

// Load saved data from localStorage
function loadData() {
  const saved = JSON.parse(localStorage.getItem("attendanceData"));
  if (!saved) return;

  totalAttendees = saved.totalAttendees || 0;
  teamCounts = saved.teamCounts || { water: 0, zero: 0, power: 0 };

  attendeeCountEl.textContent = totalAttendees;
  waterCountEl.textContent = teamCounts.water;
  zeroCountEl.textContent = teamCounts.zero;
  powerCountEl.textContent = teamCounts.power;

  const percent = (totalAttendees / maxAttendees) * 100;
  progressBar.style.width = percent + "%";

  attendeeListEl.innerHTML = "";
  if (saved.attendees) {
    saved.attendees.forEach(({ name, team }) => addToAttendeeList(name, team));
  }
}

// Form Submit Event
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("attendeeName").value.trim();
  const team = document.getElementById("teamSelect").value;

  if (!name || !team) return;

  if (totalAttendees >= maxAttendees) {
    fadeIn(greeting, "Sorry, event is full!", "error-message");
    return;
  }

  totalAttendees++;
  teamCounts[team]++;

  animateNumber(attendeeCountEl, parseInt(attendeeCountEl.textContent), totalAttendees);
  animateNumber(waterCountEl, parseInt(waterCountEl.textContent), teamCounts.water);
  animateNumber(zeroCountEl, parseInt(zeroCountEl.textContent), teamCounts.zero);
  animateNumber(powerCountEl, parseInt(powerCountEl.textContent), teamCounts.power);

  const percent = (totalAttendees / maxAttendees) * 100;
  animateProgressBar(progressBar, percent);

  fadeIn(greeting, `Welcome, ${name}! You’ve joined ${teamLabel(team)}.`, "success-message");

  // ✅ Save & display attendee
  saveData(name, team);
  addToAttendeeList(name, team);

  if (totalAttendees < maxAttendees) {
    confettiBurst(100);
  } else {
    bigCelebration();
  }

  form.reset();
});

// Clear Data Button
clearBtn.addEventListener("click", () => {
  localStorage.removeItem("attendanceData");

  totalAttendees = 0;
  teamCounts = { water: 0, zero: 0, power: 0 };

  attendeeCountEl.textContent = 0;
  waterCountEl.textContent = 0;
  zeroCountEl.textContent = 0;
  powerCountEl.textContent = 0;

  progressBar.style.width = "0%";
  greeting.style.display = "none";
  attendeeListEl.innerHTML = "";

  fadeIn(greeting, "✅ All data cleared.", "success-message");
});

// Load data when page loads
window.addEventListener("DOMContentLoaded", loadData);

