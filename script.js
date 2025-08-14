// ===== التبويبات =====
document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.target;
    document.querySelectorAll('.tool').forEach(sec=>{
      sec.hidden = sec.id !== target;
    });
  });
});

// ===== حاسبة العمر =====
const birthEl = document.getElementById("birthDate");
const ageOut = document.getElementById("ageResult");

document.getElementById('clearAge').addEventListener('click', ()=>{
  birthEl.value = '';
  ageOut.textContent = '';
});

function calcAgeParts(birth, today=new Date()){
  let y = today.getFullYear() - birth.getFullYear();
  let m = today.getMonth() - birth.getMonth();
  let d = today.getDate() - birth.getDate();
  if(d < 0){ d += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); m--; }
  if(m < 0){ m += 12; y--; }
  return {y, m, d};
}

// تحويل ميلادي إلى هجري عبر APIasync function gToH(dateStr) {
  // تحويل تاريخ الميلادي من YYYY-MM-DD إلى DD-MM-YYYY
  const parts = dateStr.split('-'); // ["YYYY", "MM", "DD"]
  const formatted = `${parts[2]}-${parts[1]}-${parts[0]}`; // "DD-MM-YYYY"
  
  const url = `https://api.aladhan.com/v1/gToH?date=${formatted}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('فشل الاتصال بالـ API');
  const data = await res.json();
  if(!data || !data.data || !data.data.hijri) throw new Error('رد غير متوقع من الـ API');
  
  return data.data.hijri;
}


// حساب العمر بالميلادي والهجريasync function getHijriAge(birthDateStr) {
  const birthHijri = await gToH(birthDateStr);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayHijri = await gToH(todayStr);

  let year = parseInt(todayHijri.year) - parseInt(birthHijri.year);
  let month = parseInt(todayHijri.month.number) - parseInt(birthHijri.month.number);
  let day = parseInt(todayHijri.day) - parseInt(birthHijri.day);

  if(day < 0){ day += 30; month--; }
  if(month < 0){ month += 12; year--; }

  return { year, month, day };
}

document.getElementById('calcAge').addEventListener('click', async ()=>{
  const v = birthEl.value;
  if(!v){ ageOut.innerHTML = '<span class="error">رجاءً اختر تاريخ الميلاد.</span>'; return; }

  // العمر الميلادي
  const b = new Date(v);
  const {y,m,d} = calcAgeParts(b);
  let text = `<span class="success">العمر الميلادي: ${y} سنة و ${m} شهر و ${d} يوم</span>`;

  // العمر الهجري
  try{
    ageOut.textContent = '... جاري التحويل للهجري';
    ageOut.classList.add('loading');

    const {year, month, day} = await getHijriAge(v);

    ageOut.classList.remove('loading');
    text += `<br><span class="success">العمر الهجري: ${year} سنة و ${month} شهر و ${day} يوم</span>`;
    ageOut.innerHTML = text;
  } catch(e){
    ageOut.classList.remove('loading');
    ageOut.innerHTML += `<br><span class="error">تعذر حساب العمر الهجري.</span>`;
  }
});


// ===== محول التاريخ =====
function toHijri(){
  const date = document.getElementById("gregDate").value;
  if(!date){ alert("من فضلك أدخل التاريخ الميلادي"); return; }
  fetch(`https://api.aladhan.com/v1/gToH?date=${date}`)
    .then(res=>res.json())
    .then(data=>{
      if(!data || !data.data || !data.data.hijri) throw new Error();
      const h = data.data.hijri;
      document.getElementById("hijriResult").innerText = `${h.day} / ${h.month.number} / ${h.year}`;
    }).catch(()=>{ document.getElementById("hijriResult").innerText="حدث خطأ في التحويل"; });
}

function toGregorian(){
  const y=document.getElementById("hYear").value;
  const m=document.getElementById("hMonth").value;
  const d=document.getElementById("hDay").value;
  if(!y||!m||!d){ alert("من فضلك أدخل التاريخ الهجري كامل"); return; }
  fetch(`https://api.aladhan.com/v1/hToG?date=${d}-${m}-${y}`)
    .then(res=>res.json())
    .then(data=>{
      if(!data || !data.data || !data.data.gregorian) throw new Error();
      const g = data.data.gregorian;
      document.getElementById("gregResult").innerText = `${g.day} / ${g.month.number} / ${g.year}`;
    }).catch(()=>{ document.getElementById("gregResult").innerText="حدث خطأ في التحويل"; });
}

// ===== محول العملات =====
async function convertCurrency(){
  const from = document.getElementById("currencyFrom").value;
  const to = document.getElementById("currencyTo").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const resultEl = document.getElementById("currencyResult");

  if(isNaN(amount) || amount <= 0){
    resultEl.innerHTML = '<span class="error">أدخل مبلغ صحيح أكبر من 0</span>';
    return;
  }

  if(from === to){
    resultEl.innerHTML = `<span class="success">العملة نفسها، النتيجة: ${amount.toFixed(2)} ${to}</span>`;
    return;
  }

  resultEl.textContent = "جاري التحويل...";
  try{
    const res = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`);
    const data = await res.json();
    if(!data || typeof data.result !== 'number') throw new Error();
    resultEl.innerHTML = `<span class="success">${amount.toFixed(2)} ${from} = ${data.result.toFixed(4)} ${to}</span>`;
  } catch(e){
    resultEl.innerHTML = '<span class="error">تعذر جلب سعر الصرف</span>';
  }
}

