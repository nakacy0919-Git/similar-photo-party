// Generate a frozen CSS file from an explicit class safelist, never in the browser.
// Requires Node 22 and exactly tailwindcss@4.1.10 during maintenance.
const fs = require('node:fs');
const path = require('node:path');
const {compile} = require('tailwindcss');

(async function build() {
    const root = path.resolve(__dirname, '..');
    const tailwindRoot = path.resolve(require.resolve('tailwindcss'), '../..');
    const loadedVersion = require(path.join(tailwindRoot, 'package.json')).version;
    if (loadedVersion !== '4.1.10') throw new Error('Expected Tailwind 4.1.10, got ' + loadedVersion);
    const candidates = fs.readFileSync(path.join(root, 'tools/tailwind-candidates.txt'), 'utf8')
        .split(/\r?\n/).map(item => item.trim())
        .filter(item => item && !item.startsWith('#'));
    if (candidates.length < 250 || new Set(candidates).size !== candidates.length) {
        throw new Error('Tailwind candidate safelist is missing or contains duplicates');
    }
    const loadStylesheet = async (id, base) => {
        const file = id === 'tailwindcss' ? path.join(tailwindRoot, 'index.css') : path.resolve(base, id);
        return {content: fs.readFileSync(file, 'utf8'), base: path.dirname(file)};
    };
    const generator = await compile('@import "tailwindcss";', {base: root, loadStylesheet});
    const css = generator.build(candidates);
    const required = [
        '.grid-cols-2', '.hidden', '.md\\\\:flex-row',
        '.hover\\\\:bg-indigo-700', '.bg-gradient-to-r', '.border-4'
    ].map(x => x.replace(/\\\\/g, '\\'));
    for (const selector of required) {
        if (!css.includes(selector)) throw new Error('Missing expected utility: ' + selector);
    }
    if (css.length < 30000 || css.length > 160000) {
        throw new Error('Unexpected compiled CSS size: ' + css.length);
    }
    fs.writeFileSync(path.join(root, 'css/tailwind-static.css'), css);
    console.log('Tailwind classes:', candidates.length, 'CSS bytes:', Buffer.byteLength(css));
})().catch(error => { console.error(error); process.exitCode = 1; });
