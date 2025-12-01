// Palette de couleurs par défaut
const defaultColors = [
    { name: 'Bleu Principal', hex: '#3366CC', rgb: [51, 102, 204] },
    { name: 'Orange Accent', hex: '#FF9900', rgb: [255, 153, 0] },
    { name: 'Vert Action', hex: '#66CC33', rgb: [102, 204, 51] },
    { name: 'Violet', hex: '#7b13d6', rgb: [123, 19, 214] },
    { name: 'Rouge', hex: '#f91616', rgb: [249, 22, 22] },
    { name: 'Bleu', hex: '#3885f4', rgb: [56, 133, 244] },
    { name: 'Rose', hex: '#ed5fb1', rgb: [237, 95, 177] },
    { name: 'Jaune', hex: '#f9c900', rgb: [249, 201, 0] },
    { name: 'Vert', hex: '#2e9959', rgb: [46, 153, 89] }
];

let currentVision = 'normal';

// Matrices de transformation pour les différents types de vision
const visionMatrices = {
    normal: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ],
    deuteranopia: [
        [0.625, 0.375, 0],
        [0.7, 0.3, 0],
        [0, 0.3, 0.7]
    ],
    protanopia: [
        [0.567, 0.433, 0],
        [0.558, 0.442, 0],
        [0, 0.242, 0.758]
    ],
    tritanopia: [
        [0.95, 0.05, 0],
        [0, 0.433, 0.567],
        [0, 0.475, 0.525]
    ],
    achromatopsia: [
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114]
    ],
    monochromacy: [
        [0.213, 0.715, 0.072],
        [0.213, 0.715, 0.072],
        [0.213, 0.715, 0.072]
    ],
    photophobia: [
        [0.4, 0.4, 0.4],
        [0.4, 0.4, 0.4],
        [0.4, 0.4, 0.4]
    ],
    scotopic: [
        [0.1, 0.8, 0.1],
        [0.1, 0.8, 0.1],
        [0.1, 0.8, 0.1]
    ]
};

// Fonction pour appliquer la transformation de couleur
function applyVisionFilter(rgb, visionType) {
    // Conditions qui affectent principalement le champ visuel mais peuvent aussi affecter la perception des couleurs
    if (visionType === 'tunnel') {
        // Vision tunnel : réduction de la luminosité périphérique
        const [r, g, b] = rgb;
        return [
            Math.round(r * 0.6),
            Math.round(g * 0.6), 
            Math.round(b * 0.6)
        ];
    }
    
    if (visionType === 'peripheral') {
        // Perte périphérique : vision centrale préservée mais réduite
        const [r, g, b] = rgb;
        return [
            Math.round(r * 0.8),
            Math.round(g * 0.8),
            Math.round(b * 0.8)
        ];
    }
    
    if (['central', 'hemianopia', 'prosopagnosia'].includes(visionType)) {
        return rgb; // Ces conditions affectent surtout le champ visuel
    }

    const matrix = visionMatrices[visionType] || visionMatrices.normal;
    const [r, g, b] = rgb;
    
    const newR = Math.round(matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b);
    const newG = Math.round(matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b);
    const newB = Math.round(matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b);
    
    return [
        Math.max(0, Math.min(255, newR)),
        Math.max(0, Math.min(255, newG)),
        Math.max(0, Math.min(255, newB))
    ];
}

