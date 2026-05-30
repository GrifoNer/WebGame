const fs = require('fs');
const path = require('path');

console.log('\n🔍 ПРОВЕРКА PWA КОМПОНЕНТОВ\n');

const publicDir = path.join(__dirname, 'public');

// Проверяем manifest.json
const manifestPath = path.join(publicDir, 'manifest.json');
if (fs.existsSync(manifestPath)) {
    console.log('✅ manifest.json найден');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log('   - name:', manifest.name);
    console.log('   - short_name:', manifest.short_name);
    console.log('   - start_url:', manifest.start_url);
    console.log('   - display:', manifest.display);
} else {
    console.log('❌ manifest.json НЕ найден!');
}

// Проверяем sw.js
const swPath = path.join(publicDir, 'sw.js');
if (fs.existsSync(swPath)) {
    console.log('✅ sw.js найден');
} else {
    console.log('❌ sw.js НЕ найден!');
}

// Проверяем иконки
const iconsDir = path.join(publicDir, 'icons');
if (fs.existsSync(iconsDir)) {
    const icons = fs.readdirSync(iconsDir);
    console.log(`✅ Папка icons найдена (${icons.length} файлов)`);
    
    const requiredIcons = ['icon-72.png', 'icon-96.png', 'icon-128.png', 'icon-144.png', 'icon-152.png', 'icon-192.png', 'icon-256.png', 'icon-384.png', 'icon-512.png'];
    const missingIcons = requiredIcons.filter(icon => !icons.includes(icon));
    
    if (missingIcons.length > 0) {
        console.log('⚠️ Отсутствуют иконки:', missingIcons.join(', '));
    } else {
        console.log('✅ Все необходимые иконки присутствуют');
    }
} else {
    console.log('❌ Папка icons НЕ найдена!');
}

// Проверяем index.html на наличие PWA мета-тегов
const indexPath = path.join(publicDir, 'index.html');
if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, 'utf8');
    
    const checks = [
        { name: 'manifest link', pattern: /<link rel="manifest" href="manifest.json">/ },
        { name: 'viewport', pattern: /<meta name="viewport"/ },
        { name: 'theme-color', pattern: /<meta name="theme-color"/ },
        { name: 'apple-mobile-web-app-capable', pattern: /<meta name="apple-mobile-web-app-capable"/ }
    ];
    
    console.log('\n📄 Проверка index.html:');
    checks.forEach(check => {
        if (check.pattern.test(html)) {
            console.log(`   ✅ ${check.name} найден`);
        } else {
            console.log(`   ❌ ${check.name} НЕ найден`);
        }
    });
}

console.log('\n🌐 Проверка через HTTPS:');
console.log('   PWA работает только через HTTPS или localhost');
console.log('   Текущий адрес: http://localhost:3002');
console.log('   ✅ localhost считается безопасным\n');

console.log('📱 Для установки PWA:');
console.log('   1. Откройте Chrome/Edge на localhost:3002');
console.log('   2. Нажмите F12 → Application → Manifest');
console.log('   3. Проверьте, что нет ошибок');
console.log('   4. В адресной строке должна появиться иконка установки 📱\n');