// ==UserScript==
// @name         wplace.live template overlay
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Template overlay para wplace.live com interface moderna
// @author       You
// @match        https://wplace.live/*
// @match        https://*.wplace.live/*
// @run-at       document-ready
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    console.log("🔥 WPLACE TEMPLATE SCRIPT EXECUTANDO!");
    
    let templateOverlay = null;
    let templateImg = null;
    let currentOpacity = 0.5;
    let currentScale = 10.0; // Tamanho padrão bem maior
    let isMoving = false;
    let moveSpeed = 1; // Movimento mais preciso
    
    // Função para mostrar notificações
    function showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db'};
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            z-index: 10002;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease-out;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        if (!document.querySelector('#notification-style')) {
            style.id = 'notification-style';
            document.head.appendChild(style);
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }
    
    // Função para criar interface de seleção
    function createTemplateInterface() {
        if (document.getElementById('wplace-template-interface')) return;
        
        const interfaceOverlay = document.createElement('div');
        interfaceOverlay.id = 'wplace-template-interface';
        interfaceOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10005;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
        `;
        
        const panel = document.createElement('div');
        panel.style.cssText = `
            background: white;
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
        `;
        
        panel.innerHTML = `
            <h2 style="margin-top: 0; color: #333; font-size: 24px;">🎨 Template Overlay</h2>
            <p style="color: #666; margin-bottom: 30px;">Escolha uma imagem para sobrepor no mapa</p>
            
            <div style="margin-bottom: 20px;">
                <input type="file" id="template-file-input" accept="image/*" style="display: none;">
                <button id="template-file-btn" style="
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    margin: 10px;
                    transition: all 0.3s ease;
                    min-width: 180px;
                ">📁 Arquivo do PC</button>
            </div>
            
            <div style="margin: 20px 0; color: #999;">OU</div>
            
            <div style="margin-bottom: 30px;">
                <input type="url" id="template-url-input" placeholder="https://exemplo.com/imagem.png" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 14px;
                    box-sizing: border-box;
                    margin-bottom: 10px;
                ">
                <button id="template-url-btn" style="
                    background: #27ae60;
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    margin: 5px;
                    transition: all 0.3s ease;
                    min-width: 180px;
                ">🌐 Usar URL</button>
            </div>
            
            <div style="font-size: 12px; color: #666; margin-bottom: 20px;">
                ⌨️ <strong>Controles:</strong><br>
                WASD = mover • Q/E = opacidade • R/F = tamanho • ESC = sair
            </div>
            
            <button id="template-cancel-btn" style="
                background: #95a5a6;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
            ">❌ Cancelar</button>
        `;
        
        interfaceOverlay.appendChild(panel);
        document.body.appendChild(interfaceOverlay);
        
        // Event listeners
        const fileInput = document.getElementById('template-file-input');
        const fileBtn = document.getElementById('template-file-btn');
        const urlInput = document.getElementById('template-url-input');
        const urlBtn = document.getElementById('template-url-btn');
        const cancelBtn = document.getElementById('template-cancel-btn');
        
        fileBtn.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    applyTemplate(e.target.result);
                    interfaceOverlay.remove();
                };
                reader.readAsDataURL(file);
            }
        });
        
        urlBtn.addEventListener('click', () => {
            const url = urlInput.value.trim();
            if (url) {
                applyTemplate(url);
                interfaceOverlay.remove();
            } else {
                showNotification("❌ Digite uma URL válida", 'error');
            }
        });
        
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') urlBtn.click();
        });
        
        cancelBtn.addEventListener('click', () => interfaceOverlay.remove());
        interfaceOverlay.addEventListener('click', (e) => {
            if (e.target === interfaceOverlay) interfaceOverlay.remove();
        });
    }
    
    // Função para redimensionar imagem com alinhamento de pixel
    function scaleImage(increase = true) {
        if (!templateImg) return;
        
        const scaleStep = 0.5; // Passos maiores para ajuste mais preciso
        if (increase) {
            currentScale = Math.min(50.0, currentScale + scaleStep);
        } else {
            currentScale = Math.max(1.0, currentScale - scaleStep);
        }
        
        // Forçar alinhamento pixel-perfect
        templateImg.style.transform = templateImg.style.transform.replace(/scale\([^)]*\)/, '') + ` scale(${currentScale})`;
        
        // Tentar alinhar com grid do site
        if (currentScale >= 10) {
            templateImg.style.imageRendering = 'pixelated';
            templateImg.style.imageRendering = '-moz-crisp-edges';
            templateImg.style.imageRendering = 'crisp-edges';
        }
        
        showNotification(`🔍 Tamanho: ${Math.round(currentScale * 10)}% (${Math.round(currentScale)}x)`, 'info', 1000);
    }
    function applyTemplate(templateSrc) {
        showNotification("📥 Carregando template...", 'info');
        
        // Remover template existente
        if (templateOverlay) templateOverlay.remove();
        
        // Encontrar container do mapa
        const mapContainer = document.body;
        
        // Criar overlay
        templateOverlay = document.createElement('div');
        templateOverlay.id = 'wplace-template-overlay';
        templateOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 1000;
            overflow: hidden;
        `;
        
        // Criar imagem
        templateImg = document.createElement('img');
        templateImg.src = templateSrc;
        templateImg.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(${currentScale});
            opacity: ${currentOpacity};
            pointer-events: none;
            image-rendering: pixelated;
            max-width: none;
            max-height: none;
            border: 2px solid rgba(255,255,255,0.3);
        `;
        
        templateImg.onload = () => {
            showNotification("✅ Template carregado! Use WASD para mover", 'success');
            enableControls();
            // Criar grade inicial se necessário
            if (showGrid) setTimeout(createPixelGrid, 100);
        };
        
        templateImg.onerror = () => {
            showNotification("❌ Erro ao carregar template", 'error');
        };
        
        templateOverlay.appendChild(templateImg);
        mapContainer.appendChild(templateOverlay);
    }
    
    // Função para habilitar controles
    function enableControls() {
        let currentX = 0;
        let currentY = 0;
        
        function updatePosition() {
            if (templateImg) {
                const transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) scale(${currentScale})`;
                templateImg.style.transform = transform;
                
                // Atualizar grade se ativa
                if (showGrid && templateGrid) {
                    templateGrid.style.transform = transform;
                    templateGrid.style.top = templateImg.offsetTop + 'px';
                    templateGrid.style.left = templateImg.offsetLeft + 'px';
                }
            }
        }
        
        function handleKeyDown(e) {
            if (!templateImg) return;
            
            switch(e.key.toLowerCase()) {
                case 'w':
                    e.preventDefault();
                    currentY -= moveSpeed;
                    updatePosition();
                    break;
                case 's':
                    e.preventDefault();
                    currentY += moveSpeed;
                    updatePosition();
                    break;
                case 'a':
                    e.preventDefault();
                    currentX -= moveSpeed;
                    updatePosition();
                    break;
                case 'd':
                    e.preventDefault();
                    currentX += moveSpeed;
                    updatePosition();
                    break;
                case 'q':
                    e.preventDefault();
                    currentOpacity = Math.max(0.1, currentOpacity - 0.1);
                    templateImg.style.opacity = currentOpacity;
                    showNotification(`🔍 Opacidade: ${Math.round(currentOpacity * 100)}%`, 'info', 1000);
                    break;
                case 'e':
                    e.preventDefault();
                    currentOpacity = Math.min(1.0, currentOpacity + 0.1);
                    templateImg.style.opacity = currentOpacity;
                    showNotification(`🔍 Opacidade: ${Math.round(currentOpacity * 100)}%`, 'info', 1000);
                    break;
                case 'r':
                    e.preventDefault();
                    scaleImage(true); // Aumentar
                    break;
                case 'f':
                    e.preventDefault();
                    scaleImage(false); // Diminuir
                    break;
                case 'g':
                    e.preventDefault();
                    toggleGrid();
                    break;
                case 'c':
                    e.preventDefault();
                    toggleGridColor();
                    break;
                case 'escape':
                    e.preventDefault();
                    removeTemplate();
                    break;
            }
        }
        
        document.addEventListener('keydown', handleKeyDown);
    }
    
    // Função para remover template
    function removeTemplate() {
        if (templateOverlay) {
            templateOverlay.remove();
            templateOverlay = null;
            templateImg = null;
            templateGrid = null;
            showNotification("❌ Template removido", 'info');
        }
    }
    
    // Função para criar botão principal
    function createMainButton() {
        const mainButton = document.createElement('button');
        mainButton.id = 'wplace-template-main-btn';
        mainButton.innerHTML = '🎨';
        mainButton.title = 'Template Overlay (Clique para abrir)';
        
        mainButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            z-index: 10001;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        
        mainButton.addEventListener('click', createTemplateInterface);
        
        mainButton.addEventListener('mouseenter', () => {
            mainButton.style.transform = 'scale(1.1)';
        });
        
        mainButton.addEventListener('mouseleave', () => {
            mainButton.style.transform = 'scale(1)';
        });
        
        document.body.appendChild(mainButton);
    }
    
    // Inicialização
    function init() {
        showNotification("🎨 Template Overlay carregado!", 'success');
        createMainButton();
        
        // Mostrar interface automaticamente na primeira vez
        setTimeout(() => {
            if (!templateOverlay) {
                createTemplateInterface();
            }
        }, 2000);
    }
    
    // Aguardar página carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 1000);
    }
    
})();