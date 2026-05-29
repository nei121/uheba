// ===== МОДУЛЬ НАСТРОЙКИ ШАПКИ И ПОДВАЛА =====

// Состояние шапки и подвала
let headerConfig = {
    enabled: true,
    logo: '',
    siteName: 'MaTilda',
    menu: ['Главная', 'О нас', 'Услуги', 'Контакты'],
    bgColor: '#1e2a4a',
    textColor: '#ffffff',
    fixed: false
};

let footerConfig = {
    enabled: true,
    text: '© 2025 MaTilda. Все права защищены.',
    bgColor: '#1e2a4a',
    textColor: '#ffffff',
    showSocial: true,
    socialLinks: {
        telegram: '#',
        vk: '#',
        youtube: '#'
    }
};

// ===== СИСТЕМА СТРАНИЦ =====
let pages = [
    { id: 'page_1', name: 'Главная', blocks: [] },
    { id: 'page_2', name: 'О нас', blocks: [] },
    { id: 'page_3', name: 'Услуги', blocks: [] },
    { id: 'page_4', name: 'Контакты', blocks: [] }
];
let currentPageId = 'page_1';
let nextPageId = 5;

// Загрузка страниц из localStorage
function loadPages() {
    const savedPages = localStorage.getItem('matilda_pages');
    const savedCurrentPage = localStorage.getItem('matilda_current_page');
    
    if (savedPages) {
        pages = JSON.parse(savedPages);
        // Обновляем nextPageId
        const maxId = Math.max(...pages.map(p => parseInt(p.id.split('_')[1]) || 0), 0);
        nextPageId = maxId + 1;
    }
    if (savedCurrentPage) {
        currentPageId = savedCurrentPage;
    }
    
    // Синхронизируем меню с названиями страниц
    syncMenuFromPages();
    
    renderCurrentPage();
}

// Сохранение страниц
function savePages() {
    localStorage.setItem('matilda_pages', JSON.stringify(pages));
    localStorage.setItem('matilda_current_page', currentPageId);
    syncMenuFromPages();
    saveHeaderFooterSettings();
}

// Синхронизация меню с названиями страниц
function syncMenuFromPages() {
    headerConfig.menu = pages.map(p => p.name);
}

// Рендер текущей страницы
function renderCurrentPage() {
    const canvas = document.getElementById('canvas');
    const currentPage = pages.find(p => p.id === currentPageId);
    
    if (!currentPage) return;
    
    // Очищаем canvas
    canvas.innerHTML = '';
    
    // Добавляем контейнер для шапки (будет заполнен позже)
    const headerContainer = document.createElement('div');
    headerContainer.id = 'site-header-container';
    canvas.appendChild(headerContainer);
    
    // Добавляем контейнер для контента
    const contentContainer = document.createElement('div');
    contentContainer.id = 'page-content-container';
    canvas.appendChild(contentContainer);
    
    // Добавляем контейнер для подвала
    const footerContainer = document.createElement('div');
    footerContainer.id = 'site-footer-container';
    canvas.appendChild(footerContainer);
    
    // Восстанавливаем блоки
    if (currentPage.blocks && currentPage.blocks.length > 0) {
        contentContainer.innerHTML = currentPage.blocks;
        attachBlockEvents();
    } else {
        contentContainer.innerHTML = '<div class="empty-message" id="emptyMessage"><span>➕</span><p>Добавьте первый блок с помощью панели инструментов</p></div>';
    }
    
    // Применяем стили шапки и подвала
    applyHeaderFooterToCanvas();
}

