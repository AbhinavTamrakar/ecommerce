import * as fs from 'fs';
import * as path from 'path';

function walkDir(dir: string, callback: (filePath: string) => void): void {
  fs.readdirSync(dir).forEach((f: string) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function replaceTextColors() {
  const dirs = [
    path.join(__dirname, 'src', 'app', 'admin'),
    path.join(__dirname, 'src', 'components', 'admin')
  ];
  
  let changedFiles = 0;

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    walkDir(dir, (filePath) => {
      if (!filePath.endsWith('.tsx')) return;
      
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Make low contrast Tailwind variables darker
      // Instead of text-black/20 -> make it text-black/60 minimum for legibility
      const oldContent = content;
      content = content
        .replace(/text-black\/10/g, 'text-black/50')
        .replace(/text-black\/20/g, 'text-black/60')
        .replace(/text-black\/30/g, 'text-black/70')
        .replace(/text-black\/40/g, 'text-black/80')
        .replace(/text-black\/50/g, 'text-black/90')
        .replace(/text-black\/60/g, 'text-black')
        
        .replace(/text-white\/20/g, 'text-white/60')
        .replace(/text-white\/30/g, 'text-white/70')
        .replace(/text-white\/40/g, 'text-white/80')
        
        // Sometimes icons or borders are also too dim
        .replace(/border-black\/5/g, 'border-black/20')
        .replace(/border-black\/10/g, 'border-black/20')
        .replace(/opacity-10/g, 'opacity-40')
        .replace(/opacity-20/g, 'opacity-50')
        .replace(/opacity-30/g, 'opacity-60')
        .replace(/opacity-40/g, 'opacity-70')
        
        // Gray text improvements
        .replace(/text-gray-400/g, 'text-gray-600')
        .replace(/text-gray-500/g, 'text-gray-700')
        
        // Make the very small text slightly larger or bolder if it's explicitly light
        .replace(/font-medium text-black\/(40|50|60)/g, 'font-bold text-black/$1');

      if (content !== oldContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        changedFiles++;
        console.log(`Updated contrast in: ${filePath}`);
      }
    });
  });

  console.log(`Total files updated: ${changedFiles}`);
}

replaceTextColors();
