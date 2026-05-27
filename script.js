// ===== ОБЩИЕ ФУНКЦИИ =====
function showResult(elementId, text, isError = false) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = text;
        el.style.color = isError ? '#c0392b' : '#1e2a4a';
    }
}

// Функция форматирования чисел (убирает .000 и округляет)
function formatValue(value) {
    return Math.round(value);
}

// ===== АКТИВНАЯ ССЫЛКА В НАВИГАЦИИ =====
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    }
});

// ===== СТРАНИЦА: ЗАКОН ОМА =====
if (document.querySelector('.calc-type') && document.getElementById('voltage-group')) {
    const calcBtns = document.querySelectorAll('.calc-btn');
    const groups = {
        voltage: document.getElementById('voltage-group'),
        current: document.getElementById('current-group'),
        resistance: document.getElementById('resistance-group')
    };

    if (calcBtns.length) {
        calcBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                calcBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const type = btn.dataset.calc;
                Object.values(groups).forEach(g => g.classList.add('hidden'));
                if (groups[type]) groups[type].classList.remove('hidden');
            });
        });
    }

    const calcVoltage = document.getElementById('calc-voltage');
    if (calcVoltage) {
        calcVoltage.addEventListener('click', () => {
            const current = parseFloat(document.getElementById('current')?.value);
            const resistance = parseFloat(document.getElementById('resistance')?.value);
            if (isNaN(current) || isNaN(resistance)) {
                showResult('voltage-result', '❌ Введите все значения');
            } else {
                const voltage = current * resistance;
                showResult('voltage-result', `U = ${formatValue(voltage)} В`);
            }
        });
    }

    const calcCurrent = document.getElementById('calc-current');
    if (calcCurrent) {
        calcCurrent.addEventListener('click', () => {
            const voltage = parseFloat(document.getElementById('voltage')?.value);
            const resistance = parseFloat(document.getElementById('resistance2')?.value);
            if (isNaN(voltage) || isNaN(resistance) || resistance === 0) {
                showResult('current-result', '❌ Введите все значения (R ≠ 0)');
            } else {
                const current = voltage / resistance;
                showResult('current-result', `I = ${formatValue(current)} А`);
            }
        });
    }

    const calcResistance = document.getElementById('calc-resistance');
    if (calcResistance) {
        calcResistance.addEventListener('click', () => {
            const voltage = parseFloat(document.getElementById('voltage2')?.value);
            const current = parseFloat(document.getElementById('current2')?.value);
            if (isNaN(voltage) || isNaN(current) || current === 0) {
                showResult('resistance-result', '❌ Введите все значения (I ≠ 0)');
            } else {
                const resistance = voltage / current;
                showResult('resistance-result', `R = ${formatValue(resistance)} Ом`);
            }
        });
    }
}

// ===== СТРАНИЦА: МОЩНОСТЬ =====
if (document.querySelector('.formula-select') && document.getElementById('ui-group')) {
    const formulaBtns = document.querySelectorAll('.formula-btn');
    const groups = {
        ui: document.getElementById('ui-group'),
        i2r: document.getElementById('i2r-group'),
        u2r: document.getElementById('u2r-group')
    };

    if (formulaBtns.length) {
        formulaBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                formulaBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const type = btn.dataset.formula;
                Object.values(groups).forEach(g => g.classList.add('hidden'));
                if (groups[type]) groups[type].classList.remove('hidden');
            });
        });
    }

    const calcUi = document.getElementById('calc-ui');
    if (calcUi) {
        calcUi.addEventListener('click', () => {
            const voltage = parseFloat(document.getElementById('voltage-ui')?.value);
            const current = parseFloat(document.getElementById('current-ui')?.value);
            if (isNaN(voltage) || isNaN(current)) {
                showResult('ui-result', '❌ Введите все значения');
            } else {
                const power = voltage * current;
                showResult('ui-result', `P = ${formatValue(power)} Вт`);
            }
        });
    }

    const calcI2r = document.getElementById('calc-i2r');
    if (calcI2r) {
        calcI2r.addEventListener('click', () => {
            const current = parseFloat(document.getElementById('current-i2r')?.value);
            const resistance = parseFloat(document.getElementById('resistance-i2r')?.value);
            if (isNaN(current) || isNaN(resistance)) {
                showResult('i2r-result', '❌ Введите все значения');
            } else {
                const power = Math.pow(current, 2) * resistance;
                showResult('i2r-result', `P = ${formatValue(power)} Вт`);
            }
        });
    }

    const calcU2r = document.getElementById('calc-u2r');
    if (calcU2r) {
        calcU2r.addEventListener('click', () => {
            const voltage = parseFloat(document.getElementById('voltage-u2r')?.value);
            const resistance = parseFloat(document.getElementById('resistance-u2r')?.value);
            if (isNaN(voltage) || isNaN(resistance) || resistance === 0) {
                showResult('u2r-result', '❌ Введите все значения (R ≠ 0)');
            } else {
                const power = Math.pow(voltage, 2) / resistance;
                showResult('u2r-result', `P = ${formatValue(power)} Вт`);
            }
        });
    }
}

