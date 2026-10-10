const $ = (s) => document.querySelector(s);
const STORE = "ecoquest_multi_v1";
const quotes = [
 "Small green habits grow into a big beautiful future.",
 "Be the reason your corner of Earth feels loved.",
 "The Earth is not a bin. Let's keep it beautiful, together.",
 "A cleaner planet begins with the next small thing you do.",
 "Waste less today. Protect more tomorrow.",
 "There is no Planet B, but there are millions of ways to help Planet A."
];
const tips = [
 "Switch off lights when you leave a room, and unplug chargers when not in use.",
 "Use daylight instead of switching on lights whenever possible.",
 "Separate e-waste and take it to an authorised collection point.",
 "Reuse containers and repair items before replacing them.",
 "Walk, cycle, or use public transport for short trips when safe."
];
const flowerChoices = ["🌼","🌸","🌻","🌺","🌷","💮","🪻"];
const demoLeaders = [
 {name:"GreenGuru",emoji:"🌳",points:320,reports:32},
 {name:"CleanCrusader",emoji:"🧤",points:280,reports:28},
 {name:"EcoQueen",emoji:"🌸",points:250,reports:25},
 {name:"NatureNerd",emoji:"🌿",points:210,reports:21},
 {name:"PlanetPal",emoji:"🌎",points:180,reports:18}
];
let data;
try {
 data = JSON.parse(localStorage.getItem(STORE)) || {reports:[],days:[],rewardClaimed:false,name:""};
} catch(e) {
 data = {reports:[],days:[],rewardClaimed:false};
}
data.reports ||= [];
data.days ||= [];
data.name ||= "";
let selectedPhoto = "";
let toastTimer;

