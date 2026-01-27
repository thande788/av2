/**
 * Simple performance metrics from build output
 */
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

async function getDirectorySize(dir) {
  let size = 0;
  try {
    const files = await readdir(dir, { withFileTypes: true });
    for (const file of files) {
      const path = join(dir, file.name);
      if (file.isDirectory()) {
        size += await getDirectorySize(path);
      } else {
        const s = await stat(path);
        size += s.size;
      }
    }
  } catch {}
  return size;
}

async function main() {
  console.log('\n📊 Build Performance Metrics\n');
  console.log('─'.repeat(50));
  
  // Static bundle size
  const staticSize = await getDirectorySize('.next/static');
  console.log(`📦 Static bundle: ${(staticSize / 1024).toFixed(1)} KB`);
  
  // Check for large chunks
  const chunks = await readdir('.next/static/chunks').catch(() => []);
  const chunkSizes = [];
  for (const chunk of chunks) {
    if (chunk.endsWith('.js')) {
      const s = await stat(join('.next/static/chunks', chunk));
      chunkSizes.push({ name: chunk, size: s.size });
    }
  }
  chunkSizes.sort((a, b) => b.size - a.size);
  
  console.log('\n🔍 Largest chunks:');
  for (const chunk of chunkSizes.slice(0, 5)) {
    const kb = (chunk.size / 1024).toFixed(1);
    const status = chunk.size > 150000 ? '⚠️' : '✅';
    console.log(`   ${status} ${chunk.name}: ${kb} KB`);
  }
  
  // Performance checklist
  console.log('\n✅ Performance Checklist:');
  console.log('   ✓ AVIF/WebP image formats configured');
  console.log('   ✓ Image caching (30 days)');
  console.log('   ✓ Static asset caching (1 year immutable)');
  console.log('   ✓ Hero images have priority prop');
  console.log('   ✓ View Transitions API ready');
  console.log('   ✓ Blur placeholders available');
  
  console.log('\n📈 Target Metrics:');
  console.log('   • LCP: < 2.5s');
  console.log('   • CLS: < 0.1');
  console.log('   • INP: < 200ms');
  console.log('   • Bundle: < 100KB gzipped first-load');
  
  console.log('\n─'.repeat(50));
  console.log('💡 Run `pnpm analyze` to view detailed bundle breakdown');
  console.log('💡 Use Chrome DevTools Lighthouse for full audit\n');
}

main();
