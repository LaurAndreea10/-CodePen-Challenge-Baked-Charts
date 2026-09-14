const categories = [
        {
          name: "Still paired",
          description: "Safe in the drawer",
          caption: "still paired",
          icon: "🧦",
          color: "#e07a5f"
        },
        {
          name: "Dryer dimension",
          description: "Portal activity detected",
          caption: "dryer dimension",
          icon: "🌀",
          color: "#8d6a9f"
        },
        {
          name: "Under the couch",
          description: "Dust ecosystem",
          caption: "under the couch",
          icon: "🛋️",
          color: "#3d9a8b"
        },
        {
          name: "Dog's secret stash",
          description: "Highly suspicious",
          caption: "dog's stash",
          icon: "🐕",
          color: "#f2a541"
        }
      ];

      const reports = {
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

      const circumference = 2 * Math.PI * 25;

      const chartSlices = document.querySelector("#chartSlices");
      const legend = document.querySelector("#legend");
      const centerValue = document.querySelector("#centerValue");
      const centerCaption = document.querySelector("#centerCaption");
      const announcement = document.querySelector("#chartAnnouncement");
      const periodLabel = document.querySelector("#periodLabel");
      const survivalMetric = document.querySelector("#survivalMetric");
      const dryerMetric = document.querySelector("#dryerMetric");
      const dogMetric = document.querySelector("#dogMetric");
      const insightTitle = document.querySelector("#insightTitle");
      const insightText = document.querySelector("#insightText");
      const confidence = document.querySelector("#confidence");
      const bakeButton = document.querySelector("#bakeButton");
      const themeButton = document.querySelector("#themeButton");
      const confettiLayer = document.querySelector("#confettiLayer");

      let currentRange = "month";
      let selectedCategory = null;

      function renderChart() {
        const report = reports[currentRange];
        let offset = 0;

        chartSlices.replaceChildren();
        legend.replaceChildren();

        report.values.forEach((value, index) => {
          const category = categories[index];
          const segmentLength = (value / 100) * circumference;

          const circle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
          );

          circle.classList.add("slice");
          circle.dataset.index = index;
          circle.setAttribute("r", "25");
          circle.setAttribute("cx", "50");
          circle.setAttribute("cy", "50");
          circle.setAttribute("stroke", category.color);
          circle.setAttribute(
            "stroke-dasharray",
            `${Math.max(segmentLength - 1.1, 0)} ${circumference}`
          );
          circle.setAttribute("stroke-dashoffset", String(-offset));
          circle.setAttribute("tabindex", "0");
          circle.setAttribute("role", "button");
          circle.setAttribute(
            "aria-label",
            `${category.name}: ${value} percent`
          );

          circle.style.animationDelay = `${index * 140}ms`;

          chartSlices.append(circle);

          const item = document.createElement("li");
          item.dataset.index = index;
          item.tabIndex = 0;
          item.setAttribute("role", "button");
          item.setAttribute(
            "aria-label",
            `Show ${category.name}, ${value} percent`
          );

          item.innerHTML = `
            <span
              class="legend-dot"
              style="--legend-color:${category.color}"
            ></span>

            <span class="legend-copy">
              <strong>${category.icon} ${category.name}</strong>
              <small>${category.description}</small>
            </span>

            <b>${value}%</b>
          `;

          legend.append(item);
          offset += segmentLength;
        });

        periodLabel.textContent = report.title;
        survivalMetric.textContent = `${report.values[0]}%`;
        dryerMetric.textContent = `${report.values[1]}%`;
        dogMetric.textContent = `${report.values[3]}%`;

        bindChartEvents();
        resetSelection();
        updateInsight();
      }

      function bindChartEvents() {
        const slices = [...document.querySelectorAll(".slice")];
        const items = [...legend.querySelectorAll("li")];

        [...slices, ...items].forEach((element) => {
          const index = Number(element.dataset.index);

          element.addEventListener("mouseenter", () => {
            activateCategory(index);
          });

          element.addEventListener("mouseleave", () => {
            if (selectedCategory === null) resetSelection();
          });

          element.addEventListener("focus", () => {
            activateCategory(index);
          });

          element.addEventListener("blur", () => {
            if (selectedCategory === null) resetSelection();
          });

          element.addEventListener("click", () => {
            if (selectedCategory === index) {
              selectedCategory = null;
              resetSelection();
            } else {
              selectedCategory = index;
              activateCategory(index);
            }
          });

          element.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              element.click();
            }

            if (event.key === "Escape") {
              selectedCategory = null;
              resetSelection();
              element.blur();
            }
          });
        });
      }

      function activateCategory(index) {
        const report = reports[currentRange];
        const category = categories[index];
        const value = report.values[index];
        const amount = Math.round((value / 100) * report.total);

        document.querySelectorAll(".slice").forEach((slice, position) => {
          slice.classList.toggle("active", position === index);
          slice.classList.toggle("muted", position !== index);
        });

        legend.querySelectorAll("li").forEach((item, position) => {
          item.classList.toggle("active", position === index);
          item.classList.toggle("muted", position !== index);
        });

        centerValue.textContent = `${value}%`;
        centerCaption.textContent = category.caption;

        announcement.textContent =
          `${category.name}: ${value} percent, approximately ` +
          `${amount} tracked socks. ${category.description}.`;
      }

      function resetSelection() {
        document.querySelectorAll(".slice").forEach((slice) => {
          slice.classList.remove("active", "muted");
        });

        legend.querySelectorAll("li").forEach((item) => {
          item.classList.remove("active", "muted");
        });

        centerValue.textContent = reports[currentRange].total;
        centerCaption.textContent = "socks tracked";
        announcement.textContent = "All sock categories are displayed.";
      }

      function updateInsight() {
        const values = reports[currentRange].values;
        const missingValues = values.slice(1);
        const highestMissing = Math.max(...missingValues);
        const index = values.indexOf(highestMissing);
        const category = categories[index];

        insightTitle.textContent = `${category.name} leads the mystery.`;

        insightText.textContent =
          `${category.description}. It currently accounts for ` +
          `${highestMissing}% of missing socks. Immediate investigation ` +
          `and emergency sock pairing are recommended.`;

        confidence.textContent =
          `${Math.min(99, 65 + highestMissing)}% suspicious`;
      }

      function randomValues() {
        const paired = randomNumber(32, 52);
        const dryer = randomNumber(18, 30);
        const couch = randomNumber(12, 24);
        const dog = 100 - paired - dryer - couch;

        if (dog < 8 || dog > 25) return randomValues();

        return [paired, dryer, couch, dog];
      }

      function randomNumber(minimum, maximum) {
        return Math.floor(
          Math.random() * (maximum - minimum + 1) + minimum
        );
      }

      function launchConfetti() {
        if (
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          return;
        }

        const colors = categories.map((category) => category.color);

        for (let index = 0; index < 35; index += 1) {
          const piece = document.createElement("span");

          piece.className = "confetti";
          piece.style.left = `${Math.random() * 100}%`;
          piece.style.background =
            colors[Math.floor(Math.random() * colors.length)];
          piece.style.animationDelay = `${Math.random() * 300}ms`;

          confettiLayer.append(piece);
          piece.addEventListener("animationend", () => piece.remove());
        }
      }

      document.querySelectorAll(".range-button").forEach((button) => {
        button.addEventListener("click", () => {
          document
            .querySelector(".range-button.active")
            ?.classList.remove("active");

          button.classList.add("active");
          currentRange = button.dataset.range;
          selectedCategory = null;

          renderChart();
        });
      });

      bakeButton.addEventListener("click", () => {
        reports[currentRange].values = randomValues();
        selectedCategory = null;

        renderChart();
        launchConfetti();

        document.querySelector("#updatedTime").textContent =
          "Case #404 · Freshly baked just now";
      });

      themeButton.addEventListener("click", () => {
        const darkMode =
          document.documentElement.dataset.theme === "dark";

        const newTheme = darkMode ? "light" : "dark";

        document.documentElement.dataset.theme = newTheme;
        localStorage.setItem("sockspiracy-theme", newTheme);

        themeButton.setAttribute(
          "aria-pressed",
          String(newTheme === "dark")
        );

        themeButton.setAttribute(
          "aria-label",
          newTheme === "dark"
            ? "Switch to light theme"
            : "Switch to dark theme"
        );

        themeButton.querySelector("[aria-hidden]").textContent =
          newTheme === "dark" ? "☀️" : "🌙";

        themeButton.querySelector(".theme-text").textContent =
          newTheme === "dark" ? i18n[currentLanguage].themeLight : i18n[currentLanguage].themeDark;
      });

      const savedTheme = localStorage.getItem("sockspiracy-theme");

      if (savedTheme === "dark") {
        document.documentElement.dataset.theme = "dark";
        themeButton.setAttribute("aria-pressed", "true");
        themeButton.setAttribute("aria-label", "Switch to light theme");
        themeButton.querySelector("[aria-hidden]").textContent = "☀️";
        themeButton.querySelector(".theme-text").textContent =
          "Light mode";
      }

      renderChart();

