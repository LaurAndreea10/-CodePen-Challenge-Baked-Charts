const ranges = {
  week: {
    title: "Last 7 days",
    total: 20,
    values: [45, 20, 20, 15]
  },
  month: {
    title: "Last 30 days",
    total: 40,
    values: [40, 25, 20, 15]
  },
  year: {
    title: "Last 12 months",
    total: 128,
    values: [36, 29, 18, 17]
  }
};

const categories = [
  {
    name: "Still paired",
    note: "Safe in the drawer",
    color: "#ff7657",
    icon: "🧦"
  },
  {
    name: "Dryer dimension",
    note: "Portal activity",
    color: "#ffc857",
    icon: "🌀"
  },
  {
    name: "Under the couch",
    note: "Dust ecosystem",
    color: "#8d70dc",
    icon: "🛋️"
  },
  {
    name: "Dog's secret stash",
    note: "Highly suspicious",
    color: "#55b990",
    icon: "🐕"
  }
];

const chartSegments = document.querySelector("#chartSegments");
const legend = document.querySelector("#legend");
const tooltip = document.querySelector("#tooltip");
const periodTitle = document.querySelector("#periodTitle");
const sockTotal = document.querySelector("#sockTotal");
const accessibleSummary = document.querySelector("#accessibleSummary");
const survivalRate = document.querySelector("#survivalRate");
const dryerRisk = document.querySelector("#dryerRisk");
const dogRisk = document.querySelector("#dogRisk");
const insightText = document.querySelector("#insightText");
const themeButton = document.querySelector("#themeButton");
const remixButton = document.querySelector("#remixButton");
const confettiLayer = document.querySelector("#confettiLayer");

const radius = 78;
const circumference = 2 * Math.PI * radius;
let currentRange = "month";

function renderChart(values, total, title) {
  chartSegments.innerHTML = "";
  legend.innerHTML = "";

  let offset = 0;

  values.forEach((value, index) => {
    const category = categories[index];
    const length = (value / 100) * circumference;
    const gap = 4;

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );

    circle.setAttribute("class", "segment");
    circle.setAttribute("cx", "110");
    circle.setAttribute("cy", "110");
    circle.setAttribute("r", radius);
    circle.setAttribute("stroke", category.color);
    circle.setAttribute(
      "stroke-dasharray",
      `${Math.max(length - gap, 0)} ${circumference}`
    );
    circle.setAttribute("stroke-dashoffset", -offset);
    circle.setAttribute("stroke-linecap", "round");
    circle.setAttribute("tabindex", "0");
    circle.setAttribute("role", "button");
    circle.setAttribute(
      "aria-label",
      `${category.name}: ${value} percent`
    );
    circle.style.animationDelay = `${index * 110}ms`;

    const showTooltip = event => {
      const point =
        event.touches?.[0] ||
        event;

      tooltip.innerHTML = `
        <strong>${category.icon} ${category.name}</strong><br>
        ${value}% · ${Math.round((value / 100) * total)} socks
      `;

      tooltip.style.left = `${point.clientX}px`;
      tooltip.style.top = `${point.clientY}px`;
      tooltip.classList.add("visible");
    };

    circle.addEventListener("pointermove", showTooltip);
    circle.addEventListener("pointerenter", showTooltip);
    circle.addEventListener("focus", () => {
      const bounds = circle.getBoundingClientRect();

      showTooltip({
        clientX: bounds.left + bounds.width / 2,
        clientY: bounds.top
      });
    });

    circle.addEventListener("pointerleave", hideTooltip);
    circle.addEventListener("blur", hideTooltip);

    chartSegments.append(circle);

    const legendButton = document.createElement("button");
    legendButton.className = "legend-item";
    legendButton.type = "button";
    legendButton.innerHTML = `
      <span
        class="legend-dot"
        style="background:${category.color};--dot-color:${category.color}"
      ></span>

      <span class="legend-copy">
        <strong>${category.icon} ${category.name}</strong>
        <small>${category.note}</small>
      </span>

      <span class="legend-value">${value}%</span>
    `;

    legendButton.addEventListener("mouseenter", () => {
      circle.style.strokeWidth = "34";
      circle.style.filter = "brightness(1.08)";
    });

    legendButton.addEventListener("mouseleave", () => {
      circle.style.strokeWidth = "";
      circle.style.filter = "";
    });

    legendButton.addEventListener("click", () => {
      announceCategory(category, value, total);
    });

    legend.append(legendButton);
    offset += length;
  });

  periodTitle.textContent = title;
  animateNumber(sockTotal, total);

  survivalRate.textContent = `${values[0]}%`;
  dryerRisk.textContent = `${values[1]}%`;
  dogRisk.textContent = `${values[3]}%`;

  accessibleSummary.textContent = values
    .map((value, index) => `${categories[index].name}: ${value}%`)
    .join(". ");

  updateInsight(values);
}

