/* ========= فلاش عند تبديل الثيم + أيقونة FA مع Fallback ========= */
(function(){
  const toggleBtn = document.getElementById('themeToggle');
  if(!toggleBtn) return;

  // نتحقق إن كانت Font Awesome محمّلة، وإلا نستعمل إيموجي
  function hasFA(){
    const test = document.createElement('i');
    test.className = 'fas fa-moon';
    test.style.position = 'absolute';
    test.style.opacity  = '0';
    document.body.appendChild(test);
    const fam = (getComputedStyle(test).fontFamily || '');
    test.remove();
    return /Font Awesome|FontAwesome/i.test(fam);
  }
  const USE_FA    = hasFA();
  const ICON_MOON = USE_FA ? '<i class="fas fa-moon" aria-hidden="true"></i>' : '🌙';
  const ICON_SUN  = USE_FA ? '<i class="fas fa-sun"  aria-hidden="true"></i>' : '☀️';

  // ✅ الافتراضي: داكن إذا ما في تفضيل محفوظ
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.body.classList.remove('theme-dark');
    toggleBtn.innerHTML = ICON_MOON;
  } else {
    document.body.classList.add('theme-dark');
    toggleBtn.innerHTML = ICON_SUN;
  }

  toggleBtn.addEventListener('click', () => {
    // فلاش لطيف
    document.body.classList.add('theme-flip');
    setTimeout(()=>document.body.classList.remove('theme-flip'), 450);

    const nowDark = document.body.classList.toggle('theme-dark');
    toggleBtn.innerHTML = nowDark ? ICON_SUN : ICON_MOON;
    localStorage.setItem('theme', nowDark ? 'dark' : 'light');
  });
})();

/* ========= زر للأعلى ========= */
(function(){
  const toTop = document.getElementById('toTop');
  if(!toTop) return;
  window.addEventListener('scroll', () => { toTop.classList.toggle('show', window.scrollY > 400); });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ========= روابط الصفحة الرئيسية ========= */
(function(){
  const mapsBtn = document.getElementById('mapsBtn');
  if(mapsBtn){ mapsBtn.addEventListener('click', () => window.open("https://maps.app.goo.gl/zevtPC8n4Ms2Sxz89","_blank")); }

  const fbLink = document.getElementById('fbLink');
  if(fbLink){
    fbLink.addEventListener('click', (e) => {
      const pageUrl = "https://facebook.com/profile.php?id=61579062652707";
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if(isMobile){
        const deep = "fb://facewebmodal/f?href=" + encodeURIComponent(pageUrl);
        const t = Date.now();
        window.location.href = deep;
        setTimeout(function(){ if(Date.now() - t < 1600){ window.open(pageUrl, "_blank"); } }, 800);
        e.preventDefault();
      }
    });
  }

  const copyBtn = document.getElementById('copyPhone');
  if(copyBtn){
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('+962797383239').catch(()=>{});
    });
  }
})();

/* ========= صفحة الحجز: أوقات + تحقق + رسائل ========= */
(function(){
  const form = document.getElementById('bookingForm');
  if(!form) return;

  const START = 9, END = 16;
  const dateInput = document.getElementById('date');
  const timeSelect = document.getElementById('time');
  const submitBtn = document.getElementById('submitBtn');

  // حوّل _next النسبي إلى رابط كامل على نفس الدومين الحالي (لو كنت مستخدم value="thanks.html")
  const nextInput = form.querySelector('input[name="_next"]');
  if (nextInput && nextInput.value) {
    nextInput.value = new URL(nextInput.value, window.location.href).href;
  }

  const today = new Date(); today.setHours(0,0,0,0);
  function isSameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
  function labelFor(h){ if(h===0)return"12:00 ص"; if(h===12)return"12:00 م"; if(h<12)return String(h).padStart(2,'0')+":00 ص"; return String(h-12).padStart(2,'0')+":00 م"; }

  function buildOptions(forToday){
    timeSelect.innerHTML = '<option value="" selected disabled>اختر وقتًا</option>';
    const now = new Date();
    const nextHour = now.getMinutes()>0 ? now.getHours()+1 : now.getHours();
    for (let h=START; h<=END; h++){
      const opt = document.createElement('option');
      opt.value = String(h).padStart(2,'0') + ':00';
      opt.textContent = labelFor(h);
      opt.disabled = forToday && h < nextHour;
      timeSelect.appendChild(opt);
    }
  }

  function refreshTimes(){
    const d = dateInput.value;
    if (!d){ timeSelect.innerHTML = '<option value="" selected disabled>اختر وقتًا</option>'; return; }
    const chosen = new Date(d + 'T00:00');
    buildOptions(isSameDay(chosen, today));
  }

  function setMinTodayAndMaybeBump() {
    const now = new Date();
    const todayISO = new Date().toISOString().split('T')[0];
    dateInput.min = todayISO;
    if (!dateInput.value) dateInput.value = todayISO;

    const isToday = isSameDay(new Date(dateInput.value + 'T00:00'), now);
    if (isToday && now.getHours() >= END) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = tomorrow.toISOString().split('T')[0];
    }
  }

  setMinTodayAndMaybeBump();
  refreshTimes();
  dateInput.addEventListener('change', refreshTimes);

  /* تحقق فوري */
  const fields = ['name','phone','service','date','time'];
  function msgFor(el){
    if(el.validity.valueMissing) return 'هذا الحقل مطلوب.';
    if(el.id==='phone' && el.validity.patternMismatch) return 'رجاءً اكتب رقمًا بصيغة دولية صحيحة أو بصيغة 07XXXXXXXX للأردن.';
    if(el.validity.typeMismatch) return 'القيمة المدخلة غير صحيحة.';
    return '';
  }
  function showError(el, text){
    el.setAttribute('aria-invalid', 'true');
    let err = el.parentElement.querySelector('.field-error');
    if(!err){ err = document.createElement('div'); err.className='field-error'; el.parentElement.appendChild(err); }
    err.textContent = text;
  }
  function clearError(el){
    el.removeAttribute('aria-invalid');
    const err = el.parentElement.querySelector('.field-error');
    if(err) err.remove();
  }
  fields.forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('input', ()=>{ el.checkValidity() ? clearError(el) : showError(el, msgFor(el)); });
    el.addEventListener('blur',  ()=>{ el.checkValidity() ? clearError(el) : showError(el, msgFor(el)); });
  });

  form.addEventListener('submit', function(e){
    // تطبيع الهاتف
    const phone = document.getElementById('phone');
    let v = phone.value.replace(/\s+/g,'');
    v = v.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
    if (/^07\d{8}$/.test(v)) { v = '+962' + v.slice(1); }
    phone.value = v;

    // تحقق نهائي
    let firstInvalid = null;
    fields.forEach(id=>{
      const el = document.getElementById(id);
      if(!el) return;
      if(!el.checkValidity()){
        if(!firstInvalid) firstInvalid = el;
        showError(el, msgFor(el));
      }else{
        clearError(el);
      }
    });
    if(firstInvalid){
      e.preventDefault();
      firstInvalid.focus();
      return;
    }

    // منع الإرسال المزدوج
    if(submitBtn){
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    }
  });
})();

