# site-ethnoflow

The public landing page for **[EthnoFlow](https://github.com/uscabayaosj/ethnoflow)**
(local-first field workbench for TikTok digital ethnography).

A single static page — no build step, no framework — deployed via GitHub Pages.
Structure and design system are adapted from EthnoFlow's sibling site,
[fieldscribe-site](https://github.com/uscabayaosj/fieldscribe-site), but the palette,
fonts, and copy are EthnoFlow's own: the CSS custom properties mirror
`src/styles/theme.css` in the app itself (viridian primary, ochre accent, warm paper
background), light and dark, right down to the hex values.

**Live site:** https://uscabayaosj.github.io/site-ethnoflow/

## Structure

```
index.html            # The entire page
assets/
├── css/style.css      # All styling — palette lifted from the app's theme.css
├── js/main.js         # Citation copy-to-clipboard + live release/download links
└── img/
    ├── logo.png, favicon-*.png    # Generated from scripts/app-icon.png in ethnoflow
    └── screens/                   # Product screenshots from scripts/out/ in ethnoflow
```

## Local preview

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Updating screenshots / icon

Regenerate `assets/img/` from the `ethnoflow` repo's `scripts/app-icon.png` and
`scripts/out/*.png` (produced by that repo's screenshot script) whenever the app's UI
or icon changes meaningfully. There's no build step — just resize and drop the PNGs in.

## Download links

`assets/js/main.js` fetches `https://api.github.com/repos/uscabayaosj/ethnoflow/releases/latest`
at page load and rewrites each platform's download button to the matching asset
(`.dmg` ×2 for macOS, `.exe`/`.msi` for Windows, `.AppImage`/`.deb`/`.rpm` for Linux) —
matched by filename pattern, so it keeps working automatically as
`ethnoflow`'s version-bump + release-build workflows cut new releases. The static
`href`s already in the HTML point at `/releases/latest`, so downloads still work
correctly even with JavaScript disabled or the GitHub API unreachable.

## License

MIT · © Ulysses Cabayao 2026
