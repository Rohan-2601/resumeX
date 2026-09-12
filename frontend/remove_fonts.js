const fs = require('fs');
const path = require('path');

const files = [
  'app/dashboard/layout.js',
  'app/dashboard/links/page.js',
  'app/dashboard/analytics/page.js',
  'app/dashboard/resumes/[resumeId]/page.js',
  'app/dashboard/resumes/page.js',
  'app/[username]/error.js',
  'app/terms/page.js',
  'app/privacy/page.js',
  'app/components/footer/Footer.js',
  'app/[username]/not-found.js',
  'app/components/share-preview/SharePreview.js',
  'app/components/comparison/Comparison.js',
  'app/(auth)/layout.js',
  'app/(auth)/login/page.js',
  'app/(auth)/register/page.js',
  'app/auth/callback/page.js'
];

files.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Remove imports
    content = content.replace(/import\s+\{\s*(?:Playfair_Display|Sora)(?:,\s*(?:Playfair_Display|Sora))?\s*\}\s+from\s+["']next\/font\/google["'];?\n?/g, '');
    
    // Remove font instance definitions
    content = content.replace(/const\s+displayFont\s*=\s*Playfair_Display\s*\(\{[^}]+\}\);\n?/g, '');
    content = content.replace(/const\s+sansFont\s*=\s*Sora\s*\(\{[^}]+\}\);\n?/g, '');
    
    // Remove sansFont.className from classNames
    content = content.replace(/\$\{sansFont\.className\}\s*/g, '');
    
    // Clean up specific displayFont usages (usually on logo or headings)
    content = content.replace(/\$\{displayFont\.className\}\s*italic\s*/g, '');
    content = content.replace(/\$\{displayFont\.className\}\s*/g, '');
    
    // Replace empty className={` `} with nothing, or leave it empty 
    // Just replace empty backticks inside className
    content = content.replace(/className=\{\`\s*\`\}/g, '');
    content = content.replace(/className=\{\`([^\`\$]*?)\`\}/g, (match, p1) => {
        let cls = p1.trim();
        return cls ? `className="${cls}"` : '';
    });
    
    fs.writeFileSync(p, content);
  }
});
