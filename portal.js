const socks=[
 {id:"coral",icon:"🧦",symbol:"●",ro:"Șoseta Coral",en:"Coral Sock",color:"#ff7657"},
 {id:"violet",icon:"🧦",symbol:"◆",ro:"Șoseta Violet",en:"Violet Sock",color:"#a78bfa"},
 {id:"green",icon:"🧦",symbol:"▲",ro:"Șoseta Verde",en:"Green Sock",color:"#5ee0ad"},
 {id:"gold",icon:"🧦",symbol:"★",ro:"Șoseta Aurie",en:"Golden Sock",color:"#ffd166"}
];
const text={
 ro:{analysis:"Analiză",game:"Joc",progress:"Progres",kicker:"Noul centru de comandă al rufelor",hero1:"Găsește perechea.",hero2:"Salvează sertarul.",intro:"Explorează datele, joacă provocarea de sortare și descoperă cine se află în spatele dispariției șosetelor.",play:"Joacă acum",openLab:"Deschide laboratorul",moduleAnalysis:"Laborator de date",moduleAnalysisText:"Donut, pie, bar și exporturi",moduleGameText:"Joc rapid și accesibil",moduleProgress:"Centrul de progres",moduleProgressText:"Recorduri și realizări locale",mission:"Misiunea activă",gameIntro:"Trimite fiecare șosetă în sertarul cu simbolul identic.",difficulty:"Dificultate",easy:"Ușor",normal:"Normal",hard:"Greu",sound:"Sunet",scan:"Scanare",score:"Scor",best:"Record",level:"Nivel",time:"Timp",objective:"Obiectiv: sortează 10 șosete",ready:"Apasă Start pentru a începe.",waiting:"Așteaptă...",help:"Folosește tastele 1–4, săgețile și Enter sau atinge un sertar.",start:"Pornește jocul",localProgress:"Progres local",progressTitle:"Realizările tale",badgeFirst:"Prima pereche",badgeFirstText:"Sortează prima șosetă",badgeStreak:"În flăcări",badgeStreakText:"Ajunge la streak 5",badgeMission:"Salvatorul sertarului",badgeMissionText:"Finalizează o misiune",badgeScore:"Portal master",badgeScoreText:"Obține 250 de puncte",resetProgress:"Resetează progresul jocului",correct:"Corect!",wrong:"Sertar greșit.",over:"Timpul a expirat.",complete:"Misiune finalizată!",again:"Joacă din nou",drawer:"Sertarul",target:"Găsește sertarul pentru",points:"puncte",resetDone:"Progresul a fost resetat."},
 en:{analysis:"Analysis",game:"Game",progress:"Progress",kicker:"The new laundry command center",hero1:"Find the pair.",hero2:"Save the drawer.",intro:"Explore the data, play the sorting challenge and discover who is behind the missing socks.",play:"Play now",openLab:"Open data lab",moduleAnalysis:"Data laboratory",moduleAnalysisText:"Donut, pie, bar and exports",moduleGameText:"Fast accessible game",moduleProgress:"Progress center",moduleProgressText:"Local records and achievements",mission:"Active mission",gameIntro:"Send every sock to the drawer with the matching symbol.",difficulty:"Difficulty",easy:"Easy",normal:"Normal",hard:"Hard",sound:"Sound",scan:"Auto scan",score:"Score",best:"Best",level:"Level",time:"Time",objective:"Goal: sort 10 socks",ready:"Press Start to begin.",waiting:"Waiting...",help:"Use keys 1–4, arrow keys and Enter, or tap a drawer.",start:"Start game",localProgress:"Local progress",progressTitle:"Your achievements",badgeFirst:"First pair",badgeFirstText:"Sort your first sock",badgeStreak:"On fire",badgeStreakText:"Reach a streak of 5",badgeMission:"Drawer saver",badgeMissionText:"Complete one mission",badgeScore:"Portal master",badgeScoreText:"Score 250 points",resetProgress:"Reset game progress",correct:"Correct!",wrong:"Wrong drawer.",over:"Time is up.",complete:"Mission complete!",again:"Play again",drawer:"Drawer",target:"Find the drawer for",points:"points",resetDone:"Progress has been reset."}
};
const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
let language=localStorage.getItem("sock-portal-language")||"ro";
let active=false,score=0,streak=0,level=1,sorted=0,time=30,targetIndex=0,timer=null,scanTimer=null,scanIndex=0,soundOn=false,scanOn=false;
const saved=()=>{try{return JSON.parse(localStorage.getItem("sock-portal-progress")||'{"best":0,"badges":[]}')}catch{return{best:0,badges:[]}}};
let progress=saved();
function persist(){localStorage.setItem("sock-portal-progress",JSON.stringify(progress))}
function tr(){return text[language]}
function applyLanguage(){
 document.documentElement.lang=language;$$("[data-t]").forEach(el=>{const key=el.dataset.t;if(tr()[key])el.textContent=tr()[key]});
 $("#lang").textContent=language==="ro"?"EN":"RO";$("#lang").setAttribute("aria-label",language==="ro"?"Switch to English":"Schimbă în română");
 renderBaskets();if(active)newTarget(false);else $("#targetName").textContent=tr().waiting;
 localStorage.setItem("sock-portal-language",language)
}
$("#lang").addEventListener("click",()=>{language=language==="ro"?"en":"ro";applyLanguage()});
const savedTheme=localStorage.getItem("sock-portal-theme")||"dark";document.documentElement.dataset.theme=savedTheme;$("#theme").textContent=savedTheme==="dark"?"☀️":"🌙";
$("#theme").addEventListener("click",()=>{const next=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;$("#theme").textContent=next==="dark"?"☀️":"🌙";$("#theme").setAttribute("aria-pressed",String(next==="light"));localStorage.setItem("sock-portal-theme",next)});
function renderBaskets(){
 const box=$("#baskets");box.replaceChildren();socks.forEach((sock,index)=>{const button=document.createElement("button");button.type="button";button.className="basket";button.dataset.index=index;button.setAttribute("aria-label",(language==="ro"?tr().drawer:tr().drawer)+" "+(index+1)+": "+sock[language]);button.innerHTML="<span style='color:"+sock.color+"'>"+sock.icon+" "+sock.symbol+"</span><strong>"+sock[language]+"</strong><small>"+tr().drawer+" "+(index+1)+"</small>";button.addEventListener("click",()=>choose(index));box.append(button)})
}
function duration(){return{easy:45,normal:30,hard:20}[$("#difficulty").value]}
function points(){return{easy:8,normal:12,hard:18}[$("#difficulty").value]}
function startGame(){
 clearInterval(timer);stopScan();active=true;score=0;streak=0;level=1;sorted=0;time=duration();$("#start").textContent=tr().again;updateHud();newTarget(false);
 timer=setInterval(()=>{time--;updateHud();if(time<=0)endGame(false)},1000);if(scanOn)startScan();announce(tr().target+" "+socks[targetIndex][language])
}
function newTarget(announceIt=true){targetIndex=Math.floor(Math.random()*socks.length);const sock=socks[targetIndex];$("#targetSock").textContent=sock.icon+" "+sock.symbol;$("#targetSock").style.color=sock.color;$("#targetName").textContent=sock[language];if(announceIt)announce(tr().target+" "+sock[language])}
function choose(index){
 if(!active)return;const buttons=$$(".basket");buttons.forEach(b=>b.classList.remove("correct","wrong"));
 if(index===targetIndex){streak++;sorted++;score+=points()+Math.min(streak*2,20);level=1+Math.floor(sorted/5);time+=level>1?1:0;buttons[index].classList.add("correct");$("#gameStatus").textContent=tr().correct+" +"+points();beep(660);vibrate([30]);unlock("first");if(streak>=5)unlock("streak");if(score>=250)unlock("score");if(sorted>=10){unlock("mission");endGame(true);return}newTarget()}else{streak=0;score=Math.max(0,score-5);buttons[index].classList.add("wrong");$("#gameStatus").textContent=tr().wrong;beep(180);vibrate([70,40,70])}
 updateHud()
}
function updateHud(){$("#score").textContent=score;$("#best").textContent=Math.max(progress.best,score);$("#streak").textContent=streak;$("#level").textContent=level;$("#time").textContent=time;$("#missionCount").textContent=sorted+"/10";$("#missionBar").value=Math.min(sorted,10)}
function endGame(won){active=false;clearInterval(timer);stopScan();progress.best=Math.max(progress.best,score);persist();$("#gameStatus").textContent=(won?tr().complete:tr().over)+" "+score+" "+tr().points;$("#targetName").textContent=tr().waiting;$("#start").focus();updateHud();renderBadges();announce($("#gameStatus").textContent)}
function unlock(id){if(!progress.badges.includes(id)){progress.badges.push(id);persist();renderBadges();announce(tr().complete)}}
function renderBadges(){$$(".achievement-grid article").forEach(card=>card.classList.toggle("unlocked",progress.badges.includes(card.dataset.badge)));$("#best").textContent=progress.best}
function announce(message){$("#announcer").textContent="";setTimeout(()=>$("#announcer").textContent=message,30)}
function vibrate(pattern){if(navigator.vibrate)navigator.vibrate(pattern)}
function beep(frequency){if(!soundOn)return;const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;const context=new Context(),osc=context.createOscillator(),gain=context.createGain();osc.frequency.value=frequency;gain.gain.setValueAtTime(.07,context.currentTime);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+.12);osc.connect(gain).connect(context.destination);osc.start();osc.stop(context.currentTime+.12)}
$("#start").addEventListener("click",startGame);
$("#sound").addEventListener("click",()=>{soundOn=!soundOn;$("#sound").setAttribute("aria-pressed",String(soundOn));$("#sound span:first-child").textContent=soundOn?"🔊":"🔇";beep(520)});
$("#scan").addEventListener("click",()=>{scanOn=!scanOn;$("#scan").setAttribute("aria-pressed",String(scanOn));if(scanOn&&active)startScan();else stopScan()});
function startScan(){stopScan();scanTimer=setInterval(()=>{const buttons=$$(".basket");buttons.forEach(b=>b.classList.remove("scanning"));buttons[scanIndex%buttons.length].classList.add("scanning");buttons[scanIndex%buttons.length].focus({preventScroll:true});scanIndex++},1200)}
function stopScan(){clearInterval(scanTimer);$$(".basket").forEach(b=>b.classList.remove("scanning"))}
document.addEventListener("keydown",event=>{if(!active)return;if(["1","2","3","4"].includes(event.key))choose(Number(event.key)-1);if(scanOn&&(event.key===" "||event.key==="Enter")){event.preventDefault();choose((scanIndex-1+socks.length)%socks.length)}});
$("#resetProgress").addEventListener("click",()=>{progress={best:0,badges:[]};persist();renderBadges();announce(tr().resetDone)});
applyLanguage();renderBadges();updateHud();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