function hideTooltip() {
  tooltip.classList.remove("visible");
}

function announceCategory(category, value, total) {
  const amount = Math.round((value / 100) * total);

  accessibleSummary.textContent =
    `${category.name}: ${value} percent, approximately ${amount} socks.`;

  insightText.textContent =
    `${category.icon} ${amount} tracked socks are associated with ` +
    `${category.name.toLowerCase()}. ${category.note}.`;
}

function updateInsight(values) {
  const highestMissingValue = Math.max(...values.slice(1));
  const highestIndex = values.indexOf(highestMissingValue);
  const category = categories[highestIndex];

  insightText.textContent =
    `${category.name} is currently the main disappearance zone at ` +
    `${highestMissingValue}%. Pair socks immediately and inspect all ` +
    `suspicious portals before starting another wash.`;
}

function animateNumber(element, target) {
  const start = Number(element.textContent) || 0;
  const duration = 550;
  const startTime = performance.now();

  function update(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    element.textContent = Math.round(start + (target - start) * eased);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function generateRandomValues() {
  const first = randomNumber(32, 55);
  const second = randomNumber(15, 30);
  const third = randomNumber(10, 25);
  const fourth = 100 - first - second - third;

  if (fourth < 8) {
    return generateRandomValues();
  }

  return [first, second, third, fourth];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function launchConfetti() {
  const colors = ["#ff7657", "#ffc857", "#8d70dc", "#55b990"];

  for (let index = 0; index < 38; index++) {
    const piece = document.createElement("span");

    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background =
      colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 350}ms`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;

    confettiLayer.append(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector(".tab.active")?.classList.remove("active");
    button.classList.add("active");

    currentRange = button.dataset.range;
    const data = ranges[currentRange];

    renderChart(data.values, data.total, data.title);
  });
});

remixButton.addEventListener("click", () => {
  const values = generateRandomValues();
  const baseData = ranges[currentRange];

  ranges[currentRange].values = values;

  renderChart(values, baseData.total, baseData.title);
  launchConfetti();

  document.querySelector("#updatedTime").textContent =
    "Freshly baked just now";
});

themeButton.addEventListener("click", () => {
  const isDark =
    document.documentElement.dataset.theme === "dark";

  document.documentElement.dataset.theme =
    isDark ? "light" : "dark";

  themeButton.setAttribute("aria-pressed", String(!isDark));
  themeButton.querySelector("span").textContent =
    isDark ? "🌙" : "☀️";

  localStorage.setItem(
    "baked-charts-theme",
    isDark ? "light" : "dark"
  );
});

const savedTheme = localStorage.getItem("baked-charts-theme");

if (savedTheme) {
  document.documentElement.dataset.theme = savedTheme;
  themeButton.setAttribute(
    "aria-pressed",
    String(savedTheme === "dark")
  );
  themeButton.querySelector("span").textContent =
    savedTheme === "dark" ? "☀️" : "🌙";
}

renderChart(
  ranges.month.values,
  ranges.month.total,
  ranges.month.title
);
