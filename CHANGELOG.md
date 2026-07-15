# Changelog

## 1.0.0 (2026-07-15)


### Features

* animated wave visualizer jackpot card with canvas-based indigo wave background, amount animation, glow effects ([8cd4a3c](https://github.com/cryptoflops/stacks-jackpot-wall/commit/8cd4a3ccaf91d74fc012f6bb7da2c1b3a6173a6e))
* cinematic GSAP hero redesign for Jackpot Wall landing page ([99affdd](https://github.com/cryptoflops/stacks-jackpot-wall/commit/99affddd8fa2aa904d67f70cd650810d417507a0))
* full landing page - HowItWorks, LiveStats, RecentActivity, enhanced Footer + dark/light theme toggle ([797aef6](https://github.com/cryptoflops/stacks-jackpot-wall/commit/797aef64298b52c375c232a1d939680c6a8ed4ce))


### Bug Fixes

* add _headers to prevent 7-day HTML caching, reduce to 60s with stale-while-revalidate ([4059c44](https://github.com/cryptoflops/stacks-jackpot-wall/commit/4059c44ee27a76f0109d13edfb61bfafa717953f))
* consolidate [@stacks](https://github.com/stacks) packages into single vendor chunk to prevent chunk 404 on Cloudflare ([42f70eb](https://github.com/cryptoflops/stacks-jackpot-wall/commit/42f70eb283c799d0699232041b3fc0c882f8cc78))
* convert next.config.mjs to .js for Cloudflare compatibility, force clean build ([4ef991a](https://github.com/cryptoflops/stacks-jackpot-wall/commit/4ef991ac7385fdb8722c5e595cc893b2ad071a19))
* **design-audit:** fix findings - font weights, custom-scrollbar, skip-link, INJECTED_STYLES removal, focus-visible fix, emoji replacement, GSAP perf, loading state, copyright, mobile nav, canvas fallback, bg consolidation, sonner toasts ([e29ea17](https://github.com/cryptoflops/stacks-jackpot-wall/commit/e29ea17dcb60f05ce8ba266ee103083dc811e343))
* regenerate package-lock.json to fix stale dependency tree causing chunk splits on Cloudflare ([c0cb55f](https://github.com/cryptoflops/stacks-jackpot-wall/commit/c0cb55f58be5092d55ed1d9d463f38049cba3f3b))
* remove webpack cache after build to stay under Cloudflare 25MiB file limit ([d83dc35](https://github.com/cryptoflops/stacks-jackpot-wall/commit/d83dc3546653efeaa35229d5da9df17b160a43bc))
* replace Tailwind CSS variable [@apply](https://github.com/apply) (bg-card, border-border) with direct CSS for Tailwind 3 compatibility ([5eb805c](https://github.com/cryptoflops/stacks-jackpot-wall/commit/5eb805c7bfe07e4b9982d16429d900d53b0dfee1))
* **ui:** accessibility improvements - fixed FOUC with dark loading state, focus-visible rings, reduced-motion support, textarea label, improved empty states with CTAs, WebGL reduced-motion respect ([ab33c88](https://github.com/cryptoflops/stacks-jackpot-wall/commit/ab33c8880b9577244f97f8a072670d5e5376f72a))
