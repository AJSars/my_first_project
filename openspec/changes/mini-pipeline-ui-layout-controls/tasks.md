## 1. Markup structure

- [x] 1.1 Restructure `index.html` into a labeled **main controls** `<section>` (creation, **editing** affordances as present, linking, load, save/export JSON file) and a **graph controls** `<section>` adjacent to the canvas (Reset zoom, Cleanup)
- [x] 1.2 Move **Reset zoom** and **Cleanup** out of the main toolbar into graph controls only; remove duplicate buttons

## 2. Styling

- [x] 2.1 Update `styles.css` for spacing, headings, and responsive stacking so both regions read clearly

## 3. Save

- [x] 3.1 Implement **Save / Export** in `app.js`: build v2 JSON from current state; trigger download of a **local `.json` file** (Blob + object URL); no upload
- [x] 3.2 Use a sensible default filename and pretty-print JSON for readability

## 4. Cleanup alignment

- [x] 4.1 Confirm `graph-geometry.js` Cleanup (or app glue) matches **left-to-right** bipartite intent; tweak comments or column gaps only if needed—**no** graph data mutations

## 5. Docs

- [x] 5.1 Update `README.md` with main vs graph control areas and the save feature