// ===== СТРАНИЦА: РЕЗИСТОРЫ =====
const calcResistor = document.getElementById('calc-resistor');
if (calcResistor) {
    calcResistor.addEventListener('click', () => {
        const band1 = parseInt(document.getElementById('band1')?.value);
        const band2 = parseInt(document.getElementById('band2')?.value);
        const multiplier = parseInt(document.getElementById('multiplier')?.value);
        const tolerance = document.getElementById('tolerance')?.value;

        const value = (band1 * 10 + band2) * Math.pow(10, multiplier);
        
        let unit = 'Ом';
        let displayValue = value;
        
        if (value >= 1e6) {
            displayValue = value / 1e6;
            unit = 'МОм';
        } else if (value >= 1e3) {
            displayValue = value / 1e3;
            unit = 'кОм';
        }
        
        // Для резисторов оставляем форматирование с убранными .000
        if (Number.isInteger(displayValue)) {
            showResult('resistor-result', `Сопротивление: ${displayValue} ${unit} ± ${tolerance}`);
        } else {
            showResult('resistor-result', `Сопротивление: ${displayValue.toFixed(2)} ${unit} ± ${tolerance}`);
        }
    });
}

// ===== СТРАНИЦА: КОНТАКТЫ =====
const feedbackForm = document.getElementById('feedbackForm');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showResult('form-message', '✅ Сообщение отправлено! Мы свяжемся с вами.');
        feedbackForm.reset();
        setTimeout(() => {
            const msg = document.getElementById('form-message');
            if (msg) msg.innerHTML = '';
        }, 3000);
    });
}

