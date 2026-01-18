// Script postbuild para corregir runtime en archivos de Vercel
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', '.vercel', 'output');

function updateConfigFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Buscar y reemplazar nodejs18.x por nodejs20.x
    if (content.includes('nodejs18.x')) {
      const updated = content.replace(/nodejs18\.x/g, 'nodejs20.x');
      fs.writeFileSync(filePath, updated, 'utf8');
      console.log(`✅ Updated runtime in ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
  } catch (error) {
    // Ignorar errores
  }
  return false;
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️ Directory ${dir} does not exist`);
    return 0;
  }
  
  let updated = 0;
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      // Ignorar directorios especiales y symlinks problemáticos
      if (file === 'proc' || file === 'sys' || file === 'dev') {
        continue;
      }
      
      const filePath = path.join(dir, file);
      
      try {
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          updated += walkDir(filePath);
        } else if (file.endsWith('.json') || file === '.vc-config.json') {
          if (updateConfigFile(filePath)) {
            updated++;
          }
        }
      } catch (error) {
        // Ignorar errores de archivos/directorios inaccesibles (symlinks, permisos, etc.)
        continue;
      }
    }
  } catch (error) {
    // Ignorar errores al leer directorios
  }
  
  return updated;
}

console.log('🔧 Fixing Node.js runtime from 18.x to 20.x...');
const updated = walkDir(outputDir);
console.log(`✅ Updated ${updated} file(s)`);
