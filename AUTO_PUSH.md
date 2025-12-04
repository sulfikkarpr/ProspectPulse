# 🔄 Auto Push Script

If you want to automatically push changes in the future, you can use this script:

## Quick Push Command

```bash
cd /home/sulfikkar/Desktop/ProspectPulse
git add -A
git commit -m "Your commit message here"
git push origin main
```

## Or Create an Alias

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
alias gpush='git add -A && git commit -m "$1" && git push origin main'
```

Then use: `gpush "Your commit message"`

## Current Status

All changes have been committed and are ready to push. Use one of the authentication methods from `GIT_PUSH_AUTH.md` to push.

