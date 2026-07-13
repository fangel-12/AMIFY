let records = [
  {id:1, crop:'Maize', plantDate:'2026-03-01', harvestDate:'2026-06-10', expectedQty:40, actualQty:38, status:'harvested'},
  {id:2, crop:'Cassava', plantDate:'2026-04-15', harvestDate:'2026-09-01', expectedQty:60, actualQty:null, status:'growing'},
  {id:3, crop:'Tomato', plantDate:'2026-05-01', harvestDate:'2026-07-20', expectedQty:20, actualQty:null, status:'planted'}
];

let nextId = 4;

const buyerDirectory = [
  {name:'Adaeze Nwosu', location:'Ogbomoso, Oyo', crops:['Maize','Cassava'], reliability:92, verified:true, dealsCompleted:5},
  {name:'Chidi Okeke', location:'Nsukka, Enugu', crops:['Yam','Rice'], reliability:78, verified:true, dealsCompleted:2},
  {name:'Fatima Bello', location:'Kaduna', crops:['Maize','Beans'], reliability:65, verified:false, dealsCompleted:0},
  {name:'Emeka Obi', location:'Owerri, Imo', crops:['Cassava','Tomato'], reliability:88, verified:true, dealsCompleted:3}
];

let chatLog = {}; // { farmerName: [{from:'buyer'|'farmer', text:''}] }
let dealMarkedForCurrentChat = false;
let activeChatFarmer = null;

function switchView(view){
  document.getElementById('farmerView').style.display = view==='farmer' ? 'block':'none';
  document.getElementById('buyerView').style.display = view==='buyer' ? 'block':'none';
  document.getElementById('tabFarmer').classList.toggle('active', view==='farmer');
  document.getElementById('tabBuyer').classList.toggle('active', view==='buyer');
  if(view==='buyer') renderBuyerView();
}

function calcReliability(){
  const completed = records.filter(r => r.status==='harvested');
  if(completed.length===0) return null;
  const good = completed.filter(r => r.actualQty !== null && r.actualQty >= 0.8 * r.expectedQty);
  return Math.round((good.length/completed.length)*100);
}

function daysStatus(r){
  const today = new Date('2026-07-02');
  const plant = new Date(r.plantDate);
  const harvest = new Date(r.harvestDate);
  if(r.status==='harvested') return 'harvested';
  return today >= harvest ? 'growing' : (today >= plant ? 'growing' : 'planted');
}

function addRecord(){
  const crop = document.getElementById('cropType').value;
  const qty = parseFloat(document.getElementById('expectedQty').value);
  const plantDate = document.getElementById('plantDate').value;
  const harvestDate = document.getElementById('harvestDate').value;

  if(!qty || !plantDate || !harvestDate){
    alert('Fill in all fields before adding a record.');
    return;
  }

  records.push({
    id: nextId++,
    crop, plantDate, harvestDate,
    expectedQty: qty, actualQty: null,
    status: 'planted'
  });

  document.getElementById('expectedQty').value='';
  document.getElementById('plantDate').value='';
  document.getElementById('harvestDate').value='';

  renderRecords();
}

function markHarvested(id){
  const input = document.getElementById('actual-'+id);
  const val = parseFloat(input.value);
  if(!val){ alert('Enter actual yield first.'); return; }
  const r = records.find(r=>r.id===id);
  r.actualQty = val;
  r.status = 'harvested';
  renderRecords();
}

