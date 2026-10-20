(function () {
  var root = document.documentElement;
  var colors = { light: "#f2f0ea", dark: "#0b0b0a" };

  // ---- theme ----

  function applyTheme(theme) {
    root.dataset.theme = theme;
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) {
      m.removeAttribute("media");
      m.setAttribute("content", colors[theme]);
    });
    var btn = document.querySelector(".theme-btn");
    if (btn) {
      btn.textContent = theme === "dark" ? "Theme: dark" : "Theme: light";
      btn.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " theme");
    }
  }

  applyTheme(root.dataset.theme || "dark");

  var themeBtn = document.querySelector(".theme-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.dataset.theme === "dark" ? "light" : "dark";
      try { localStorage.setItem("theme", next); } catch (e) {}
      applyTheme(next);
    });
  }

  // ---- phone menu ----

  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");

  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.querySelector(".menu-label").textContent = open ? "Close" : "Menu";
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      setMenu(!nav.classList.contains("open"));
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && !nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
    });
  }

  // ---- 404: show the path that failed ----

  document.querySelectorAll(".trace").forEach(function (el) { el.textContent = location.pathname; });

  // ---- filings: Escape goes back to the index ----

  var escape = document.querySelector("[data-escape]");

  // ---- uptime counter in the operator record ----

  var uptime = document.querySelector("[data-uptime]");
  if (uptime) {
    var start = Date.parse(uptime.dataset.uptime);
    var tick = function () {
      var s = Math.floor((Date.now() - start) / 1000);
      var d = Math.floor(s / 86400);
      var h = Math.floor((s % 86400) / 3600);
      var m = Math.floor((s % 3600) / 60);
      uptime.textContent = d + "d " + h + "h " + m + "m " + (s % 60) + "s";
    };
    tick();
    setInterval(tick, 1000);
  }

  // ---- command palette ----

  var routes = [
    { label: "home", hint: "/", href: "/" },
    { label: "writings", hint: "/writings/", href: "/writings/" },
    { label: "projects", hint: "/projects/", href: "/projects/" },
    { label: "RFC-0001 the tool nobody asked for", hint: "read", href: "/writings/the-tool-nobody-asked-for/" },
    { label: "RFC-0002 runbooks are love letters", hint: "read", href: "/writings/runbooks-are-love-letters/" },
    { label: "RFC-0003 deprecate yourself gracefully", hint: "read", href: "/writings/deprecate-yourself-gracefully/" },
    { label: "x.com/internaltooling", hint: "new tab", href: "https://x.com/internaltooling", external: true },
    { label: "toggle theme", hint: "action", action: function () { themeBtn && themeBtn.click(); } }
  ];

  var dialog = document.createElement("dialog");
  dialog.className = "palette";
  dialog.setAttribute("aria-label", "Command palette");
  dialog.innerHTML = '<input type="text" placeholder="Jump to…" aria-label="Search pages" autocomplete="off" spellcheck="false"><ul role="listbox"></ul>';
  document.body.appendChild(dialog);
  var input = dialog.querySelector("input");
  var list = dialog.querySelector("ul");
  var active = 0;
  var shown = [];

  function render() {
    var q = input.value.trim().toLowerCase();
    shown = routes.filter(function (r) { return r.label.toLowerCase().indexOf(q) !== -1; });
    active = Math.min(active, Math.max(shown.length - 1, 0));
    list.innerHTML = "";
    if (!shown.length) {
      list.innerHTML = '<li class="empty">no route matches. try "rfc".</li>';
      return;
    }
    shown.forEach(function (r, i) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = r.href || "#";
      a.className = i === active ? "active" : "";
      if (r.external) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
      a.innerHTML = "<b></b><span></span>";
      a.firstChild.textContent = r.label;
      a.lastChild.textContent = r.hint;
      a.addEventListener("click", function (e) {
        if (r.action) { e.preventDefault(); r.action(); }
        dialog.close();
      });
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function openPalette() {
    input.value = "";
    active = 0;
    render();
    dialog.showModal();
    input.focus();
  }

  input.addEventListener("input", function () { active = 0; render(); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); active = (active + 1) % Math.max(shown.length, 1); render(); }
    if (e.key === "ArrowUp") { e.preventDefault(); active = (active - 1 + shown.length) % Math.max(shown.length, 1); render(); }
    if (e.key === "Enter" && shown[active]) { e.preventDefault(); list.querySelectorAll("a")[active].click(); }
  });
  dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });

  document.querySelectorAll(".palette-btn").forEach(function (b) { b.addEventListener("click", openPalette); });
  document.addEventListener("keydown", function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (e.key === "Escape" && escape && !dialog.open && !typing && !(nav && nav.classList.contains("open"))) { location.href = escape.href; return; }
    if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing && !dialog.open)) {
      e.preventDefault();
      openPalette();
    }
  });
})();