// Применение шапки и подвала к текущему canvas
function applyHeaderFooterToCanvas() {
    const headerContainer = document.getElementById('site-header-container');
    const footerContainer = document.getElementById('site-footer-container');
    
    // Шапка
    if (headerConfig.enabled && headerContainer) {
        let logoHtml = '';
        if (headerConfig.logo && headerConfig.logo.trim() !== '') {
            logoHtml = `<span class="logo-icon">${headerConfig.logo}</span>`;
        }
        
        headerContainer.innerHTML = `
            <div class="site-header" style="background: ${headerConfig.bgColor}; color: ${headerConfig.textColor}; ${headerConfig.fixed ? 'position: sticky; top: 0; z-index: 100;' : ''}">
                <div class="site-header-logo">
                    ${logoHtml}
                    <span class="logo-name">${headerConfig.siteName}</span>
                </div>
                <nav class="site-header-nav">
                    ${pages.map((page, idx) => `
                        <a href="#" onclick="switchToPage('${page.id}'); return false;" data-page="${page.id}" class="${page.id === currentPageId ? 'active-page' : ''}">${page.name}</a>
                    `).join('')}
                </nav>
            </div>
        `;
    } else if (headerContainer) {
        headerContainer.innerHTML = '';
    }
    
    // Подвал
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
                <div class="site-footer-text">${footerConfig.text}</div>
                ${socialHtml}
            </div>
        `;
    } else if (footerContainer) {
        footerContainer.innerHTML = '';
    }
}

// Переключение между страницами
function switchToPage(pageId) {
    // Сохраняем текущие блоки перед переключением
    saveCurrentPageBlocks();
    
    currentPageId = pageId;
    renderCurrentPage();
    savePages();
}

// Сохранение блоков текущей страницы
function saveCurrentPageBlocks() {
    const contentContainer = document.getElementById('page-content-container');
    const currentPage = pages.find(p => p.id === currentPageId);
    
    if (currentPage && contentContainer) {
        // Сохраняем HTML блоков (без шапки и подвала)
        const blocksHtml = contentContainer.innerHTML;
        currentPage.blocks = blocksHtml;
    }
}

// Добавление блока на текущую страницу
// Добавление блока на текущую страницу
function addBlockToCurrentPage(type) {
    const contentContainer = document.getElementById('page-content-container');
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
            // Блок изображения с возможностью выбора файла
            blockHtml = `
                <div class="block-image">
                    <div class="image-uploader">
                        <img src="images/placeholder.jpg" alt="Изображение" class="uploaded-image" onerror="this.src='https://via.placeholder.com/800x400?text=Выберите+изображение'">
                        <div class="image-controls">
                            <button class="image-upload-btn" onclick="uploadImage(this)">📁 Выбрать изображение</button>
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
        default:
            return;
    }
    
    const block = document.createElement('div');
    block.className = 'site-block';
    block.id = blockId;
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
            selectBlock(blockId);
        }
    });
    
    contentContainer.appendChild(block);
    selectBlock(blockId);
    attachBlockEvents();
    
    // Автосохранение
    saveCurrentPageBlocks();
    savePages();
}

// ===== РАБОТА С ИЗОБРАЖЕНИЯМИ =====

// Функция загрузки изображения
function uploadImage(button) {
    const fileInput = button.parentElement.querySelector('.image-file-input');
    if (fileInput) {
        fileInput.click();
    }
}

// Обработка выбранного файла
function handleImageUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
    }
    
    // Проверяем размер (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Изображение太大了 (максимум 5MB)');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageElement = input.parentElement.parentElement.querySelector('.uploaded-image');
        if (imageElement) {
            imageElement.src = e.target.result;
            
            // Сохраняем изображение в localStorage
            saveImageToLocalStorage(file.name, e.target.result);
            
            // Автосохранение страницы
            saveCurrentPageBlocks();
            savePages();
        }
    };
    reader.readAsDataURL(file);
}

// Сохранение изображения в localStorage
function saveImageToLocalStorage(filename, dataUrl) {
    let images = localStorage.getItem('matilda_images');
    images = images ? JSON.parse(images) : {};
    images[filename] = dataUrl;
    localStorage.setItem('matilda_images', JSON.stringify(images));
}

// Загрузка сохранённых изображений
function loadSavedImages() {
    const images = localStorage.getItem('matilda_images');
    if (images) {
        const imageData = JSON.parse(images);
        // Изображения будут восстановлены при загрузке блоков
        restoreImagesInBlocks(imageData);
    }
}