function renderRecords(){
  const list = document.getElementById('recordList');
  if(records.length===0){
    list.innerHTML = '<div class="empty">No crops logged yet. Add your first record above.</div>';
  } else {
    list.innerHTML = records.map(r=>{
      const stage = r.status;
      const stageLabel = stage.charAt(0).toUpperCase()+stage.slice(1);
      let actionHtml = '';
      if(stage !== 'harvested'){
        actionHtml = `
          <input type="number" class="mini-input" id="actual-${r.id}" placeholder="Actual qty">
          <button class="mini-btn" onclick="markHarvested(${r.id})">Mark harvested</button>
        `;
      } else {
        actionHtml = `<span style="font-size:12px;color:var(--ink-soft);">${r.actualQty} / ${r.expectedQty} bags</span>`;
      }
      return `
        <div class="record">
          <div class="record-left">
            <div class="crop">${r.crop}</div>
            <div class="meta">Planted ${r.plantDate} · Expected ${r.expectedQty} bags</div>
          </div>
          <div class="record-actions">
            <div class="stage ${stage}"><span class="stage-dot"></span>${stageLabel}</div>
            ${actionHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  const score = calcReliability();
  document.getElementById('reliabilityScore').textContent = score===null ? '—' : score+'%';

  const myDeals = buyerDirectory.find(f=>f.name==='Adaeze Nwosu');
  if(myDeals) document.getElementById('dealsCount').textContent = `${myDeals.dealsCompleted} completed deals`;
}

function renderBuyerView(){
  const cropFilter = document.getElementById('filterCrop').value;
  const locFilter = document.getElementById('filterLoc').value.toLowerCase();

  let filtered = buyerDirectory.filter(f=>{
    const cropMatch = !cropFilter || f.crops.includes(cropFilter);
    const locMatch = !locFilter || f.location.toLowerCase().includes(locFilter);
    return cropMatch && locMatch;
  });

  const grid = document.getElementById('farmerGrid');
  if(filtered.length===0){
    grid.innerHTML = '<div class="empty">No farmers match those filters.</div>';
    return;
  }

  grid.innerHTML = filtered.map((f)=>{
    return `
      <div class="farmer-card">
        <div class="top">
          <div>
            <div class="fname">${f.name}</div>
            <div class="floc">${f.location}</div>
            ${f.verified ? '<div class="verified-badge">✓ Verified</div>' : ''}
          </div>
          <div class="rel-pill">${f.reliability}%</div>
        </div>
        <div class="crop-tags">
          ${f.crops.map(c=>`<span class="crop-tag">${c}</span>`).join('')}
        </div>
        <div class="deals-count">${f.dealsCompleted} completed deal${f.dealsCompleted===1?'':'s'} via Amify</div>
        <button class="interest-btn" style="margin-top:10px;" onclick="openChat('${f.name}')">
          Chat & express interest
        </button>
      </div>
    `;
  }).join('');
}

function openChat(name){
  const farmer = buyerDirectory.find(f=>f.name===name);
  activeChatFarmer = farmer;
  dealMarkedForCurrentChat = false;

  document.getElementById('chatFarmerName').textContent = farmer.name;
  document.getElementById('chatFarmerLoc').textContent = farmer.location;
  document.getElementById('dealBtn').disabled = false;
  document.getElementById('dealBtn').textContent = 'Mark deal completed';

  if(!chatLog[name]){
    chatLog[name] = [
      {from:'farmer', text:`Hi, thanks for your interest! I have ${farmer.crops[0]} ready. How many bags do you need?`}
    ];
  }
  renderChat();
  document.getElementById('chatOverlay').classList.add('open');
}

function closeChat(){
  document.getElementById('chatOverlay').classList.remove('open');
  activeChatFarmer = null;
}

function renderChat(){
  const body = document.getElementById('chatBody');
  const log = chatLog[activeChatFarmer.name] || [];
  body.innerHTML = log.map(m=>`<div class="msg ${m.from}">${m.text}</div>`).join('');
  body.scrollTop = body.scrollHeight;
}

function sendMessage(){
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if(!text || !activeChatFarmer) return;
  chatLog[activeChatFarmer.name].push({from:'buyer', text});
  input.value = '';
  renderChat();
  // simple auto-reply so the flow feels real
  setTimeout(()=>{
    chatLog[activeChatFarmer.name].push({from:'farmer', text:'Sounds good — let\'s work out the details here.'});
    renderChat();
  }, 600);
}

function markDealComplete(){
  if(!activeChatFarmer || dealMarkedForCurrentChat) return;
  activeChatFarmer.dealsCompleted += 1;
  dealMarkedForCurrentChat = true;
  document.getElementById('dealBtn').disabled = true;
  document.getElementById('dealBtn').textContent = 'Deal marked ✓';
  chatLog[activeChatFarmer.name].push({from:'farmer', text:'Deal confirmed on Amify. Thanks for buying through the platform!'});
  renderChat();
  renderBuyerView();
}

renderRecords();

// ---------- Weather ----------
// Get a free key at https://openweathermap.org/api (no card needed)
const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY';

async function getWeather(){
  const city = document.getElementById('weatherCity').value.trim();
  const resultBox = document.getElementById('weatherResult');
  if(!city){ resultBox.innerHTML = '<div class="empty">Enter a location first.</div>'; return; }

  if(OPENWEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY'){
    resultBox.innerHTML = `<div class="empty">Add your free OpenWeatherMap API key in the code (line: OPENWEATHER_API_KEY) to activate this.</div>`;
    return;
  }

  resultBox.innerHTML = '<div class="empty">Checking...</div>';
  try{
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},NG&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const res = await fetch(url);
    if(!res.ok) throw new Error('Location not found');
    const data = await res.json();
    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const rainChance = data.rain ? 'Rain likely today' : 'No rain expected';
    resultBox.innerHTML = `
      <div style="display:flex;gap:24px;flex-wrap:wrap;">
        <div><div style="font-family:'Fraunces',serif;font-size:26px;font-weight:700;">${temp}°C</div><div style="font-size:12px;color:var(--ink-soft);">${desc}</div></div>
        <div><div style="font-size:13px;font-weight:600;">${rainChance}</div><div style="font-size:12px;color:var(--ink-soft);">Humidity ${data.main.humidity}%</div></div>
      </div>
    `;
  }catch(e){
    resultBox.innerHTML = `<div class="empty">Couldn't fetch weather — check the city name or API key.</div>`;
  }
}

// ---------- AI Plant Scan ----------
// Get a free Hugging Face token at https://huggingface.co/settings/tokens (free tier, no card needed)
const HF_TOKEN = 'YOUR_HUGGINGFACE_TOKEN';
const HF_MODEL = 'linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification';

let plantFile = null;

function previewPlantImage(){
  const input = document.getElementById('plantImage');
  const file = input.files[0];
  if(!file) return;
  plantFile = file;
  const reader = new FileReader();
  reader.onload = e=>{
    document.getElementById('plantPreview').src = e.target.result;
    document.getElementById('plantPreviewWrap').style.display = 'block';
    document.getElementById('plantResult').innerHTML = '';
  };
  reader.readAsDataURL(file);
}

async function scanPlant(){
  const resultBox = document.getElementById('plantResult');
  if(!plantFile){ resultBox.innerHTML = '<div class="empty">Upload an image first.</div>'; return; }

  if(HF_TOKEN === 'YOUR_HUGGINGFACE_TOKEN'){
    resultBox.innerHTML = `<div class="empty">Add your free Hugging Face token in the code (line: HF_TOKEN) to activate this.</div>`;
    return;
  }

  resultBox.innerHTML = '<div class="empty">Scanning...</div>';
  try{
    const res = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/octet-stream'
      },
      body: plantFile
    });
    if(!res.ok) throw new Error('Scan failed');
    const data = await res.json();
    if(!Array.isArray(data) || data.length===0) throw new Error('No result');

    const top = data[0];
    const label = top.label.replace(/_/g,' ');
    const confidence = Math.round(top.score * 100);
    const isHealthy = label.toLowerCase().includes('healthy');

    resultBox.innerHTML = `
      <div class="stage ${isHealthy ? 'growing' : 'planted'}" style="display:inline-flex;">
        <span class="stage-dot"></span>${label} — ${confidence}% confidence
      </div>
    `;
  }catch(e){
    resultBox.innerHTML = `<div class="empty">Scan failed — model may be loading (first request can take ~20s), try again.</div>`;
  }
}