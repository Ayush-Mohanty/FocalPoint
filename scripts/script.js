// script.js - full file (replace your existing script.js with this)
// Adds Snowfall Serenity & Rainfall Rhythm. Preserves timer/stopwatch/history exactly.

document.addEventListener("DOMContentLoaded", () => {
  // === THEME NAMES ===
  const themeNames = {
    snow: "Snowfall Serenity",
    night: "Night Sky",
    interactive: "Interactive Starfield",
    aurora: "Aurora Waves",
    breeze: "Breeze Flow",
    mist: "Dream Mist",
    rain: "Rainfall Rhythm",
    drift: "Particle Drift"
  };

  // --- MODE SWITCHING ---
  const timerModeBtn = document.getElementById("timerMode");
  const stopwatchModeBtn = document.getElementById("stopwatchMode");
  const timerSection = document.getElementById("timerSection");
  const stopwatchSection = document.getElementById("stopwatchSection");

  // Defensive guards in case DOM differs slightly
  if (timerModeBtn && stopwatchModeBtn && timerSection && stopwatchSection) {
    timerModeBtn.addEventListener("click", () => {
      timerModeBtn.classList.add("active");
      stopwatchModeBtn.classList.remove("active");
      timerSection.classList.remove("hidden");
      stopwatchSection.classList.add("hidden");
    });

    stopwatchModeBtn.addEventListener("click", () => {
      stopwatchModeBtn.classList.add("active");
      timerModeBtn.classList.remove("active");
      stopwatchSection.classList.remove("hidden");
      timerSection.classList.add("hidden");
    });
  }

  // --- BACKGROUND SWITCHER ---
  function applyBackground(bg) {
    // Keep only the chosen theme on body (replace any existing class)
    document.body.className = bg;

    // store preference
    try { localStorage.setItem("bgTheme", bg); } catch (e) { /* fail silently */ }

    // Remove any previously created canvas elements (safely)
    const canvasIds = ["starfield", "auroraCanvas", "pulseCanvas", "driftCanvas", "snowCanvas", "rainCanvas"];
    canvasIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });

    // Create interactive canvases only when needed
    if (bg === "interactive") createStarfield();
    else if (bg === "aurora") createAurora();
    else if (bg === "rain") createRainfall();
    else if (bg === "snow") createSnowfall();
    else if (bg === "drift") createParticleDrift();
    // note: breeze/mist are pure CSS themes (no canvas)

    // update selected label if present
    const selectedOption = document.getElementById("selectedOption");
    if (selectedOption && themeNames[bg]) selectedOption.textContent = themeNames[bg];

    showToast(`🌈 ${themeNames[bg]} Activated`);
  }

  // Load saved theme (default to snow for new design)
  const savedTheme = (function(){
    try { return localStorage.getItem("bgTheme") || "snow"; }
    catch (e) { return "snow"; }
  })();
  applyBackground(savedTheme);

  // --- CUSTOM DROPDOWN (smart positioning + overflow fix) ---
  const customDropdown = document.getElementById("customDropdown");
  const selectedOption = document.getElementById("selectedOption");
  const dropdownList = document.getElementById("dropdownList");

  if (selectedOption && themeNames[savedTheme]) {
    selectedOption.textContent = themeNames[savedTheme];
  }

  if (selectedOption && dropdownList && customDropdown) {
    selectedOption.addEventListener("click", (e) => {
      e.stopPropagation();

      dropdownList.classList.toggle("hidden");
      customDropdown.classList.toggle("active");

      // Smart positioning: open upward if not enough space below
      const rect = customDropdown.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < 260 && spaceAbove > spaceBelow) {
        dropdownList.classList.add("open-up");
      } else {
        dropdownList.classList.remove("open-up");
      }

      // Limit height so it won't push layout
      dropdownList.style.maxHeight = "240px";
      dropdownList.style.overflowY = "auto";
    });

    // Bind only options that have data-value (skips dividers)
    dropdownList.querySelectorAll("div[data-value]").forEach(option => {
      option.addEventListener("click", () => {
        const value = option.getAttribute("data-value");
        if (!value) return;
        selectedOption.textContent = option.textContent.trim();
        dropdownList.classList.add("hidden");
        customDropdown.classList.remove("active");
        applyBackground(value);
      });
    });

    // Click outside closes the menu
    document.addEventListener("click", (e) => {
      if (!customDropdown.contains(e.target)) {
        dropdownList.classList.add("hidden");
        customDropdown.classList.remove("active");
      }
    });

    // Close dropdown on scroll for smoother UX
    window.addEventListener("scroll", () => {
      dropdownList.classList.add("hidden");
      customDropdown.classList.remove("active");
    });
  }

  // ---------------------------
  // Canvas backgrounds (all createXXX functions add a canvas and animate it)
  // ---------------------------

  // --- STARFIELD (Interactive) ---
  function createStarfield() {
    const canvas = document.createElement("canvas");
    canvas.id = "starfield";
    Object.assign(canvas.style, { position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.3 + 0.2,
      s: Math.random() * 0.3 + 0.03,
    }));

    let mx = 0, my = 0;
    document.addEventListener("mousemove", e => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x + mx * 40, star.y + my * 40, star.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fill();

        star.y += star.s;
        if (star.y > canvas.height) star.y = -2;
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // --- AURORA (canvas-based wave) ---
  function createAurora() {
    const canvas = document.createElement("canvas");
    canvas.id = "auroraCanvas";
    Object.assign(canvas.style, { position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    function animate() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, `hsla(${t % 360}, 60%, 20%, 0.6)`);
      grad.addColorStop(1, `hsla(${(t + 60) % 360}, 50%, 10%, 0.6)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, h / 2 + Math.sin(t / 30 + i) * 80);
        for (let x = 0; x < w; x += 10) {
          const y = h / 2 +
            Math.sin(x / 100 + t / 20 + i) * 50 +
            Math.cos(x / 50 + t / 25) * 10;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${(t * 2 + i * 60) % 360}, 100%, 60%, 0.12)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      t += 0.35;
      requestAnimationFrame(animate);
    }
    animate();
  }

  // --- SNOWFALL SERENITY ---
  function createSnowfall() {
    const canvas = document.createElement("canvas");
    canvas.id = "snowCanvas";
    Object.assign(canvas.style, { position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const snowflakes = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 3 + 1,
      speed: Math.random() * 1.2 + 0.3,
      drift: Math.random() * 0.5 - 0.25
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      for (const flake of snowflakes) {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
        ctx.fill();

        flake.y += flake.speed;
        flake.x += flake.drift;

        if (flake.y > canvas.height) flake.y = -10;
        if (flake.x > canvas.width) flake.x = 0;
        if (flake.x < 0) flake.x = canvas.width;
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // --- RAINFALL RHYTHM ---
  function createRainfall() {
    const canvas = document.createElement("canvas");
    canvas.id = "rainCanvas";
    Object.assign(canvas.style, { position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const drops = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: Math.random() * 20 + 10,
      speed: Math.random() * 4 + 3,
      slant: Math.random() * 0.5 - 0.25
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(173, 216, 230, 0.45)";
      ctx.lineWidth = 1.2;
      for (const drop of drops) {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.slant * 8, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        drop.x += drop.slant * 0.6;

        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
        if (drop.x > canvas.width) drop.x = 0;
        if (drop.x < 0) drop.x = canvas.width;
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // --- PULSE GRID (kept for compatibility - previously existed) ---
  function createPulseGrid() {
    const canvas = document.createElement("canvas");
    canvas.id = "pulseCanvas";
    Object.assign(canvas.style, { position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(102, 227, 196, 0.12)";
      ctx.lineWidth = 1;
      const gap = 46;
      for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
          const pulse = Math.sin((x + y + t) / 60) * 6;
          ctx.beginPath();
          ctx.rect(x + pulse, y + pulse, 2, 2);
          ctx.stroke();
        }
      }
      t += 1.8;
      requestAnimationFrame(draw);
    }
    draw();
  }

  // --- PARTICLE DRIFT ---
  function createParticleDrift() {
    const canvas = document.createElement("canvas");
    canvas.id = "driftCanvas";
    Object.assign(canvas.style, { position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.6,
      vx: Math.random() * 0.3 - 0.15,
      vy: Math.random() * 0.3 - 0.15
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(136, 212, 255, 0.7)";
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // --- TOAST NOTIFICATION ---
  function showToast(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.2)",
      backdropFilter: "blur(8px)",
      padding: "10px 18px",
      borderRadius: "12px",
      color: "#fff",
      fontSize: "14px",
      boxShadow: "0 0 15px rgba(255,255,255,0.12)",
      opacity: "0",
      transform: "translateY(8px)",
      transition: "opacity 0.35s ease, transform 0.35s ease"
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      setTimeout(() => toast.remove(), 400);
    }, 1400);
  }

  // ---------------------------
  // TIMER (persistent)
  // ---------------------------
  let timerInterval;
  let totalTime = 0;
  let timeLeft = 0;

  const timerDisplay = document.getElementById("timerDisplay");
  const startBtn = document.getElementById("startTimer");
  const pauseBtn = document.getElementById("pauseTimer");
  const resetBtn = document.getElementById("resetTimer");
  const setBtn = document.getElementById("setTime");
  const minutesInput = document.getElementById("minutesInput");

  function updateTimerDisplay() {
    if (!timerDisplay) return;
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    timerDisplay.textContent = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function saveTimerState(endTime) {
    try {
      localStorage.setItem("timerEnd", endTime);
      localStorage.setItem("timerTotal", totalTime);
    } catch (e) {}
  }

  function loadTimerState() {
    try {
      const endTime = parseInt(localStorage.getItem("timerEnd"));
      const savedTotal = parseInt(localStorage.getItem("timerTotal"));
      const now = Math.floor(Date.now() / 1000);

      if (endTime && savedTotal) {
        const diff = endTime - now;
        if (diff > 0) {
          totalTime = savedTotal;
          timeLeft = diff;
          startTimer(true);
        } else {
          localStorage.removeItem("timerEnd");
          localStorage.removeItem("timerTotal");
        }
      }
    } catch (e) {}
  }

  function startTimer(auto = false) {
    if (timerInterval) return;

    const endTime = auto
      ? parseInt(localStorage.getItem("timerEnd"))
      : Math.floor(Date.now() / 1000) + timeLeft;

    saveTimerState(endTime);

    timerInterval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      timeLeft = endTime - now;

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        try { localStorage.removeItem("timerEnd"); localStorage.removeItem("timerTotal"); } catch (e) {}
        timeLeft = 0;
        updateTimerDisplay();
        alert("⏰ Time’s up!");
      }

      updateTimerDisplay();
    }, 1000);
  }

  function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    try {
      localStorage.removeItem("timerEnd");
      localStorage.setItem("timerLeft", timeLeft);
    } catch (e) {}
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    try { localStorage.removeItem("timerEnd"); localStorage.removeItem("timerTotal"); } catch (e) {}
    timeLeft = totalTime;
    updateTimerDisplay();
  }

  if (setBtn) {
    setBtn.addEventListener("click", () => {
      const mins = parseInt(minutesInput.value);
      if (!mins || mins <= 0) {
        alert("Enter a valid number of minutes.");
        return;
      }
      totalTime = mins * 60;
      timeLeft = totalTime;
      updateTimerDisplay();
      try { localStorage.removeItem("timerEnd"); localStorage.removeItem("timerTotal"); } catch (e) {}
    });
  }

  if (startBtn) startBtn.addEventListener("click", () => {
    if (timeLeft <= 0) timeLeft = totalTime;
    startTimer();
  });
  if (pauseBtn) pauseBtn.addEventListener("click", pauseTimer);
  if (resetBtn) resetBtn.addEventListener("click", resetTimer);

  loadTimerState();
  updateTimerDisplay();

  // ---------------------------
  // STOPWATCH (persistent) + HISTORY
  // ---------------------------
  let swInterval;
  let swTime = 0;
  let isRunning = false;

  const swDisplay = document.getElementById("stopwatchDisplay");
  const startSW = document.getElementById("startSW");
  const pauseSW = document.getElementById("pauseSW");
  const resetSW = document.getElementById("resetSW");

  function updateSWDisplay() {
    if (!swDisplay) return;
    const hrs = Math.floor(swTime / 3600);
    const mins = Math.floor((swTime % 3600) / 60);
    const secs = swTime % 60;
    swDisplay.textContent = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function startStopwatch(auto = false) {
    if (swInterval) return;
    let startTime;
    if (auto) startTime = parseInt(localStorage.getItem("swStart"));
    else {
      startTime = Math.floor(Date.now() / 1000) - swTime;
      try { localStorage.setItem("swStart", startTime); } catch (e) {}
    }
    isRunning = true;
    try { localStorage.setItem("swRunning", "true"); } catch (e) {}
    swInterval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      swTime = now - startTime;
      updateSWDisplay();
    }, 1000);
  }

  function pauseStopwatch() {
    clearInterval(swInterval);
    swInterval = null;
    isRunning = false;
    try {
      localStorage.setItem("swTime", swTime);
      localStorage.removeItem("swStart");
      localStorage.setItem("swRunning", "false");
    } catch (e) {}
  }

  // Extended Reset with Study History Integration
  const originalResetSW = function() {
    clearInterval(swInterval);
    swInterval = null;
    isRunning = false;
    swTime = 0;
    try {
      localStorage.removeItem("swStart");
      localStorage.removeItem("swTime");
      localStorage.removeItem("swRunning");
    } catch (e) {}
    updateSWDisplay();
  };

  if (resetSW) {
    resetSW.addEventListener("click", () => {
      if (swTime > 0) saveHistory(swTime);
      originalResetSW();
    });
  }

  function loadSWState() {
    try {
      const running = localStorage.getItem("swRunning") === "true";
      const savedTime = parseInt(localStorage.getItem("swTime")) || 0;
      const savedStart = parseInt(localStorage.getItem("swStart"));
      if (running && savedStart) {
        const now = Math.floor(Date.now() / 1000);
        swTime = now - savedStart;
        startStopwatch(true);
      } else swTime = savedTime;
      updateSWDisplay();
    } catch (e) {
      swTime = 0;
      updateSWDisplay();
    }
  }

  if (startSW) startSW.addEventListener("click", () => { if (!isRunning) startStopwatch(); });
  if (pauseSW) pauseSW.addEventListener("click", pauseStopwatch);
  loadSWState();

  // === STUDY HISTORY FEATURE ===
  const historyList = document.getElementById("historyList");
  const clearHistoryBtn = document.getElementById("clearHistory");

  function loadHistory() {
    if (!historyList) return;
    const saved = JSON.parse(localStorage.getItem("studyHistory") || "[]");
    historyList.innerHTML = "";
    saved.forEach(entry => {
      const li = document.createElement("li");
      li.textContent = `${entry.date} — ${entry.duration}`;
      historyList.appendChild(li);
    });
  }

  function saveHistory(timeInSeconds) {
    const hrs = Math.floor(timeInSeconds / 3600);
    const mins = Math.floor((timeInSeconds % 3600) / 60);
    const secs = timeInSeconds % 60;
    const duration = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    const saved = JSON.parse(localStorage.getItem("studyHistory") || "[]");
    const now = new Date();
    const entry = {
      date: now.toLocaleString('en-IN', { dateStyle: "medium", timeStyle: "short" }),
      duration
    };
    saved.unshift(entry);
    try { localStorage.setItem("studyHistory", JSON.stringify(saved)); } catch (e) {}
    loadHistory();
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
      if (confirm("Clear all study history?")) {
        try { localStorage.removeItem("studyHistory"); } catch (e) {}
        loadHistory();
      }
    });
  }

  loadHistory();

  // END of DOMContentLoaded
});
