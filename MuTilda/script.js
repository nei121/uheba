let selectedBlock = null;
let blockIdCounter = 0;
let draggedBlock = null;

// ===== ЗАГРУЗКА СОХРАНЁННОГО САЙТА =====
function loadSite() {
    const saved = localStorage.getItem('mutilda_site');
    if (saved) {
        const canvas = document.getElementById('canvas');
        canvas.innerHTML = saved;
        document.getElementById('emptyMessage')?.remove();
        attachBlockEvents();
        if (typeof loadHeaderFooterSettings === 'function') loadHeaderFooterSettings();
        if (typeof loadPages === 'function') loadPages();
    }
}

// ===== СОХРАНЕНИЕ САЙТА =====
function saveSite() {
    if (typeof saveCurrentPageBlocks === 'function') saveCurrentPageBlocks();
    if (typeof savePages === 'function') savePages();
    if (typeof saveHeaderFooterSettings === 'function') saveHeaderFooterSettings();
    const fullHtml = generateFullHtmlWithHeaderFooter();
    downloadFile('mutilda_site.html', fullHtml);
    alert('Сайт сохранён! Файл скачан.');
}

// ===== СКАЧИВАНИЕ ФАЙЛА =====
function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

// ===== ОЧИСТКА САЙТА =====
function clearSite() {
    if (confirm('Вы уверены? Все блоки будут удалены.')) {
        localStorage.removeItem('mutilda_site');
        localStorage.removeItem('mutilda_pages');
        localStorage.removeItem('mutilda_current_page');
        localStorage.removeItem('mutilda_header');
        localStorage.removeItem('mutilda_footer');
        localStorage.removeItem('mutilda_images');
        location.reload();
    }
}

// ===== ПРОСМОТР САЙТА =====
function previewSite() {
    if (typeof saveCurrentPageBlocks === 'function') saveCurrentPageBlocks();
    const fullHtml = generateFullHtmlWithHeaderFooter();
    const previewWindow = window.open();
    previewWindow.document.write(fullHtml);
    previewWindow.document.close();
}

// ===== ДОБАВЛЕНИЕ БЛОКА =====
function addBlock(type) {
    if (typeof addBlockToCurrentPage === 'function') addBlockToCurrentPage(type);
}

// ===== ПЕРЕМЕЩЕНИЕ БЛОКА ВВЕРХ =====
function moveBlockUp(blockId) {
    const block = document.getElementById(blockId);
    const prev = block.previousElementSibling;
    if (prev && prev.classList.contains('site-block')) {
        block.parentNode.insertBefore(block, prev);
        selectBlock(blockId);
        saveCurrentPageBlocks();
        savePages();
    }
}

// ===== ПЕРЕМЕЩЕНИЕ БЛОКА ВНИЗ =====
function moveBlockDown(blockId) {
    const block = document.getElementById(blockId);
    const next = block.nextElementSibling;
    if (next && next.classList.contains('site-block')) {
        block.parentNode.insertBefore(next, block);
        selectBlock(blockId);
        saveCurrentPageBlocks();
        savePages();
    }
}

// ===== УДАЛЕНИЕ БЛОКА =====
function deleteBlock(blockId) {
    if (confirm('Удалить блок?')) {
        const block = document.getElementById(blockId);
        block.remove();
        selectedBlock = null;
        closeProperties();
        const contentContainer = document.getElementById('page-content-container');
        if (contentContainer && contentContainer.children.length === 0) {
            contentContainer.innerHTML = '<div class="empty-message" id="emptyMessage"><span>➕</span><p>Добавьте первый блок с помощью панели инструментов</p></div>';
        }
        saveCurrentPageBlocks();
        savePages();
    }
}

// ===== ВЫБОР БЛОКА =====
function selectBlock(blockId) {
    document.querySelectorAll('.site-block').forEach(b => b.classList.remove('selected'));
    const block = document.getElementById(blockId);
    if (block) {
        block.classList.add('selected');
        selectedBlock = blockId;
        openProperties(block);
    }
}

// ===== ПРИМЕНЕНИЕ СТИЛЕЙ БЛОКА =====
function applyBlockStyles(block, blockWidth, blockAlign) {
    if (!block) return;
    block.style.float = 'none';
    block.style.margin = '';
    block.style.display = '';
    block.style.width = '';
    block.style.clear = '';
    
    if (blockWidth === 'auto' || blockWidth === '') {
        block.style.width = 'auto';
        block.style.display = 'inline-block';
    } else if (blockWidth.includes('%')) {
        block.style.width = blockWidth;
        block.style.display = 'block';
    } else if (blockWidth.includes('px')) {
        block.style.width = blockWidth;
        block.style.display = 'inline-block';
    } else if (!isNaN(blockWidth) && blockWidth !== '') {
        block.style.width = blockWidth + 'px';
        block.style.display = 'inline-block';
    } else {
        block.style.width = 'auto';
        block.style.display = 'inline-block';
    }
    
    if (blockAlign === 'left') {
        block.style.float = 'left';
        block.style.margin = '0 24px 20px 0';
        block.style.display = 'inline-block';
        block.style.clear = 'none';
    } else if (blockAlign === 'right') {
        block.style.float = 'right';
        block.style.margin = '0 0 20px 24px';
        block.style.display = 'inline-block';
        block.style.clear = 'none';
    } else {
        block.style.float = 'none';
        block.style.margin = '20px auto';
        block.style.display = 'block';
        block.style.width = block.style.width === 'auto' ? 'fit-content' : block.style.width;
        block.style.clear = 'both';
        block.style.textAlign = 'center';
    }
}