/* ========= صفحة شركات التأمين: تحميل الشعارات + فلترة ========= */
(function(){
  const list  = document.getElementById('insureList');
  const input = document.getElementById('insureFilter');
  const count = document.getElementById('insureCount');
  const tabs  = document.querySelectorAll('.type-filter .type-btn');
  if(!list) return;

  let selectedType = 'all';

  const cards = Array.from(list.querySelectorAll('.brand-card'));
  cards.forEach(card=>{
    const name     = card.dataset.name || 'جهة';
    const domain   = (card.dataset.domain || '').trim();
    const fallback = card.dataset.fallback || '';
    const url      = card.dataset.url || '';

    const fig = document.createElement('figure');
    const img = document.createElement('img');
    img.alt = name; img.loading = 'lazy';

    if (domain) img.src = `https://logo.clearbit.com/${domain}`;
    else if (fallback) img.src = fallback;

    let triedFallback = false;
    img.addEventListener('error', ()=>{
      if (fallback && !triedFallback){
        triedFallback = true;
        img.src = fallback;
        return;
      }
      img.remove();
      const ph = document.createElement('div');
      ph.className = 'fallback';
      const initials = name.replace(/[^\p{L}\p{N}\s]/gu,'').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
      ph.textContent = initials || '—';
      fig.prepend(ph);
    });

    const cap = document.createElement('figcaption');
    const arabic = name.split(/\s{2,}|  | – | - /)[0];
    cap.textContent = arabic || name;

    if (url){
      card.style.cursor = 'pointer';
      card.addEventListener('click', ()=> window.open(url, '_blank', 'noopener'));
    }

    fig.append(img, cap);
    card.append(fig);
  });

  function apply(){
    const q = (input?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach(card=>{
      const name = (card.dataset.name || '').toLowerCase();
      const type = (card.dataset.type || '').toLowerCase();
      const matchesText = !q || name.includes(q);
      const matchesType = (selectedType==='all') || (type === selectedType);
      const show = matchesText && matchesType;
      card.style.display = show ? '' : 'none';
      if(show) visible++;
    });
    if(count) count.textContent = String(visible);
  }

  tabs.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      tabs.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      selectedType = btn.dataset.type || 'all';
      apply();
    });
  });

  input?.addEventListener('input', apply);
  apply();
})();
(function(){
  var payload = {
    path: location.pathname + location.search,
    referrer: document.referrer || '',
    ua: navigator.userAgent || '',
    lang: navigator.language || ''
  };

  var url = 'https://script.google.com/macros/s/AKfycbwWbLie0FnuY2vYo8e4NnmawQE0oT6RWxoJZswmm-P6Ubpvqmv0uUFxyMG0nt6L6uXqPA/exec';
  var blob = new Blob([JSON.stringify(payload)], {type:'text/plain'});

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, blob);
  } else {
    fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {'Content-Type': 'text/plain'},
      body: JSON.stringify(payload),
      keepalive: true
    });
  }
})();
