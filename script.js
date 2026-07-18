const countries = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];
const select = document.getElementById('countrySelect');
countries.forEach(c => {
    let opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    select.appendChild(opt);
});

let teams = [], matchesData = {}, matchOrder = [];
const rules = ["無違規", "機器人踩紅線", "比賽期間觸碰機器", "未上場"];

window.onload = function() {
    let today = new Date().toISOString().slice(0, 10);
    document.getElementById('matchDate').value = today;
    if(localStorage.getItem('wro_sync_url')) {
        document.getElementById('syncUrl').value = localStorage.getItem('wro_sync_url');
    }
}

function addTeam() {
    let input = document.getElementById('tName');
    let name = input.value.trim();
    if(name && !teams.find(t => t.name === name)) {
        teams.push({name, w:0, l:0, s:0, v:0, checked:false});
        input.value = ''; input.focus(); 
        buildMatchOrder();
        refresh();
    }
}

function buildMatchOrder() {
    let newOrder = [];
    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            newOrder.push({i, j});
        }
    }
    if (matchOrder.length === 0 || matchOrder.length !== newOrder.length) {
        matchOrder = newOrder;
    }
}

function shuffleMatches() {
    if (matchOrder.length < 2) {
        alert("隊伍數量不足，無法隨機排列！");
        return;
    }
    for (let i = matchOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [matchOrder[i], matchOrder[j]] = [matchOrder[j], matchOrder[i]];
    }
    renderMatches();
    alert("🎲 對戰表隨機排列完成！順序已固定。");
}

function refresh() {
    let tbody = document.querySelector('#statsTable tbody');
    tbody.innerHTML = '';
    let sortedTeams = [...teams].sort((a,b) => b.w - a.w || b.s - a.s || b.v - a.v);
    sortedTeams.forEach(t => {
        let options = rules.map((r, i) => `<option value="${i}" ${t.v==i?'selected':''}>${r}</option>`).join('');
        tbody.innerHTML += `<tr>
            <td><input type="checkbox" onchange="toggleSelect('${t.name}')" ${t.checked ? 'checked' : ''}></td>
            <td>${t.name}</td><td>${t.w}</td><td>${t.l}</td><td>${t.s}</td>
            <td><select onchange="updateV('${t.name}', this.value)">${options}</select></td></tr>`;
    });
    renderMatches();
}

function renderMatches() {
    let mBody = document.querySelector('#matchTable tbody');
    mBody.innerHTML = '';
    buildMatchOrder();
    matchOrder.forEach(pair => {
        let t1 = teams[pair.i]; let t2 = teams[pair.j];
        if (!t1 || !t2) return;
        let key = `${pair.i}-${pair.j}`;
        let s = matchesData[key] || ['', '', '', '', '', ''];
        mBody.innerHTML += `<tr><td>${t1.name} vs ${t2.name}</td>
            <td><input type="number" class="sc" data-key="${key}" data-idx="0" value="${s[0]}">:<input type="number" class="sc" data-key="${key}" data-idx="1" value="${s[1]}"></td>
            <td><input type="number" class="sc" data-key="${key}" data-idx="2" value="${s[2]}">:<input type="number" class="sc" data-key="${key}" data-idx="3" value="${s[3]}"></td>
            <td><input type="number" class="sc" data-key="${key}" data-idx="4" value="${s[4]}">:<input type="number" class="sc" data-key="${key}" data-idx="5" value="${s[5]}"></td></tr>`;
    });
    document.querySelectorAll('.sc').forEach(el => el.addEventListener('input', calc));
}

function calc(e) {
    let key = e.target.dataset.key, idx = e.target.dataset.idx;
    if(!matchesData[key]) matchesData[key] = ['', '', '', '', '', ''];
    matchesData[key][idx] = e.target.value;
    teams.forEach(t => { t.w=0; t.l=0; t.s=0; });
    for(let k in matchesData) {
        let p = k.split('-'), t1 = teams[p[0]], t2 = teams[p[1]];
        if(!t1 || !t2) continue;
        let s = matchesData[k];
        for(let m=0; m<6; m+=2) {
            let v1 = parseInt(s[m]), v2 = parseInt(s[m+1]);
            if(!isNaN(v1)) t1.s += v1;
            if(!isNaN(v2)) t2.s += v2;
            if(!isNaN(v1) && !isNaN(v2)) {
                if(v1 > v2) { t1.w++; t2.l++; }
                else if(v2 > v1) { t2.w++; t1.l++; }
            }
        }
    }
    refresh();
}

function deleteSelected() { 
    let toDelete = teams.filter(t => t.checked).map(t => t.name);
    if (toDelete.length === 0) { alert("請先勾選要刪除的隊伍！"); return; }
    for (let k in matchesData) {
        let p = k.split('-'), t1 = teams[p[0]], t2 = teams[p[1]];
        if (!t1 || !t2 || toDelete.includes(t1.name) || toDelete.includes(t2.name)) { delete matchesData[k]; }
    }
    teams = teams.filter(t => !t.checked);
    matchOrder = [];
    fakeRecalc();
    refresh(); 
}