// Fonction pour appliquer les effets visuels sur l'ensemble de la page
function applyVisualEffects(visionType) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    // Supprimer les effets précédents
    mainContent.style.filter = '';
    mainContent.style.clipPath = '';
    mainContent.style.mask = '';
    mainContent.style.webkitMask = '';
    
    // Supprimer les overlays précédents
    const existingOverlay = document.querySelector('.vision-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    switch(visionType) {
        case 'tunnel':
            // Vision tunnel : effet de vignettage circulaire
            const tunnelOverlay = document.createElement('div');
            tunnelOverlay.className = 'vision-overlay';
            tunnelOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at center, transparent 15%, rgba(0,0,0,0.3) 25%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.95) 60%);
                pointer-events: none;
                z-index: 10;
            `;
            mainContent.style.position = 'relative';
            mainContent.appendChild(tunnelOverlay);
            break;

        case 'peripheral':
            // Perte de vision périphérique : scotome central
            const peripheralOverlay = document.createElement('div');
            peripheralOverlay.className = 'vision-overlay';
            peripheralOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.8) 20%, transparent 35%);
                pointer-events: none;
                z-index: 10;
            `;
            mainContent.style.position = 'relative';
            mainContent.appendChild(peripheralOverlay);
            break;

        case 'central':
            // Scotome central : tache aveugle au centre
            const centralOverlay = document.createElement('div');
            centralOverlay.className = 'vision-overlay';
            centralOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.9) 15%, rgba(0,0,0,0.3) 25%, transparent 35%);
                pointer-events: none;
                z-index: 10;
            `;
            mainContent.style.position = 'relative';
            mainContent.appendChild(centralOverlay);
            break;

        case 'hemianopia':
            // Hémianopsie : perte de la moitié du champ visuel
            const hemianopiaOverlay = document.createElement('div');
            hemianopiaOverlay.className = 'vision-overlay';
            hemianopiaOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.9) 48%, transparent 52%, transparent 100%);
                pointer-events: none;
                z-index: 10;
            `;
            mainContent.style.position = 'relative';
            mainContent.appendChild(hemianopiaOverlay);
            break;

        case 'photophobia':
            // Photophobie : sensibilité à la lumière
            mainContent.style.filter = 'brightness(0.3) contrast(0.7)';
            break;

        case 'scotopic':
            // Vision scotopique : vision nocturne
            mainContent.style.filter = 'brightness(0.4) contrast(1.2) hue-rotate(180deg)';
            break;

        case 'prosopagnosia':
            // Prosopagnosie : flou sur les détails
            mainContent.style.filter = 'blur(1px) contrast(0.8)';
            break;

        default:
            // Vision normale : pas d'effet
            break;
    }
}

