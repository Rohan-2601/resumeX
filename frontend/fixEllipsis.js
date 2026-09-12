const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}
const files = walk('frontend');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.match(/[a-zA-Z]+\.\.\./)) {
    const newContent = content.replace(/([a-zA-Z]+)\.\.\./g, '$1');
    if (newContent !== content) {
      fs.writeFileSync(file, newContent);
      console.log('Fixed ' + file);
    }
  }
});