// Восстановление изображений в блоках
function restoreImagesInBlocks(imageData) {
    const allImages = document.querySelectorAll('.uploaded-image');
    allImages.forEach(img => {
        const src = img.src;
        // Если src начинается с blob: или data:, значит это загруженное изображение
        if (src.startsWith('data:image') || src.startsWith('blob:')) {
            // Проверяем, есть ли такое изображение в сохранённых
            for (const [filename, dataUrl] of Object.entries(imageData)) {
                if (src === dataUrl) {
                    // Уже есть, ничего не делаем
                    break;
                }
            }
        }
    });
}

// Функция для замены изображения
function changeImage(blockId) {
    const block = document.getElementById(blockId);
    const fileInput = block.querySelector('.image-file-input');
    if (fileInput) {
        fileInput.click();
    }
}

// Создание новой страницы
function createNewPage() {
    const pageName = prompt('Введите название новой страницы:', 'Новая страница');
    if (!pageName || pageName.trim() === '') return;
    
    const newPage = {
        id: `page_${nextPageId}`,
        name: pageName.trim(),
        blocks: ''
    };
    pages.push(newPage);
    nextPageId++;
    
    savePages();
    renderCurrentPage();
    
    // Переключаемся на новую страницу
    switchToPage(newPage.id);
}

// Удаление страницы
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
        
        // Переключаемся на первую страницу
        currentPageId = pages[0].id;
        savePages();
        renderCurrentPage();
    }
}

// Редактирование названия текущей страницы
function renameCurrentPage() {
    const currentPage = pages.find(p => p.id === currentPageId);
    if (!currentPage) return;
    
    const newName = prompt('Введите новое название страницы:', currentPage.name);
    if (newName && newName.trim() !== '') {
        currentPage.name = newName.trim();
        savePages();
        renderCurrentPage();
    }
}

