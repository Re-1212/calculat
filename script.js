// ===== التبويبات =====
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.target;
    document.querySelectorAll('.tool').forEach(sec => {
      sec.hidden = sec.id !== target;
    });
  });
});

// ===== حاسبة العمر =====
const birthEl = document.getElementById("birth");
const ageOut = document.getElementById("ageOut");

document.getElementById('clearAge').addEventListener('click', () => {
  birthEl.value = '';
  ageOut.textContent = '';
});

function calcAgeParts(birth, today = new Date()) {
  let y = today.getFullYear() - birth.getFullYear();
  let m = today.getMonth() - birth.getMonth();
  let d = today.getDate() - birth.getDate();
  if (d < 0) { d += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); m--; }
  if (m < 0) { m += 12; y--; }
  return { y, m, d };
}

async function gToH(dateStr) {
  const parts = dateStr.split('-'); // ["YYYY", "MM", "DD"]
  const formatted = `${parts[2]}-${parts[1]}-${parts[0]}`; // "DD-MM-YYYY"
  const url = `https://api.aladhan.com/v1/gToH?date=${formatted}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('فشل الاتصال بالـ API');
  const data = await res.json();
  if (!data || !data.data || !data.data.hijri) throw new Error('رد غير متوقع من الـ API');
  return data.data.hijri;
}

async function getHijriAge(birthDateStr) {
  const birthHijri = await gToH(birthDateStr);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayHijri = await gToH(todayStr);

  let year = parseInt(todayHijri.year) - parseInt(birthHijri.year);
  let month = parseInt(todayHijri.month.number) - parseInt(birthHijri.month.number);
  let day = parseInt(todayHijri.day) - parseInt(birthHijri.day);

  if (day < 0) { day += 30; month--; }
  if (month < 0) { month += 12; year--; }

  return { year, month, day };
}

document.getElementById('calcAge').addEventListener('click', async () => {
  const v = birthEl.value;
  if (!v) { ageOut.innerHTML = '<span class="error">رجاءً اختر تاريخ الميلاد.</span>'; return; }

  // العمر الميلادي
  const b = new Date(v);
  const { y, m, d } = calcAgeParts(b);
  let text = `<span class="success">العمر الميلادي: ${y} سنة و ${m} شهر و ${d} يوم</span>`;

  // العمر الهجري
  try {
    ageOut.textContent = '... جاري التحويل للهجري';
    ageOut.classList.add('loading');

    const { year, month, day } = await getHijriAge(v);

    ageOut.classList.remove('loading');
    text += `<br><span class="success">العمر الهجري: ${year} سنة و ${month} شهر و ${day} يوم</span>`;
    ageOut.innerHTML = text;
  } catch (e) {
    ageOut.classList.remove('loading');
    ageOut.innerHTML += `<br><span class="error">تعذر حساب العمر الهجري.</span>`;
  }
});

// ===== محول التاريخ =====
async function toHijri() {
  const date = document.getElementById("gdate").value;
  const out = document.getElementById("toHijriOut");
  if (!date) { out.innerHTML = '<span class="error">اختر تاريخاً ميلادياً أولاً.</span>'; return; }

  try {
    out.textContent = '... جاري التحويل';
    out.classList.add('loading');
    const res = await fetch(`https://api.aladhan.com/v1/gToH?date=${date}`);
    const data = await res.json();
    out.classList.remove('loading');
    if (!data || !data.data || !data.data.hijri) throw new Error();
    const h = data.data.hijri;
    out.innerHTML = `<span class="success">${h.day} / ${h.month.number} / ${h.year} — ${h.weekday.ar}</span>`;
  } catch (e) {
    out.classList.remove('loading');
    out.innerHTML = '<span class="error">حدث خطأ أثناء التحويل.</span>';
  }
}

async function toGregorian() {
  const d = document.getElementById("hday").value;
  const m = document.getElementById("hmonth").value;
  const y = document.getElementById("hyear").value;
  const out = document.getElementById("toGregOut");

  if (!d || !m || !y) { out.innerHTML = '<span class="error">ادخلي اليوم والشهر والسنة الهجرية كاملة.</span>'; return; }

  try {
    out.textContent = '... جاري التحويل';
    out.classList.add('loading');
    const res = await fetch(`https://api.aladhan.com/v1/hToG?date=${d}-${m}-${y}`);
    const data = await res.json();
    out.classList.remove('loading');
    if (!data || !data.data || !data.data.gregorian) throw new Error();
    const g = data.data.gregorian;
    out.innerHTML = `<span class="success">${g.day} / ${g.month.number} / ${g.year} — ${g.weekday.en}</span>`;
  } catch (e) {
    out.classList.remove('loading');
    out.innerHTML = '<span class="error">حدث خطأ أثناء التحويل.</span>';
  }
}

document.getElementById('toHijriBtn').addEventListener('click', toHijri);
document.getElementById('toGregBtn').addEventListener('click', toGregorian);

// ===== محول العملات =====
async function convertCurrency() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const fxOut = document.getElementById("fxOut");

  if (isNaN(amount) || amount <= 0) {
    fxOut.innerHTML = '<span class="error">أدخلي مبلغ صالح أكبر من 0.</span>';
    return;
  }

  if (from === to) {
    fxOut.innerHTML = `<span class="success">العملة نفسها، النتيجة: ${amount.toFixed(2)} ${to}</span>`;
    return;
  }

  try {
    fxOut.textContent = '... جاري التحويل';
    fxOut.classList.add('loading');
    const res = await fetch(`https://api.exchangerate.host/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}`);
    const data = await res.json();
    fxOut.classList.remove('loading');
    if (!data || typeof data.result !== 'number') throw new Error();
    fxOut.innerHTML = `<span class="success">${amount.toFixed(2)} ${from} = ${data.result.toFixed(4)} ${to}</span>`;
  } catch (e) {
    fxOut.classList.remove('loading');
    fxOut.innerHTML = '<span class="error">تعذر جلب سعر الصرف.</span>';
  }
}

document.getElementById('convert').addEventListener('click', convertCurrency);
document.getElementById('swap').addEventListener('click', () => {
  const from = document.getElementById('from');
  const to = document.getElementById('to');
  [from.value, to.value] = [to.value, from.value];
});
