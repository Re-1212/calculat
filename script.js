// حساب العمر
function calcAge() {
    const birthDateStr = document.getElementById("birthDate").value;
    if (!birthDateStr) {
        alert("من فضلك أدخل تاريخ ميلادك");
        return;
    }
    const today = new Date();
    const birthDate = new Date(birthDateStr);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    document.getElementById("ageResult").innerText = `عمرك هو: ${age} سنة`;
}

// تحويل ميلادي إلى هجري باستخدام API
function toHijri() {
    const date = document.getElementById("gregDate").value;
    if (!date) {
        alert("من فضلك أدخل التاريخ الميلادي");
        return;
    }
    fetch(`https://api.aladhan.com/v1/gToH?date=${date}`)
        .then(res => res.json())
        .then(data => {
            if (data.code !== 200) throw new Error("خطأ في البيانات");
            const hijri = data.data.hijri;
            document.getElementById("hijriResult").innerText =
                `${hijri.day} / ${hijri.month.number} / ${hijri.year}`;
        })
        .catch(() => {
            document.getElementById("hijriResult").innerText = "حدث خطأ في التحويل";
        });
}

// تحويل هجري إلى ميلادي باستخدام API
function toGregorian() {
    const year = document.getElementById("hYear").value;
    const month = document.getElementById("hMonth").value;
    const day = document.getElementById("hDay").value;
    if (!year || !month || !day) {
        alert("من فضلك أدخل التاريخ الهجري كامل");
        return;
    }
    fetch(`https://api.aladhan.com/v1/hToG?date=${day}-${month}-${year}`)
        .then(res => res.json())
        .then(data => {
            if (data.code !== 200) throw new Error("خطأ في البيانات");
            const greg = data.data.gregorian;
            document.getElementById("gregResult").innerText =
                `${greg.day} / ${greg.month.number} / ${greg.year}`;
        })
        .catch(() => {
            document.getElementById("gregResult").innerText = "حدث خطأ في التحويل";
        });
}

// تحويل العملات باستخدام API بديل (exchangerate-api.com)
async function convertCurrency() {
    const from = document.getElementById("currencyFrom").value;
    const to = document.getElementById("currencyTo").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const resultEl = document.getElementById("currencyResult");

    if (isNaN(amount) || amount <= 0) {
        alert("من فضلك أدخل مبلغ صحيح أكبر من صفر");
        return;
    }
    if (from === to) {
        resultEl.innerText = `العملة نفسها، النتيجة: ${amount.toFixed(2)} ${to}`;
        return;
    }

    resultEl.innerText = "جاري التحويل...";

    try {
        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
        const data = await res.json();
        if (!data || !data.rates || !data.rates[to]) throw new Error("فشل في جلب سعر الصرف");
        const rate = data.rates[to];
        const converted = amount * rate;
        resultEl.innerText = `${amount.toFixed(2)} ${from} = ${converted.toFixed(2)} ${to}`;
    } catch (e) {
        resultEl.innerText = "حدث خطأ في تحويل العملات";
    }
}
