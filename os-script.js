// ===== ОПЕРАЦИОННАЯ СИСТЕМА =====
let activeWindow = null;
let windowZIndex = 50;

// ===== НА ГЛАВНУЮ СТРАНИЦУ =====
function goToMainPage() {
    // Очищаем сессию
    sessionStorage.removeItem('os_authenticated');
    // Переходим на главную страницу
    window.location.href = 'index.html';
}

// ===== ВЫХОД ИЗ ОС (возврат на страницу входа) =====
function logoutAndExit() {
    // Очищаем сессию
    sessionStorage.removeItem('os_authenticated');
    // Переходим на страницу входа
    window.location.href = 'login.html';
}


// Функция показа окна
function openWindow(windowId, title, content) {
    const windowsContainer = document.getElementById('windows-container');
    
    // Удаляем старое окно если есть
    const existingWindow = document.getElementById(windowId);
    if (existingWindow) {
        existingWindow.remove();
    }
    
    const windowDiv = document.createElement('div');
    windowDiv.className = 'window';
    windowDiv.id = windowId;
    windowDiv.style.left = '100px';
    windowDiv.style.top = '80px';
    windowDiv.style.width = '400px';
    
    windowDiv.innerHTML = `
        <div class="window-header">
            <span class="window-title">${title}</span>
            <div class="window-controls">
                <span class="close-btn" onclick="closeWindow('${windowId}')">✕</span>
            </div>
        </div>
        <div class="window-content">
            ${content}
        </div>
    `;
    
    windowsContainer.appendChild(windowDiv);
    makeDraggable(windowDiv);
    focusWindow(windowId);
}

// Функция закрытия окна
function closeWindow(windowId) {
    const window = document.getElementById(windowId);
    if (window) window.remove();
}

// Функция фокуса на окне
function focusWindow(windowId) {
    const window = document.getElementById(windowId);
    if (window) {
        windowZIndex++;
        window.style.zIndex = windowZIndex;
        document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
        window.classList.add('active');
        activeWindow = windowId;
    }
}

// Функция перетаскивания окна
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = element.querySelector('.window-header');
    
    header.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        focusWindow(element.id);
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        let top = element.offsetTop - pos2;
        let left = element.offsetLeft - pos1;
        if (top < 0) top = 0;
        if (left < 0) left = 0;
        element.style.top = top + "px";
        element.style.left = left + "px";
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// ===== КАЛЬКУЛЯТОР =====
function openCalculator() {
    const content = `
        <div class="window-calculator">
            <div class="display">
                <div class="current-operand" id="os-current">0</div>
            </div>
         <div class="buttons">
                <button class="btn btn-clear" data-action="clear">C</button>
                <button class="btn btn-delete" data-action="delete">⌫</button>
                <button class="btn btn-operator" data-operator="%">%</button>
                <button class="btn btn-operator" data-operator="/">÷</button>
                
                <button class="btn btn-number" data-number="7">7</button>
                <button class="btn btn-number" data-number="8">8</button>
                <button class="btn btn-number" data-number="9">9</button>
                <button class="btn btn-operator" data-operator="*">×</button>
                
                <button class="btn btn-number" data-number="4">4</button>
                <button class="btn btn-number" data-number="5">5</button>
                <button class="btn btn-number" data-number="6">6</button>
                <button class="btn btn-operator" data-operator="-">-</button>
                
                <button class="btn btn-number" data-number="1">1</button>
                <button class="btn btn-number" data-number="2">2</button>
                <button class="btn btn-number" data-number="3">3</button>
                <button class="btn btn-operator" data-operator="+">+</button>
                
                <button class="btn btn-number zero" data-number="0">0</button>
                <button class="btn btn-number" data-number=".">.</button>
                <button class="btn btn-equals" data-action="equals">=</button>
            </div>
        </div>
    `;
    
    openWindow('calc-window', '🧮 Калькулятор', content);
    
    // Инициализация калькулятора после открытия окна
    setTimeout(() => {
        let current = '0';
        const display = document.getElementById('os-current');
        
        function updateDisplay() {
            if (display) display.innerText = current;
        }
        
        document.querySelectorAll('#calc-window .btn-number').forEach(btn => {
            btn.addEventListener('click', () => {
                const num = btn.dataset.number;
                if (current === '0' && num !== '.') {
                    current = num;
                } else {
                    current += num;
                }
                updateDisplay();
            });
        });
        
        document.querySelectorAll('#calc-window .btn-operator').forEach(btn => {
            btn.addEventListener('click', () => {
                current += ' ' + btn.dataset.operator + ' ';
                updateDisplay();
            });
        });
        
        document.querySelector('#calc-window .btn-clear')?.addEventListener('click', () => {
            current = '0';
            updateDisplay();
        });
        
        document.querySelector('#calc-window .btn-equals')?.addEventListener('click', () => {
            try {
                let expr = current.replace(/×/g, '*').replace(/÷/g, '/');
                current = eval(expr).toString();
                updateDisplay();
            } catch {
                current = 'Ошибка';
                updateDisplay();
            }
        });
    }, 100);
}