// ===== СТРАНИЦА: ПОТЕРИ НАПРЯЖЕНИЯ =====
(function() {
    // Проверяем, находимся ли мы на странице voltage-loss.html
    if (!document.querySelector('#single-group, #three-group, #high6-group, #high10-group')) return;
    
    // Удельные сопротивления проводов (Ом·мм²/м)
    const resistivity = {
        cu: 0.0175,  // медь
        al: 0.0280   // алюминий
    };
    
    // Индуктивные сопротивления (Ом/км) для разных сечений
    const inductiveReactance = {
        1.5: 0.116, 2.5: 0.105, 4: 0.096, 6: 0.090, 10: 0.083,
        16: 0.078, 25: 0.072, 35: 0.069, 50: 0.066, 70: 0.064,
        95: 0.062, 120: 0.060, 150: 0.059, 185: 0.058, 240: 0.057
    };
    
    // Функция получения активного сопротивления
    function getResistance(crossSection, material, lengthMeters) {
        const rho = resistivity[material];
        return rho * lengthMeters / crossSection;
    }
    
    // Функция показа результата
    function showLossResult(elementId, voltage, deltaU, normPercent) {
        const deltaUPercent = (deltaU / voltage) * 100;
        const isNorm = deltaUPercent <= normPercent;
        const status = isNorm ? '✅ В пределах нормы' : '⚠️ ПРЕВЫШЕНИЕ НОРМЫ';
        
        const resultDiv = document.getElementById(elementId);
        if (resultDiv) {
            resultDiv.innerHTML = `ΔU = ${deltaU.toFixed(2)} В (${deltaUPercent.toFixed(2)}%) | ${status}`;
            resultDiv.style.color = isNorm ? '#1e2a4a' : '#c0392b';
        }
    }
    
    // ===== 1. ОДНОФАЗНАЯ СЕТЬ 220В =====
    function calcSinglePhase() {
        const crossSection = parseFloat(document.getElementById('cross-section-single')?.value);
        const material = document.getElementById('material-single')?.value;
        const current = parseFloat(document.getElementById('current-single')?.value);
        const length = parseFloat(document.getElementById('length-single')?.value);
        const cosPhi = parseFloat(document.getElementById('cos-single')?.value);
        const voltage = 220;
        
        if (isNaN(current) || isNaN(length) || current <= 0 || length <= 0) {
            const resultDiv = document.getElementById('single-result');
            if (resultDiv) resultDiv.innerHTML = '❌ Заполните все поля (ток, длина)';
            return;
        }
        
        const R = getResistance(crossSection, material, length);
        const X = (inductiveReactance[crossSection] || 0.06) * length / 1000;
        const sinPhi = Math.sqrt(1 - Math.pow(cosPhi, 2));
        
        const deltaU = 2 * current * (R * cosPhi + X * sinPhi);
        
        showLossResult('single-result', voltage, deltaU, 5);
    }
    
    // ===== 2. ТРЁХФАЗНАЯ СЕТЬ 380В =====
    function calcThreePhase() {
        const crossSection = parseFloat(document.getElementById('cross-section-three')?.value);
        const material = document.getElementById('material-three')?.value;
        const current = parseFloat(document.getElementById('current-three')?.value);
        const length = parseFloat(document.getElementById('length-three')?.value);
        const cosPhi = parseFloat(document.getElementById('cos-three')?.value);
        const voltage = 380;
        
        if (isNaN(current) || isNaN(length) || current <= 0 || length <= 0) {
            const resultDiv = document.getElementById('three-result');
            if (resultDiv) resultDiv.innerHTML = '❌ Заполните все поля (ток, длина)';
            return;
        }
        
        const R = getResistance(crossSection, material, length);
        const X = (inductiveReactance[crossSection] || 0.06) * length / 1000;
        const sinPhi = Math.sqrt(1 - Math.pow(cosPhi, 2));
        
        const deltaU = Math.sqrt(3) * current * (R * cosPhi + X * sinPhi);
        
        showLossResult('three-result', voltage, deltaU, 5);
    }
    
    // ===== 3. ВЫСОКОЕ НАПРЯЖЕНИЕ 6 кВ =====
    function calcHigh6() {
        const crossSection = parseFloat(document.getElementById('cross-section-high6')?.value);
        const material = document.getElementById('material-high6')?.value;
        const power = parseFloat(document.getElementById('power-high6')?.value);
        const length = parseFloat(document.getElementById('length-high6')?.value);
        const cosPhi = parseFloat(document.getElementById('cos-high6')?.value);
        const voltage = 6000;
        
        if (isNaN(power) || isNaN(length) || power <= 0 || length <= 0) {
            const resultDiv = document.getElementById('high6-result');
            if (resultDiv) resultDiv.innerHTML = '❌ Заполните все поля (мощность, длина)';
            return;
        }
        
        const current = power * 1000 / (Math.sqrt(3) * voltage * cosPhi);
        const R = getResistance(crossSection, material, length * 1000);
        const X = (inductiveReactance[crossSection] || 0.06) * length;
        const sinPhi = Math.sqrt(1 - Math.pow(cosPhi, 2));
        
        const deltaU = Math.sqrt(3) * current * (R * cosPhi + X * sinPhi);
        
        showLossResult('high6-result', voltage, deltaU, 8);
    }
    
    // ===== 4. ВЫСОКОЕ НАПРЯЖЕНИЕ 10 кВ =====
    function calcHigh10() {
        const crossSection = parseFloat(document.getElementById('cross-section-high10')?.value);
        const material = document.getElementById('material-high10')?.value;
        const power = parseFloat(document.getElementById('power-high10')?.value);
        const length = parseFloat(document.getElementById('length-high10')?.value);
        const cosPhi = parseFloat(document.getElementById('cos-high10')?.value);
        const voltage = 10000;
        
        if (isNaN(power) || isNaN(length) || power <= 0 || length <= 0) {
            const resultDiv = document.getElementById('high10-result');
            if (resultDiv) resultDiv.innerHTML = '❌ Заполните все поля (мощность, длина)';
            return;
        }
        
        const current = power * 1000 / (Math.sqrt(3) * voltage * cosPhi);
        const R = getResistance(crossSection, material, length * 1000);
        const X = (inductiveReactance[crossSection] || 0.06) * length;
        const sinPhi = Math.sqrt(1 - Math.pow(cosPhi, 2));
        
        const deltaU = Math.sqrt(3) * current * (R * cosPhi + X * sinPhi);
        
        showLossResult('high10-result', voltage, deltaU, 8);
    }
    
    // ===== ПЕРЕКЛЮЧЕНИЕ МЕЖДУ ТИПАМИ СЕТЕЙ =====
    const systemBtns = document.querySelectorAll('[data-system]');
    const groups = {
        single: document.getElementById('single-group'),
        three: document.getElementById('three-group'),
        high6: document.getElementById('high6-group'),
        high10: document.getElementById('high10-group')
    };
    
    function hideAllGroups() {
        Object.values(groups).forEach(group => {
            if (group) group.classList.add('hidden');
        });
    }
    
    function showGroup(system) {
        if (groups[system]) groups[system].classList.remove('hidden');
    }
    
    if (systemBtns.length) {
        systemBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                systemBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const system = this.dataset.system;
                hideAllGroups();
                showGroup(system);
            });
        });
    }
    
    // Назначение кнопок расчёта
    const btnSingle = document.getElementById('calc-single');
    if (btnSingle) btnSingle.addEventListener('click', calcSinglePhase);
    
    const btnThree = document.getElementById('calc-three');
    if (btnThree) btnThree.addEventListener('click', calcThreePhase);
    
    const btnHigh6 = document.getElementById('calc-high6');
    if (btnHigh6) btnHigh6.addEventListener('click', calcHigh6);
    
    const btnHigh10 = document.getElementById('calc-high10');
    if (btnHigh10) btnHigh10.addEventListener('click', calcHigh10);
    
    // По умолчанию показываем однофазную сеть
    hideAllGroups();
    showGroup('single');
    const defaultBtn = document.querySelector('[data-system="single"]');
    if (defaultBtn) defaultBtn.classList.add('active');
})();