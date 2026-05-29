// ===== MuTilda - МОДУЛЬ ШАПКИ, ПОДВАЛА И СТРАНИЦ =====

// -------------------- НАСТРОЙКИ ПО УМОЛЧАНИЮ --------------------
let headerConfig = {
    enabled: true,
    logo: '',
    siteName: 'MuTilda',
    menu: ['Главная', 'О нас', 'Услуги', 'Контакты'],
    bgColor: '#1e2a4a',
    textColor: '#ffffff',
    fixed: false
};

let footerConfig = {
    enabled: true,
    text: '© 2026 MuTilda. Все права защищены.',
    bgColor: '#1e2a4a',
    textColor: '#ffffff',
    showSocial: true,
    socialLinks: {
        telegram: '#',
        vk: '#',
        youtube: '#'
    }
};

// -------------------- СИСТЕМА СТРАНИЦ --------------------
let pages = [
    { id: 'page_1', name: 'Главная', blocks: '' },
    { id: 'page_2', name: 'О нас', blocks: '' },
    { id: 'page_3', name: 'Услуги', blocks: '' },
    { id: 'page_4', name: 'Контакты', blocks: '' }
];
let currentPageId = 'page_1';
let nextPageId = 5;

// -------------------- ЗАГРУЗКА / СОХРАНЕНИЕ СТРАНИЦ --------------------
function loadPages() {
    const savedPages = localStorage.getItem('mutilda_pages');
    const savedCurrentPage = localStorage.getItem('mutilda_current_page');
    
    if (savedPages) {
        pages = JSON.parse(savedPages);
        const maxId = Math.max(...pages.map(p => parseInt(p.id.split('_')[1]) || 0), 0);
        nextPageId = maxId + 1;
    }
    if (savedCurrentPage) currentPageId = savedCurrentPage;
    
    syncMenuFromPages();
    renderCurrentPage();
}

function savePages() {
    localStorage.setItem('mutilda_pages', JSON.stringify(pages));
    localStorage.setItem('mutilda_current_page', currentPageId);
    syncMenuFromPages();
    saveHeaderFooterSettings();
}

function syncMenuFromPages() {
    headerConfig.menu = pages.map(p => p.name);
}

// -------------------- ОТРИСОВКА ТЕКУЩЕЙ СТРАНИЦЫ --------------------
function renderCurrentPage() {
    const canvas = document.getElementById('canvas');
    const currentPage = pages.find(p => p.id === currentPageId);
    if (!currentPage) return;
    
    canvas.innerHTML = `
        <div id="site-header-container"></div>
        <div id="page-content-container" class="blocks-container"></div>
        <div id="site-footer-container"></div>
    `;
    
    const contentContainer = document.getElementById('page-content-container');
    if (currentPage.blocks && currentPage.blocks.length > 0) {
        contentContainer.innerHTML = currentPage.blocks;
        if (typeof attachBlockEvents === 'function') attachBlockEvents();
    } else {
        contentContainer.innerHTML = '<div class="empty-message" id="emptyMessage"><span>➕</span><p>Добавьте первый блок с помощью панели инструментов</p></div>';
    }
    
    applyHeaderFooterToCanvas();
}