// ===== ЗАКОН ОМА =====
function openOhm() {
    const content = `
        <h3>📐 Закон Ома</h3>
        <p class="formula">U = I × R</p>
        <div class="form-group">
            <label>Ток (I), А</label>
            <input type="number" id="os-current-ohm" placeholder="Введите ток">
        </div>
        <div class="form-group">
            <label>Сопротивление (R), Ом</label>
            <input type="number" id="os-resistance-ohm" placeholder="Введите сопротивление">
        </div>
        <button class="btn-calc" id="os-calc-voltage">Рассчитать напряжение</button>
        <div class="result" id="os-ohm-result"></div>
    `;
    
    openWindow('ohm-window', '📐 Закон Ома', content);
    
    setTimeout(() => {
        document.getElementById('os-calc-voltage')?.addEventListener('click', () => {
            const current = parseFloat(document.getElementById('os-current-ohm')?.value);
            const resistance = parseFloat(document.getElementById('os-resistance-ohm')?.value);
            const resultDiv = document.getElementById('os-ohm-result');
            if (isNaN(current) || isNaN(resistance)) {
                resultDiv.innerHTML = '❌ Введите все значения';
            } else {
                const voltage = current * resistance;
                resultDiv.innerHTML = `U = ${Math.round(voltage)} В`;
            }
        });
    }, 100);
}

// ===== МОЩНОСТЬ =====
function openPower() {
    const content = `
        <h3>⚡ Расчёт мощности</h3>
        <p class="formula">P = U × I</p>
        <div class="form-group">
            <label>Напряжение (U), В</label>
            <input type="number" id="os-voltage-power" placeholder="Введите напряжение">
        </div>
        <div class="form-group">
            <label>Ток (I), А</label>
            <input type="number" id="os-current-power" placeholder="Введите ток">
        </div>
        <button class="btn-calc" id="os-calc-power">Рассчитать мощность</button>
        <div class="result" id="os-power-result"></div>
    `;
    
    openWindow('power-window', '⚡ Мощность', content);
    
    setTimeout(() => {
        document.getElementById('os-calc-power')?.addEventListener('click', () => {
            const voltage = parseFloat(document.getElementById('os-voltage-power')?.value);
            const current = parseFloat(document.getElementById('os-current-power')?.value);
            const resultDiv = document.getElementById('os-power-result');
            if (isNaN(voltage) || isNaN(current)) {
                resultDiv.innerHTML = '❌ Введите все значения';
            } else {
                const power = voltage * current;
                resultDiv.innerHTML = `P = ${Math.round(power)} Вт`;
            }
        });
    }, 100);
}

// ===== ОБО МНЕ =====
function openAbout() {
    const content = `
        <div style="text-align: center;">
            <div style="width: 120px; height: 120px; margin: 0 auto 15px; border-radius: 50%; overflow: hidden; border: 3px solid #2780e0; background: #3a3a5e;">
                <img src="avatar.jpg" alt="Фото профиля" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/120x120?text=Фото'">
            </div>
            <h3 style="margin: 0 0 5px 0;">Мальцев Андрей Николаевич</h3>
            <p style="color: #2780e0; margin: 0 0 15px 0;">Инженер-электрик | Разработчик</p>
            <p style="margin: 15px 0; line-height: 1.5;">Специалист в области электротехники и энергетики. 
                        Более 20 лет опыта работы с электроустановками до и выше 1000 В, 
                        проектирование систем электроснабжения, расчёт потерь напряжения, 
                        выбор сечений кабелей и аппаратов защиты.</p>
            <hr style="margin: 15px 0; border-color: #3a3a5e;">
            <p style="margin: 5px 0;">📧 andreinri@yandex.ru</p>
          

            
        </div>
           <div class="detail-card">
                    <h3> Навыки</h3>
                    <div class="skills">
                        <span class="skill-tag">Python</span>
                        <span class="skill-tag">JavaScript</span>
                        <span class="skill-tag">HTML/CSS</span>
                        <span class="skill-tag">SQL</span>
                        <span class="skill-tag">С++ </span>
                        <span class="skill-tag">С#</span>
                        <span class="skill-tag">Java</span>
                        <span class="skill-tag">Kotlin</span>

                    </div>
                </div>
    `;
    
    openWindow('about-window', '👤 Обо мне', content);
}
// ===== ЧАСЫ НА ПАНЕЛИ =====
function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    document.getElementById('taskbar-time').innerHTML = `${dateStr} ${timeStr}`;
}

