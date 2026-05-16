# Side Button Link Copier

[English](./README.en.md) | [中文](./README.md)

Use mouse side buttons (back/forward) to batch copy similar or same-position links on any webpage. Ideal for scraping list pages, search results, product cards, etc.

## Features

- **Back button (mouse button 3)**: Copy links with **similar structure**  
  Generates a generic CSS path based on the current link (ignoring position differences), selects all `<a>` tags with the same structure on the page, and copies their `href`s.

- **Forward button (mouse button 4)**: Copy links at the **same position**  
  Adds `:nth-child` index to the nearest branch that has multiple same-tag siblings, selecting only elements that share the exact same position as the current link.

## Installation

1. Install the **Tampermonkey** browser extension (supports Chrome / Firefox / Edge, etc.).
2. Create a new userscript, paste the script code, and save.
3. Make sure the script is enabled.

## Usage

1. Hover your mouse over any link you want to use as a template.
2. Press a mouse side button:
   - **Back button (`←`)**: Batch copy all links with similar structure to the current one.
   - **Forward button (`→`)**: Batch copy links at the same position as the current one (e.g., the first item of each list).
3. All links are copied to the system clipboard, separated by newlines.
4. The copied links will briefly flash with a red outline (0.5 seconds) and a notification will show the count.

## Example Scenarios

| Scenario | Recommended Action |
|----------|--------------------|
| Search results page – need to copy all result links | Hover any result link → **Back button** |
| Product listing – need only the "buy" link per product (each product has multiple links) | Hover the first product's "buy" link → **Forward button** |
| Table or card list – copy the link from the second column of each row | Hover a second-column link → **Forward button** (same position) |

## How It Works

The script generates CSS selectors using two strategies:

1. **Without position distinction (Back button)**  
   Does not add `:nth-child` to the path. The resulting selector matches all elements on the page with the same tag and class chain.  
   Example: `div.item a.title` → matches all `.title` links inside `.item`.

2. **With position distinction (Forward button)**  
   Adds `:nth-child(index)` to the nearest level that has multiple same-tag siblings, making the selection more precise.  
   Example: `div.list > a:nth-child(2) .btn` → matches only the button link inside the second item of each list.

## Notes

- **Side button default behavior is overridden** – The back/forward buttons will no longer navigate in the browser; they trigger copying instead. If you rely on side buttons for navigation, use this script with caution or disable it temporarily.
- Works only on `<a>` tags (hover or click on the link itself or its internal elements).
- If no similar structures are found or all matched links have empty `href`, a failure notification will appear.
- Only `href` attributes (absolute URLs) are copied – no text content or other attributes.
- The script requires `GM_setClipboard` and `GM_notification` permissions (already declared at the top of the script).

## Compatibility

- Works on all `http://` and `https://` pages (`@match *://*/*`).
- No third-party libraries – pure native JavaScript.
- Compatible with most modern browsers (Chrome 70+ / Firefox 65+ / Edge 80+).

## FAQ

**Q: Nothing happens when I press the side button.**  
A: Check that your side buttons work normally; look for errors in the browser console; ensure the script is enabled and the page has finished loading.

**Q: Too many or too few links are copied.**  
A: This means the generated CSS selector is not precise enough. Try using the forward button (position‑aware) to narrow the selection, or add unique classes to the containers of your links.

**Q: How do I temporarily restore the side buttons' original navigation function?**  
A: Disable the script in the Tampermonkey menu, or remove `e.preventDefault()` from the script code.

## License

MIT © Bili345679 2026

See the [LICENSE](./LICENSE) file for details.
