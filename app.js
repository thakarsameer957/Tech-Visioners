
// Shared JS for citizen and admin pages.
// Uses localStorage key 'civic_reports' to store an array of reports.
// Each report: {id, category, title, description, photoDataUrl, location: {lat,lon}, status, createdAt}

(function(){
  const storageKey = 'civic_reports_v1';

  function uid(){ return 'r_' + Math.random().toString(36).slice(2,9); }

  function loadReports(){
    try{
      const raw = localStorage.getItem(storageKey);
      if(!raw) return [];
      return JSON.parse(raw);
    }catch(e){ return []; }
  }
  function saveReports(arr){
    localStorage.setItem(storageKey, JSON.stringify(arr));
  }

  // Seed sample data if none
  function seedIfEmpty(){
    const arr = loadReports();
    if(arr.length === 0){
      const sample = [
        {id:uid(), category:'Garbage', title:'Overflowing bin', description:'Garbage spilling near market', photoDataUrl:'', location:{lat:19.0760,lon:72.8777}, status:'Open', createdAt: Date.now() - 3600*1000*24},
        {id:uid(), category:'Pothole', title:'Large pothole', description:'Bus route damaged', photoDataUrl:'', location:{lat:19.075,lon:72.88}, status:'Assigned', createdAt: Date.now() - 3600*1000*5},
      ];
      saveReports(sample);
    }
  }
  seedIfEmpty();

  // Citizen page logic
  if(document.getElementById('reportForm')){
    const form = document.getElementById('reportForm');
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photoPreview');
    const locText = document.getElementById('locText');
    const getLocationBtn = document.getElementById('getLocationBtn');
    const msg = document.getElementById('msg');
    const ownReports = document.getElementById('ownReports');

    let currentPhotoData = '';
    let currentLocation = null;

    function renderOwnReports(){
      const arr = loadReports().slice().reverse();
      if(!ownReports) return;
      if(arr.length === 0){ ownReports.innerHTML = '<div class="muted">No reports yet.</div>'; return; }
      const html = arr.map(r=>`
        <div class="card" style="margin-bottom:8px; padding:8px;">
          <strong>${r.title}</strong> <span class="muted">[${r.category}]</span><br/>
          <small>${new Date(r.createdAt).toLocaleString()}</small><br/>
          <div>${r.description || ''}</div>
          <div>Location: ${r.location ? (r.location.lat.toFixed(4)+', '+r.location.lon.toFixed(4)) : 'Not captured'}</div>
          <div>Status: ${r.status || 'Open'}</div>
        </div>
      `).join('');
      ownReports.innerHTML = html;
    }
    renderOwnReports();

    photoInput.addEventListener('change', (e)=>{
      const f = e.target.files && e.target.files[0];
      if(!f) return;
      const reader = new FileReader();
      reader.onload = function(ev){
        currentPhotoData = ev.target.result;
        photoPreview.innerHTML = '<img src="'+currentPhotoData+'" alt="preview"/>';
      };
      reader.readAsDataURL(f);
    });

    getLocationBtn.addEventListener('click', ()=>{
      if(!navigator.geolocation){
        locText.textContent = 'Geolocation not supported';
        return;
      }
      locText.textContent = 'Getting...';
      navigator.geolocation.getCurrentPosition((p)=>{
        currentLocation = {lat: p.coords.latitude, lon: p.coords.longitude};
        locText.textContent = currentLocation.lat.toFixed(5)+', '+currentLocation.lon.toFixed(5);
      }, (err)=>{
        locText.textContent = 'Denied or unavailable';
      }, {timeout:10000});
    });

    form.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      const category = document.getElementById('category').value;
      const title = document.getElementById('title').value.trim();
      const description = document.getElementById('description').value.trim();

      if(!category || !title){ msg.textContent = 'Please fill required fields.'; return; }
      const arr = loadReports();
      const report = {
        id: uid(),
        category, title, description,
        photoDataUrl: currentPhotoData || '',
        location: currentLocation,
        status: 'Open',
        createdAt: Date.now()
      };
      arr.push(report);
      saveReports(arr);
      msg.textContent = 'Report submitted locally. Open Admin Dashboard to view.';
      form.reset();
      photoPreview.innerHTML = '';
      currentPhotoData = '';
      currentLocation = null;
      locText.textContent = 'Not captured';
      renderOwnReports();
    });

    document.getElementById('resetBtn').addEventListener('click', ()=>{
      photoPreview.innerHTML = '';
      currentPhotoData = '';
      currentLocation = null;
      locText.textContent = 'Not captured';
      msg.textContent = '';
    });
  }

  // Admin page logic
  if(document.getElementById('reportsTable')){
    const tbody = document.querySelector('#reportsTable tbody');
    const stats = document.getElementById('stats');
    const filterCategory = document.getElementById('filterCategory');
    const clearAll = document.getElementById('clearAll');

    function populateFilterOptions(){
      const arr = loadReports();
      const cats = Array.from(new Set(arr.map(r=>r.category))).sort();
      filterCategory.innerHTML = '<option value="">All</option>' + cats.map(c=>'<option>'+c+'</option>').join('');
    }

    function renderStats(arr){
      const total = arr.length;
      const byCat = {};
      arr.forEach(r=> byCat[r.category] = (byCat[r.category]||0)+1);
      const statHtml = '<div class="stat"><strong>Total</strong><div>'+total+'</div></div>' +
        Object.keys(byCat).map(k=>'<div class="stat"><strong>'+k+'</strong><div>'+byCat[k]+'</div></div>').join('');
      stats.innerHTML = statHtml;
    }

    function renderTable(filter){
      const arr = loadReports();
      const shown = filter ? arr.filter(r=>r.category===filter) : arr;
      if(shown.length === 0){ tbody.innerHTML = '<tr><td colspan="7">No reports</td></tr>'; return; }
      tbody.innerHTML = shown.map(r=>{
        const loc = r.location ? (r.location.lat.toFixed(4)+', '+r.location.lon.toFixed(4)) : '—';
        const photo = r.photoDataUrl ? '<img src="'+r.photoDataUrl+'" style="max-width:120px;border-radius:6px"/>' : '—';
        return `<tr data-id="${r.id}"><td>${r.id}</td><td>${r.category}</td><td>${r.title}</td><td>${loc}</td><td>${photo}</td><td class="status">${r.status}</td><td>
          <button class="assignBtn">Assign</button>
          <button class="closeBtn">Close</button>
          <button class="deleteBtn">Delete</button>
        </td></tr>`;
      }).join('');
    }

    function refresh(){
      const arr = loadReports();
      populateFilterOptions();
      renderStats(arr);
      renderTable(filterCategory.value);
    }

    refresh();

    filterCategory.addEventListener('change', ()=> refresh());
    clearAll.addEventListener('click', ()=>{
      if(!confirm('Clear all reports from localStorage? This cannot be undone.')) return;
      saveReports([]);
      refresh();
    });

    tbody.addEventListener('click', (ev)=>{
      const tr = ev.target.closest('tr');
      if(!tr) return;
      const id = tr.getAttribute('data-id');
      let arr = loadReports();
      const idx = arr.findIndex(x=>x.id===id);
      if(idx===-1) return;
      if(ev.target.classList.contains('assignBtn')){
        arr[idx].status = 'Assigned';
        saveReports(arr); refresh();
      } else if(ev.target.classList.contains('closeBtn')){
        arr[idx].status = 'Closed';
        saveReports(arr); refresh();
      } else if(ev.target.classList.contains('deleteBtn')){
        if(!confirm('Delete this report?')) return;
        arr.splice(idx,1); saveReports(arr); refresh();
      }
    });

  }

})();