// Открытие панели управления страницами
function openPageManager() {
    const panel = document.getElementById('propertiesPanel');
    const content = document.getElementById('panelContent');
    
    panel.classList.add('open');
    
    content.innerHTML = `
        <div class="property-group">
            <label>📄 Управление страницами</label>
            <div style="margin-bottom: 10px;">
                <button class="tool-btn" onclick="createNewPage(); closeProperties();" style="width:100%; margin-bottom:5px;">➕ Создать страницу</button>
                <button class="tool-btn" onclick="renameCurrentPage(); closeProperties();" style="width:100%; margin-bottom:5px;">✏️ Переименовать текущую</button>
                <button class="tool-btn" onclick="deleteCurrentPage(); closeProperties();" style="width:100%; background:#e74c3c;">🗑️ Удалить текущую</button>
            </div>
        </div>
        <div class="property-group">
            <label>📑 Список страниц</label>
            <div style="max-height: 300px; overflow-y: auto;">
                ${pages.map(page => `
                    <div style="padding: 8px; margin: 5px 0; background: ${page.id === currentPageId ? '#4d9eff' : '#3a3a5e'}; border-radius: 6px; cursor: pointer;" onclick="switchToPage('${page.id}'); closeProperties();">
                        ${page.id === currentPageId ? '✅ ' : '📄 '} ${page.name}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Загрузка настроек шапки и подвала
function loadHeaderFooterSettings() {
    const savedHeader = localStorage.getItem('matilda_header');
    const savedFooter = localStorage.getItem('matilda_footer');
    
    if (savedHeader) {
        headerConfig = JSON.parse(savedHeader);
    }
    if (savedFooter) {
        footerConfig = JSON.parse(savedFooter);
    }
    
    applyHeaderFooterToCanvas();
}

// Сохранение настроек
function saveHeaderFooterSettings() {
    localStorage.setItem('matilda_header', JSON.stringify(headerConfig));
    localStorage.setItem('matilda_footer', JSON.stringify(footerConfig));
    applyHeaderFooterToCanvas();
    updatePreview();
}

// Применение шапки и подвала
function applyHeaderFooter() {
    applyHeaderFooterToCanvas();
}

// Открытие настроек шапки
function openHeaderSettings() {
    const panel = document.getElementById('propertiesPanel');
    const content = document.getElementById('panelContent');
    
    panel.classList.add('open');
    
    content.innerHTML = `
        <div class="property-group">
            <label>🔘 Включить шапку</label>
            <input type="checkbox" id="headerEnabled" ${headerConfig.enabled ? 'checked' : ''}>
        </div>
        
        <div class="property-group">
            <label>🎨 Логотип (оставьте пустым чтобы скрыть)</label>
            <input type="text" id="headerLogo" value="${headerConfig.logo}" placeholder="Например: 🎨">
        </div>
        
        <div class="property-group">
            <label>📝 Название сайта</label>
            <input type="text" id="headerSiteName" value="${headerConfig.siteName}">
        </div>
        
        <div class="property-group">
            <label>🎨 Цвет фона</label>
            <input type="color" id="headerBgColor" value="${headerConfig.bgColor}">
        </div>
        
        <div class="property-group">
            <label>📝 Цвет текста</label>
            <input type="color" id="headerTextColor" value="${headerConfig.textColor}">
        </div>
        
        <div class="property-group">
            <label>📌 Закрепить шапку (sticky)</label>
            <input type="checkbox" id="headerFixed" ${headerConfig.fixed ? 'checked' : ''}>
        </div>
        
        <button class="tool-btn" onclick="saveHeaderSettings()" style="width:100%; margin-top:10px;">💾 Сохранить шапку</button>
    `;
    
    document.getElementById('headerEnabled').addEventListener('change', () => saveHeaderSettings());
    document.getElementById('headerLogo').addEventListener('input', () => saveHeaderSettings());
    document.getElementById('headerSiteName').addEventListener('input', () => saveHeaderSettings());
    document.getElementById('headerBgColor').addEventListener('input', () => saveHeaderSettings());
    document.getElementById('headerTextColor').addEventListener('input', () => saveHeaderSettings());
    document.getElementById('headerFixed').addEventListener('change', () => saveHeaderSettings());
}

function saveHeaderSettings() {
    headerConfig.enabled = document.getElementById('headerEnabled').checked;
    headerConfig.logo = document.getElementById('headerLogo').value || '';
    headerConfig.siteName = document.getElementById('headerSiteName').value || 'MaTilda';
    headerConfig.bgColor = document.getElementById('headerBgColor').value;
    headerConfig.textColor = document.getElementById('headerTextColor').value;
    headerConfig.fixed = document.getElementById('headerFixed').checked;
    
    saveHeaderFooterSettings();
}

// Открытие настроек подвала
function openFooterSettings() {
    const panel = document.getElementById('propertiesPanel');
    const content = document.getElementById('panelContent');
    
    panel.classList.add('open');
    
    content.innerHTML = `
        <div class="property-group">
            <label>🔘 Включить подвал</label>
            <input type="checkbox" id="footerEnabled" ${footerConfig.enabled ? 'checked' : ''}>
        </div>
        
        <div class="property-group">
            <label>📝 Текст подвала</label>
            <input type="text" id="footerText" value="${footerConfig.text}">
        </div>
        
        <div class="property-group">
            <label>🎨 Цвет фона</label>
            <input type="color" id="footerBgColor" value="${footerConfig.bgColor}">
        </div>
        
        <div class="property-group">
            <label>📝 Цвет текста</label>
            <input type="color" id="footerTextColor" value="${footerConfig.textColor}">
        </div>
        
        <div class="property-group">
            <label>🔘 Показать соцсети</label>
            <input type="checkbox" id="footerShowSocial" ${footerConfig.showSocial ? 'checked' : ''}>
        </div>
        
        <div class="property-group">
            <label>📱 Telegram ссылка</label>
            <input type="text" id="footerTelegram" value="${footerConfig.socialLinks.telegram}">
        </div>
        
        <div class="property-group">
            <label>📘 VK ссылка</label>
            <input type="text" id="footerVk" value="${footerConfig.socialLinks.vk}">
        </div>
        
        <div class="property-group">
            <label>▶️ YouTube ссылка</label>
            <input type="text" id="footerYoutube" value="${footerConfig.socialLinks.youtube}">
        </div>
        
        <button class="tool-btn" onclick="saveFooterSettings()" style="width:100%; margin-top:10px;">💾 Сохранить подвал</button>
    `;
    
    document.getElementById('footerEnabled').addEventListener('change', () => saveFooterSettings());
    document.getElementById('footerText').addEventListener('input', () => saveFooterSettings());
    document.getElementById('footerBgColor').addEventListener('input', () => saveFooterSettings());
    document.getElementById('footerTextColor').addEventListener('input', () => saveFooterSettings());
    document.getElementById('footerShowSocial').addEventListener('change', () => saveFooterSettings());
    document.getElementById('footerTelegram').addEventListener('input', () => saveFooterSettings());
    document.getElementById('footerVk').addEventListener('input', () => saveFooterSettings());
    document.getElementById('footerYoutube').addEventListener('input', () => saveFooterSettings());
}

function saveFooterSettings() {
    footerConfig.enabled = document.getElementById('footerEnabled').checked;
    footerConfig.text = document.getElementById('footerText').value || '© 2025 MaTilda';
    footerConfig.bgColor = document.getElementById('footerBgColor').value;
    footerConfig.textColor = document.getElementById('footerTextColor').value;
    footerConfig.showSocial = document.getElementById('footerShowSocial').checked;
    footerConfig.socialLinks.telegram = document.getElementById('footerTelegram').value || '#';
    footerConfig.socialLinks.vk = document.getElementById('footerVk').value || '#';
    footerConfig.socialLinks.youtube = document.getElementById('footerYoutube').value || '#';
    
    saveHeaderFooterSettings();
}

function updatePreview() {
    const fullHtml = generateFullHtmlWithHeaderFooter();
    localStorage.setItem('matilda_preview', fullHtml);
}

// Генерация полного HTML с шапкой и подвалом (для предпросмотра и сохранения)
function generateFullHtmlWithHeaderFooter() {
    // Сохраняем текущие блоки перед генерацией
    saveCurrentPageBlocks();
    
    // Логотип (только если не пустой)
    let logoHtml = '';
    if (headerConfig.logo && headerConfig.logo.trim() !== '') {
        logoHtml = `<span class="logo-icon">${headerConfig.logo}</span>`;
    }
    
    // Соцсети для подвала
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
    
    // Генерируем HTML для каждой страницы
    let pagesHtml = '';
    for (const page of pages) {
        // Если у страницы нет блоков или они пустые, показываем сообщение
        const pageContent = page.blocks && page.blocks !== '<div class="empty-message" id="emptyMessage"><span>➕</span><p>Добавьте первый блок с помощью панели инструментов</p></div>' 
            ? page.blocks 
            : '<div class="empty-message" style="text-align:center; padding:40px; color:#aaa;">📄 Страница пуста. Добавьте блоки в конструкторе.</div>';
        
        pagesHtml += `
            <div class="page-content" id="page-${page.id}" style="display: ${page.id === currentPageId ? 'block' : 'none'};">
                ${pageContent}
            </div>
        `;
    }
    
    // Генерируем пункты меню с правильными обработчиками
    let menuHtml = '';
    for (const page of pages) {
        menuHtml += `<a href="#" onclick="showPage('${page.id}'); return false;" class="${page.id === currentPageId ? 'active-page' : ''}">${escapeHtml(page.name)}</a>`;
    }
    
    return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(headerConfig.siteName)} - Сайт на MaTilda</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            background: #f5f5f5; 
            display: flex; 
            flex-direction: column; 
            min-height: 100vh; 
        }
        .page-container { 
            max-width: 1000px; 
            margin: 0 auto; 
            background: #fff; 
            flex: 1; 
            padding: 40px; 
            width: 100%; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        
        /* Стили шапки */
        .site-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 30px;
            flex-wrap: wrap;
            gap: 15px;
        }
        .site-header-logo { display: flex; align-items: center; gap: 10px; font-size: 1.3rem; font-weight: bold; }
        .site-header-logo .logo-icon { font-size: 1.8rem; }
        .site-header-nav { display: flex; gap: 20px; flex-wrap: wrap; }
        .site-header-nav a { 
            color: inherit; 
            text-decoration: none; 
            opacity: 0.8; 
            cursor: pointer;
            transition: opacity 0.2s;
        }
        .site-header-nav a:hover { opacity: 1; text-decoration: underline; }
        .site-header-nav a.active-page { 
            opacity: 1; 
            text-decoration: underline; 
            font-weight: bold;
        }
        
        /* Стили подвала */
        .site-footer { 
            text-align: center; 
            padding: 30px; 
            margin-top: auto; 
        }
        .site-footer-text { margin-bottom: 15px; }
        .site-footer-social { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
        .site-footer-social a { 
            color: inherit; 
            text-decoration: none; 
            opacity: 0.7; 
            transition: opacity 0.2s;
        }
        .site-footer-social a:hover { opacity: 1; text-decoration: underline; }
        
        /* Стили блоков */
        .block-text { font-size: 1rem; line-height: 1.6; margin: 15px 0; color: #333; }
        .block-heading h2 { font-size: 1.8rem; margin: 15px 0; color: #1e2a4a; }
        .block-image { margin: 15px 0; }
        .block-image img { max-width: 100%; height: auto; border-radius: 8px; }
        .block-button { text-align: center; margin: 15px 0; }
        .block-button a { 
            display: inline-block; 
            background: #4d9eff; 
            color: #fff; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 8px;
            transition: background 0.2s;
        }
        .block-button a:hover { background: #3a7fd4; }
        .block-separator hr { margin: 20px 0; border: none; height: 2px; background: linear-gradient(90deg, #4d9eff, #ccc); }
        .block-html { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0; font-family: monospace; overflow-x: auto; }
        
        .empty-message { text-align: center; padding: 40px; color: #aaa; }
        
        @media (max-width: 768px) {
            .page-container { padding: 20px; }
            .site-header { flex-direction: column; text-align: center; }
            .site-header-nav { justify-content: center; }
            .block-heading h2 { font-size: 1.4rem; }
        }
    </style>
</head>
<body>
    <div class="site-header" style="background: ${headerConfig.bgColor}; color: ${headerConfig.textColor}; ${headerConfig.fixed ? 'position: sticky; top: 0; z-index: 100;' : ''}">
        <div class="site-header-logo">
            ${logoHtml}
            <span class="logo-name">${escapeHtml(headerConfig.siteName)}</span>
        </div>
        <nav class="site-header-nav" id="site-nav">
            ${menuHtml}
        </nav>
    </div>
    
    <div class="page-container" id="page-container">
        ${pagesHtml}
    </div>
    
    <div class="site-footer" style="background: ${footerConfig.bgColor}; color: ${footerConfig.textColor};">
        <div class="site-footer-text">${escapeHtml(footerConfig.text)}</div>
        ${socialHtml}
    </div>
    
    <script>
        // Функция переключения между страницами
        function showPage(pageId) {
            // Скрываем все страницы
            var pages = document.querySelectorAll('.page-content');
            for (var i = 0; i < pages.length; i++) {
                pages[i].style.display = 'none';
            }
            // Показываем выбранную страницу
            var selectedPage = document.getElementById('page-' + pageId);
            if (selectedPage) {
                selectedPage.style.display = 'block';
            }
            // Обновляем активный класс в меню
            var links = document.querySelectorAll('.site-header-nav a');
            for (var i = 0; i < links.length; i++) {
                links[i].classList.remove('active-page');
            }
            // Находим активную ссылку
            for (var i = 0; i < links.length; i++) {
                if (links[i].getAttribute('onclick') && links[i].getAttribute('onclick').indexOf(pageId) !== -1) {
                    links[i].classList.add('active-page');
                    break;
                }
            }
        }
    </script>
</body>
</html>`;
}

// Вспомогательная функция для экранирования HTML
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
// Инициализация
function initPageSystem() {
    loadPages();
}

// Экспортируем функции для глобального доступа
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