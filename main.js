/* ========= فلاش عند تبديل الثيم ========= */
(function(){
  const toggleBtn = document.getElementById('themeToggle');
  if(!toggleBtn) return;
  const ICON_MOON = '<i class="fas fa-moon" aria-hidden="true"></i>';
  const ICON_SUN  = '<i class="fas fa-sun" aria-hidden="true"></i>';

  const saved = localStorage.getItem('theme');
  if(saved === 'dark'){ document.body.classList.add('theme-dark'); toggleBtn.innerHTML = ICON_SUN; }
  else { document.body.classList.remove('theme-dark'); toggleBtn.innerHTML = ICON_MOON; }

  toggleBtn.addEventListener('click', () => {
    // فلاش لطيف
    document.body.classList.add('theme-flip');
    setTimeout(()=>document.body.classList.remove('theme-flip'), 450);

    document.body.classList.toggle('theme-dark');
    const dark = document.body.classList.contains('theme-dark');
    toggleBtn.innerHTML = dark ? ICON_SUN : ICON_MOON;
    localStorage.setItem('theme', dark ? 'dark' : 'light');
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

  /* --- تحقق فوري ورسائل خطأ أنيقة --- */
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
    el.addEventListener('blur', ()=>{ el.checkValidity() ? clearError(el) : showError(el, msgFor(el)); });
  });

  // تطبيع رقم الهاتف ومنع الإرسال المزدوج + spinner
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