const i18n={"ro":{"title":"Sockspiracy — Grafic interactiv accesibil | LaurAi","challenge":"Provocare CodePen · Baked Charts","hero1":"Marea","hero2":"conspirație a șosetelor.","intro":"O investigație deloc științifică despre locul în care dispar șosetele după ce intră în sistemul de spălare.","status":"Misterul rufelor este activ","week":"7 zile","month":"30 de zile","year":"1 an","bake":"Generează date noi","label":"Analiza rufelor","chart":"Unde dispar șosetele mele","live":"Date actualizate","metrics":["Rata perechilor salvate","Riscul portalului uscătorului","Implicarea câinelui"],"notes":["↑ 6% luna aceasta","Probabilitate ridicată","În curs de investigare"],"insight":"Concluzie proaspăt generată","footer":"Creat cu date, firimituri și șosete suspecte.","updated":"Cazul #404 · Actualizat acum","themeDark":"Mod întunecat","themeLight":"Mod luminos","access":"Accesibilitate","settings":"Preferințe de afișare","contrast":"Contrast ridicat","contrastDesc":"Mărește diferența dintre text și fundal","font":"Text mărit","fontDesc":"Mărește textul și comenzile","motion":"Reduce animațiile","motionDesc":"Oprește mișcările decorative","reset":"Resetează preferințele","periods":["Ultimele 7 zile","Ultimele 30 de zile","Ultimele 12 luni"],"cats":[["Încă în pereche","În siguranță în sertar","încă în pereche"],["Dimensiunea uscătorului","Activitate de portal detectată","dimensiunea uscătorului"],["Sub canapea","Ecosistem de praf","sub canapea"],["Ascunzătoarea câinelui","Foarte suspect","ascunzătoarea câinelui"]],"tracked":"șosete urmărite","all":"Sunt afișate toate categoriile de șosete.","suspicious":"suspect","leads":"conduce misterul.","accounts":"Reprezintă în prezent","recommend":"din șosetele dispărute. Se recomandă investigarea imediată."},"en":{"title":"Sockspiracy — Interactive Accessible Sock Chart | LaurAi","challenge":"CodePen Challenge · Baked Charts","hero1":"The great","hero2":"sockspiracy.","intro":"A scientifically questionable investigation into where socks disappear after entering the laundry system.","status":"Laundry mystery active","week":"7 days","month":"30 days","year":"1 year","bake":"Bake new data","label":"Laundry intelligence","chart":"Where my socks go","live":"Live crumbs","metrics":["Pair survival rate","Dryer portal risk","Dog involvement"],"notes":["↑ 6% this month","High probability","Under investigation"],"insight":"Freshly baked insight","footer":"Baked with data, crumbs and suspicious socks.","updated":"Case #404 · Updated just now","themeDark":"Dark mode","themeLight":"Light mode","access":"Accessibility","settings":"Display preferences","contrast":"High contrast","contrastDesc":"Increases the difference between text and background","font":"Larger text","fontDesc":"Enlarges text and controls","motion":"Reduce motion","motionDesc":"Stops decorative animations","reset":"Reset preferences","periods":["Last 7 days","Last 30 days","Last 12 months"],"cats":[["Still paired","Safe in the drawer","still paired"],["Dryer dimension","Portal activity detected","dryer dimension"],["Under the couch","Dust ecosystem","under the couch"],["Dog's secret stash","Highly suspicious","dog's stash"]],"tracked":"socks tracked","all":"All sock categories are displayed.","suspicious":"suspicious","leads":"leads the mystery.","accounts":"It currently accounts for","recommend":"of missing socks. Immediate investigation is recommended."}};
let currentLanguage=localStorage.getItem("sockspiracy-language")||"ro";
const languageButtons=document.querySelectorAll(".language-button");
const accessibilityPanel=document.querySelector("#accessibilityPanel");
const accessibilityButton=document.querySelector("#accessibilityButton");
const closeAccessibility=document.querySelector("#closeAccessibility");
const contrastButton=document.querySelector("#contrastButton");
const fontButton=document.querySelector("#fontButton");
const motionButton=document.querySelector("#motionButton");
const settingsAnnouncement=document.querySelector("#settingsAnnouncement");

