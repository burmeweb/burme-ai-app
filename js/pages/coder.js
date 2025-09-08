// Coder Page JavaScript with Worker Integration
document.addEventListener('DOMContentLoaded', function() {
    const codeInput = document.querySelector('.code-input textarea');
    const formatBtn = document.querySelector('.format-btn');
    const explainBtn = document.querySelector('.explain-btn');
    const debugBtn = document.querySelector('.debug-btn');
    const optimizeBtn = document.querySelector('.optimize-btn');
    const generateBtn = document.querySelector('.generate-btn');
    const copyCodeBtn = document.querySelector('.copy-code-btn');
    const languageSelect = document.getElementById('language-select');
    const codeOutput = document.querySelector('.code-output pre code');
    const templateButtons = document.querySelectorAll('.template-btn');
    
    let currentLanguage = 'python';
    let codeWorker = null;

    // Initialize Web Worker
    function initWorker() {
        if (window.Worker) {
            try {
                codeWorker = new Worker('js/worker.js');
                
                codeWorker.onmessage = function(e) {
                    const { action, result } = e.data;
                    
                    switch (action) {
                        case 'format':
                            handleFormatResult(result);
                            break;
                        case 'explain':
                        case 'debug':
                        case 'optimize':
                            handleAnalysisResult(action, result);
                            break;
                        case 'generate':
                            handleGenerationResult(result);
                            break;
                        case 'error':
                            showNotification('Worker error: ' + result, 'error');
                            break;
                    }
                };
                
                codeWorker.onerror = function(error) {
                    console.error('Worker error:', error);
                    showNotification('Worker failed, using fallback', 'error');
                    // Fallback to non-worker implementation
                    codeWorker = null;
                };
            } catch (e) {
                console.warn('Web Worker not available:', e);
                codeWorker = null;
            }
        }
    }

    // Language selection
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            currentLanguage = this.value;
            updateCodeSyntaxHighlighting();
        });
    }
    
    // Initialize worker
    initWorker();
    
    // Format button
    if (formatBtn) {
        formatBtn.addEventListener('click', formatCode);
    }
    
    // Action buttons
    if (explainBtn) {
        explainBtn.addEventListener('click', () => analyzeCode('explain'));
    }
    
    if (debugBtn) {
        debugBtn.addEventListener('click', () => analyzeCode('debug'));
    }
    
    if (optimizeBtn) {
        optimizeBtn.addEventListener('click', () => analyzeCode('optimize'));
    }
    
    if (generateBtn) {
        generateBtn.addEventListener('click', generateCode);
    }
    
    // Copy code button
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', copyOutputCode);
    }
    
    // Template buttons
    templateButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const templateType = this.textContent;
            loadCodeTemplate(templateType);
        });
    });
    
    // Auto-resize textarea
    if (codeInput) {
        codeInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
    
    function formatCode() {
        if (!codeInput || codeInput.value.trim() === '') {
            showNotification('Please enter some code to format', 'warning');
            return;
        }
        
        const code = codeInput.value;
        
        // Show loading state
        if (formatBtn) {
            formatBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Formatting...';
            formatBtn.disabled = true;
        }
        
        if (codeWorker) {
            // Use Web Worker
            codeWorker.postMessage({
                action: 'format',
                data: code,
                language: currentLanguage
            });
        } else {
            // Fallback to direct processing
            setTimeout(() => {
                const formattedCode = simulateCodeFormatting(code, currentLanguage);
                handleFormatResult(formattedCode);
            }, 500);
        }
    }
    
    function analyzeCode(action) {
        if (!codeInput || codeInput.value.trim() === '') {
            showNotification('Please enter some code to analyze', 'warning');
            return;
        }
        
        const code = codeInput.value;
        const button = {
            'explain': explainBtn,
            'debug': debugBtn,
            'optimize': optimizeBtn
        }[action];
        
        // Show loading state
        if (button) {
            button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${button.textContent}...`;
            button.disabled = true;
        }
        
        if (codeOutput) {
            codeOutput.textContent = `// Analyzing code for ${action}...`;
        }
        
        if (codeWorker) {
            // Use Web Worker
            codeWorker.postMessage({
                action: action,
                data: code,
                language: currentLanguage
            });
        } else {
            // Fallback to direct processing
            setTimeout(() => {
                const result = simulateCodeAnalysis(code, action, currentLanguage);
                handleAnalysisResult(action, result);
            }, 1000);
        }
    }
    
    function generateCode() {
        if (!codeInput || codeInput.value.trim() === '') {
            showNotification('Please describe what code you want to generate', 'warning');
            return;
        }
        
        const description = codeInput.value;
        
        // Show loading state
        if (generateBtn) {
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            generateBtn.disabled = true;
        }
        
        if (codeOutput) {
            codeOutput.textContent = `// Generating code for: ${description.substring(0, 50)}...`;
        }
        
        // Try Cloudflare Worker first, then fallback
        generateWithCloudflareWorker(description)
            .catch(error => {
                console.warn('Cloudflare Worker failed, using fallback:', error);
                if (codeWorker) {
                    // Use Web Worker as fallback
                    codeWorker.postMessage({
                        action: 'generate',
                        data: description,
                        language: currentLanguage
                    });
                } else {
                    // Final fallback to direct processing
                    setTimeout(() => {
                        const generatedCode = simulateCodeGeneration(description, currentLanguage);
                        handleGenerationResult(generatedCode);
                    }, 1500);
                }
            });
    }
    
    async function generateWithCloudflareWorker(description) {
        try {
            const response = await fetch('https://your-worker.your-domain.workers.dev/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: description,
                    language: currentLanguage,
                    type: 'code'
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            handleGenerationResult(data.generatedCode || data.result);
            
        } catch (error) {
            throw error;
        }
    }
    
    function handleFormatResult(formattedCode) {
        if (codeInput) {
            codeInput.value = formattedCode;
            codeInput.style.height = 'auto';
            codeInput.style.height = (codeInput.scrollHeight) + 'px';
        }
        
        // Reset button state
        if (formatBtn) {
            formatBtn.innerHTML = '<i class="fas fa-indent"></i> Format';
            formatBtn.disabled = false;
        }
        
        showNotification('Code formatted successfully!', 'success');
    }
    
    function handleAnalysisResult(action, result) {
        if (codeOutput) {
            codeOutput.textContent = result;
            updateCodeSyntaxHighlighting();
        }
        
        // Reset button state
        const button = {
            'explain': explainBtn,
            'debug': debugBtn,
            'optimize': optimizeBtn
        }[action];
        
        if (button) {
            const originalText = {
                'explain': 'Explain Code',
                'debug': 'Debug',
                'optimize': 'Optimize'
            }[action];
            button.innerHTML = `<i class="fas fa-${action === 'explain' ? 'question-circle' : action === 'debug' ? 'bug' : 'bolt'}"></i> ${originalText}`;
            button.disabled = false;
        }
        
        showNotification(`Code ${action} completed successfully!`, 'success');
    }
    
    function handleGenerationResult(generatedCode) {
        if (codeOutput) {
            codeOutput.textContent = generatedCode;
            updateCodeSyntaxHighlighting();
        }
        
        // Reset button state
        if (generateBtn) {
            generateBtn.innerHTML = '<i class="fas fa-code"></i> Generate Code';
            generateBtn.disabled = false;
        }
        
        showNotification('Code generated successfully!', 'success');
    }
    
    function copyOutputCode() {
        if (!codeOutput || !codeOutput.textContent || codeOutput.textContent === '// Your code results will appear here') {
            showNotification('No code to copy', 'warning');
            return;
        }
        
        navigator.clipboard.writeText(codeOutput.textContent)
            .then(() => {
                showNotification('Code copied to clipboard!', 'success');
            })
            .catch(err => {
                showNotification('Failed to copy code', 'error');
                console.error('Copy failed:', err);
            });
    }
    
    function loadCodeTemplate(templateType) {
        const templates = {
            'API Request': {
                python: `import requests\n\ndef api_request(url, params=None):\n    try:\n        response = requests.get(url, params=params)\n        response.raise_for_status()\n        return response.json()\n    except requests.exceptions.RequestException as e:\n        print(f"Request failed: {e}")\n        return None\n\n# Example usage\n# data = api_request("https://api.example.com/data")`,
                javascript: `async function apiRequest(url, params = {}) {\n    try {\n        const response = await fetch(url + '?' + new URLSearchParams(params));\n        if (!response.ok) {\n            throw new Error('HTTP error ' + response.status);\n        }\n        return await response.json();\n    } catch (error) {\n        console.error('Request failed:', error);\n        return null;\n    }\n}\n\n// Example usage\n// const data = await apiRequest('https://api.example.com/data', { param: 'value' });`
            },
            'Database Connection': {
                python: `import sqlite3\n\ndef get_db_connection():\n    conn = sqlite3.connect('database.db')\n    conn.row_factory = sqlite3.Row\n    return conn\n\ndef execute_query(query, params=None):\n    conn = get_db_connection()\n    try:\n        cursor = conn.cursor()\n        cursor.execute(query, params or ())\n        result = cursor.fetchall()\n        conn.commit()\n        return result\n    finally:\n        conn.close()`,
                javascript: `const sqlite3 = require('sqlite3').verbose();\n\nfunction getDbConnection() {\n    return new sqlite3.Database('database.db');\n}\n\nfunction executeQuery(query, params = []) {\n    return new Promise((resolve, reject) => {\n        const db = getDbConnection();\n        db.all(query, params, (err, rows) => {\n            db.close();\n            if (err) {\n                reject(err);\n            } else {\n                resolve(rows);\n            }\n        });\n    });\n}`
            }
        };
        
        if (templates[templateType] && templates[templateType][currentLanguage]) {
            if (codeInput) {
                codeInput.value = templates[templateType][currentLanguage];
                codeInput.style.height = 'auto';
                codeInput.style.height = (codeInput.scrollHeight) + 'px';
            }
        } else {
            showNotification(`No template available for ${templateType} in ${currentLanguage}`, 'info');
        }
    }
    
    function simulateCodeFormatting(code, language) {
        return code
            .replace(/\n\s+\n/g, '\n\n')
            .replace(/\t/g, '    ')
            .replace(/{\s*/g, '{\n    ')
            .replace(/}\s*/g, '\n}\n')
            .trim();
    }
    
    function simulateCodeAnalysis(code, action, language) {
        const actions = {
            'explain': `// Code Explanation:\n// This ${language} code contains ${code.split('\n').length} lines\n// Main functionality appears to be data processing/algorithm implementation`,
            'debug': `// Debug Analysis:\n// No syntax errors found\n// Check variable scope, error handling, and edge cases`,
            'optimize': `// Optimization Suggestions:\n// 1. Algorithm complexity analysis\n// 2. Memory usage optimization\n// 3. Best practices implementation`
        };
        return actions[action] || '// Analysis completed';
    }
    
    function simulateCodeGeneration(description, language) {
        const templates = {
            python: `# Generated: ${description.substring(0, 50)}...\n\ndef main():\n    """Main function implementation"""\n    # TODO: Implement functionality\n    print("Hello from generated code!")\n\nif __name__ == "__main__":\n    main()`,
            javascript: `// Generated: ${description.substring(0, 50)}...\n\nfunction main() {\n    // TODO: Implement functionality\n    console.log("Hello from generated code!");\n}\n\nmain();`,
            java: `// Generated: ${description.substring(0, 50)}...\n\npublic class Main {\n    public static void main(String[] args) {\n        // TODO: Implement functionality\n        System.out.println("Hello from generated code!");\n    }\n}`
        };
        return templates[language] || templates.python;
    }
    
    function updateCodeSyntaxHighlighting() {
        if (codeOutput) {
            const code = codeOutput.textContent;
            codeOutput.innerHTML = code
                .replace(/\/\/.*$/gm, '<span class="comment">$&</span>')
                .replace(/".*?"/g, '<span class="string">$&</span>')
                .replace(/\b(function|def|class|if|else|for|while|return)\b/g, '<span class="keyword">$1</span>');
        }
    }
    
    // Cleanup worker when page unloads
    window.addEventListener('beforeunload', function() {
        if (codeWorker) {
            codeWorker.terminate();
        }
    });
    
    // Initialize code syntax highlighting
    updateCodeSyntaxHighlighting();
});
