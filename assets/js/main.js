// Copy-to-clipboard for citation blocks
document.querySelectorAll('[data-copy-target]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var target = document.getElementById(btn.getAttribute('data-copy-target'));
    if (!target) return;
    var text = target.innerText;

    var done = function () {
      var original = btn.textContent;
      btn.textContent = 'Copied';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 1600);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text, done);
      });
    } else {
      fallbackCopy(text, done);
    }
  });
});

function fallbackCopy(text, cb) {
  var el = document.createElement('textarea');
  el.value = text;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(el);
  cb();
}

// ---------------------------------------------------------------------
// Live release info — keeps every download link pointed at whatever
// GitHub currently reports as the latest release, without editing this
// page by hand each time version-bump.yml cuts a new one. Falls back to
// the static hrefs already in the HTML (GitHub's own /releases/latest
// redirect) if the API is unreachable or rate-limited.
// ---------------------------------------------------------------------

var REPO = 'ethnoflow';
var OWNER = 'uscabayaosj';
var CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function fetchLatestRelease() {
  var cacheKey = 'ef-release-' + OWNER + '-' + REPO;
  try {
    var cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    if (cached && (Date.now() - cached.ts) < CACHE_TTL_MS) {
      return Promise.resolve(cached.data);
    }
  } catch (e) {}

  return fetch('https://api.github.com/repos/' + OWNER + '/' + REPO + '/releases/latest', {
    headers: { Accept: 'application/vnd.github+json' }
  })
    .then(function (res) { if (!res.ok) throw new Error('release fetch failed'); return res.json(); })
    .then(function (data) {
      try { localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: data })); } catch (e) {}
      return data;
    })
    .catch(function () { return null; });
}

function findAsset(assets, matchFn) {
  return assets.find(matchFn) || null;
}

function wireAsset(linkId, release, matchFn) {
  var el = document.getElementById(linkId);
  if (!el || !release || !Array.isArray(release.assets)) return null;
  var asset = findAsset(release.assets, matchFn);
  if (asset) el.href = asset.browser_download_url;
  return asset;
}

fetchLatestRelease().then(function (release) {
  if (!release || !Array.isArray(release.assets)) return;
  var assets = release.assets;
  var version = release.tag_name || '';

  // macOS: two .dmg builds — Apple Silicon (aarch64) and Intel (x64).
  wireAsset('dl-mac-arm', release, function (a) {
    return /aarch64.*\.dmg$/i.test(a.name);
  });
  wireAsset('dl-mac-intel', release, function (a) {
    return /(^|[^a])x64[._].*\.dmg$/i.test(a.name) || (/\.dmg$/i.test(a.name) && !/aarch64/i.test(a.name));
  });

  // Windows: NSIS .exe is the primary, .msi offered as an alternative.
  wireAsset('dl-win-exe', release, function (a) { return /\.exe$/i.test(a.name); });
  wireAsset('dl-win-msi', release, function (a) { return /\.msi$/i.test(a.name); });

  // Linux: AppImage is the primary (works on most distros unmodified),
  // .deb / .rpm offered as alternatives.
  wireAsset('dl-linux-appimage', release, function (a) { return /\.appimage$/i.test(a.name); });
  wireAsset('dl-linux-deb', release, function (a) { return /\.deb$/i.test(a.name); });
  wireAsset('dl-linux-rpm', release, function (a) { return /\.rpm$/i.test(a.name); });

  document.querySelectorAll('[data-version-text]').forEach(function (el) {
    el.textContent = version;
  });

  // Hero button: point it at whichever platform the visitor is likely on.
  var heroBtn = document.getElementById('hero-download-btn');
  if (heroBtn) {
    var ua = navigator.userAgent || '';
    var target = 'dl-mac-arm';
    var label = 'Download for Mac';
    if (/Windows/i.test(ua)) {
      target = 'dl-win-exe';
      label = 'Download for Windows';
    } else if (/Linux/i.test(ua) && !/Android/i.test(ua)) {
      target = 'dl-linux-appimage';
      label = 'Download for Linux';
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      target = 'dl-mac-arm';
      label = 'Download for Mac';
    } else {
      heroBtn = null; // Unknown platform (mobile, etc.) — leave the default "See downloads" link.
    }
    if (heroBtn) {
      var matched = document.getElementById(target);
      if (matched && matched.href) {
        heroBtn.href = matched.href;
        heroBtn.textContent = label;
      }
    }
  }
});

// GitHub star count in header
var githubStars = document.getElementById('github-stars');
if (githubStars) {
  fetch('https://api.github.com/repos/' + OWNER + '/' + REPO, {
    headers: { Accept: 'application/vnd.github+json' }
  })
    .then(function (res) { if (!res.ok) throw new Error('repo fetch failed'); return res.json(); })
    .then(function (data) {
      if (data.stargazers_count !== undefined) {
        githubStars.textContent = '★ ' + data.stargazers_count;
      }
    })
    .catch(function () {
      // If fetch fails, just leave the fallback text
    });
}