setInterval(updateTime, 1000);
updateTime();

// ===== МЕНЮ ПУСК =====
function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    menu.classList.toggle('show');
}

// Закрытие меню при клике вне его
document.addEventListener('click', (e) => {
    const menu = document.getElementById('start-menu');
    const startBtn = document.getElementById('start-button');
    if (!startBtn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('show');
    }
});


// ===== ПОТЕРИ НАПРЯЖЕНИЯ =====
function openVoltageLoss() {
    const content = `
        
        <div class="calc-type-os" style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
            <button class="os-system-btn active" data-system="single">220В (1ф)</button>
            <button class="os-system-btn" data-system="three">380В (3ф)</button>
            <button class="os-system-btn" data-system="high6">6 кВ</button>
            <button class="os-system-btn" data-system="high10">10 кВ</button>
        </div>
        
        <!-- Однофазная сеть 220В -->
        <div id="os-single-group">
            <div class="form-group">
                <label>Сечение провода, мм²</label>
                <select id="os-cross-section-single">
                    <option value="1.5">1.5 мм²</option><option value="2.5">2.5 мм²</option>
                    <option value="4">4 мм²</option><option value="6">6 мм²</option>
                    <option value="10">10 мм²</option><option value="16">16 мм²</option>
                    <option value="25">25 мм²</option><option value="35">35 мм²</option>
                    <option value="50">50 мм²</option><option value="70">70 мм²</option>
                    <option value="95">95 мм²</option><option value="120">120 мм²</option>
                    <option value="150">150 мм²</option><option value="185">185 мм²</option>
                    <option value="240">240 мм²</option>
                </select>
            </div>
            <div class="form-group">
                <label>Материал провода</label>
                <select id="os-material-single">
                    <option value="cu">Медь (Cu)</option>
                    <option value="al">Алюминий (Al)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Ток нагрузки, А</label>
                <input type="number" id="os-current-single" placeholder="Введите ток">
            </div>
            <div class="form-group">
                <label>Длина линии, м</label>
                <input type="number" id="os-length-single" placeholder="Введите длину">
            </div>
            <div class="form-group">
                <label>cosφ (коэффициент мощности)</label>
                <input type="number" id="os-cos-single" value="0.95" step="0.01">
            </div>
            <button class="btn-calc" id="os-calc-single">Рассчитать потери</button>
            <div class="result" id="os-single-result"></div>
        </div>
        
        <!-- Трёхфазная сеть 380В (скрыта по умолчанию) -->
        <div id="os-three-group" style="display: none;">
            <div class="form-group">
                <label>Сечение провода, мм²</label>
                <select id="os-cross-section-three">
                    <option value="1.5">1.5 мм²</option><option value="2.5">2.5 мм²</option>
                    <option value="4">4 мм²</option><option value="6">6 мм²</option>
                    <option value="10">10 мм²</option><option value="16">16 мм²</option>
                    <option value="25">25 мм²</option><option value="35">35 мм²</option>
                    <option value="50">50 мм²</option><option value="70">70 мм²</option>
                    <option value="95">95 мм²</option><option value="120">120 мм²</option>
                    <option value="150">150 мм²</option><option value="185">185 мм²</option>
                    <option value="240">240 мм²</option>
                </select>
            </div>
            <div class="form-group">
                <label>Материал провода</label>
                <select id="os-material-three">
                    <option value="cu">Медь (Cu)</option>
                    <option value="al">Алюминий (Al)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Ток нагрузки, А</label>
                <input type="number" id="os-current-three" placeholder="Введите ток">
            </div>
            <div class="form-group">
                <label>Длина линии, м</label>
                <input type="number" id="os-length-three" placeholder="Введите длину">
            </div>
            <div class="form-group">
                <label>cosφ (коэффициент мощности)</label>
                <input type="number" id="os-cos-three" value="0.95" step="0.01">
            </div>
            <button class="btn-calc" id="os-calc-three">Рассчитать потери</button>
            <div class="result" id="os-three-result"></div>
        </div>
        
        <!-- Высокое напряжение 6 кВ (скрыта по умолчанию) -->
        <div id="os-high6-group" style="display: none;">
            <div class="form-group">
                <label>Сечение провода, мм²</label>
                <select id="os-cross-section-high6">
                    <option value="16">16 мм²</option><option value="25">25 мм²</option>
                    <option value="35">35 мм²</option><option value="50">50 мм²</option>
                    <option value="70">70 мм²</option><option value="95">95 мм²</option>
                    <option value="120">120 мм²</option><option value="150">150 мм²</option>
                    <option value="185">185 мм²</option><option value="240">240 мм²</option>
                </select>
            </div>
            <div class="form-group">
                <label>Материал провода</label>
                <select id="os-material-high6">
                    <option value="cu">Медь (Cu)</option>
                    <option value="al">Алюминий (Al)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Мощность нагрузки, кВт</label>
                <input type="number" id="os-power-high6" placeholder="Введите мощность">
            </div>
            <div class="form-group">
                <label>Длина линии, км</label>
                <input type="number" id="os-length-high6" step="0.1" placeholder="Введите длину (км)">
            </div>
            <div class="form-group">
                <label>cosφ (коэффициент мощности)</label>
                <input type="number" id="os-cos-high6" value="0.95" step="0.01">
            </div>
            <button class="btn-calc" id="os-calc-high6">Рассчитать потери</button>
            <div class="result" id="os-high6-result"></div>
        </div>
        
        <!-- Высокое напряжение 10 кВ (скрыта по умолчанию) -->
        <div id="os-high10-group" style="display: none;">
            <div class="form-group">
                <label>Сечение провода, мм²</label>
                <select id="os-cross-section-high10">
                    <option value="16">16 мм²</option><option value="25">25 мм²</option>
                    <option value="35">35 мм²</option><option value="50">50 мм²</option>
                    <option value="70">70 мм²</option><option value="95">95 мм²</option>
                    <option value="120">120 мм²</option><option value="150">150 мм²</option>
                    <option value="185">185 мм²</option><option value="240">240 мм²</option>
                </select>
            </div>
            <div class="form-group">
                <label>Материал провода</label>
                <select id="os-material-high10">
                    <option value="cu">Медь (Cu)</option>
                    <option value="al">Алюминий (Al)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Мощность нагрузки, кВт</label>
                <input type="number" id="os-power-high10" placeholder="Введите мощность">
            </div>
            <div class="form-group">
                <label>Длина линии, км</label>
                <input type="number" id="os-length-high10" step="0.1" placeholder="Введите длину (км)">
            </div>
            <div class="form-group">
                <label>cosφ (коэффициент мощности)</label>
                <input type="number" id="os-cos-high10" value="0.95" step="0.01">
            </div>
            <button class="btn-calc" id="os-calc-high10">Рассчитать потери</button>
            <div class="result" id="os-high10-result"></div>
        </div>
    `;
    
    openWindow('voltage-loss-window', '📉 Потери напряжения', content);
    
    setTimeout(() => {
        // Удельные сопротивления
        const resistivity = { cu: 0.0175, al: 0.0280 };
        const inductiveReactance = {
            1.5: 0.116, 2.5: 0.105, 4: 0.096, 6: 0.090, 10: 0.083,
            16: 0.078, 25: 0.072, 35: 0.069, 50: 0.066, 70: 0.064,
            95: 0.062, 120: 0.060, 150: 0.059, 185: 0.058, 240: 0.057
        };
        
        function getResistance(crossSection, material, lengthMeters) {
            return resistivity[material] * lengthMeters / crossSection;
        }
        
        function showResult(elementId, voltage, deltaU, normPercent) {
            const deltaUPercent = (deltaU / voltage) * 100;
            const isNorm = deltaUPercent <= normPercent;
            const status = isNorm ? '✅ В пределах нормы' : '⚠️ ПРЕВЫШЕНИЕ НОРМЫ';
            const resultDiv = document.getElementById(elementId);
            if (resultDiv) {
                resultDiv.innerHTML = `ΔU = ${deltaU.toFixed(2)} В (${deltaUPercent.toFixed(2)}%) | ${status}`;
            }
        }
        
        // Переключение между типами сетей
        const btns = document.querySelectorAll('#voltage-loss-window .os-system-btn');
        const groups = {
            single: document.getElementById('os-single-group'),
            three: document.getElementById('os-three-group'),
            high6: document.getElementById('os-high6-group'),
            high10: document.getElementById('os-high10-group')
        };
        
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                Object.values(groups).forEach(g => { if (g) g.style.display = 'none'; });
                const system = btn.dataset.system;
                if (groups[system]) groups[system].style.display = 'block';
            });
        });
        
        // Однофазная
        document.getElementById('os-calc-single')?.addEventListener('click', () => {
            const crossSection = parseFloat(document.getElementById('os-cross-section-single').value);
            const material = document.getElementById('os-material-single').value;
            const current = parseFloat(document.getElementById('os-current-single').value);
            const length = parseFloat(document.getElementById('os-length-single').value);
            const cosPhi = parseFloat(document.getElementById('os-cos-single').value);
            if (isNaN(current) || isNaN(length)) {
                document.getElementById('os-single-result').innerHTML = '❌ Заполните все поля';
                return;
            }
            const R = getResistance(crossSection, material, length);
            const X = (inductiveReactance[crossSection] || 0.06) * length / 1000;
            const sinPhi = Math.sqrt(1 - Math.pow(cosPhi, 2));
            const deltaU = 2 * current * (R * cosPhi + X * sinPhi);
            showResult('os-single-result', 220, deltaU, 5);
        });
        
        // Трёхфазная
        document.getElementById('os-calc-three')?.addEventListener('click', () => {
            const crossSection = parseFloat(document.getElementById('os-cross-section-three').value);
            const material = document.getElementById('os-material-three').value;
            const current = parseFloat(document.getElementById('os-current-three').value);
            const length = parseFloat(document.getElementById('os-length-three').value);
            const cosPhi = parseFloat(document.getElementById('os-cos-three').value);
            if (isNaN(current) || isNaN(length)) {
                document.getElementById('os-three-result').innerHTML = '❌ Заполните все поля';
                return;
            }
            const R = getResistance(crossSection, material, length);
            const X = (inductiveReactance[crossSection] || 0.06) * length / 1000;
            const sinPhi = Math.sqrt(1 - Math.pow(cosPhi, 2));
            const deltaU = Math.sqrt(3) * current * (R * cosPhi + X * sinPhi);
            showResult('os-three-result', 380, deltaU, 5);
        });
        
        // 6 кВ
        document.getElementById('os-calc-high6')?.addEventListener('click', () => {
            const crossSection = parseFloat(document.getElementById('os-cross-section-high6').value);
            const material = document.getElementById('os-material-high6').value;
            const power = parseFloat(document.getElementById('os-power-high6').value);
            const length = parseFloat(document.getElementById('os-length-high6').value);
            const cosPhi = parseFloat(document.getElementById('os-cos-high6').value);
            if (isNaN(power) || isNaN(length)) {
                document.getElementById('os-high6-result').innerHTML = '❌ Заполните все поля';
                return;
            }
            const voltage = 6000;
            const current = power * 1000 / (Math.sqrt(3) * voltage * cosPhi);
            const R = getResistance(crossSection, material, length * 1000);
            const X = (inductiveReactance[crossSection] || 0.06) * length;
            const sinPhi = Math.sqrt(1 - Math.pow(cosPhi, 2));
            const deltaU = Math.sqrt(3) * current * (R * cosPhi + X * sinPhi);
            showResult('os-high6-result', voltage, deltaU, 8);
        });
        
        // 10 кВ
        document.getElementById('os-calc-high10')?.addEventListener('click', () => {
            const crossSection = parseFloat(document.getElementById('os-cross-section-high10').value);
            const material = document.getElementById('os-material-high10').value;
            const power = parseFloat(document.getElementById('os-power-high10').value);
            const length = parseFloat(document.getElementById('os-length-high10').value);
            const cosPhi = parseFloat(document.getElementById('os-cos-high10').value);
            if (isNaN(power) || isNaN(length)) {
                document.getElementById('os-high10-result').innerHTML = '❌ Заполните все поля';
                return;
            }
            const voltage = 10000;
            const current = power * 1000 / (Math.sqrt(3) * voltage * cosPhi);
            const R = getResistance(crossSection, material, length * 1000);
            const X = (inductiveReactance[crossSection] || 0.06) * length;
            const sinPhi = Math.sqrt(1 - Math.pow(cosPhi, 2));
            const deltaU = Math.sqrt(3) * current * (R * cosPhi + X * sinPhi);
            showResult('os-high10-result', voltage, deltaU, 8);
        });
    }, 100);
}