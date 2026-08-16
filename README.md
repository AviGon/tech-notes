# tech-notes

Personal technical notes — machine learning, operating systems, OOP, and more — published at [avigon.github.io/tech-notes](https://avigon.github.io/tech-notes/).

A small client-side markdown app: no build step, no server. See [content/guide/how-to-add-notes.md](content/guide/how-to-add-notes.md) (or the "Guide" section on the site itself) for how to add a new note or category.

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

## Local preview

```bash
python -m http.server 8000
# open http://localhost:8000
```