// ===== DRAG AND DROP =====
function initDragAndDrop() {
    const blocks = document.querySelectorAll('.site-block');
    blocks.forEach(block => {
        block.setAttribute('draggable', 'true');
        block.removeEventListener('dragstart', handleDragStart);
        block.removeEventListener('dragend', handleDragEnd);
        block.removeEventListener('dragover', handleDragOver);
        block.removeEventListener('dragenter', handleDragEnter);
        block.removeEventListener('dragleave', handleDragLeave);
        block.removeEventListener('drop', handleDrop);
        block.addEventListener('dragstart', handleDragStart);
        block.addEventListener('dragend', handleDragEnd);
        block.addEventListener('dragover', handleDragOver);
        block.addEventListener('dragenter', handleDragEnter);
        block.addEventListener('dragleave', handleDragLeave);
        block.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    draggedBlock = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.id);
    this.style.opacity = '0.5';
}

function handleDragEnd(e) {
    this.style.opacity = '';
    document.querySelectorAll('.site-block').forEach(block => {
        block.classList.remove('drag-over');
        block.style.borderTop = '';
        block.style.borderBottom = '';
    });
    draggedBlock = null;
}

function handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }

function handleDragEnter(e) {
    e.preventDefault();
    if (this !== draggedBlock) {
        this.classList.add('drag-over');
        const rect = this.getBoundingClientRect();
        const mouseY = e.clientY;
        const midPoint = rect.top + rect.height / 2;
        if (mouseY < midPoint) {
            this.style.borderTop = '3px solid #667eea';
            this.style.borderBottom = '';
        } else {
            this.style.borderTop = '';
            this.style.borderBottom = '3px solid #667eea';
        }
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
    this.style.borderTop = '';
    this.style.borderBottom = '';
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    this.style.borderTop = '';
    this.style.borderBottom = '';
    if (draggedBlock && draggedBlock !== this) {
        const parent = this.parentNode;
        const rect = this.getBoundingClientRect();
        const mouseY = e.clientY;
        const midPoint = rect.top + rect.height / 2;
        if (mouseY < midPoint) parent.insertBefore(draggedBlock, this);
        else parent.insertBefore(draggedBlock, this.nextSibling);
        saveCurrentPageBlocks();
        savePages();
        initDragAndDrop();
        attachBlockEvents();
    }
}

// ===== ОТКРЫТИЕ ПАНЕЛИ СВОЙСТВ =====
function openProperties(block) {
    const panel = document.getElementById('propertiesPanel');
    const content = document.getElementById('panelContent');
    panel.classList.add('open');
    
    const blockType = block.querySelector('.block-text') ? 'text' :
                     block.querySelector('.block-heading') ? 'heading' :
                     block.querySelector('.block-image') ? 'image' :
                     block.querySelector('.block-button') ? 'button' :
                     block.querySelector('.block-html') ? 'html' : 'separator';
    
    // ===== ТЕКСТ =====
    if (blockType === 'text') {
        const textDiv = block.querySelector('.block-text');
        const currentColor = textDiv.style.color || '#334155';
        const currentFontSize = textDiv.style.fontSize || '1rem';
        const currentFontFamily = textDiv.style.fontFamily || 'inherit';
        const currentTextAlign = textDiv.style.textAlign || 'left';
        const currentText = textDiv.innerText;
        const currentBlockWidth = block.style.width === 'auto' ? 'auto' : (block.style.width || 'auto');
        const currentBlockAlign = block.style.float === 'left' ? 'left' : (block.style.float === 'right' ? 'right' : 'center');
        
        content.innerHTML = `
            <div class="property-group"><label>📝 Текст</label><textarea id="propText" rows="5">${currentText}</textarea></div>
            <div style="border-top:1px solid #334155; margin:15px 0; padding-top:10px;"><h4>🎨 Стилизация</h4>
                <div class="property-group"><label>🎨 Цвет текста</label><input type="color" id="propTextColor" value="${currentColor}"></div>
                <div class="property-group"><label>📏 Размер шрифта</label><select id="propTextSize"><option value="0.8rem" ${currentFontSize === '0.8rem' ? 'selected' : ''}>Маленький</option><option value="1rem" ${currentFontSize === '1rem' ? 'selected' : ''}>Обычный</option><option value="1.2rem" ${currentFontSize === '1.2rem' ? 'selected' : ''}>Средний</option><option value="1.5rem" ${currentFontSize === '1.5rem' ? 'selected' : ''}>Большой</option><option value="2rem" ${currentFontSize === '2rem' ? 'selected' : ''}>Очень большой</option></select></div>
                <div class="property-group"><label>🔤 Шрифт</label><select id="propTextFont"><option value="inherit" ${currentFontFamily === 'inherit' ? 'selected' : ''}>По умолчанию</option><option value="'Segoe UI', sans-serif" ${currentFontFamily.includes('Segoe') ? 'selected' : ''}>Segoe UI</option><option value="'Arial', sans-serif" ${currentFontFamily.includes('Arial') ? 'selected' : ''}>Arial</option><option value="'Times New Roman', serif" ${currentFontFamily.includes('Times') ? 'selected' : ''}>Times New Roman</option><option value="'Courier New', monospace" ${currentFontFamily.includes('Courier') ? 'selected' : ''}>Courier New</option></select></div>
                <div class="property-group"><label>📍 Выравнивание</label><select id="propTextAlign"><option value="left" ${currentTextAlign === 'left' ? 'selected' : ''}>Слева</option><option value="center" ${currentTextAlign === 'center' ? 'selected' : ''}>По центру</option><option value="right" ${currentTextAlign === 'right' ? 'selected' : ''}>Справа</option></select></div>
            </div>
            <div style="border-top:1px solid #334155; margin:15px 0; padding-top:10px;"><h4>📦 Блок</h4>
                <div class="property-group"><label>📏 Ширина блока</label><input type="text" id="propBlockWidth" value="${currentBlockWidth}" placeholder="auto, 300px, 50%"></div>
                <div class="property-group"><label>📍 Выравнивание</label><select id="propBlockAlign"><option value="left" ${currentBlockAlign === 'left' ? 'selected' : ''}>Слева</option><option value="center" ${currentBlockAlign === 'center' ? 'selected' : ''}>По центру</option><option value="right" ${currentBlockAlign === 'right' ? 'selected' : ''}>Справа</option></select></div>
            </div>
            <button class="tool-btn" onclick="updateTextProp()" style="width:100%">💾 Применить</button>
        `;
    }
    
    // ===== ЗАГОЛОВОК =====
    else if (blockType === 'heading') {
        const heading = block.querySelector('h2');
        const currentColor = heading.style.color || '#1e293b';
        const currentFontSize = heading.style.fontSize || '1.8rem';
        const currentFontFamily = heading.style.fontFamily || 'inherit';
        const currentTextAlign = heading.style.textAlign || 'left';
        const currentText = heading?.innerText || '';
        const currentBlockWidth = block.style.width === 'auto' ? 'auto' : (block.style.width || 'auto');
        const currentBlockAlign = block.style.float === 'left' ? 'left' : (block.style.float === 'right' ? 'right' : 'center');
        
        content.innerHTML = `
            <div class="property-group"><label>📌 Заголовок</label><input type="text" id="propHeading" value="${currentText}"></div>
            <div style="border-top:1px solid #334155; margin:15px 0; padding-top:10px;"><h4>🎨 Стилизация</h4>
                <div class="property-group"><label>🎨 Цвет заголовка</label><input type="color" id="propHeadingColor" value="${currentColor}"></div>
                <div class="property-group"><label>📏 Размер заголовка</label><select id="propHeadingSize"><option value="1.2rem" ${currentFontSize === '1.2rem' ? 'selected' : ''}>Маленький</option><option value="1.5rem" ${currentFontSize === '1.5rem' ? 'selected' : ''}>Средний</option><option value="1.8rem" ${currentFontSize === '1.8rem' ? 'selected' : ''}>Обычный</option><option value="2.2rem" ${currentFontSize === '2.2rem' ? 'selected' : ''}>Большой</option><option value="2.8rem" ${currentFontSize === '2.8rem' ? 'selected' : ''}>Очень большой</option></select></div>
                <div class="property-group"><label>🔤 Шрифт</label><select id="propHeadingFont"><option value="inherit" ${currentFontFamily === 'inherit' ? 'selected' : ''}>По умолчанию</option><option value="'Segoe UI', sans-serif" ${currentFontFamily.includes('Segoe') ? 'selected' : ''}>Segoe UI</option><option value="'Arial', sans-serif" ${currentFontFamily.includes('Arial') ? 'selected' : ''}>Arial</option><option value="'Times New Roman', serif" ${currentFontFamily.includes('Times') ? 'selected' : ''}>Times New Roman</option></select></div>
                <div class="property-group"><label>📍 Выравнивание</label><select id="propHeadingAlign"><option value="left" ${currentTextAlign === 'left' ? 'selected' : ''}>Слева</option><option value="center" ${currentTextAlign === 'center' ? 'selected' : ''}>По центру</option><option value="right" ${currentTextAlign === 'right' ? 'selected' : ''}>Справа</option></select></div>
            </div>
            <div style="border-top:1px solid #334155; margin:15px 0; padding-top:10px;"><h4>📦 Блок</h4>
                <div class="property-group"><label>📏 Ширина блока</label><input type="text" id="propBlockWidth" value="${currentBlockWidth}"></div>
                <div class="property-group"><label>📍 Выравнивание</label><select id="propBlockAlign"><option value="left" ${currentBlockAlign === 'left' ? 'selected' : ''}>Слева</option><option value="center" ${currentBlockAlign === 'center' ? 'selected' : ''}>По центру</option><option value="right" ${currentBlockAlign === 'right' ? 'selected' : ''}>Справа</option></select></div>
            </div>
            <button class="tool-btn" onclick="updateHeadingProp()" style="width:100%">💾 Применить</button>
        `;
    }
    
    // ===== ИЗОБРАЖЕНИЕ =====
    else if (blockType === 'image') {
        let img = block.querySelector('img');
        if (!img) {
            img = document.createElement('img');
            img.className = 'uploaded-image';
            img.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'800\' height=\'400\' viewBox=\'0 0 800 400\'%3E%3Crect width=\'800\' height=\'400\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'400\' y=\'200\' font-family=\'Arial\' font-size=\'20\' fill=\'%23999\' text-anchor=\'middle\'%3EВыберите изображение%3C/text%3E%3C/svg%3E';
            img.alt = 'Изображение';
            block.querySelector('.block-image').appendChild(img);
        }
        
        const currentImgWidth = img.style.width || '100%';
        const currentImgAlign = img.parentElement?.style.textAlign || 'center';
        const currentRadius = img.style.borderRadius || '8px';
        const currentAlt = img.alt || '';
        const currentBlockWidth = block.style.width === 'auto' ? 'auto' : (block.style.width || 'auto');
        const currentBlockAlign = block.style.float === 'left' ? 'left' : (block.style.float === 'right' ? 'right' : 'center');
        
        let currentShadow = 'none';
        if (img.style.boxShadow === '0 2px 8px rgba(0,0,0,0.1)') currentShadow = 'small';
        else if (img.style.boxShadow === '0 4px 15px rgba(0,0,0,0.15)') currentShadow = 'medium';
        else if (img.style.boxShadow === '0 8px 30px rgba(0,0,0,0.2)') currentShadow = 'large';
        
        const isFromPC = img.src && img.src.startsWith('data:image');
        
        content.innerHTML = `
            <div class="property-group"><label>📁 Источник</label><div style="display:flex; gap:15px;"><label><input type="radio" name="imageSource" value="pc" ${isFromPC ? 'checked' : ''}> С ПК</label><label><input type="radio" name="imageSource" value="url" ${!isFromPC ? 'checked' : ''}> По URL</label></div></div>
            <div class="property-group" id="pcUploadGroup" style="${isFromPC ? 'display:block' : 'display:none'}"><label>📁 Выберите файл</label><input type="file" id="propImageFile" accept="image/*"></div>
            <div class="property-group" id="urlInputGroup" style="${!isFromPC ? 'display:block' : 'display:none'}"><label>🔗 URL</label><input type="text" id="propImageUrl" value="${!isFromPC ? (img?.src || '') : ''}"></div>
            <div class="property-group"><label>📝 Alt текст</label><input type="text" id="propImageAlt" value="${currentAlt}"></div>
            <div class="property-group"><label>📏 Ширина (%)</label><input type="range" id="propImageWidth" min="10" max="100" value="${parseInt(currentImgWidth)}" step="5"><span id="imgWidthValue">${currentImgWidth}</span></div>
            <div class="property-group"><label>📍 Выравнивание</label><select id="propImageAlign"><option value="left" ${currentImgAlign === 'left' ? 'selected' : ''}>Слева</option><option value="center" ${currentImgAlign === 'center' ? 'selected' : ''}>По центру</option><option value="right" ${currentImgAlign === 'right' ? 'selected' : ''}>Справа</option></select></div>
            <div class="property-group"><label>🔄 Закругление (px)</label><input type="number" id="propImageRadius" value="${parseInt(currentRadius)}" min="0" max="50"></div>
            <div class="property-group"><label>📦 Тень</label><select id="propImageShadow"><option value="none" ${currentShadow === 'none' ? 'selected' : ''}>Без тени</option><option value="small" ${currentShadow === 'small' ? 'selected' : ''}>Маленькая</option><option value="medium" ${currentShadow === 'medium' ? 'selected' : ''}>Средняя</option><option value="large" ${currentShadow === 'large' ? 'selected' : ''}>Большая</option></select></div>
            <div style="border-top:1px solid #334155; margin:15px 0; padding-top:10px;"><h4>📦 Блок</h4>
                <div class="property-group"><label>📏 Ширина блока</label><input type="text" id="propBlockWidth" value="${currentBlockWidth}"></div>
                <div class="property-group"><label>📍 Выравнивание</label><select id="propBlockAlign"><option value="left" ${currentBlockAlign === 'left' ? 'selected' : ''}>Слева</option><option value="center" ${currentBlockAlign === 'center' ? 'selected' : ''}>По центру</option><option value="right" ${currentBlockAlign === 'right' ? 'selected' : ''}>Справа</option></select></div>
            </div>
            <button class="tool-btn" onclick="updateImageProp()" style="width:100%">💾 Применить</button>
        `;
        
        const radioButtons = document.querySelectorAll('input[name="imageSource"]');
        const pcGroup = document.getElementById('pcUploadGroup');
        const urlGroup = document.getElementById('urlInputGroup');
        radioButtons.forEach(radio => {
            radio.onchange = function() {
                if (this.value === 'pc') { if (pcGroup) pcGroup.style.display = 'block'; if (urlGroup) urlGroup.style.display = 'none'; }
                else { if (pcGroup) pcGroup.style.display = 'none'; if (urlGroup) urlGroup.style.display = 'block'; }
            };
        });
        
        const fileInput = document.getElementById('propImageFile');
        if (fileInput) {
            fileInput.onchange = function(e) {
                const file = e.target.files[0];
                if (!file || !file.type.startsWith('image/')) return;
                const reader = new FileReader();
                reader.onload = function(ev) {
                    const urlInput = document.getElementById('propImageUrl');
                    if (urlInput) urlInput.value = ev.target.result;
                    updateImageProp();
                };
                reader.readAsDataURL(file);
            };
        }
        
        const widthSlider = document.getElementById('propImageWidth');
        const widthValue = document.getElementById('imgWidthValue');
        if (widthSlider) widthSlider.oninput = () => { if (widthValue) widthValue.innerText = widthSlider.value + '%'; };
    }
    
    // ===== КНОПКА =====
    else if (blockType === 'button') {
        const link = block.querySelector('a');
        const currentText = link?.innerText || '';
        const currentLink = link?.getAttribute('href') || '#';
        const currentBg = link?.style.backgroundColor || '#667eea';
        const currentRadius = link?.style.borderRadius || '40px';
        const currentBlockWidth = block.style.width === 'auto' ? 'auto' : (block.style.width || 'auto');
        const currentBlockAlign = block.style.float === 'left' ? 'left' : (block.style.float === 'right' ? 'right' : 'center');
        
        content.innerHTML = `
            <div class="property-group"><label>🔘 Текст</label><input type="text" id="propButtonText" value="${currentText}"></div>
            <div class="property-group"><label>🔗 Ссылка</label><input type="text" id="propButtonLink" value="${currentLink}"></div>
            <div class="property-group"><label>🎨 Цвет фона</label><input type="color" id="propButtonBg" value="${currentBg.startsWith('#') ? currentBg : '#667eea'}"></div>
            <div class="property-group"><label>📏 Скругление (px)</label><input type="number" id="propButtonRadius" value="${parseInt(currentRadius)}" min="0" max="100"></div>
            <div style="border-top:1px solid #334155; margin:15px 0; padding-top:10px;"><h4>📦 Блок</h4>
                <div class="property-group"><label>📏 Ширина блока</label><input type="text" id="propBlockWidth" value="${currentBlockWidth}"></div>
                <div class="property-group"><label>📍 Выравнивание</label><select id="propBlockAlign"><option value="left" ${currentBlockAlign === 'left' ? 'selected' : ''}>Слева</option><option value="center" ${currentBlockAlign === 'center' ? 'selected' : ''}>По центру</option><option value="right" ${currentBlockAlign === 'right' ? 'selected' : ''}>Справа</option></select></div>
            </div>
            <button class="tool-btn" onclick="updateButtonProp()" style="width:100%">💾 Применить</button>
        `;
    }
    
    // ===== HTML =====
    else if (blockType === 'html') {
        const htmlDiv = block.querySelector('.block-html');
        const currentHtml = htmlDiv?.innerHTML || '';
        const currentBlockWidth = block.style.width === 'auto' ? 'auto' : (block.style.width || 'auto');
        const currentBlockAlign = block.style.float === 'left' ? 'left' : (block.style.float === 'right' ? 'right' : 'center');
        
        content.innerHTML = `
            <div class="property-group"><label>🔧 HTML код</label><textarea id="propHtml" rows="10">${currentHtml}</textarea></div>
            <div style="border-top:1px solid #334155; margin:15px 0; padding-top:10px;"><h4>📦 Блок</h4>
                <div class="property-group"><label>📏 Ширина блока</label><input type="text" id="propBlockWidth" value="${currentBlockWidth}"></div>
                <div class="property-group"><label>📍 Выравнивание</label><select id="propBlockAlign"><option value="left" ${currentBlockAlign === 'left' ? 'selected' : ''}>Слева</option><option value="center" ${currentBlockAlign === 'center' ? 'selected' : ''}>По центру</option><option value="right" ${currentBlockAlign === 'right' ? 'selected' : ''}>Справа</option></select></div>
            </div>
            <button class="tool-btn" onclick="updateHtmlProp()" style="width:100%">💾 Применить</button>
        `;
    }
    
    // ===== РАЗДЕЛИТЕЛЬ =====
    else {
        content.innerHTML = `<p style="color:#888; text-align:center;">Разделитель не требует настроек</p>`;
    }
}

// ===== ОБНОВЛЕНИЕ ТЕКСТА =====
function updateTextProp() {
    const text = document.getElementById('propText')?.value;
    const color = document.getElementById('propTextColor')?.value;
    const size = document.getElementById('propTextSize')?.value;
    const font = document.getElementById('propTextFont')?.value;
    const align = document.getElementById('propTextAlign')?.value;
    const blockWidth = document.getElementById('propBlockWidth')?.value;
    const blockAlign = document.getElementById('propBlockAlign')?.value;
    
    const block = document.getElementById(selectedBlock);
    if (!block) return;
    
    const textDiv = block.querySelector('.block-text');
    if (textDiv) {
        if (text) textDiv.innerText = text;
        if (color) textDiv.style.color = color;
        if (size) textDiv.style.fontSize = size;
        if (font) textDiv.style.fontFamily = font;
        if (align) textDiv.style.textAlign = align;
    }
    
    applyBlockStyles(block, blockWidth, blockAlign);
    saveCurrentPageBlocks();
    savePages();
}

// ===== ОБНОВЛЕНИЕ ЗАГОЛОВКА =====
function updateHeadingProp() {
    const text = document.getElementById('propHeading')?.value;
    const color = document.getElementById('propHeadingColor')?.value;
    const size = document.getElementById('propHeadingSize')?.value;
    const font = document.getElementById('propHeadingFont')?.value;
    const align = document.getElementById('propHeadingAlign')?.value;
    const blockWidth = document.getElementById('propBlockWidth')?.value;
    const blockAlign = document.getElementById('propBlockAlign')?.value;
    
    const block = document.getElementById(selectedBlock);
    if (!block) return;
    
    const heading = block.querySelector('h2');
    if (heading) {
        if (text) heading.innerText = text;
        if (color) heading.style.color = color;
        if (size) heading.style.fontSize = size;
        if (font) heading.style.fontFamily = font;
        if (align) heading.style.textAlign = align;
    }
    
    applyBlockStyles(block, blockWidth, blockAlign);
    saveCurrentPageBlocks();
    savePages();
}

// ===== ОБНОВЛЕНИЕ ИЗОБРАЖЕНИЯ =====
function updateImageProp() {
    const alt = document.getElementById('propImageAlt')?.value || '';
    const width = document.getElementById('propImageWidth')?.value || '100';
    const align = document.getElementById('propImageAlign')?.value || 'center';
    const radius = document.getElementById('propImageRadius')?.value || '8';
    const shadow = document.getElementById('propImageShadow')?.value || 'none';
    const blockWidth = document.getElementById('propBlockWidth')?.value;
    const blockAlign = document.getElementById('propBlockAlign')?.value;
    
    const radioChecked = document.querySelector('input[name="imageSource"]:checked');
    const source = radioChecked ? radioChecked.value : 'url';
    let newSrc = '';
    if (source === 'url') {
        const urlInput = document.getElementById('propImageUrl');
        if (urlInput) newSrc = urlInput.value;
    }
    
    const block = document.getElementById(selectedBlock);
    if (!block) return;
    
    const container = block.querySelector('.block-image');
    if (!container) return;
    
    let img = container.querySelector('img');
    if (!img) {
        img = document.createElement('img');
        img.className = 'uploaded-image';
        container.appendChild(img);
    }
    
    if (newSrc && newSrc.trim() !== '') img.src = newSrc;
    if (alt) img.alt = alt;
    img.style.width = width + '%';
    img.style.borderRadius = radius + 'px';
    
    const shadows = { none: 'none', small: '0 2px 8px rgba(0,0,0,0.1)', medium: '0 4px 15px rgba(0,0,0,0.15)', large: '0 8px 30px rgba(0,0,0,0.2)' };
    img.style.boxShadow = shadows[shadow] || 'none';
    container.style.textAlign = align;
    
    applyBlockStyles(block, blockWidth, blockAlign);
    saveCurrentPageBlocks();
    savePages();
}

// ===== ОБНОВЛЕНИЕ КНОПКИ =====
function updateButtonProp() {
    const text = document.getElementById('propButtonText')?.value;
    const linkUrl = document.getElementById('propButtonLink')?.value;
    const bgColor = document.getElementById('propButtonBg')?.value;
    const radius = document.getElementById('propButtonRadius')?.value;
    const blockWidth = document.getElementById('propBlockWidth')?.value;
    const blockAlign = document.getElementById('propBlockAlign')?.value;
    
    const block = document.getElementById(selectedBlock);
    if (!block) return;
    
    const a = block.querySelector('a');
    if (a) {
        if (text) a.innerText = text;
        if (linkUrl) a.href = linkUrl;
        if (bgColor) { a.style.background = bgColor; a.style.backgroundImage = 'none'; }
        if (radius) a.style.borderRadius = radius + 'px';
    }
    
    applyBlockStyles(block, blockWidth, blockAlign);
    saveCurrentPageBlocks();
    savePages();
}

// ===== ОБНОВЛЕНИЕ HTML =====
function updateHtmlProp() {
    const html = document.getElementById('propHtml')?.value;
    const blockWidth = document.getElementById('propBlockWidth')?.value;
    const blockAlign = document.getElementById('propBlockAlign')?.value;
    
    const block = document.getElementById(selectedBlock);
    if (!block) return;
    
    const htmlDiv = block.querySelector('.block-html');
    if (htmlDiv && html) htmlDiv.innerHTML = html;
    
    applyBlockStyles(block, blockWidth, blockAlign);
    saveCurrentPageBlocks();
    savePages();
}

// ===== ЗАКРЫТИЕ ПАНЕЛИ =====
function closeProperties() {
    document.getElementById('propertiesPanel').classList.remove('open');
}

// ===== ПРИВЯЗКА СОБЫТИЙ =====
function attachBlockEvents() {
    document.querySelectorAll('.site-block').forEach(block => {
        block.addEventListener('click', (e) => {
            if (!e.target.closest('.block-controls')) selectBlock(block.id);
        });
        const editable = block.querySelector('[contenteditable="true"]');
        if (editable) {
            editable.addEventListener('blur', () => { saveCurrentPageBlocks(); savePages(); });
        }
    });
    initDragAndDrop();
}

// ===== СОХРАНЕНИЕ ТЕКУЩИХ БЛОКОВ =====
function saveCurrentPageBlocks() {
    const contentContainer = document.getElementById('page-content-container');
    if (contentContainer && typeof savePages !== 'undefined') {
        const currentPage = pages.find(p => p.id === currentPageId);
        if (currentPage) {
            currentPage.blocks = contentContainer.innerHTML;
            savePages();
        }
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => { loadSite(); });

// ===== ГЕНЕРАЦИЯ HTML ДЛЯ ПРЕДПРОСМОТРА =====
// Генерация полного HTML с шапкой и подвалом (для предпросмотра и сохранения)
function generateFullHtmlWithHeaderFooter() {
    if (typeof saveCurrentPageBlocks === 'function') saveCurrentPageBlocks();
    
    // Получаем актуальные настройки из глобальных переменных
    const header = typeof headerConfig !== 'undefined' ? headerConfig : {
        enabled: true, logo: '', siteName: 'MuTilda',
        menu: ['Главная', 'О нас', 'Услуги', 'Контакты'],
        bgColor: '#1e2a4a', textColor: '#ffffff', fixed: false
    };
    
    const footer = typeof footerConfig !== 'undefined' ? footerConfig : {
        enabled: true, text: '© 2025 MuTilda. Все права защищены.',
        bgColor: '#1e2a4a', textColor: '#ffffff', showSocial: true,
        socialLinks: { telegram: '#', vk: '#', youtube: '#' }
    };
    
    const pagesList = typeof pages !== 'undefined' ? pages : [{ id: 'page_1', name: 'Главная', blocks: '' }];
    const currentPageIdGlobal = typeof currentPageId !== 'undefined' ? currentPageId : 'page_1';
    
    // Генерируем HTML шапки ТОЛЬКО если включена
    let headerHtml = '';
    if (header.enabled) {
        let logoHtml = '';
        if (header.logo && header.logo.trim() !== '') {
            logoHtml = `<span class="logo-icon">${escapeHtml(header.logo)}</span>`;
        }
        
        let menuHtml = '';
        for (const page of pagesList) {
            menuHtml += `<a href="#" onclick="showPage('${page.id}'); return false;" class="${page.id === currentPageIdGlobal ? 'active-page' : ''}">${escapeHtml(page.name)}</a>`;
        }
        
        headerHtml = `
            <div class="site-header" style="background: ${header.bgColor}; color: ${header.textColor}; ${header.fixed ? 'position: sticky; top: 20px; z-index: 100;' : ''}">
                <div class="site-header-logo">
                    ${logoHtml}
                    <span class="logo-name">${escapeHtml(header.siteName)}</span>
                </div>
                <nav class="site-header-nav">
                    ${menuHtml}
                </nav>
            </div>
        `;
    }
    
    // Генерируем HTML подвала ТОЛЬКО если включен
    let footerHtml = '';
    if (footer.enabled) {
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
        
        footerHtml = `
            <div class="site-footer" style="background: ${footer.bgColor}; color: ${footer.textColor};">
                <div class="site-footer-text">${escapeHtml(footer.text)}</div>
                ${socialHtml}
            </div>
        `;
    }
    
    // Очистка блоков для предпросмотра
    function cleanBlockContent(html) {
        if (!html) return '<div class="empty-message" style="text-align:center; padding:40px; color:#aaa;">📄 Страница пуста</div>';
        const temp = document.createElement('div');
        temp.innerHTML = html;
        temp.querySelectorAll('.block-controls').forEach(el => el.remove());
        temp.querySelectorAll('[contenteditable="true"]').forEach(el => el.removeAttribute('contenteditable'));
        temp.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        temp.querySelectorAll('.image-uploader').forEach(uploader => {
            const img = uploader.querySelector('.uploaded-image');
            const controls = uploader.querySelector('.image-controls');
            if (controls) controls.remove();
            if (img) {
                const newDiv = document.createElement('div');
                newDiv.className = 'block-image';
                newDiv.style.textAlign = img.style.textAlign || 'center';
                newDiv.appendChild(img.cloneNode(true));
                uploader.parentElement.replaceWith(newDiv);
            }
        });
        return temp.innerHTML;
    }
    
    let pagesHtml = '';
    for (const page of pagesList) {
        pagesHtml += `<div class="page-content" id="page-${page.id}" style="display: ${page.id === currentPageIdGlobal ? 'block' : 'none'};">${cleanBlockContent(page.blocks)}</div>`;
    }
    
    return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(header.siteName)} - Сайт на MuTilda</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; display: flex; flex-direction: column; min-height: 100vh; }
        .page-container { max-width: 1000px; margin: 0 auto; background: #fff; flex: 1; padding: 40px; width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border-radius: 24px; }
        
        .site-header { max-width: 1000px; margin: 20px auto 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; flex-wrap: wrap; gap: 15px; border-radius: 60px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        .site-header-logo { display: flex; align-items: center; gap: 10px; font-size: 1.3rem; font-weight: bold; }
        .site-header-logo .logo-icon { font-size: 1.8rem; }
        .site-header-nav { display: flex; gap: 20px; flex-wrap: wrap; }
        .site-header-nav a { color: inherit; text-decoration: none; opacity: 0.8; cursor: pointer; padding: 5px 10px; border-radius: 20px; }
        .site-header-nav a:hover { opacity: 1; text-decoration: underline; }
        .site-header-nav a.active-page { opacity: 1; text-decoration: underline; font-weight: bold; background: rgba(255,255,255,0.15); }
        
        .site-footer { max-width: 1000px; margin: 0 auto 20px auto; text-align: center; padding: 30px; margin-top: auto; border-radius: 24px; }
        .site-footer-text { margin-bottom: 15px; }
        .site-footer-social { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
        .site-footer-social a { color: inherit; text-decoration: none; opacity: 0.7; }
        .site-footer-social a:hover { opacity: 1; text-decoration: underline; }
        
        .site-block { margin: 20px 0; padding: 20px; border: 2px solid transparent; border-radius: 20px; background: #fff; display: inline-block; width: auto; min-width: 60px; vertical-align: top; }
        .site-block.center-align { display: block!important; text-align: center; margin: 25px auto!important; width: fit-content; clear: both; }
        .site-block.left-align { float: left; margin: 5px 24px 20px 0!important; }
        .site-block.right-align { float: right; margin: 5px 0 20px 24px!important; }
        .page-container::after { content: ""; display: table; clear: both; }
        
        .block-text { font-size: 1rem; line-height: 1.6; color: #333; }
        .block-heading h2 { font-size: 1.8rem; color: #1e2a4a; margin: 0; font-weight: 700; }
        .block-image { margin: 15px 0; }
        .block-image img { max-width: 100%; height: auto; border-radius: 12px; }
        .block-button { text-align: center; margin: 15px 0; }
        .block-button a { display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; padding: 12px 32px; text-decoration: none; border-radius: 40px; font-weight: 600; cursor: pointer; border: none; }
        .block-button a:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102,126,234,0.35); }
        .block-separator hr { margin: 20px 0; border: none; height: 2px; background: linear-gradient(90deg, #667eea, #764ba2, #667eea); }
        .block-html { background: #f5f5f5; padding: 15px; border-radius: 12px; font-family: monospace; overflow-x: auto; }
        .empty-message { text-align: center; padding: 40px; color: #aaa; }
        
        @media (max-width: 768px) { .page-container { padding: 20px; } .site-header { flex-direction: column; text-align: center; } .block-heading h2 { font-size: 1.4rem; } }
        .block-button a, .site-header-nav a { user-select: none; -webkit-user-select: none; }
    </style>
</head>
<body>
    ${headerHtml}
    <div class="page-container">${pagesHtml}</div>
    ${footerHtml}
    <script>
        function showPage(pageId) {
            document.querySelectorAll('.page-content').forEach(el => el.style.display = 'none');
            const selected = document.getElementById('page-' + pageId);
            if (selected) selected.style.display = 'block';
            document.querySelectorAll('.site-header-nav a').forEach(link => link.classList.remove('active-page'));
            const activeLink = Array.from(document.querySelectorAll('.site-header-nav a')).find(link => link.getAttribute('onclick')?.includes(pageId));
            if (activeLink) activeLink.classList.add('active-page');
        }
        document.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    </script>
</body>
</html>`;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : (m === '<' ? '&lt;' : '&gt;'));
}