# Playwright On Nix OS

```bash
nix develop -c zsh

pnpm i

pnpm exec playwright test
```


> [!WARNING]
> It cannot find the webkit path correctly so disable the testing on webkit. (Chromium, Firefox works fine.) 


> [!WARNING]
> Use the same playwright version on the nix packages and package.json. Unless they cannot find the browser correctly due to mismatch the browser version.
