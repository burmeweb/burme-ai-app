// Coder Page JavaScript
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
    
    // Language selection
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            currentLanguage = this.value;
            updateCodeSyntaxHighlighting();
        });
    }
    
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
        
        // Simulate formatting
        setTimeout(() => {
            // Simple formatting simulation
            const formattedCode = simulateCodeFormatting(code, currentLanguage);
            
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
        }, 1500);
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
        
        // Simulate analysis
        setTimeout(() => {
            const result = simulateCodeAnalysis(code, action, currentLanguage);
            
            if (codeOutput) {
                codeOutput.textContent = result;
                updateCodeSyntaxHighlighting();
            }
            
            // Reset button state
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
        }, 2000);
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
        
        // Simulate code generation
        setTimeout(() => {
            const generatedCode = simulateCodeGeneration(description, currentLanguage);
            
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
        }, 2500);
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
        // Simple formatting simulation
        return code
            .replace(/\n\s+\n/g, '\n\n') // Remove extra spaces between lines
            .replace(/\t/g, '    ')      // Convert tabs to spaces
            .replace(/{\s*/g, '{\n    ') // Add newline after opening braces
            .replace(/}\s*/g, '\n}\n')   // Add newlines around closing braces
            .trim();
    }
    
    function simulateCodeAnalysis(code, action, language) {
        const actions = {
            'explain': `// Code Explanation:\n// This code appears to be written in ${language}.\n// It contains ${code.split('\n').length} lines of code.\n// The main functionality seems to be processing data or implementing an algorithm.\n// Key components include variable declarations, function definitions, and control structures.\n\n// For a detailed explanation, please provide more specific code.`,
            'debug': `// Debug Analysis:\n// No syntax errors detected in the ${language} code.\n// Potential issues to check:\n// 1. Variable scope and initialization\n// 2. Function return values and error handling\n// 3. Input validation and edge cases\n// 4. Memory management (if applicable)\n\n// Recommendations:\n// - Add comprehensive error handling\n// - Include input validation\n// - Write unit tests for critical functions`,
            'optimize': `// Optimization Suggestions for ${language}:\n\n// 1. Algorithm Complexity:\n//    - Current implementation appears to be O(n) or better\n//    - Consider using built-in functions for better performance\n\n// 2. Memory Usage:\n//    - Use generators or streams for large data processing\n//    - Avoid unnecessary variable declarations\n\n// 3. Best Practices:\n//    - Follow ${language} style guide\n//    - Add comments for complex logic\n//    - Consider using async/await for I/O operations\n\n// 4. Performance Tips:\n//    - Use appropriate data structures\n//    - Cache expensive operations\n//    - Minimize database queries (if applicable)`
        };
        
        return actions[action] || '// Analysis completed';
    }
    
    function simulateCodeGeneration(description, language) {
        const templates = {
            python: `# Generated code based on: ${description.substring(0, 50)}...\n\ndef main():\n    """\n    Main function implementation\n    """\n    # TODO: Implement the functionality described\n    print("Hello from generated code!")\n\nif __name__ == "__main__":\n    main()`,
            javascript: `// Generated code based on: ${description.substring(0, 50)}...\n\nfunction main() {\n    /**\n     * Main function implementation\n     */\n    // TODO: Implement the functionality described\n    console.log("Hello from generated code!");\n}\n\n// Execute main function\nmain();`,
            java: `// Generated code based on: ${description.substring(0, 50)}...\n\npublic class Main {\n    /**\n     * Main method implementation\n     */\n    public static void main(String[] args) {\n        // TODO: Implement the functionality described\n        System.out.println("Hello from generated code!");\n    }\n}`
        };
        
        return templates[language] || templates.python;
    }
    
    function updateCodeSyntaxHighlighting() {
        // Simple syntax highlighting simulation
        // In a real app, you would use a library like Prism.js or Highlight.js
        if (codeOutput) {
            const code = codeOutput.textContent;
            // This is a very basic simulation - real highlighting would be more complex
            codeOutput.innerHTML = code
                .replace(/\/\/.*$/gm, '<span class="comment">$&</span>')
                .replace(/".*?"/g, '<span class="string">$&</span>')
                .replace(/\b(function|def|class|if|else|for|while|return)\b/g, '<span class="keyword">$1</span>');
        }
    }
    
    // Initialize code syntax highlighting
    updateCodeSyntaxHighlighting();
});
