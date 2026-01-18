// Integración de Astro para corregir el runtime de Node.js después del build
import type { AstroIntegration } from 'astro';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function fixVercelRuntime(): AstroIntegration {
  return {
    name: 'fix-vercel-runtime',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        // El adapter de Vercel genera archivos en .vercel/output
        const outputDir = path.join(process.cwd(), '.vercel', 'output');
        
        logger.info('🔧 Checking for Vercel output files...');
        
        if (!fs.existsSync(outputDir)) {
          logger.warn('⚠️ .vercel/output directory not found, skipping runtime fix');
          return;
        }

        logger.info('🔧 Fixing Node.js runtime from 18.x to 20.x...');
        let updated = 0;

        function updateConfigFile(filePath: string): boolean {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Buscar y reemplazar nodejs18.x por nodejs20.x
            if (content.includes('nodejs18.x')) {
              const updatedContent = content.replace(/nodejs18\.x/g, 'nodejs20.x');
              fs.writeFileSync(filePath, updatedContent, 'utf8');
              logger.info(`✅ Updated runtime in ${path.relative(process.cwd(), filePath)}`);
              return true;
            }
          } catch (error) {
            // Ignorar errores
          }
          return false;
        }

        function walkDir(dir: string): number {
          if (!fs.existsSync(dir)) {
            return 0;
          }
          
          let count = 0;
          const files = fs.readdirSync(dir);
          
          for (const file of files) {
            const filePath = path.join(dir, file);
            let stat: fs.Stats;
            
            try {
              stat = fs.statSync(filePath);
            } catch {
              continue;
            }
            
            if (stat.isDirectory()) {
              count += walkDir(filePath);
            } else if (file.endsWith('.json') || file === '.vc-config.json') {
              if (updateConfigFile(filePath)) {
                count++;
              }
            }
          }
          
          return count;
        }

        // Usar un delay para asegurar que el adapter de Vercel termine de escribir los archivos
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        updated = walkDir(outputDir);
        logger.info(`✅ Updated ${updated} file(s) with Node.js 20.x runtime`);
      },
    },
  };
}

export default fixVercelRuntime;
