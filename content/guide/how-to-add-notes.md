# How This Site Works

This is a plain markdown-powered notes app — no build step, no server. Every page you're reading is rendered client-side from a `.md` file.

## Adding a new note

1. Drop a markdown file in `content/<category>/your-note.md`.
2. Add an entry to `content/manifest.json` under the right category:

```json
{ "id": "your-note", "title": "Your Note Title", "file": "content/ml/your-note.md" }
```

3. Commit and push. That's it — no rebuild required.

## Adding a new category

Add a new object to the `categories` array in `manifest.json`:

```json
{
  "id": "os",
  "title": "Operating Systems",
  "emoji": "🖥️",
  "status": "active",
  "topics": []
}
```

Set `"status": "soon"` to show it in the sidebar as disabled ("Coming soon") until it has real notes.

## What you can use in a note

**Code blocks** with syntax highlighting:

```python
def gradient_descent(x, lr=0.01, steps=100):
    for _ in range(steps):
        x -= lr * grad(x)
    return x
```

**Math**, inline like $y = mx + b$, or as a block:

$$
\hat{y} = \sigma(w^T x + b)
$$

**Tables**, blockquotes, images, and everything else standard markdown supports.

> Keep notes short and specific — a page per concept beats one giant wall of text.

## Search

The search box in the sidebar filters by note title as you type. Once there are enough notes, this is the fastest way to jump around.