function setText(selector,value){const element=document.querySelector(selector);if(element)element.textContent=value}
function applyLanguage(language){
 currentLanguage=language;const d=i18n[language];document.documentElement.lang=language;document.title=d.title;
 setText(".eyebrow",d.challenge);const heroHeading=document.querySelector(".hero h1");if(heroHeading)heroHeading.innerHTML=d.hero1+"<span>"+d.hero2+"</span>";
 setText(".intro",d.intro);setText(".status",d.status);
 const rangeButtons=document.querySelectorAll(".range-button");[d.week,d.month,d.year].forEach((v,i)=>{if(rangeButtons[i])rangeButtons[i].textContent=v});
 const bakeText=document.querySelector("#bakeButton");if(bakeText)bakeText.lastChild.textContent=" "+d.bake;
 setText(".card-header .label",d.label);setText(".card-header h2",d.chart);setText(".live-pill",d.live);
 document.querySelectorAll(".metric p").forEach((el,i)=>el.textContent=d.metrics[i]);
 document.querySelectorAll(".metric small").forEach((el,i)=>el.textContent=d.notes[i]);
 setText(".insight .label",d.insight);setText("footer p:first-child",d.footer);setText("#updatedTime",d.updated);
 setText("#accessibilityButtonText",d.access);setText("#displaySettings",d.settings);setText("#accessibilityTitle",d.access);
 setText("#contrastTitle",d.contrast);setText("#contrastDescription",d.contrastDesc);setText("#fontTitle",d.font);setText("#fontDescription",d.fontDesc);
 setText("#motionTitle",d.motion);setText("#motionDescription",d.motionDesc);setText("#resetAccessibility",d.reset);
 categories.forEach((c,i)=>{c.name=d.cats[i][0];c.description=d.cats[i][1];c.caption=d.cats[i][2]});
 reports.week.title=d.periods[0];reports.month.title=d.periods[1];reports.year.title=d.periods[2];
 languageButtons.forEach(b=>{const on=b.dataset.language===language;b.classList.toggle("active",on);b.setAttribute("aria-pressed",String(on))});
 const dark=document.documentElement.dataset.theme==="dark";themeButton.querySelector(".theme-text").textContent=dark?d.themeLight:d.themeDark;
 localStorage.setItem("sockspiracy-language",language);renderChart();
}
languageButtons.forEach(button=>button.addEventListener("click",()=>applyLanguage(button.dataset.language)));
function togglePanel(open){accessibilityPanel.hidden=!open;accessibilityButton.setAttribute("aria-expanded",String(open));(open?closeAccessibility:accessibilityButton).focus()}
accessibilityButton.addEventListener("click",()=>togglePanel(accessibilityPanel.hidden));
closeAccessibility.addEventListener("click",()=>togglePanel(false));
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!accessibilityPanel.hidden)togglePanel(false)});
function preference(button,className,key){const on=!document.documentElement.classList.contains(className);document.documentElement.classList.toggle(className,on);button.setAttribute("aria-pressed",String(on));localStorage.setItem(key,String(on));settingsAnnouncement.textContent=button.querySelector("strong")?.textContent+" "+(on?"on":"off")}
contrastButton.addEventListener("click",()=>preference(contrastButton,"high-contrast","sockspiracy-contrast"));
fontButton.addEventListener("click",()=>preference(fontButton,"large-text","sockspiracy-font"));
motionButton.addEventListener("click",()=>preference(motionButton,"reduce-motion","sockspiracy-motion"));
[["sockspiracy-contrast","high-contrast",contrastButton],["sockspiracy-font","large-text",fontButton],["sockspiracy-motion","reduce-motion",motionButton]].forEach(([key,cls,button])=>{const on=localStorage.getItem(key)==="true";document.documentElement.classList.toggle(cls,on);button.setAttribute("aria-pressed",String(on))});
document.querySelector("#resetAccessibility").addEventListener("click",()=>{[["sockspiracy-contrast","high-contrast",contrastButton],["sockspiracy-font","large-text",fontButton],["sockspiracy-motion","reduce-motion",motionButton]].forEach(([key,cls,button])=>{localStorage.removeItem(key);document.documentElement.classList.remove(cls);button.setAttribute("aria-pressed","false")});settingsAnnouncement.textContent=i18n[currentLanguage].reset});
updateInsight=function(){const d=i18n[currentLanguage];const values=reports[currentRange].values;const highest=Math.max(...values.slice(1));const index=values.indexOf(highest);const category=categories[index];insightTitle.textContent=category.name+" "+d.leads;insightText.textContent=category.description+". "+d.accounts+" "+highest+"% "+d.recommend;confidence.textContent=Math.min(99,65+highest)+"% "+d.suspicious};
applyLanguage(currentLanguage);
