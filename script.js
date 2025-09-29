const capacity = 50;
const TEAM_KEYS = ["Team Water Wise", "Team Net Zero", "Team Renewables"];

let attendees = [];
let teamCounts = {
  "Team Water Wise": 0,
  "Team Net Zero": 0,
  "Team Renewables": 0
};

const nameInput = document.getElementById("nameInput");
const teamSelect = document.getElementById("teamSelect");
const checkInBtn = document.getElementById("checkInBtn");
const clearDataBtn = document.getElementById("clearDataBtn");

const attendeeListEl = document.getElementById("attendeeList");
const attendanceCountEl = document.getElementById("attendanceCount");
const progressFillEl = document.getElementById("progressFill");

const countWater = document.getElementById("count-water");
const countNetzero = document.getElementById("count-netzero");
const countRenew = document.getElementById("count-renew");
const teamList = document.getElementById("teamList");

const mega = document.getElementById("megaCelebration");

const STORAGE_KEY = "intel_summit_checkins_v4";

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ attendees, teamCounts }));
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.attendees)) attendees = data.attendees;
    if (data.teamCounts) teamCounts = data.teamCounts;
  } catch {}
}

function renderAttendees() {
  attendeeListEl.innerHTML = "";
  attendees.forEach(({ name, team }) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${escapeHTML(name)}</span>
      <span class="attendee-team">${escapeHTML(team)}</span>
    `;
    attendeeListEl.appendChild(li);
  });
}
function renderCounts() {
  countWater.textContent = teamCounts["Team Water Wise"];
  countNetzero.textContent = teamCounts["Team Net Zero"];
  countRenew.textContent = teamCounts["Team Renewables"];

  const total = attendees.length;
  const clamped = Math.min(total, capacity);
  attendanceCountEl.textContent = `${clamped} / ${capacity}`;
  progressFillEl.style.width = `${(clamped / capacity) * 100}%`;
  progressFillEl.parentElement.setAttribute("aria-valuenow", clamped);
}

// highlight winner ONLY when called explicitly
// highlight winner on team cards
function highlightWinner() {
  // Build sorted list of team counts
  const counts = TEAM_KEYS.map(t => ({ team: t, count: teamCounts[t] }))
    .sort((a, b) => b.count - a.count);

  const top = counts[0];
  const isTie = counts[1] && top.count === counts[1].count;
  const hasAny = top.count > 0;

  // Map team names to card IDs
  const teamCardMap = {
    "Team Water Wise": document.getElementById("team-water-card"),
    "Team Net Zero": document.getElementById("team-netzero-card"),
    "Team Renewables": document.getElementById("team-renew-card")
  };

  // Reset styles
  Object.values(teamCardMap).forEach(card => {
    card.classList.remove("winner");
    card.style.boxShadow = "none";
  });

  // Apply winner style
if (hasAny && !isTie) {
  const winnerCard = teamCardMap[top.team];
  if (winnerCard) {
    winnerCard.classList.add("winner");
    winnerCard.style.boxShadow =
      "0 0 0 3px rgba(255, 223, 88, 0.7), 0 12px 32px rgba(0,0,0,0.45)";

    // Add "Winner" badge if not already present
    if (!winnerCard.querySelector(".winner-badge")) {
      const badge = document.createElement("div");
      badge.className = "winner-badge";
      badge.textContent = "🏆 Winning Team 🏆";
      winnerCard.appendChild(badge);
    }
  }
}

}


function renderAll(){ renderAttendees(); renderCounts(); /* no winner here */ }

checkInBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const team = teamSelect.value;

  if (!name) { alert("Please enter a name."); nameInput.focus(); return; }
  if (!TEAM_KEYS.includes(team)) { alert("Please select a team."); teamSelect.focus(); return; }

  // 🚨 Capacity check but allow #50 celebration
if (attendees.length >= capacity) {
  if (attendees.length === capacity) {
    celebrate(attendees.length); // still trigger mega confetti
  }
  alert("Check-in limit reached (50 attendees). No more entries allowed.");
  return;
}


  attendees.push({ name, team });
  teamCounts[team]++;

  nameInput.value = "";
  teamSelect.value = "";

  save();
  renderAll();
  celebrate(attendees.length);

  // 👇 Show personalized greeting here
  showGreeting(name, team);
});

clearDataBtn.addEventListener("click", () => {
  if (!confirm("Clear all check-in data?")) return;
  attendees = [];
  teamCounts = { "Team Water Wise": 0, "Team Net Zero": 0, "Team Renewables": 0 };
  save();
  renderAll();
});

function celebrate(total) {
  if (typeof confetti !== "function") {
    console.error("Confetti library not loaded");
    return;
  }

  if (total === capacity) {
    // Show winner now
    highlightWinner();

    // Mega celebration text
    mega.classList.remove("hidden");
    mega.classList.add("pulse"); 
    setTimeout(() => {
      mega.classList.add("hidden");
      mega.classList.remove("pulse");
    }, 5000); // 5s visible

    // Big confetti shower for 5 seconds
    const duration = 5000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 10,
        spread: 200,
        startVelocity: 40,
        ticks: 200,
        origin: { x: Math.random(), y: Math.random() - 0.2 }
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  } else {
    // Small confetti burst for every check-in
    confetti({
      particleCount: 100,
      spread: 70,
      startVelocity: 30,
      origin: { y: 0.6 }
    });
  }
}

function escapeHTML(str){
  return str.replace(/[&<>"']/g, m => (
    {"&":"&amp;","<":"&lt;"," >":"&gt;",'"':"&quot;","'":"&#39;"}[m]
  ));
}

document.addEventListener("DOMContentLoaded", () => { load(); renderAll(); });

// 👇 Add this helper function at the bottom of script.js
function showGreeting(name, team) {
  const greetingEl = document.getElementById("greetingMessage");
  greetingEl.textContent = `Thanks for checking in, ${name} (${team}). We hope you have a great experience at the Intel Summit.`;

  // Show with animation
  greetingEl.classList.add("show");

  setTimeout(() => {
    greetingEl.classList.remove("show");  // hide smoothly
  }, 4000);
}


// About modal
const aboutLink = document.querySelector('.nav-link[href="#about"]');
const aboutModal = document.getElementById('aboutModal');
const closeModal = document.getElementById('closeModal');

if (aboutLink && aboutModal && closeModal) {
  aboutLink.addEventListener('click', (e) => {
    e.preventDefault();
    aboutModal.classList.add('show');
  });

  closeModal.addEventListener('click', () => {
    aboutModal.classList.remove('show');
  });

  window.addEventListener('click', (e) => {
    if (e.target === aboutModal) {
      aboutModal.classList.remove('show');
    }
  });
}
// Contact modal
const contactLink = document.querySelector('.nav-link[href="#contact"]');
const contactModal = document.getElementById('contactModal');
const closeContact = document.getElementById('closeContact');

if (contactLink && contactModal && closeContact) {
  contactLink.addEventListener('click', (e) => {
    e.preventDefault();
    contactModal.classList.add('show');
  });

  closeContact.addEventListener('click', () => {
    contactModal.classList.remove('show');
  });

  window.addEventListener('click', (e) => {
    if (e.target === contactModal) {
      contactModal.classList.remove('show');
    }
  });
}