function saveData() {
 try { localStorage.setItem(STORE, JSON.stringify(data)); }
 catch(e) { showToast("Storage full. Please use a smaller image."); }
}
function dayKey(date = new Date()) {
 return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function streakCount() {
 const days = [...new Set(data.days)].sort().reverse();
 if (!days.length) return 0;
 const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
 if (days[0] !== dayKey() && days[0] !== dayKey(yesterday)) return 0;
 let count=0, cursor=new Date(days[0]+"T12:00:00");
 for (const day of days) {
  if (day !== dayKey(cursor)) break;
  count++; cursor.setDate(cursor.getDate()-1);
 }
 return count;
}
function escapeHTML(s) {
 return String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function showToast(text) {
 const el=$("#toast"); if(!el)return;
 el.textContent=text;el.classList.add("show");
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2700);
}
function renderGreeting() {
 const name = (data.name || "").trim();
 const nav = $("#navGreeting");
 if (nav) nav.textContent = name ? `Hello, ${name}!` : "Hello, Explorer!";
 const title = $("#welcomeTitle");
 if (title) title.innerHTML = `${name ? `Hello, ${escapeHTML(name)}` : "Hello, Green Explorer"}! <span>🌱</span>`;
 const welcomePanel = $("#welcome");
 if (welcomePanel) welcomePanel.classList.toggle("name-saved", Boolean(name));
 const input = $("#visitorName");
 if (input && document.activeElement !== input) input.value = "";
}
const nameForm = $("#nameForm");
if (nameForm) nameForm.addEventListener("submit", event => {
 event.preventDefault();
 const name = $("#visitorName").value.trim();
 if (!name) { showToast("Please enter your name first."); return; }
 data.name = name.slice(0, 32);
 saveData();
 renderGreeting();
 // Clear the input after saving; the greeting keeps the saved name.
 $("#visitorName").value = "";
 showToast(`Welcome to EcoQuest, ${data.name}! 🌱`);
});
function renderGarden() {
 const garden=$("#garden"); if(!garden)return;
 garden.innerHTML="";
 if(!data.reports.length) garden.innerHTML='<span class="muted">Your first flower is waiting 🌱</span>';
 data.reports.slice(-35).forEach((r,i)=>{
  const f=document.createElement("span");f.className="flower";f.textContent=r.flower;f.style.animationDelay=`${Math.min(i*.02,.4)}s`;garden.appendChild(f);
 });
 $("#flowerCount").textContent=data.reports.length;
 const streak=streakCount();
 $("#streakCount").textContent=streak;
 $("#streakMessage").textContent=streak>=7?"Amazing! Your seven-day streak is complete.":streak===0?"Your journey starts today.":`${7-streak} more day(s) to unlock your reward!`;
 const track=$("#streakTrack");
 if(track) {
  track.innerHTML="";
  ["🌱","💧","♻️","🌿","🌼","🌳","🏆"].forEach((emoji,i)=>{
   const step=document.createElement("div");step.className="streak-step"+(i<streak?" done":"");
   step.innerHTML=`<span>${i<streak?"✓":emoji}</span><small>Day ${i+1}</small>`;track.appendChild(step);
  });
 }
 const rb=$("#rewardButton");
 if(rb){rb.disabled=streak<7||data.rewardClaimed;rb.textContent=data.rewardClaimed?"Reward claimed ✓":streak>=7?"Claim your reward 🎉":"Unlock at 7 days";}
 const home=$("#homeReports");if(home)home.textContent=data.reports.length;
 renderGreeting();
}
function renderCommunity() {
 const container=$("#communityPosts");if(!container)return;
 if(!data.reports.length){container.innerHTML='<p class="muted">No reports yet. Be the first to share a photo from your surroundings.</p>';return;}
 container.innerHTML=[...data.reports].reverse().map(r=>`<article class="feed-card"><div class="feed-photo"><img src="${r.photo}" alt="Waste report photo"></div><div class="feed-content"><h3>🌱 ${escapeHTML(r.author||data.name||"Green Explorer")}</h3><p>${escapeHTML(r.description)}</p><small>⌖ ${escapeHTML(r.location||"Location not added")} · ${escapeHTML(r.type||"Waste")}</small><p style="margin-top:10px">${r.flower} Flower earned</p><button class="like-btn" data-like="${r.id}">♡ Cheer them on</button></div></article>`).join("");
 container.querySelectorAll("[data-like]").forEach(btn=>btn.addEventListener("click",()=>{btn.textContent="♥ Cheered on!";btn.disabled=true;showToast("A little encouragement goes a long way!");}));
}
function renderLeaderboard() {
 const box=$("#leaderRows");if(!box)return;
 const mine={name:"You",emoji:"🌱",points:data.reports.length*10+(data.points||0),reports:data.reports.length,mine:true};
 const leaders=[...demoLeaders,mine].sort((a,b)=>b.points-a.points);
 box.innerHTML=leaders.map((x,i)=>`<div class="leader-row ${x.mine?"you-row":""}"><span class="rank">${["🥇","🥈","🥉","4️⃣","5️⃣","🌿"][i]||i+1}</span><span class="leader-avatar">${x.emoji}</span><div class="leader-person"><b>${escapeHTML(x.name)}${x.mine?" (you)":""}</b><small>${x.reports} reports · ${Math.floor(x.points/10)} flowers</small></div><strong class="points">${x.points} pts</strong></div>`).join("");
}
function renderQuote() {
 const el=$("#dailyQuote");if(el)el.textContent=`“${quotes[new Date().getDate()%quotes.length]}”`;
}
function renderTips() {
 const btn=$("#nextTip"),el=$("#energyTip");if(!btn||!el)return;
 let index=new Date().getDate()%tips.length;el.textContent=tips[index];
 btn.addEventListener("click",()=>{index=(index+1)%tips.length;el.textContent=tips[index];});
}
const photoInput=$("#photo");
if(photoInput) photoInput.addEventListener("change",e=>{
 const file=e.target.files[0];if(!file)return;
 if(!file.type.startsWith("image/")){showToast("Choose an image file.");photoInput.value="";return;}
 if(file.size>2*1024*1024){showToast("Choose an image under 2 MB.");photoInput.value="";return;}
 const reader=new FileReader();reader.onload=()=>{selectedPhoto=reader.result;const preview=$("#preview");preview.src=selectedPhoto;preview.hidden=false;const prompt=$("#uploadPrompt");if(prompt)prompt.hidden=true;};reader.readAsDataURL(file);
});
const dropZone=$("#dropZone");
if(dropZone){
 dropZone.addEventListener("dragover",e=>{e.preventDefault();dropZone.classList.add("dragover");});
 dropZone.addEventListener("dragleave",()=>dropZone.classList.remove("dragover"));
 dropZone.addEventListener("drop",e=>{e.preventDefault();dropZone.classList.remove("dragover");const file=e.dataTransfer.files[0];if(file){const transfer=new DataTransfer();transfer.items.add(file);photoInput.files=transfer.files;photoInput.dispatchEvent(new Event("change"));}});
}
const form=$("#reportForm");
if(form)form.addEventListener("submit",e=>{
 e.preventDefault();
 if(!selectedPhoto){showToast("Please add a waste photo first.");return;}
 const description=$("#description").value.trim();if(!description){showToast("Add a short description.");return;}
 const report={id:Date.now(),photo:selectedPhoto,description,location:$("#location").value.trim(),type:$("#wasteType").value,flower:flowerChoices[Math.floor(Math.random()*flowerChoices.length)],date:dayKey(),author:data.name||"Green Explorer"};
 data.reports.push(report);if(!data.days.includes(report.date))data.days.push(report.date);saveData();
 if (report.type === "Food waste" || report.type === "Paper") {
  sessionStorage.setItem("ecoquestPendingBioReport", JSON.stringify({id:report.id,description:report.description,type:report.type,location:report.location}));
  window.location.href = "biodegradable.html";
  return;
 }
 form.reset();selectedPhoto="";const preview=$("#preview");preview.hidden=true;preview.src="";const prompt=$("#uploadPrompt");if(prompt)prompt.hidden=false;
 renderGarden();renderCommunity();renderLeaderboard();showToast(`Report submitted! You earned ${report.flower}`);
 if(streakCount()>=7&&!data.rewardClaimed)setTimeout(showReward,500);
});
function showReward(){const modal=$("#rewardModal");if(modal)modal.hidden=false;}
function closeReward(){const modal=$("#rewardModal");if(modal)modal.hidden=true;}
const closeBtn=$("#closeModal");if(closeBtn)closeBtn.addEventListener("click",closeReward);
const rewardBtn=$("#rewardButton");if(rewardBtn)rewardBtn.addEventListener("click",()=>{if(streakCount()>=7&&!data.rewardClaimed)showReward();});
const claim=$("#claimReward");if(claim)claim.addEventListener("click",()=>{data.rewardClaimed=true;saveData();closeReward();renderGarden();showToast("Green Hero reward claimed! 🌍");});
renderGarden();renderCommunity();renderLeaderboard();renderQuote();renderTips();

// Biodegradable waste follow-up and proof-photo bonus.
let proofPhotoData = "";
if ($("#bioProofForm")) {
  let pending = null;
  try { pending = JSON.parse(sessionStorage.getItem("ecoquestPendingBioReport") || "null"); } catch(e) {}
  if (pending) {
    $("#bioWasteTitle").textContent = pending.type === "Paper" ? "Paper and plant-based waste" : "Food and organic waste";
    $("#bioWasteDescription").textContent = `You reported: ${pending.description}${pending.location ? " · " + pending.location : ""}`;
  }
  $("#proofPhoto").addEventListener("change", event => {
    const file = event.target.files[0]; if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Please choose an image file."); event.target.value=""; return; }
    if (file.size > 2*1024*1024) { showToast("Please choose a photo under 2 MB."); event.target.value=""; return; }
    const reader = new FileReader();
    reader.onload = () => { proofPhotoData=reader.result; $("#proofPreview").src=proofPhotoData; $("#proofPreview").hidden=false; $("#proofPrompt").hidden=true; };
    reader.readAsDataURL(file);
  });
  $("#bioProofForm").addEventListener("submit", event => {
    event.preventDefault();
    const selected = document.querySelector('input[name="bioAction"]:checked');
    if (!selected) { showToast("Choose what you did with the biodegradable waste."); return; }
    if (!proofPhotoData) { showToast("Upload a photo of your completed action."); return; }
    const labels = {compost:"Composted suitable organic scraps",mulch:"Used clean dry leaves or plant trimmings as mulch",collection:"Separated organic waste for collection",reuse:"Reused plant material in a garden project"};
    data.bioActions ||= [];
    data.bioActions.push({id:Date.now(),action:selected.value,actionLabel:labels[selected.value],note:$("#proofNote").value.trim(),photo:proofPhotoData,date:dayKey(),points:25,author:data.name||"Green Explorer"});
    data.points = (data.points||0)+25;
    saveData(); sessionStorage.removeItem("ecoquestPendingBioReport");
    showToast("Proof submitted! +25 bonus green points 🌿");
    setTimeout(()=>window.location.href="leaderboard.html",900);
  });
}
