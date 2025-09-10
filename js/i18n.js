// i18n.js - Internationalization support for all pages

// Language file paths
const languageFiles = {
    'en': '../i18n/eng.json',
    'my': '../i18n/my.json',
    'zh': '../i18n/china.json',
    'th': '../i18n/thai.json',
    'ph': '../i18n/phi.json',
    'ru': '../i18n/ru.json',
    'arb': '../i18n/arb.json'
};

// Global translations object
let currentTranslations = {};

// Initialize i18n on page load
function initI18n() {
    // Load saved language preference
    const savedPreferences = JSON.parse(localStorage.getItem('languagePreferences') || '{}');
    const savedLanguage = savedPreferences.language || localStorage.getItem('selectedLanguage') || 'en';
    
    // Load the language file
    loadLanguageFile(savedLanguage);
}

// Load language file
function loadLanguageFile(langCode) {
    const filePath = languageFiles[langCode];
    
    if (filePath) {
        fetch(filePath)
            .then(response => response.json())
            .then(data => {
                currentTranslations = data;
                applyTranslations();
                document.documentElement.lang = langCode;
                
                // Update page title if it has i18n attribute
                const titleElement = document.querySelector('title[data-i18n]');
                if (titleElement && currentTranslations[titleElement.getAttribute('data-i18n')]) {
                    document.title = currentTranslations[titleElement.getAttribute('data-i18n')];
                }
            })
            .catch(error => {
                console.error('Error loading language file:', error);
                // Fallback to English
                if (langCode !== 'en') {
                    loadLanguageFile('en');
                }
            });
    }
}

// Apply translations to the page
function applyTranslations() {
    // Apply translations to all elements with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (currentTranslations[key]) {
            element.textContent = currentTranslations[key];
        }
    });
    
    // Apply translations to elements with data-i18n-key attributes
    document.querySelectorAll('[data-i18n-key]').forEach(element => {
        const key = element.getAttribute('data-i18n-key');
        const value = getNestedTranslation(key);
        if (value) {
            element.textContent = value;
        }
    });
    
    // Apply translations to placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (currentTranslations[key]) {
            element.placeholder = currentTranslations[key];
        }
    });
    
    // Apply translations to title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (currentTranslations[key]) {
            element.title = currentTranslations[key];
        }
    });
    
    // Apply translations to alt attributes
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
        const key = element.getAttribute('data-i18n-alt');
        if (currentTranslations[key]) {
            element.alt = currentTranslations[key];
        }
    });
}

// Get nested translation value
function getNestedTranslation(key) {
    return key.split('.').reduce((obj, i) => (obj ? obj[i] : null), currentTranslations);
}

// Listen for language change events
window.addEventListener('storage', function(event) {
    if (event.key === 'selectedLanguage') {
        loadLanguageFile(event.newValue);
    }
    
    if (event.key === 'languagePreferences') {
        const preferences = JSON.parse(event.newValue || '{}');
        if (preferences.language) {
            loadLanguageFile(preferences.language);
        }
    }
});

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    initI18n();
}