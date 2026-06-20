const fs = require('fs');
const path = require('path');

const filesToCheck = [
    'js/components/sidebar.js',
    'js/app.js',
    'js/services/db.service.js',
    'js/pages/kesiswaan/kesiswaan.js'
];

const projectRoot = 'c:\\Users\\IDRISIYYAH\\Documents\\GitHub\\tradisi';

filesToCheck.forEach(relPath => {
    const fullPath = path.join(projectRoot, relPath);
    console.log(`Checking syntax of: ${relPath}`);
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        // Strip out imports and exports so Function constructor can compile it purely as ES5/ES6
        let sanitized = content
            .replace(/import\s+[\s\S]*?\s+from\s+['"].*?['"];?/g, '')
            .replace(/import\s+['"].*?['"];?/g, '')
            .replace(/\bexport\s+default\b/g, '')
            .replace(/\bexport\s+const\b/g, 'const')
            .replace(/\bexport\s+let\b/g, 'let')
            .replace(/\bexport\s+var\b/g, 'var')
            .replace(/\bexport\s+function\b/g, 'function')
            .replace(/\bexport\s+async\s+function\b/g, 'async function')
            .replace(/\bexport\s+class\b/g, 'class')
            .replace(/\bexport\s*\{[\s\S]*?\}\s*;?/g, ''); // Named exports block
        
        new Function(sanitized);
        console.log(`✅ ${relPath} syntax is valid!`);
    } catch (e) {
        console.error(`❌ Syntax error in ${relPath}:`, e.message);
        process.exit(1);
    }
});

console.log("All syntax checks passed successfully!");
