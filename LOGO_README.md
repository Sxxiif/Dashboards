# Logo Setup Guide

This dashboard can support a logo while still working offline.

There are two recommended methods.

## Option 1: Local logo file beside index.html

Use this option if you are okay with having one extra file beside the dashboard.

Folder structure:

```text
index.html
logo.png
```

The logo file must be in the same folder as `index.html`.

Recommended logo file names:

```text
logo.png
logo.svg
logo.webp
```

Recommended size:

```text
256x256 px or higher for square logo
400x120 px or higher for horizontal logo
```

Recommended format:

```text
PNG with transparent background
```

### HTML code example

Place this inside the dashboard header area:

```html
<div class="brand-logo-wrap">
  <img src="logo.png" alt="Dashboard Logo" class="brand-logo" onerror="this.style.display='none'">
  <div class="brand-copy">
    <div class="brand-title">Weekly Operations Dashboard</div>
    <div class="brand-subtitle">Offline VDI Dashboard</div>
  </div>
</div>
```

### CSS code example

Add this inside the `<style>` section:

```css
.brand-logo-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.brand-logo {
  width: 42px;
  height: 42px;
  object-fit: contain;
  border-radius: 12px;
  padding: 6px;
  background: var(--panel-soft, rgba(255,255,255,0.06));
  border: 1px solid var(--border, rgba(255,255,255,0.12));
  flex: 0 0 auto;
}

.brand-copy {
  min-width: 0;
}

.brand-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text, #f8fafc);
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 12px;
  color: var(--muted, #94a3b8);
  margin-top: 2px;
}
```

The `onerror` part prevents the dashboard from looking broken if `logo.png` is missing.

## Option 2: Embed logo inside index.html as Base64

Use this option if you want to keep the dashboard as exactly one file only.

The image is converted into Base64 text and placed inside the `src` attribute.

Example:

```html
<img src="data:image/png;base64,PASTE_BASE64_HERE" alt="Dashboard Logo" class="brand-logo">
```

### How to create Base64 from a logo

If you have Python available:

```python
import base64
from pathlib import Path

logo_path = Path("logo.png")
encoded = base64.b64encode(logo_path.read_bytes()).decode("utf-8")
print(encoded)
```

Then paste the output after:

```text
data:image/png;base64,
```

Full result:

```html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..." alt="Dashboard Logo" class="brand-logo">
```

## Which option should you use?

For testing:

```text
Use logo.png beside index.html
```

For final one-file delivery:

```text
Use Base64 embedded logo
```

## Important GitHub warning

Do not upload a company logo to a public GitHub repository unless you are allowed to publish it.

If the dashboard is public, use a generic placeholder logo or remove the logo before uploading.

## Recommended safe public logo placeholder

You can use a simple text/initial logo inside HTML instead of an image:

```html
<div class="brand-mark">SX</div>
```

CSS:

```css
.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  letter-spacing: 0.04em;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  border: 1px solid rgba(255,255,255,0.18);
}
```

This keeps the repository safe and generic.