// -------------------- ШАПКА И ПОДВАЛ --------------------
// Применение шапки и подвала к текущему canvas
function applyHeaderFooterToCanvas() {
    const headerContainer = document.getElementById('site-header-container');
    const footerContainer = document.getElementById('site-footer-container');
    
    // Шапка - полное удаление если отключена
    if (headerConfig.enabled && headerContainer) {
        let logoHtml = '';
        if (headerConfig.logo && headerConfig.logo.trim() !== '') {
            logoHtml = `<span class="logo-icon">${escapeHtml(headerConfig.logo)}</span>`;
        }
        
        headerContainer.innerHTML = `
            <div class="site-header" style="background: ${headerConfig.bgColor}; color: ${headerConfig.textColor}; ${headerConfig.fixed ? 'position: sticky; top: 0; z-index: 100;' : ''}">
                <div class="site-header-logo">
                    ${logoHtml}
                    <span class="logo-name">${escapeHtml(headerConfig.siteName)}</span>
                </div>
                <nav class="site-header-nav">
                    ${pages.map(page => `
                        <a href="#" onclick="switchToPage('${page.id}'); return false;" class="${page.id === currentPageId ? 'active-page' : ''}">${escapeHtml(page.name)}</a>
                    `).join('')}
                </nav>
            </div>
        `;
    } else if (headerContainer) {
        // ПОЛНОСТЬЮ ОЧИЩАЕМ КОНТЕЙНЕР шапки
        headerContainer.innerHTML = '';
        headerContainer.style.display = 'none';
    }
    
    // Подвал - полное удаление если отключен
    if (footerConfig.enabled && footerContainer) {
        let socialHtml = '';
        if (footerConfig.showSocial) {
            socialHtml = `
                <div class="site-footer-social">
                    <a href="${footerConfig.socialLinks.telegram}">📱 Telegram</a>
                    <a href="${footerConfig.socialLinks.vk}">📘 VK</a>
                    <a href="${footerConfig.socialLinks.youtube}">▶️ YouTube</a>
                </div>
            `;
        }
        footerContainer.innerHTML = `
            <div class="site-footer" style="background: ${footerConfig.bgColor}; color: ${footerConfig.textColor};">
                <div class="site-footer-text">${escapeHtml(footerConfig.text)}</div>
                ${socialHtml}
            </div>
        `;
        footerContainer.style.display = 'block';
    } else if (footerContainer) {
        // ПОЛНОСТЬЮ ОЧИЩАЕМ КОНТЕЙНЕР подвала
        footerContainer.innerHTML = '';
        footerContainer.style.display = 'none';
    }
}

// -------------------- ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ --------------------
function switchToPage(pageId) {
    saveCurrentPageBlocks();
    currentPageId = pageId;
    renderCurrentPage();
    savePages();
}

function saveCurrentPageBlocks() {
    const contentContainer = document.getElementById('page-content-container');
    const currentPage = pages.find(p => p.id === currentPageId);
    if (currentPage && contentContainer) {
        currentPage.blocks = contentContainer.innerHTML;
    }
}

