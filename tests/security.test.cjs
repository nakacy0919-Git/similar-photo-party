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
    assert.match(csp(html), /style-src 'self' 'unsafe-inline' https:\/\/cdnjs\.cloudflare\.com/);
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
