# tech-notes

Personal technical notes — machine learning, operating systems, OOP, and more — published at [avigon.github.io/tech-notes](https://avigon.github.io/tech-notes/).

A small client-side markdown app: no build step, no server.

## Structure

```
content/
  manifest.json       # defines categories and their notes
  <category>/*.md      # the notes themselves
assets/
  css/style.css
  js/app.js
index.html
```

## Adding a new note

1. Drop a markdown file in `content/<category>/your-note.md`.
2. Add an entry to `content/manifest.json` under the right category:

   ```json
   { "id": "your-note", "title": "Your Note Title", "file": "content/ml/your-note.md" }
   ```

3. Commit and push. No rebuild required.

## Adding a new category

Add a new object to the `categories` array in `manifest.json`. Set `"status": "soon"` to show it in the sidebar as disabled ("Coming soon") until it has real notes.

## Local preview

```bash
python -m http.server 8000
# open http://localhost:8000
```
