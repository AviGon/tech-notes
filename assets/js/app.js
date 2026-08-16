(function () {
  "use strict";

  var root = document.documentElement;
  var contentEl = document.getElementById("content");
  var navTreeEl = document.getElementById("nav-tree");
  var tocEl = document.getElementById("toc");
  var tocListEl = document.getElementById("toc-list");
  var appEl = document.getElementById("app");
  var searchInput = document.getElementById("search-input");

  var manifest = null;
  var searchTerm = "";

  /* ---------- theme ---------- */
  var stored = localStorage.getItem("theme");
  var prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  if (stored) root.setAttribute("data-theme", stored);
  else if (prefersLight) root.setAttribute("data-theme", "light");

  document.getElementById("theme-toggle").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ---------- mobile sidebar ---------- */
  var sidebarEl = document.getElementById("sidebar");
  var scrimEl = document.getElementById("sidebar-scrim");
  document.getElementById("sidebar-toggle").addEventListener("click", function () {
    sidebarEl.classList.add("open");
    scrimEl.classList.add("show");
  });
  scrimEl.addEventListener("click", closeSidebar);
  function closeSidebar() {
    sidebarEl.classList.remove("open");
    scrimEl.classList.remove("show");
  }

  /* ---------- markdown / highlight setup ---------- */
  marked.setOptions({
    highlight: function (code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    }
  });

  function slugify(text) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
  }

  /* ---------- data ---------- */
  function loadManifest() {
    return fetch("content/manifest.json").then(function (r) { return r.json(); });
  }

  function findTopic(catId, topicId) {
    var cat = manifest.categories.filter(function (c) { return c.id === catId; })[0];
    if (!cat) return null;
    var topic = cat.topics.filter(function (t) { return t.id === topicId; })[0];
    if (!topic) return null;
    return { category: cat, topic: topic };
  }

  function allTopicsFlat() {
    var out = [];
    manifest.categories.forEach(function (cat) {
      cat.topics.forEach(function (t) {
        out.push({ category: cat, topic: t });
      });
    });
    return out;
  }

  /* ---------- sidebar ---------- */
  function renderSidebar(activeCatId, activeTopicId) {
    var term = searchTerm.toLowerCase();
    var html = "";
    manifest.categories.forEach(function (cat) {
      var isSoon = cat.status === "soon";
      var topics = cat.topics.filter(function (t) {
        return !term || t.title.toLowerCase().indexOf(term) !== -1;
      });
      if (term && isSoon) return;
      if (term && topics.length === 0) return;

      html += '<div class="nav-category' + (isSoon ? " soon" : "") + '">';
      html += '<div class="nav-cat-head"><span class="emoji">' + cat.emoji + '</span>' + cat.title;
      if (isSoon) html += '<span class="badge">Soon</span>';
      html += '</div>';

      if (!isSoon) {
        html += '<div class="nav-topics">';
        if (topics.length === 0) {
          html += '<div class="nav-empty">' + (term ? "No matches" : "No notes yet — coming soon") + '</div>';
        } else {
          topics.forEach(function (t) {
            var active = cat.id === activeCatId && t.id === activeTopicId;
            html += '<a class="nav-topic' + (active ? " active" : "") + '" href="#/topic/' + cat.id + '/' + t.id + '">' + t.title + '</a>';
          });
        }
        html += '</div>';
      }
      html += '</div>';
    });
    navTreeEl.innerHTML = html;

    navTreeEl.querySelectorAll(".nav-topic").forEach(function (a) {
      a.addEventListener("click", closeSidebar);
    });
  }

  searchInput.addEventListener("input", function () {
    searchTerm = searchInput.value;
    var parts = location.hash.replace(/^#\//, "").split("/");
    renderSidebar(parts[1], parts[2]);
  });

  /* ---------- home view ---------- */
  function renderHome() {
    appEl.classList.remove("has-toc");
    tocListEl.innerHTML = "";

    var cardsHtml = manifest.categories.map(function (cat) {
      var count = cat.topics.length;
      var clickable = cat.status !== "soon" && count > 0;
      var href = clickable ? '#/topic/' + cat.id + '/' + cat.topics[0].id : "#";
      var sub = cat.status === "soon" ? "Coming soon" : (count === 0 ? "No notes yet" : count + (count === 1 ? " note" : " notes"));
      return '<a class="cat-card' + (clickable ? " clickable" : " disabled") + '" href="' + href + '">' +
        '<span class="emoji">' + cat.emoji + '</span>' +
        '<h3>' + cat.title + '</h3>' +
        '<p>' + sub + '</p>' +
        '</a>';
    }).join("");

    contentEl.innerHTML =
      '<div class="home-hero">' +
      '<div class="kicker">Tech Notes</div>' +
      '<h1>Notes to future me.</h1>' +
      '<p>A running set of write-ups on machine learning, systems, and software fundamentals — mostly so I don\'t have to relearn the same thing twice.</p>' +
      '</div>' +
      '<div class="cat-grid">' + cardsHtml + '</div>';
  }

  /* ---------- topic view ---------- */
  function renderTopic(catId, topicId) {
    var found = findTopic(catId, topicId);
    if (!found) {
      contentEl.innerHTML = '<div class="home-hero"><h1>Note not found</h1><p>That note doesn\'t exist yet.</p></div>';
      appEl.classList.remove("has-toc");
      return;
    }

    fetch(found.topic.file)
      .then(function (r) { return r.text(); })
      .then(function (md) {
        var html = marked.parse(md);
        contentEl.innerHTML = '<div class="markdown-body">' + html + '</div>';

        var headings = contentEl.querySelectorAll(".markdown-body h2, .markdown-body h3");
        var tocHtml = "";
        headings.forEach(function (h) {
          var id = slugify(h.textContent);
          h.id = id;
          tocHtml += '<a class="' + h.tagName.toLowerCase() + '" href="#' + id + '">' + h.textContent + '</a>';
        });
        tocListEl.innerHTML = tocHtml;
        appEl.classList.toggle("has-toc", headings.length > 0);

        if (window.renderMathInElement) {
          renderMathInElement(contentEl, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false }
            ]
          });
        }

        window.scrollTo({ top: 0 });
      });

    renderSidebar(catId, topicId);
  }

  /* ---------- router ---------- */
  function route() {
    var hash = location.hash.replace(/^#\//, "");
    var parts = hash.split("/").filter(Boolean);
    if (parts[0] === "topic" && parts[1] && parts[2]) {
      renderTopic(parts[1], parts[2]);
    } else {
      renderHome();
      renderSidebar(null, null);
    }
    closeSidebar();
  }

  loadManifest().then(function (m) {
    manifest = m;
    route();
    window.addEventListener("hashchange", route);
  });
})();
