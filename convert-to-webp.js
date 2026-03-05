const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/hp/Desktop/Senu web/my-next-app/public/destination/galle';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));

files.forEach(f => {
    const input = path.join(dir, f);
    const output = input.replace('.jpg', '.webp');
    console.log(`Converting ${f}...`);
    try {
        execSync(`npx -y sharp-cli -i "${input}" -o "${output}"`);
        console.log(`Finished ${f}`);
    } catch (e) {
        console.error(`Failed to convert ${f}: ${e.message}`);
    }
});