// Fonction pour calculer le contraste
function calculateContrast(rgb1, rgb2) {
    function getLuminance(rgb) {
        const [r, g, b] = rgb.map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    
    const lum1 = getLuminance(rgb1);
    const lum2 = getLuminance(rgb2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
}

// Fonction pour convertir hex en RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

// Fonction pour mettre à jour le testeur de contraste
function updateContrastTester() {
    const textColorPicker = document.getElementById('textColorPicker');
    const bgColorPicker = document.getElementById('bgColorPicker');
    const textColorValue = document.getElementById('textColorValue');
    const bgColorValue = document.getElementById('bgColorValue');
    const contrastPreview = document.getElementById('contrastPreview');
    const contrastRatio = document.getElementById('contrastRatio');
    const normalTextResult = document.getElementById('normalTextResult');
    const largeTextResult = document.getElementById('largeTextResult');
    const uiElementResult = document.getElementById('uiElementResult');

    if (!textColorPicker || !bgColorPicker) return;

    const textColor = textColorPicker.value;
    const bgColor = bgColorPicker.value;
    
    // Mettre à jour les valeurs affichées
    if (textColorValue) textColorValue.textContent = textColor.toUpperCase();
    if (bgColorValue) bgColorValue.textContent = bgColor.toUpperCase();
    
    // Mettre à jour l'aperçu
    if (contrastPreview) {
        contrastPreview.style.backgroundColor = bgColor;
        contrastPreview.style.color = textColor;
    }
    
    // Calculer le contraste
    const textRgb = hexToRgb(textColor);
    const bgRgb = hexToRgb(bgColor);
    
    if (textRgb && bgRgb) {
        const contrast = calculateContrast(textRgb, bgRgb);
        
        // Mettre à jour le ratio
        if (contrastRatio) {
            contrastRatio.textContent = contrast.toFixed(1) + ':1';
        }
        
        // Déterminer les niveaux de conformité
        const normalTextLevel = contrast >= 7 ? 'AAA' : contrast >= 4.5 ? 'AA' : 'Échec';
        const largeTextLevel = contrast >= 4.5 ? 'AAA' : contrast >= 3 ? 'AA' : 'Échec';
        const uiElementLevel = contrast >= 3 ? 'Conforme' : 'Échec';
        
        // Mettre à jour les résultats
        if (normalTextResult) {
            const passClass = contrast >= 4.5 ? 'status-pass' : 'status-fail';
            normalTextResult.innerHTML = `<span class="status-badge ${passClass}">${normalTextLevel}</span>`;
        }
        
        if (largeTextResult) {
            const passClass = contrast >= 3 ? 'status-pass' : 'status-fail';
            largeTextResult.innerHTML = `<span class="status-badge ${passClass}">${largeTextLevel}</span>`;
        }
        
        if (uiElementResult) {
            const passClass = contrast >= 3 ? 'status-pass' : 'status-fail';
            uiElementResult.innerHTML = `<span class="status-badge ${passClass}">${uiElementLevel}</span>`;
        }
    }
}

// Fonction pour définir des couleurs prédéfinies
function setColors(textColor, bgColor) {
    const textColorPicker = document.getElementById('textColorPicker');
    const bgColorPicker = document.getElementById('bgColorPicker');
    
    if (textColorPicker && bgColorPicker) {
        textColorPicker.value = textColor;
        bgColorPicker.value = bgColor;
        updateContrastTester();
    }
}

// Fonction pour générer la palette de couleurs
function generateColorPalette() {
    const palette = document.getElementById('colorPalette');
    if (!palette) return;
    
    palette.innerHTML = '';
    
    defaultColors.forEach(color => {
        const filteredRgb = applyVisionFilter(color.rgb, currentVision);
        const filteredHex = `#${filteredRgb.map(c => c.toString(16).padStart(2, '0')).join('')}`;
        
        const card = document.createElement('div');
        card.className = 'color-card';
        card.innerHTML = `
            <div class="color-preview" style="background-color: ${filteredHex};">
                ${color.name}
            </div>
            <div class="color-info">
                <div class="color-code">${filteredHex.toUpperCase()}</div>
                <div style="color: #000;">RGB: ${filteredRgb.join(', ')}</div>
            </div>
        `;
        palette.appendChild(card);
    });
}

// Fonction pour mettre à jour la grille de conformité
function updateComplianceGrid() {
    const grid = document.getElementById('complianceGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    defaultColors.forEach(color => {
        const contrast = calculateContrast(color.rgb, [255, 255, 255]);
        const level = contrast >= 7 ? 'AAA' : contrast >= 4.5 ? 'AA' : 'Échec';
        const levelClass = contrast >= 7 ? 'compliance-aaa' : contrast >= 4.5 ? 'compliance-aa' : 'compliance-fail';
        
        const card = document.createElement('div');
        card.className = `compliance-card ${levelClass}`;
        card.innerHTML = `
            <div class="compliance-level">${color.name}</div>
            <div class="contrast-ratio">${contrast.toFixed(1)}:1</div>
            <div class="status-badge ${contrast >= 4.5 ? 'status-pass' : 'status-fail'}">${level}</div>
        `;
        grid.appendChild(card);
    });
}

// Fonction pour mettre à jour les suggestions
function updateSuggestions() {
    const container = document.getElementById('suggestionsContainer');
    if (!container) return;
    
    container.innerHTML = '<p style="color: #000;">Suggestions basées sur l\'amélioration du contraste et l\'accessibilité pour tous les types de vision.</p>';
}

// Fonction pour afficher une page
function showPage(pageId) {
    const pages = ['mainSimulator', 'contrastPage', 'digitalAccessibilityPage', 'webAccessibilityPage', 'aboutPage'];
    pages.forEach(id => {
        const page = document.getElementById(id);
        if (page) {
            page.style.display = id === pageId ? 'block' : 'none';
        }
    });
    
    // Nettoyer les effets visuels lors du changement de page
    if (pageId !== 'mainSimulator') {
        const existingOverlay = document.querySelector('.vision-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.style.filter = '';
        }
    }
    
    if (pageId === 'mainSimulator') {
        generateColorPalette();
        updateComplianceGrid();
        updateSuggestions();
        // Réappliquer les effets visuels si nécessaire
        if (currentVision !== 'normal') {
            applyVisualEffects(currentVision);
        }
    }
}

// Gestionnaires d'événements
document.addEventListener('DOMContentLoaded', function() {
    // Navigation entre les pages
    const contrastBtn = document.getElementById('contrastPageBtn');
    const digitalBtn = document.getElementById('digitalAccessibilityBtn');
    const webBtn = document.getElementById('webAccessibilityBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    
    if (contrastBtn) {
        contrastBtn.addEventListener('click', function() {
            showPage('contrastPage');
        });
    }
    if (digitalBtn) {
        digitalBtn.addEventListener('click', function() {
            showPage('digitalAccessibilityPage');
        });
    }
    if (webBtn) {
        webBtn.addEventListener('click', function() {
            showPage('webAccessibilityPage');
        });
    }
    if (aboutBtn) {
        aboutBtn.addEventListener('click', function() {
            showPage('aboutPage');
        });
    }
    
    // Boutons de vision
    const visionBtns = document.querySelectorAll('.vision-btn');
    visionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            visionBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentVision = this.dataset.vision;
            generateColorPalette();
            applyVisualEffects(currentVision);
        });
    });
    
    // Gestionnaires pour le testeur de contraste
    const textColorPicker = document.getElementById('textColorPicker');
    const bgColorPicker = document.getElementById('bgColorPicker');
    
    if (textColorPicker) {
        textColorPicker.addEventListener('input', updateContrastTester);
    }
    if (bgColorPicker) {
        bgColorPicker.addEventListener('input', updateContrastTester);
    }
    
    // Initialiser le testeur de contraste
    updateContrastTester();
    
    // Initialiser avec la page principale
    showPage('mainSimulator');
});
