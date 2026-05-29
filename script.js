let selectedBlock = null;
let blockIdCounter = 0;

// Загрузка сохранённого сайта
function loadSite() {
    const saved = localStorage.getItem('matilda_site');
    if (saved) {
        const canvas = document.getElementById('canvas');
        canvas.innerHTML = saved;
        document.getElementById('emptyMessage')?.remove();
        attachBlockEvents();
    }
}

// Сохранение сайта
function saveSite() {
    // Сохраняем текущие блоки
    if (typeof saveCurrentPageBlocks === 'function') {
        saveCurrentPageBlocks();
    }
    
    // Сохраняем страницы в localStorage
    if (typeof savePages === 'function') {
        savePages();
    }
    
    // Сохраняем настройки шапки и подвала
    if (typeof saveHeaderFooterSettings === 'function') {
        saveHeaderFooterSettings();
    }
    
    // Генерируем HTML для скачивания
    const fullHtml = generateFullHtmlWithHeaderFooter();
    downloadFile('matilda_site.html', fullHtml);
    
    alert('Сайт сохранён! Файл скачан.');
}

// Генерация полного HTML для скачивания (с правильными стилями)
function generateFullHtml() {
    const canvas = document.getElementById('canvas');
    const blocks = canvas.querySelectorAll('.site-block');
    let content = '';
    
    blocks.forEach(block => {
        // Клонируем блок
        const clone = block.cloneNode(true);
        
        // Удаляем кнопки управления
        const controls = clone.querySelector('.block-controls');
        if (controls) controls.remove();
        
        // Убираем contenteditable
        const editableElements = clone.querySelectorAll('[contenteditable="true"]');
        editableElements.forEach(el => {
            el.removeAttribute('contenteditable');
        });
        
        // Убираем класс selected
        clone.classList.remove('selected');
        
        content += clone.outerHTML;
    });
    
    // Полные стили для скачанного сайта
    return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Мой сайт на MaTilda</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
            background: #f5f5f5;
            padding: 40px 20px;
        }

        .page-container {
            max-width: 1000px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            padding: 40px;
            min-height: 100vh;
        }

        /* Стили для блоков */
        .block-text {
            font-size: 1rem;
            line-height: 1.6;
            margin: 15px 0;
            color: #333;
        }

        .block-heading h2 {
            font-size: 1.8rem;
            margin: 15px 0;
            color: #1e2a4a;
        }

        .block-image {
            margin: 15px 0;
        }

        .block-image img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
        }

        .block-button {
            text-align: center;
            margin: 15px 0;
        }

        .block-button a {
            display: inline-block;
            background: #4d9eff;
            color: #ffffff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            transition: background 0.2s;
            cursor: pointer;
        }

        .block-button a:hover {
            background: #3a7fd4;
        }

        .block-separator hr {
            margin: 20px 0;
            border: none;
            height: 2px;
            background: linear-gradient(90deg, #4d9eff, #ccc);
        }

        .block-html {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            font-family: monospace;
            font-size: 0.9rem;
            overflow-x: auto;
        }

        /* Адаптивность */
        @media (max-width: 768px) {
            body {
                padding: 20px;
            }
            .page-container {
                padding: 20px;
            }
            .block-heading h2 {
                font-size: 1.4rem;
            }
            .block-text {
                font-size: 0.9rem;
            }
            .block-button a {
                padding: 10px 20px;
                font-size: 0.9rem;
            }
        }

        /* Картинки адаптивные */
        img {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="page-container">
        ${content}
    </div>
</body>
</html>`;
}
// Скачивание файла
function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

// Очистка сайта
function clearSite() {
    if (confirm('Вы уверены? Все блоки будут удалены.')) {
        const canvas = document.getElementById('canvas');
        canvas.innerHTML = '<div class="empty-message" id="emptyMessage"><span>➕</span><p>Добавьте первый блок с помощью панели инструментов</p></div>';
        selectedBlock = null;
        closeProperties();
    }
}

// Просмотр сайта (реальный предпросмотр с шапкой, подвалом и переходами)
function previewSite() {
    // Сохраняем текущие блоки перед генерацией
    saveCurrentPageBlocks();
    
    // Генерируем полный HTML с шапкой и подвалом
    const fullHtml = generateFullHtmlWithHeaderFooter();
    
    // Открываем в новом окне
    const previewWindow = window.open();
    previewWindow.document.write(fullHtml);
    previewWindow.document.close();
}



// Добавление блока
function addBlock(type) {
    addBlockToCurrentPage(type);
}

// Перемещение блока вверх
function moveBlockUp(blockId) {
    const block = document.getElementById(blockId);
    const prev = block.previousElementSibling;
    if (prev && prev.classList.contains('site-block')) {
        block.parentNode.insertBefore(block, prev);
        selectBlock(blockId);
    }
}

// Перемещение блока вниз
function moveBlockDown(blockId) {
    const block = document.getElementById(blockId);
    const next = block.nextElementSibling;
    if (next && next.classList.contains('site-block')) {
        block.parentNode.insertBefore(next, block);
        selectBlock(blockId);
    }
}

// Удаление блока
function deleteBlock(blockId) {
    if (confirm('Удалить блок?')) {
        const block = document.getElementById(blockId);
        block.remove();
        selectedBlock = null;
        closeProperties();
        
        const canvas = document.getElementById('canvas');
        if (canvas.children.length === 0) {
            canvas.innerHTML = '<div class="empty-message" id="emptyMessage"><span>➕</span><p>Добавьте первый блок с помощью панели инструментов</p></div>';
        }
    }
}

// Выбор блока
function selectBlock(blockId) {
    document.querySelectorAll('.site-block').forEach(b => b.classList.remove('selected'));
    const block = document.getElementById(blockId);
    block.classList.add('selected');
    selectedBlock = blockId;
    openProperties(block);
}

// Открытие панели свойств
function openProperties(block) {
    const panel = document.getElementById('propertiesPanel');
    const content = document.getElementById('panelContent');
    panel.classList.add('open');
    
    const blockContent = block.querySelector('.block-text, .block-heading, .block-image, .block-button, .block-html');
    const blockType = block.querySelector('.block-text') ? 'text' :
                     block.querySelector('.block-heading') ? 'heading' :
                     block.querySelector('.block-image') ? 'image' :
                     block.querySelector('.block-button') ? 'button' :
                     block.querySelector('.block-html') ? 'html' : 'separator';
    
    if (blockType === 'text') {
        content.innerHTML = `
            <div class="property-group">
                <label>📝 Текст</label>
                <textarea id="propText" rows="5">${blockContent.innerText}</textarea>
            </div>
            <button class="tool-btn" onclick="updateTextProp()" style="width:100%">Применить</button>
        `;
    } else if (blockType === 'heading') {
        content.innerHTML = `
            <div class="property-group">
                <label>📌 Заголовок</label>
                <input type="text" id="propHeading" value="${blockContent.querySelector('h2')?.innerText || ''}">
            </div>
            <button class="tool-btn" onclick="updateHeadingProp()" style="width:100%">Применить</button>
        `;
    } else if (blockType === 'image') {
        const img = blockContent.querySelector('img');
        content.innerHTML = `
            <div class="property-group">
                <label>🖼️ URL изображения</label>
                <input type="text" id="propImageUrl" value="${img?.src || ''}">
            </div>
            <div class="property-group">
                <label>📝 Alt текст</label>
                <input type="text" id="propImageAlt" value="${img?.alt || ''}">
            </div>
            <button class="tool-btn" onclick="updateImageProp()" style="width:100%">Применить</button>
        `;
    } else if (blockType === 'button') {
        const link = blockContent.querySelector('a');
        content.innerHTML = `
            <div class="property-group">
                <label>🔘 Текст кнопки</label>
                <input type="text" id="propButtonText" value="${link?.innerText || ''}">
            </div>
            <div class="property-group">
                <label>🔗 Ссылка</label>
                <input type="text" id="propButtonLink" value="${link?.getAttribute('href') || '#'}">
            </div>
            <button class="tool-btn" onclick="updateButtonProp()" style="width:100%">Применить</button>
        `;
    } else if (blockType === 'html') {
        content.innerHTML = `
            <div class="property-group">
                <label>🔧 HTML код</label>
                <textarea id="propHtml" rows="10">${blockContent.innerText}</textarea>
            </div>
            <button class="tool-btn" onclick="updateHtmlProp()" style="width:100%">Применить</button>
        `;
    } else {
        content.innerHTML = `<p style="color:#888; text-align:center;">Разделитель не требует настроек</p>`;
    }
}

function closeProperties() {
    document.getElementById('propertiesPanel').classList.remove('open');
}

function updateTextProp() {
    const text = document.getElementById('propText').value;
    const block = document.getElementById(selectedBlock);
    const textDiv = block.querySelector('.block-text');
    if (textDiv) textDiv.innerText = text;
}

function updateHeadingProp() {
    const text = document.getElementById('propHeading').value;
    const block = document.getElementById(selectedBlock);
    const heading = block.querySelector('h2');
    if (heading) heading.innerText = text;
}

function updateImageProp() {
    const url = document.getElementById('propImageUrl').value;
    const alt = document.getElementById('propImageAlt').value;
    const block = document.getElementById(selectedBlock);
    const img = block.querySelector('img');
    if (img) {
        img.src = url;
        img.alt = alt;
    }
}

function updateButtonProp() {
    const text = document.getElementById('propButtonText').value;
    const link = document.getElementById('propButtonLink').value;
    const block = document.getElementById(selectedBlock);
    const a = block.querySelector('a');
    if (a) {
        a.innerText = text;
        a.href = link;
    }
}

function updateHtmlProp() {
    const html = document.getElementById('propHtml').value;
    const block = document.getElementById(selectedBlock);
    const htmlDiv = block.querySelector('.block-html');
    if (htmlDiv) htmlDiv.innerHTML = html;
}

function attachBlockEvents() {
    document.querySelectorAll('.site-block').forEach(block => {
        block.addEventListener('click', (e) => {
            if (!e.target.closest('.block-controls')) {
                selectBlock(block.id);
            }
        });
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadSite();
});

 // Генерация полного HTML с шапкой и подвалом (для предпросмотра и сохранения)
function generateFullHtmlWithHeaderFooter() {
    // Сохраняем текущие блоки перед генерацией
    if (typeof saveCurrentPageBlocks === 'function') {
        saveCurrentPageBlocks();
    }
    
    // Получаем настройки из глобальных переменных
    const header = typeof headerConfig !== 'undefined' ? headerConfig : {
        enabled: true,
        logo: '',
        siteName: 'MaTilda',
        menu: ['Главная', 'О нас', 'Услуги', 'Контакты'],
        bgColor: '#1e2a4a',
        textColor: '#ffffff',
        fixed: false
    };
    
    const footer = typeof footerConfig !== 'undefined' ? footerConfig : {
        enabled: true,
        text: '© 2025 MaTilda. Все права защищены.',
        bgColor: '#1e2a4a',
        textColor: '#ffffff',
        showSocial: true,
        socialLinks: { telegram: '#', vk: '#', youtube: '#' }
    };
    
    const pagesList = typeof pages !== 'undefined' ? pages : [
        { id: 'page_1', name: 'Главная', blocks: '' },
        { id: 'page_2', name: 'О нас', blocks: '' },
        { id: 'page_3', name: 'Услуги', blocks: '' },
        { id: 'page_4', name: 'Контакты', blocks: '' }
    ];
    
    const currentPageIdGlobal = typeof currentPageId !== 'undefined' ? currentPageId : 'page_1';
    
    // Логотип (только если не пустой)
    let logoHtml = '';
    if (header.logo && header.logo.trim() !== '') {
        logoHtml = `<span class="logo-icon">${escapeHtml(header.logo)}</span>`;
    }
    
    // Соцсети для подвала
    let socialHtml = '';
    if (footer.showSocial) {
        socialHtml = `
            <div class="site-footer-social">
                <a href="${footer.socialLinks.telegram}">📱 Telegram</a>
                <a href="${footer.socialLinks.vk}">📘 VK</a>
                <a href="${footer.socialLinks.youtube}">▶️ YouTube</a>
            </div>
        `;
    }
    
// Функция для очистки блоков от contenteditable и кнопок управления
function cleanBlockContent(html) {
    if (!html) return '<div class="empty-message" style="text-align:center; padding:40px; color:#aaa;">📄 Страница пуста. Добавьте блоки в конструкторе.</div>';
    
    // Создаём временный DOM элемент
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Удаляем кнопки управления
    const controls = temp.querySelectorAll('.block-controls');
    controls.forEach(el => el.remove());
    
    // Удаляем атрибут contenteditable
    const editableElements = temp.querySelectorAll('[contenteditable="true"]');
    editableElements.forEach(el => {
        el.removeAttribute('contenteditable');
    });
    
    // Удаляем класс selected
    const selectedElements = temp.querySelectorAll('.selected');
    selectedElements.forEach(el => el.classList.remove('selected'));
    
    // Обрабатываем блоки изображений - оставляем только img, убираем кнопки загрузки
    const imageUploaders = temp.querySelectorAll('.image-uploader');
    imageUploaders.forEach(uploader => {
        const img = uploader.querySelector('.uploaded-image');
        const controls = uploader.querySelector('.image-controls');
        if (controls) controls.remove();
        if (img) {
            // Создаём новый div с только изображением
            const newDiv = document.createElement('div');
            newDiv.className = 'block-image';
            newDiv.appendChild(img.cloneNode(true));
            uploader.parentElement.replaceWith(newDiv);
        }
    });
    
    return temp.innerHTML;
}
    
    // Генерируем HTML для каждой страницы
    let pagesHtml = '';
    for (const page of pagesList) {
        const cleanedContent = cleanBlockContent(page.blocks);
        pagesHtml += `
            <div class="page-content" id="page-${page.id}" style="display: ${page.id === currentPageIdGlobal ? 'block' : 'none'};">
                ${cleanedContent}
            </div>
        `;
    }
    
    // Генерируем пункты меню
    let menuHtml = '';
    for (const page of pagesList) {
        menuHtml += `<a href="#" onclick="showPage('${page.id}'); return false;" class="${page.id === currentPageIdGlobal ? 'active-page' : ''}">${escapeHtml(page.name)}</a>`;
    }
    
    return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(header.siteName)} - Сайт на MaTilda</title>
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
            cursor: pointer;
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
        
        /* Запрет выделения текста в предпросмотре */
        .block-button a, .site-header-nav a {
            user-select: none;
            -webkit-user-select: none;
        }
    </style>
</head>
<body>
    <div class="site-header" style="background: ${header.bgColor}; color: ${header.textColor}; ${header.fixed ? 'position: sticky; top: 0; z-index: 100;' : ''}">
        <div class="site-header-logo">
            ${logoHtml}
            <span class="logo-name">${escapeHtml(header.siteName)}</span>
        </div>
        <nav class="site-header-nav" id="site-nav">
            ${menuHtml}
        </nav>
    </div>
    
    <div class="page-container" id="page-container">
        ${pagesHtml}
    </div>
    
    <div class="site-footer" style="background: ${footer.bgColor}; color: ${footer.textColor};">
        <div class="site-footer-text">${escapeHtml(footer.text)}</div>
        ${socialHtml}
    </div>
    
    <script>
        // Функция переключения между страницами
        function showPage(pageId) {
            var pages = document.querySelectorAll('.page-content');
            for (var i = 0; i < pages.length; i++) {
                pages[i].style.display = 'none';
            }
            var selectedPage = document.getElementById('page-' + pageId);
            if (selectedPage) {
                selectedPage.style.display = 'block';
            }
            var links = document.querySelectorAll('.site-header-nav a');
            for (var i = 0; i < links.length; i++) {
                links[i].classList.remove('active-page');
            }
            for (var i = 0; i < links.length; i++) {
                if (links[i].getAttribute('onclick') && links[i].getAttribute('onclick').indexOf(pageId) !== -1) {
                    links[i].classList.add('active-page');
                    break;
                }
            }
        }
        
        // Запрет редактирования кнопок
        document.querySelectorAll('[contenteditable]').forEach(function(el) {
            el.removeAttribute('contenteditable');
        });
    </script>
</body>
</html>`;
}