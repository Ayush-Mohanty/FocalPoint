document.addEventListener("DOMContentLoaded", () => {
  // === THEME NAMES (must be available before applyBackground) ===
  const themeNames = {
    calm: "Calm Gradient",
    night: "Night Sky",
    interactive: "Interactive Starfield",
    aurora: "Aurora Waves",
  };

  // --- MODE SWITCHING ---
  const timerModeBtn = document.getElementById("timerMode");
  const stopwatchModeBtn = document.getElementById("stopwatchMode");
  const timerSection = document.getElementById("timerSection");
  const stopwatchSection = document.getElementById("stopwatchSection");

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

  // --- BACKGROUND SWITCHER ---
  function applyBackground(bg) {
    document.body.className = bg;
    localStorage.setItem("bgTheme", bg);

    // Remove old canvases
    ["starfield", "auroraCanvas"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    // Create interactives
    if (bg === "interactive") createStarfield();
    else if (bg === "aurora") createAurora();

    showToast(`🌈 ${themeNames[bg]} Activated`);
  }

  // Load saved theme (must load before we set UI selected label)
  const savedTheme = localStorage.getItem("bgTheme") || "calm";
  applyBackground(savedTheme);

  // --- CUSTOM DROPDOWN ---
  const customDropdown = document.getElementById("customDropdown");
  const selectedOption = document.getElementById("selectedOption");
  const dropdownList = document.getElementById("dropdownList");

  // Protect in case HTML IDs are missing
  if (selectedOption && themeNames[savedTheme]) {
    selectedOption.textContent = themeNames[savedTheme];
  }

  // Toggle open/close
  if (selectedOption && dropdownList && customDropdown) {
    selectedOption.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownList.classList.toggle("hidden");
      customDropdown.classList.toggle("active");
    });

    // Select background
    dropdownList.querySelectorAll("div").forEach((option) => {
      option.addEventListener("click", () => {
        const value = option.getAttribute("data-value");
        selectedOption.textContent = option.textContent.trim();
        dropdownList.classList.add("hidden");
        customDropdown.classList.remove("active");
        applyBackground(value);
      });
    });

    // Click outside to close
    document.addEventListener("click", (e) => {
      if (!customDropdown.contains(e.target)) {
        dropdownList.classList.add("hidden");
        customDropdown.classList.remove("active");
      }
    });
  }

  // --- STARFIELD BACKGROUND ---
  function createStarfield() {
    const canvas = document.createElement("canvas");
    canvas.id = "starfield";
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
      r: Math.random() * 1.2,
      s: Math.random() * 0.3 + 0.05,
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
        ctx.arc(star.x + mx * 50, star.y + my * 50, star.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fill();

        star.y += star.s;
        if (star.y > canvas.height) star.y = 0;
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // --- AURORA WAVES BACKGROUND ---
  function createAurora() {
    const canvas = document.createElement("canvas");
    canvas.id = "auroraCanvas";
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
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, `hsl(${t % 360}, 80%, 60%)`);
      grad.addColorStop(1, `hsl(${(t + 120) % 360}, 70%, 50%)`);
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
        ctx.strokeStyle = `hsla(${(t * 2 + i * 60) % 360}, 100%, 70%, 0.3)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      t += 0.5;
      requestAnimationFrame(animate);
    }
    animate();
  }

  // --- TOAST NOTIFICATION ---
  function showToast(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.background = "rgba(255,255,255,0.12)";
    toast.style.border = "1px solid rgba(255,255,255,0.2)";
    toast.style.backdropFilter = "blur(8px)";
    toast.style.padding = "10px 18px";
    toast.style.borderRadius = "12px";
    toast.style.color = "#fff";
    toast.style.fontSize = "14px";
    toast.style.boxShadow = "0 0 15px rgba(255,255,255,0.12)";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    toast.style.transition = "opacity 0.35s ease, transform 0.35s ease";
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      setTimeout(() => toast.remove(), 400);
    }, 1600);
  }

  // --- TIMER ---
  let timerInterval, totalTime = 0, timeLeft = 0;
  const timerDisplay = document.getElementById("timerDisplay");
  const startBtn = document.getElementById("startTimer");
  const pauseBtn = document.getElementById("pauseTimer");
  const resetBtn = document.getElementById("resetTimer");
  const setBtn = document.getElementById("setTime");
  const minutesInput = document.getElementById("minutesInput");

  function updateTimerDisplay() {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    timerDisplay.textContent = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function saveTimerState(endTime) {
    localStorage.setItem("timerEnd", endTime);
    localStorage.setItem("timerTotal", totalTime);
  }

  function loadTimerState() {
    const end = parseInt(localStorage.getItem("timerEnd"));
    const total = parseInt(localStorage.getItem("timerTotal"));
    const now = Math.floor(Date.now() / 1000);
    if (end && total) {
      const diff = end - now;
      if (diff > 0) {
        totalTime = total;
        timeLeft = diff;
        startTimer(true);
      } else {
        localStorage.removeItem("timerEnd");
        localStorage.removeItem("timerTotal");
      }
    }
  }

  function startTimer(auto = false) {
    if (timerInterval) return;
    const endTime = auto ? parseInt(localStorage.getItem("timerEnd")) : Math.floor(Date.now() / 1000) + timeLeft;
    saveTimerState(endTime);
    timerInterval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      timeLeft = endTime - now;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        localStorage.removeItem("timerEnd");
        localStorage.removeItem("timerTotal");
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
    localStorage.removeItem("timerEnd");
    localStorage.setItem("timerLeft", timeLeft);
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    localStorage.removeItem("timerEnd");
    localStorage.removeItem("timerTotal");
    timeLeft = totalTime;
    updateTimerDisplay();
  }

  setBtn.addEventListener("click", () => {
    const mins = parseInt(minutesInput.value);
    if (!mins || mins <= 0) {
      alert("Enter a valid number of minutes.");
      return;
    }
    totalTime = mins * 60;
    timeLeft = totalTime;
    updateTimerDisplay();
    localStorage.removeItem("timerEnd");
    localStorage.removeItem("timerTotal");
  });

  startBtn.addEventListener("click", () => {
    if (timeLeft <= 0) timeLeft = totalTime;
    startTimer();
  });
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);

  loadTimerState();
  updateTimerDisplay();

  // --- STOPWATCH ---
  let swInterval, swTime = 0, isRunning = false;
  const swDisplay = document.getElementById("stopwatchDisplay");
  const startSW = document.getElementById("startSW");
  const pauseSW = document.getElementById("pauseSW");
  const resetSW = document.getElementById("resetSW");

  function updateSWDisplay() {
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
      localStorage.setItem("swStart", startTime);
    }
    isRunning = true;
    localStorage.setItem("swRunning", "true");
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
    localStorage.setItem("swTime", swTime);
    localStorage.removeItem("swStart");
    localStorage.setItem("swRunning", "false");
  }

  function resetStopwatch() {
    clearInterval(swInterval);
    swInterval = null;
    isRunning = false;
    swTime = 0;
    localStorage.removeItem("swStart");
    localStorage.removeItem("swTime");
    localStorage.removeItem("swRunning");
    updateSWDisplay();
  }

  function loadSWState() {
    const running = localStorage.getItem("swRunning") === "true";
    const savedTime = parseInt(localStorage.getItem("swTime")) || 0;
    const savedStart = parseInt(localStorage.getItem("swStart"));
    if (running && savedStart) {
      const now = Math.floor(Date.now() / 1000);
      swTime = now - savedStart;
      startStopwatch(true);
    } else swTime = savedTime;
    updateSWDisplay();
  }

  startSW.addEventListener("click", () => { if (!isRunning) startStopwatch(); });
  pauseSW.addEventListener("click", pauseStopwatch);
  resetSW.addEventListener("click", resetStopwatch);
  loadSWState();
});