// -------------------- ДОБАВЛЕНИЕ БЛОКОВ --------------------
function addBlockToCurrentPage(type) {
    const contentContainer = document.getElementById('page-content-container');
    if (!contentContainer) return;
    
    const emptyMsg = document.getElementById('emptyMessage');
    if (emptyMsg) emptyMsg.remove();
    
    const blockId = `block_${Date.now()}_${Math.random()}`;
    let blockHtml = '';
    
    switch(type) {
        case 'text':
            blockHtml = `<div class="block-text" contenteditable="true">Введите ваш текст здесь...</div>`;
            break;
        case 'heading':
            blockHtml = `<div class="block-heading"><h2 contenteditable="true">Новый заголовок</h2></div>`;
            break;
        case 'image':
            blockHtml = `
                <div class="block-image" style="text-align: center;">
                    <div class="image-uploader">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f0f0f0'/%3E%3Ctext x='400' y='200' font-family='Arial' font-size='20' fill='%23999' text-anchor='middle'%3EВыберите изображение%3C/text%3E%3C/svg%3E" alt="Изображение" class="uploaded-image" style="max-width: none; width: 100%; border-radius: 8px;">
                        <div class="image-controls" style="margin-top: 10px; text-align: center;">
                            <button class="image-upload-btn" onclick="uploadImage(this)" style="background: #4d9eff; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">📁 Выбрать изображение</button>
                            <input type="file" class="image-file-input" accept="image/*" style="display:none" onchange="handleImageUpload(this)">
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'button':
            blockHtml = `<div class="block-button"><a href="#" contenteditable="true">Кнопка</a></div>`;
            break;
        case 'separator':
            blockHtml = `<div class="block-separator"><hr></div>`;
            break;
        case 'html':
            blockHtml = `<div class="block-html" contenteditable="true"><code>&lt;div&gt;Ваш HTML код&lt;/div&gt;</code></div>`;
            break;
        default: return;
    }
    
    const block = document.createElement('div');
    block.className = 'site-block';
    block.id = blockId;
    block.style.width = '100%';
    block.style.margin = '15px 0';
    block.style.float = 'none';
    block.style.display = 'block';
    
    block.innerHTML = `
        ${blockHtml}
        <div class="block-controls">
            <button class="move-up" onclick="moveBlockUp('${blockId}')">⬆️</button>
            <button class="move-down" onclick="moveBlockDown('${blockId}')">⬇️</button>
            <button class="delete" onclick="deleteBlock('${blockId}')">🗑️</button>
        </div>
    `;
    
    block.addEventListener('click', (e) => {
        if (!e.target.closest('.block-controls')) {
            if (typeof selectBlock === 'function') {
                selectBlock(blockId);
            }
        }
    });
    
    contentContainer.appendChild(block);
    
    if (typeof selectBlock === 'function') {
        selectBlock(blockId);
    }
    if (typeof attachBlockEvents === 'function') {
        attachBlockEvents();
    }
    
    saveCurrentPageBlocks();
    savePages();
}

// -------------------- РАБОТА С ИЗОБРАЖЕНИЯМИ --------------------
function uploadImage(button) {
    const fileInput = button.parentElement.querySelector('.image-file-input');
    if (fileInput) fileInput.click();
}

function handleImageUpload(input) {
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        alert('Изображение слишком большое (максимум 5MB)');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = input.parentElement.parentElement.querySelector('.uploaded-image');
        if (img) {
            img.src = e.target.result;
            saveCurrentPageBlocks();
            savePages();
        }
    };
    reader.readAsDataURL(file);
}

// -------------------- УПРАВЛЕНИЕ СТРАНИЦАМИ --------------------
function createNewPage() {
    const pageName = prompt('Введите название новой страницы:', 'Новая страница');
    if (!pageName || !pageName.trim()) return;
    
    pages.push({ id: `page_${nextPageId}`, name: pageName.trim(), blocks: '' });
    nextPageId++;
    savePages();
    renderCurrentPage();
    switchToPage(pages[pages.length - 1].id);
}

function deleteCurrentPage() {
    if (pages.length <= 1) {
        alert('Нельзя удалить последнюю страницу!');
        return;
    }
    const currentPage = pages.find(p => p.id === currentPageId);
    if (!currentPage) return;
    if (confirm(`Удалить страницу "${currentPage.name}"?`)) {
        const index = pages.findIndex(p => p.id === currentPageId);
        pages.splice(index, 1);
        currentPageId = pages[0].id;
        savePages();
        renderCurrentPage();
    }
}

// Рендер текущей страницы
function renderCurrentPage() {
    const canvas = document.getElementById('canvas');
    const currentPage = pages.find(p => p.id === currentPageId);
    if (!currentPage) return;
    
    canvas.innerHTML = `
        <div id="site-header-container" style="display: block;"></div>
        <div id="page-content-container" class="blocks-container"></div>
        <div id="site-footer-container" style="display: block;"></div>
    `;
    
    const contentContainer = document.getElementById('page-content-container');
    if (currentPage.blocks && currentPage.blocks.length > 0) {
        contentContainer.innerHTML = currentPage.blocks;
        if (typeof attachBlockEvents === 'function') attachBlockEvents();
    } else {
        contentContainer.innerHTML = '<div class="empty-message" id="emptyMessage"><span>➕</span><p>Добавьте первый блок с помощью панели инструментов</p></div>';
    }
    
    applyHeaderFooterToCanvas();
}
function openPageManager() {
    const panel = document.getElementById('propertiesPanel');
    const content = document.getElementById('panelContent');
    panel.classList.add('open');
    
    content.innerHTML = `
        <div class="property-group">
            <label>📄 Управление страницами</label>
            <button class="tool-btn" onclick="createNewPage(); closeProperties();" style="width:100%; margin-bottom:5px;">➕ Создать страницу</button>
            <button class="tool-btn" onclick="renameCurrentPage(); closeProperties();" style="width:100%; margin-bottom:5px;">✏️ Переименовать текущую</button>
            <button class="tool-btn" onclick="deleteCurrentPage(); closeProperties();" style="width:100%; background:#e74c3c;">🗑️ Удалить текущую</button>
        </div>
        <div class="property-group">
            <label>📑 Список страниц</label>
            <div style="max-height: 300px; overflow-y: auto;">
                ${pages.map(page => `
                    <div style="padding: 8px; margin: 5px 0; background: ${page.id === currentPageId ? '#4d9eff' : '#3a3a5e'}; border-radius: 6px; cursor: pointer;" onclick="switchToPage('${page.id}'); closeProperties();">
                        ${page.id === currentPageId ? '✅ ' : '📄 '} ${escapeHtml(page.name)}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// -------------------- НАСТРОЙКИ ШАПКИ --------------------
function loadHeaderFooterSettings() {
    const savedHeader = localStorage.getItem('mutilda_header');
    const savedFooter = localStorage.getItem('mutilda_footer');
    if (savedHeader) headerConfig = JSON.parse(savedHeader);
    if (savedFooter) footerConfig = JSON.parse(savedFooter);
    applyHeaderFooterToCanvas();
}

function saveHeaderFooterSettings() {
    localStorage.setItem('mutilda_header', JSON.stringify(headerConfig));
    localStorage.setItem('mutilda_footer', JSON.stringify(footerConfig));
    applyHeaderFooterToCanvas();
}

function openHeaderSettings() {
    const panel = document.getElementById('propertiesPanel');
    const content = document.getElementById('panelContent');
    panel.classList.add('open');
    
    content.innerHTML = `
        <div class="property-group"><label>🔘 Включить шапку</label><input type="checkbox" id="headerEnabled" ${headerConfig.enabled ? 'checked' : ''}></div>
        <div class="property-group"><label>🎨 Логотип</label><input type="text" id="headerLogo" value="${headerConfig.logo}" placeholder="🎨"></div>
        <div class="property-group"><label>📝 Название сайта</label><input type="text" id="headerSiteName" value="${headerConfig.siteName}"></div>
        <div class="property-group"><label>🎨 Цвет фона</label><input type="color" id="headerBgColor" value="${headerConfig.bgColor}"></div>
        <div class="property-group"><label>📝 Цвет текста</label><input type="color" id="headerTextColor" value="${headerConfig.textColor}"></div>
        <div class="property-group"><label>📌 Закрепить шапку</label><input type="checkbox" id="headerFixed" ${headerConfig.fixed ? 'checked' : ''}></div>
        <button class="tool-btn" onclick="saveHeaderSettings()" style="width:100%">💾 Сохранить</button>
    `;
    
    document.getElementById('headerEnabled').onchange = () => saveHeaderSettings();
    document.getElementById('headerLogo').oninput = () => saveHeaderSettings();
    document.getElementById('headerSiteName').oninput = () => saveHeaderSettings();
    document.getElementById('headerBgColor').oninput = () => saveHeaderSettings();
    document.getElementById('headerTextColor').oninput = () => saveHeaderSettings();
    document.getElementById('headerFixed').onchange = () => saveHeaderSettings();
}

function saveHeaderSettings() {
    headerConfig.enabled = document.getElementById('headerEnabled').checked;
    headerConfig.logo = document.getElementById('headerLogo').value || '';
    headerConfig.siteName = document.getElementById('headerSiteName').value || 'MuTilda';
    headerConfig.bgColor = document.getElementById('headerBgColor').value;
    headerConfig.textColor = document.getElementById('headerTextColor').value;
    headerConfig.fixed = document.getElementById('headerFixed').checked;
    
    // Сохраняем в localStorage
    localStorage.setItem('mutilda_header', JSON.stringify(headerConfig));
    
    // ПРИНУДИТЕЛЬНО ОБНОВЛЯЕМ ОТОБРАЖЕНИЕ ШАПКИ
    const headerContainer = document.getElementById('site-header-container');
    if (headerContainer) {
        if (headerConfig.enabled) {
            // Показываем контейнер и перерисовываем шапку
            headerContainer.style.display = 'block';
            applyHeaderFooterToCanvas();
        } else {
            // Скрываем контейнер и очищаем содержимое
            headerContainer.innerHTML = '';
            headerContainer.style.display = 'none';
        }
    }
    
    // Также обновляем подвал, если нужно
    const footerContainer = document.getElementById('site-footer-container');
    if (footerContainer && typeof footerConfig !== 'undefined') {
        if (footerConfig.enabled) {
            footerContainer.style.display = 'block';
            applyHeaderFooterToCanvas();
        } else {
            footerContainer.innerHTML = '';
            footerContainer.style.display = 'none';
        }
    }
}

// -------------------- НАСТРОЙКИ ПОДВАЛА --------------------
function openFooterSettings() {
    const panel = document.getElementById('propertiesPanel');
    const content = document.getElementById('panelContent');
    panel.classList.add('open');
    
    content.innerHTML = `
        <div class="property-group"><label>🔘 Включить подвал</label><input type="checkbox" id="footerEnabled" ${footerConfig.enabled ? 'checked' : ''}></div>
        <div class="property-group"><label>📝 Текст подвала</label><input type="text" id="footerText" value="${footerConfig.text}"></div>
        <div class="property-group"><label>🎨 Цвет фона</label><input type="color" id="footerBgColor" value="${footerConfig.bgColor}"></div>
        <div class="property-group"><label>📝 Цвет текста</label><input type="color" id="footerTextColor" value="${footerConfig.textColor}"></div>
        <div class="property-group"><label>🔘 Показать соцсети</label><input type="checkbox" id="footerShowSocial" ${footerConfig.showSocial ? 'checked' : ''}></div>
        <div class="property-group"><label>📱 Telegram</label><input type="text" id="footerTelegram" value="${footerConfig.socialLinks.telegram}"></div>
        <div class="property-group"><label>📘 VK</label><input type="text" id="footerVk" value="${footerConfig.socialLinks.vk}"></div>
        <div class="property-group"><label>▶️ YouTube</label><input type="text" id="footerYoutube" value="${footerConfig.socialLinks.youtube}"></div>
        <button class="tool-btn" onclick="saveFooterSettings()" style="width:100%">💾 Сохранить</button>
    `;
    
    document.getElementById('footerEnabled').onchange = () => saveFooterSettings();
    document.getElementById('footerText').oninput = () => saveFooterSettings();
    document.getElementById('footerBgColor').oninput = () => saveFooterSettings();
    document.getElementById('footerTextColor').oninput = () => saveFooterSettings();
    document.getElementById('footerShowSocial').onchange = () => saveFooterSettings();
    document.getElementById('footerTelegram').oninput = () => saveFooterSettings();
    document.getElementById('footerVk').oninput = () => saveFooterSettings();
    document.getElementById('footerYoutube').oninput = () => saveFooterSettings();
}

function saveFooterSettings() {
    footerConfig.enabled = document.getElementById('footerEnabled').checked;
    footerConfig.text = document.getElementById('footerText').value || '© 2026 MuTilda';
    footerConfig.bgColor = document.getElementById('footerBgColor').value;
    footerConfig.textColor = document.getElementById('footerTextColor').value;
    footerConfig.showSocial = document.getElementById('footerShowSocial').checked;
    footerConfig.socialLinks.telegram = document.getElementById('footerTelegram').value || '#';
    footerConfig.socialLinks.vk = document.getElementById('footerVk').value || '#';
    footerConfig.socialLinks.youtube = document.getElementById('footerYoutube').value || '#';
    saveHeaderFooterSettings();
}

// -------------------- ВСПОМОГАТЕЛЬНЫЕ --------------------
function closeProperties() {
    const panel = document.getElementById('propertiesPanel');
    if (panel) panel.classList.remove('open');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// -------------------- ИНИЦИАЛИЗАЦИЯ --------------------
function initPageSystem() {
    loadPages();
}

// -------------------- ГЛОБАЛЬНЫЙ ЭКСПОРТ --------------------
window.addBlock = addBlockToCurrentPage;
window.openPageManager = openPageManager;
window.createNewPage = createNewPage;
window.renameCurrentPage = renameCurrentPage;
window.deleteCurrentPage = deleteCurrentPage;
window.switchToPage = switchToPage;
window.openHeaderSettings = openHeaderSettings;
window.openFooterSettings = openFooterSettings;
window.saveHeaderSettings = saveHeaderSettings;
window.saveFooterSettings = saveFooterSettings;
window.closeProperties = closeProperties;
window.saveCurrentPageBlocks = saveCurrentPageBlocks;
window.uploadImage = uploadImage;
window.handleImageUpload = handleImageUpload;

// Автозапуск
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageSystem);
} else {
    initPageSystem();
}