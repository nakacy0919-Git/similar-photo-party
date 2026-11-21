const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const read = file => fs.readFileSync(file, 'utf8');
const pages = ['index.html', 'privacy.html'];
const csp = page => {
    const tag = page.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)">/i);
    assert.ok(tag, 'CSP meta tag must be present');
    return tag[1];
};

test('deleted password gate must not reappear on the review branch', () => {
    assert.equal(fs.existsSync('lock.js'), false, 'do not ship plaintext client-side passwords');
    for (const file of pages) {
        const html = read(file);
        assert.doesNotMatch(html, /(?:src=["'][^"']*lock\.js|CORRECT_PASSWORD|prompt\s*\()/i);
    }
});

test('scripts are local, and inline executable event handlers are forbidden', () => {
    for (const file of pages) {
        const html = read(file);
        for (const match of html.matchAll(/<script\b([^>]*)>/gi)) {
            const src = match[1].match(/\bsrc=["']([^"']+)["']/i);
            assert.ok(src, 'inline <script> is not allowed');
            assert.match(src[1], /^(?:js\/)[a-z0-9/_-]+\.js$/i, 'only local JS files');
        }
        assert.doesNotMatch(html, /\son[a-z]+\s*=/i, 'no inline event handlers');
        assert.doesNotMatch(html, /<base\b/i);
    }
});

test('CSP restricts script execution and remote connections', () => {
    for (const file of pages) {
        const policy = csp(read(file));
        for (const directive of [
            "default-src 'self'",
            "script-src 'self'",
            "connect-src 'self'",
            "img-src 'self' data:",
            "media-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'none'",
            "frame-src 'none'"
        ]) {
            assert.ok(policy.includes(directive), file + ': missing ' + directive);
        }
        assert.doesNotMatch(policy, /unsafe-eval|script-src[^;]*unsafe-inline|default-src\s+\*/i);
        // canvas-confetti may use an in-memory worker; no remote worker origin is permitted.
        assert.match(policy, /worker-src 'self' blob:/);
    }
});

test('all third-party CSS is explicitly allowed and duplicate font requests are removed', () => {
    const html = read('index.html');
    const privacy = read('privacy.html');
    const css = read('css/style.css');
    for (const body of [html, privacy, css]) {
        assert.doesNotMatch(body, /fonts\.googleapis\.com|fonts\.gstatic\.com/i);
    }
    assert.match(csp(html), /style-src 'self' https:\/\/cdnjs\.cloudflare\.com/);
    assert.match(csp(html), /font-src 'self' https:\/\/cdnjs\.cloudflare\.com/);
    assert.match(html, /href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/6\.4\.0\/css\/all\.min\.css"/);
    assert.doesNotMatch(privacy, /<style\b/i, 'privacy page CSS should be declarative');
});

test('external navigation prevents new-window access to the game', () => {
    for (const file of pages) {
        const html = read(file);
        for (const match of html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)) {
            assert.match(match[0], /rel=["'][^"']*noopener[^"']*noreferrer[^"']*["']/i);
        }
    }
});

test('third-party icon CSS uses pinned integrity and does not leak referrer', () => {
    const html = read('index.html');
    const link = html.match(/<link\s+[^>]*href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/6\.4\.0\/css\/all\.min\.css"[^>]*>/i);
    assert.ok(link, 'known pinned icon stylesheet expected');
    const digest = link[0].match(/integrity="sha512-([A-Za-z0-9+/=]+)"/);
    assert.ok(digest, 'SRI sha512 digest required');
    assert.equal(Buffer.from(digest[1], 'base64').length, 64, 'SHA-512 digest length must be 64 bytes');
    assert.match(link[0], /crossorigin="anonymous"/);
    assert.match(link[0], /referrerpolicy="no-referrer"/);
});

test('static CSS replaces browser-side Tailwind and forbids inline styling', () => {
    const staticCss = read('css/tailwind-static.css');
    const customCss = read('css/style.css');
    assert.equal(fs.existsSync('js/vendor/tailwind.js'), false, 'do not re-ship runtime CSS compiler');
    for (const page of pages) {
        const html = read(page);
        assert.match(html, /href="css\/tailwind-static\.css"/);
        assert.doesNotMatch(html, /<script[^>]+tailwind/i);
        assert.doesNotMatch(html, /\bstyle=["']/i, 'CSP prohibits inline style attributes');
        assert.doesNotMatch(html, /<style\b/i, 'CSP prohibits inline style blocks');
        const policy = csp(html);
        assert.match(policy, /style-src 'self' https:\/\/cdnjs\.cloudflare\.com/);
        assert.doesNotMatch(policy, /'unsafe-inline'|'unsafe-eval'/i);
    }
    assert.match(customCss, /#result-layout-img\s*\{\s*flex-basis:\s*60%/);
    assert.ok(staticCss.length > 30000 && staticCss.length < 160000);
    assert.match(staticCss, /tailwindcss v4\.1\.10/i);
    assert.doesNotMatch(staticCss, /@import\b|url\(["']?https?:\/\//i);
});

test('precompiled stylesheet covers every safelisted utility class, including mobile and interactive variants', () => {
    const stylesheet = read('css/tailwind-static.css');
    const candidateText = read('tools/tailwind-candidates.txt');
    const candidates = candidateText.split(/\r?\n/).map(x => x.trim()).filter(x => x && !x.startsWith('#'));
    assert.ok(candidates.length >= 250, 'incomplete candidate list');
    assert.equal(new Set(candidates).size, candidates.length, 'duplicate candidate classes');
    const escapeCss = value => value.replace(/[^A-Za-z0-9_-]/g, char => '\\' + char);
    const missing = candidates.filter(value => !stylesheet.includes('.' + escapeCss(value)));
    assert.deepEqual(missing, [], 'static CSS must include all utility selectors');
    for (const critical of ['grid-cols-2', 'md:flex-row', 'hover:bg-indigo-700', 'bg-gradient-to-r', 'ring-yellow-200']) {
        assert.ok(candidates.includes(critical), 'missing critical interactive utility ' + critical);
    }
});

test('all static source utility classes are explicitly safelisted or owned by local styles', () => {
    const utilities = new Set(read('tools/tailwind-candidates.txt').split(/\r?\n/).map(x => x.trim()).filter(x => x && !x.startsWith('#')));
    const custom = new Set([...read('css/style.css').matchAll(/\.([a-z][a-z0-9_-]*)/gi)].map(x => x[1]));
    const hookOnly = new Set(['no-scrollbar', 'feedback-check', 'memory-time-select-btn', 'time-select-btn', 'hint-mode-btn']);
    const sourceClasses = new Set();
    const addClasses = words => words.split(/\s+/).filter(Boolean).forEach(word => sourceClasses.add(word));

    for (const page of pages) {
        for (const match of read(page).matchAll(/\bclass=["']([^"']+)["']/g)) addClasses(match[1]);
    }
    const game = read('js/game.js');
    for (const match of game.matchAll(/\.className\s*(?:\+?=)\s*(['"])(.*?)\1/g)) addClasses(match[2]);
    for (const call of game.matchAll(/\.classList\.(?:add|remove|toggle)\(([^)]*)\)/g)) {
        for (const quoted of call[1].matchAll(/['"]([^'"]+)['"]/g)) addClasses(quoted[1]);
    }
    const missing = [...sourceClasses].filter(name => !utilities.has(name) && !custom.has(name) &&
        !hookOnly.has(name) && !name.startsWith('fa-') && !name.startsWith('$' + '{'));
    assert.deepEqual(missing, [], 'new utility classes must be added to tools/tailwind-candidates.txt');
});

test('remaining GitHub Actions workflows have read-only permissions and no deployment steps', () => {
    const names = fs.readdirSync('.github/workflows').filter(name => /\.ya?ml$/.test(name));
    assert.ok(names.includes('gameplay-checks.yml'));
    assert.equal(names.includes('static-css-build.yml'), false, 'one-time compiler workflow must be removed');
    for (const name of names) {
        const workflow = read('.github/workflows/' + name);
        assert.match(workflow, /contents:\s*read/);
        assert.doesNotMatch(workflow, /contents:\s*write|pages:\s*write|deployments:\s*write|id-token:\s*write/i);
        assert.doesNotMatch(workflow, /\bvercel\b|\bgh-pages\b|actions\/deploy-pages/i);
    }
});