function fakeRecalc() {
    teams.forEach(t => { t.w=0; t.l=0; t.s=0; });
    for(let k in matchesData) {
        let p = k.split('-'), t1 = teams[p[0]], t2 = teams[p[1]];
        if(!t1 || !t2) continue;
        let s = matchesData[k];
        for(let m=0; m<6; m+=2) {
            let v1 = parseInt(s[m]), v2 = parseInt(s[m+1]);
            if(!isNaN(v1)) t1.s += v1;
            if(!isNaN(v2)) t2.s += v2;
            if(!isNaN(v1) && !isNaN(v2)) {
                if(v1 > v2) { t1.w++; t2.l++; }
                else if(v2 > v1) { t2.w++; t1.l++; }
            }
        }
    }
}

function resetScores() {
    if (teams.length === 0) { alert("目前沒有任何隊伍資料。"); return; }
    if (confirm("⚠️ 確定要將目前所有對戰成績歸零嗎？")) {
        matchesData = {};
        teams.forEach(t => { t.w = 0; t.l = 0; t.s = 0; });
        refresh();
        alert("🔄 所有成績已成功歸零！");
    }
}

function toggleSelect(name) { teams.find(x => x.name === name).checked = !teams.find(x => x.name === name).checked; }
function updateV(name, val) { teams.find(t=>t.name===name).v = parseInt(val); refresh(); }

function saveMatch() { 
    let inputs = document.querySelectorAll('.sc'); 
    for(let input of inputs) { if(input.value === "") { alert("請填寫所有對戰分數！"); return; } } 
    
    let matchDate = document.getElementById('matchDate').value || "未知日期";
    let countrySelect = document.getElementById('countrySelect').value || "未選擇";

    let history = JSON.parse(localStorage.getItem('wro_records') || '[]'); 
    history.push({ 
        date: matchDate, country: countrySelect,
        teams, matchesData, matchOrder, selected: false 
    }); 
    localStorage.setItem('wro_records', JSON.stringify(history)); 
    
    let syncUrl = document.getElementById('syncUrl').value.trim();
    if(syncUrl) {
        localStorage.setItem('wro_sync_url', syncUrl);
        let sortedTeams = [...teams].sort((a,b) => b.w - a.w || b.s - a.s || b.v - a.v);
        let matchOrderData = [];
        matchOrder.forEach(pair => {
            let t1 = teams[pair.i]; let t2 = teams[pair.j];
            if(!t1 || !t2) return;
            let key = `${pair.i}-${pair.j}`;
            let s = matchesData[key] || ['', '', '', '', '', ''];
            matchOrderData.push({
                pair: `${t1.name} vs ${t2.name}`,
                r1: `${s[0]}:${s[1]}`, r2: `${s[2]}:${s[3]}`, r3: `${s[4]}:${s[5]}`
            });
        });
        
        fetch(syncUrl, {
            method: 'POST', mode: 'no-cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ date: matchDate, country: countrySelect, sortedTeams, matches: matchOrderData })
        });
        alert('💾 紀錄已儲存並同步至雲端！');
    } else {
        alert('💾 紀錄已儲存於本機！');
    }
}

function toggleHistory() { 
    let list = document.getElementById('historyList'); 
    list.style.display = list.style.display === 'none' ? 'block' : 'none'; 
    let history = JSON.parse(localStorage.getItem('wro_records') || '[]'); 
    document.getElementById('recordItems').innerHTML = history.map((m, i) => `
        <div style="background:#222; padding:10px; margin:5px; border-left:4px solid #00ffcc;">
            <input type="checkbox" onchange="toggleHistSelect(${i})" ${m.selected ? 'checked' : ''}>
            <span style="color:#00ffcc; text-decoration:underline; cursor:pointer;" onclick="loadRecord(${i})">
                📅 ${m.date} | ${m.country} | 👥 ${m.teams.length} 隊
            </span>
        </div>
    `).join(''); 
}

function toggleHistSelect(i) { let h = JSON.parse(localStorage.getItem('wro_records')); h[i].selected = !h[i].selected; localStorage.setItem('wro_records', JSON.stringify(h)); }
function deleteSelectedHistory() { let h = JSON.parse(localStorage.getItem('wro_records')||'[]'); h = h.filter(m => !m.selected); localStorage.setItem('wro_records', JSON.stringify(h)); toggleHistory(); }

function loadRecord(i) { 
    let h = JSON.parse(localStorage.getItem('wro_records')); 
    if(!h || !h[i]) return;
    document.getElementById('matchDate').value = h[i].date;
    document.getElementById('countrySelect').value = h[i].country;
    teams = h[i].teams; matchesData = h[i].matchesData; matchOrder = h[i].matchOrder;
    refresh(); 
    alert(`📂 已成功載入紀錄！`);
}