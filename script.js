(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ----- Rotating Scripture: a new verse on every refresh -----
  var VERSES = [
    {t:"I was glad when they said to me, 'Let us go to the house of the Lord.'", r:"Psalm 122:1"},
    {t:"Be strong and courageous. Do not be afraid, for the Lord your God will be with you wherever you go.", r:"Joshua 1:9"},
    {t:"I can do all things through Christ who strengthens me.", r:"Philippians 4:13"},
    {t:"For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you.", r:"Jeremiah 29:11"},
    {t:"The Lord is my shepherd; I shall not want.", r:"Psalm 23:1"},
    {t:"Trust in the Lord with all your heart, and lean not on your own understanding.", r:"Proverbs 3:5"},
    {t:"Those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles.", r:"Isaiah 40:31"},
    {t:"Come to me, all you who are weary and burdened, and I will give you rest.", r:"Matthew 11:28"},
    {t:"God is our refuge and strength, an ever-present help in trouble.", r:"Psalm 46:1"},
    {t:"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", r:"John 3:16"},
    {t:"And we know that in all things God works for the good of those who love him.", r:"Romans 8:28"},
    {t:"This is the day that the Lord has made; let us rejoice and be glad in it.", r:"Psalm 118:24"},
    {t:"His mercies are new every morning; great is your faithfulness.", r:"Lamentations 3:22-23"},
    {t:"Now faith is the assurance of things hoped for, the conviction of things not seen.", r:"Hebrews 11:1"},
    {t:"Enter his gates with thanksgiving and his courts with praise.", r:"Psalm 100:4"},
    {t:"If anyone is in Christ, he is a new creation; the old has passed away, the new has come.", r:"2 Corinthians 5:17"},
    {t:"The Lord your God is in your midst, a mighty one who will save.", r:"Zephaniah 3:17"},
    {t:"Taste and see that the Lord is good; blessed is the one who takes refuge in him.", r:"Psalm 34:8"},
    {t:"Fear not, for I am with you; be not dismayed, for I am your God.", r:"Isaiah 41:10"},
    {t:"As for me and my house, we will serve the Lord.", r:"Joshua 24:15"}
  ];
  (function(){
    var vt = document.getElementById("verseText"), vr = document.getElementById("verseRef");
    if (vt && vr){ var v = VERSES[Math.floor(Math.random() * VERSES.length)];
      vt.innerHTML = "“" + v.t + "”"; vr.textContent = v.r; }
  })();

  document.querySelectorAll("[data-splittext]").forEach(function(el){
    var nodes = Array.prototype.slice.call(el.childNodes), frag = document.createDocumentFragment(), i = 0;
    nodes.forEach(function(node){
      if (node.nodeType === 3){
        node.textContent.split(/(\s+)/).forEach(function(tok){
          if (tok.trim() === ""){ frag.appendChild(document.createTextNode(tok)); return; }
          var w = document.createElement("span"); w.className = "word";
          var inner = document.createElement("span"); inner.textContent = tok;
          inner.style.setProperty("--i", i++); w.appendChild(inner); frag.appendChild(w);
        });
      } else if (node.nodeType === 1){
        var w2 = document.createElement("span"); w2.className = "word";
        node.style.setProperty("--i", i++); node.style.display = "inline-block";
        w2.appendChild(node); frag.appendChild(w2);
      }
    });
    el.innerHTML = ""; el.appendChild(frag); el.classList.add("reveal-text");
  });

  var revealEls = document.querySelectorAll(".reveal:not(.in), .reveal-text, .wm-photo");
  if (reduce || !("IntersectionObserver" in window)){
    revealEls.forEach(function(el){ el.classList.add("in"); }); countUpAll();
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add("in"); if (e.target.id === "stats") countUpAll(); io.unobserve(e.target); }
      });
    }, { threshold:0.12, rootMargin:"0px 0px -8% 0px" });
    revealEls.forEach(function(el){ io.observe(el); });
    var statsEl = document.getElementById("stats"); if (statsEl) io.observe(statsEl);
  }

  var counted = false;
  function countUpAll(){
    if (counted) return; counted = true;
    document.querySelectorAll(".num[data-count]").forEach(function(el){
      var target = parseInt(el.getAttribute("data-count"),10) || 0, suffix = el.getAttribute("data-suffix") || "";
      if (reduce){ el.textContent = target.toLocaleString() + suffix; return; }
      var start = performance.now(), dur = 1600;
      function step(now){
        var p = Math.min((now - start)/dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString() + (p===1?suffix:"");
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  var nav = document.getElementById("nav"), toTop = document.getElementById("toTop"), progress = document.getElementById("progress"), ticking = false;
  function onScroll(){
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (h > 0 ? y/h : 0) + ")";
    nav.classList.toggle("scrolled", y > 40);
    toTop.classList.toggle("show", y > 700);
    ticking = false;
  }
  window.addEventListener("scroll", function(){ if (!ticking){ requestAnimationFrame(onScroll); ticking = true; } }, { passive:true });
  onScroll();
  toTop.addEventListener("click", function(){ window.scrollTo({ top:0, behavior: reduce ? "auto" : "smooth" }); });

  var toggle = document.getElementById("menuToggle"), links = document.getElementById("navlinks"), scrim = document.getElementById("navScrim");
  function setMenu(open){
    links.classList.toggle("open", open);
    toggle.classList.toggle("is-open", open);
    if (scrim) scrim.classList.toggle("show", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  (function(){
    var tmoved = false;
    function flip(){ setMenu(!links.classList.contains("open")); }
    toggle.addEventListener("touchstart", function(){ tmoved = false; }, { passive: true });
    toggle.addEventListener("touchmove", function(){ tmoved = true; }, { passive: true });
    toggle.addEventListener("touchend", function(e){ if (tmoved) return; if (e.cancelable) e.preventDefault(); flip(); });
    toggle.addEventListener("click", flip);
  })();
  if (scrim) scrim.addEventListener("click", function(){ setMenu(false); });
  links.addEventListener("click", function(e){ if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape" && links.classList.contains("open")) setMenu(false); });

  var form = document.getElementById("subForm"), msg = document.getElementById("subMsg");
  form.addEventListener("submit", function(e){ e.preventDefault(); msg.textContent = "Amen — you're on the list! 🙌"; form.reset(); });
  document.getElementById("year").textContent = new Date().getFullYear();

  // ----- Sub-group logos: tap/click to colorize (hover handled in CSS) -----
  document.querySelectorAll(".logo-item").forEach(function(btn){
    btn.addEventListener("click", function(){ btn.classList.toggle("active"); });
  });

  // ----- Fellowship panels: click/tap to expand (one at a time) -----
  (function(){
    var group = document.querySelector(".split-panels");
    if (!group) return;
    var panels = group.querySelectorAll(".panel");
    panels.forEach(function(p){
      function toggle(){
        var wasActive = p.classList.contains("active");
        panels.forEach(function(x){ x.classList.remove("active"); });
        if (!wasActive) p.classList.add("active");
        group.classList.toggle("has-active", !wasActive);
      }
      p.addEventListener("click", toggle);
      p.addEventListener("keydown", function(e){ if (e.key === "Enter" || e.key === " "){ e.preventDefault(); toggle(); } });
    });
  })();

  // ----- Modal (Tenets) -----
  function openModal(m){
    m.classList.add("open"); m.setAttribute("aria-hidden","false"); document.body.classList.add("modal-open");
    requestAnimationFrame(function(){ m.classList.add("show"); });
  }
  function closeModal(m){
    m.classList.remove("show"); m.setAttribute("aria-hidden","true"); document.body.classList.remove("modal-open");
    setTimeout(function(){ m.classList.remove("open"); }, 340);
  }
  document.querySelectorAll("[data-modal]").forEach(function(btn){
    function open(){ var m = document.getElementById(btn.getAttribute("data-modal")); if (m) openModal(m); }
    btn.addEventListener("click", open);
    var tmoved = false;
    btn.addEventListener("touchstart", function(){ tmoved = false; }, { passive: true });
    btn.addEventListener("touchmove", function(){ tmoved = true; }, { passive: true });
    btn.addEventListener("touchend", function(e){ if (tmoved) return; if (e.cancelable) e.preventDefault(); open(); }, { passive: false });
    if (btn.tagName !== "BUTTON"){
      btn.addEventListener("keydown", function(e){ if (e.key === "Enter" || e.key === " "){ e.preventDefault(); open(); } });
    }
  });
  document.querySelectorAll(".modal [data-close]").forEach(function(el){
    el.addEventListener("click", function(){ closeModal(el.closest(".modal")); });
  });
  document.addEventListener("keydown", function(e){
    if (e.key === "Escape"){ var open = document.querySelector(".modal.open"); if (open) closeModal(open); }
  });

  var fine = window.matchMedia("(pointer:fine)").matches;
  if (!reduce && fine){
    // hero cursor parallax removed — hero text stays still
    document.querySelectorAll("[data-tilt]").forEach(function(card){
      var raf = false, rx = 0, ry = 0, mx = 50, my = 50;
      card.addEventListener("pointermove", function(ev){
        var r = card.getBoundingClientRect(), cx = (ev.clientX - r.left)/r.width, cy = (ev.clientY - r.top)/r.height;
        ry = (cx - .5) * 10; rx = (.5 - cy) * 10; mx = cx*100; my = cy*100;
        if (!raf){ requestAnimationFrame(function(){
          card.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-6px)";
          card.style.setProperty("--mx", mx + "%"); card.style.setProperty("--my", my + "%"); raf = false;
        }); raf = true; }
      });
      card.addEventListener("pointerleave", function(){ card.style.transform = ""; });
    });
    // magnetic hover effect removed — buttons stay still
  }
})();
(function(){
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".teams-tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".team-panel"));
  if (!tabs.length) return;
  function activate(id){
    tabs.forEach(function(t){ var on = t.getAttribute("data-team") === id; t.classList.toggle("is-active", on); t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1; });
    panels.forEach(function(p){ p.classList.toggle("is-active", p.getAttribute("data-team") === id); });
  }
  tabs.forEach(function(t, i){
    t.addEventListener("click", function(){ activate(t.getAttribute("data-team")); });
    var tmoved2 = false;
    t.addEventListener("touchstart", function(){ tmoved2 = false; }, { passive: true });
    t.addEventListener("touchmove", function(){ tmoved2 = true; }, { passive: true });
    t.addEventListener("touchend", function(e){ if (tmoved2) return; if (e.cancelable) e.preventDefault(); activate(t.getAttribute("data-team")); }, { passive: false });
    t.addEventListener("keydown", function(e){
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (next){ e.preventDefault(); next.focus(); activate(next.getAttribute("data-team")); }
    });
  });
})();
(function(){
  var els = document.querySelectorAll(".svc-status");
  if (!els.length) return;
  function upd(){
    var now = new Date(), day = now.getDay(), m = now.getHours()*60 + now.getMinutes();
    els.forEach(function(e){
      var d = +e.getAttribute("data-day"), s = +e.getAttribute("data-start"), en = +e.getAttribute("data-end");
      e.classList.remove("live","ended"); e.textContent = "";
      if (day !== d) return;
      if (m >= s && m < en){ e.classList.add("live"); e.textContent = "Started"; }
      else if (m >= en){ e.classList.add("ended"); e.textContent = "Closed"; }
    });
  }
  upd();
  setInterval(upd, 30000);
})();

(function(){
  var sub = document.getElementById("subForm"), toast = document.getElementById("toast"), timer;
  if (!sub || !toast) return;
  sub.addEventListener("submit", function(e){
    e.preventDefault();
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");
    try { sub.reset(); } catch (_){ }
    clearTimeout(timer);
    timer = setTimeout(function(){ toast.classList.remove("show"); }, 4200);
  });
})();

/* Songbook PDF: open & download that survive sandboxes and hosting alike */
(function(){
  function openPdf(url){
    var w = window.open(url, "_blank");
    if (w) return;                     // normal case (hosted / local): clean URL
    fetch(url).then(function(r){ return r.blob(); }).then(function(b){
      var o = URL.createObjectURL(b);
      var w2 = window.open(o, "_blank");
      if (!w2) window.location.href = o;
      setTimeout(function(){ URL.revokeObjectURL(o); }, 60000);
    }).catch(function(){ window.location.href = url; });
  }
  function downloadPdf(url, name){
    fetch(url).then(function(r){ return r.blob(); }).then(function(b){
      var o = URL.createObjectURL(b), t = document.createElement("a");
      t.href = o; t.download = name || "songbook.pdf";
      document.body.appendChild(t); t.click(); t.remove();
      setTimeout(function(){ URL.revokeObjectURL(o); }, 60000);
    }).catch(function(){
      var t = document.createElement("a");
      t.href = url; t.download = name || "songbook.pdf";
      document.body.appendChild(t); t.click(); t.remove();
    });
  }
  document.querySelectorAll("a.hymn-cover, .hymn-actions a:not([download])").forEach(function(a){
    a.addEventListener("click", function(e){ e.preventDefault(); openPdf(a.getAttribute("href")); });
  });
  document.querySelectorAll(".hymn-actions a[download]").forEach(function(a){
    a.addEventListener("click", function(e){ e.preventDefault(); downloadPdf(a.getAttribute("href"), a.getAttribute("download")); });
  });
})();

/* Watch: YouTube live player modal */
(function(){
  var modal = document.getElementById("watchModal");
  if (!modal) return;
  var player = document.getElementById("watchPlayer");
  var frame = modal.querySelector(".watch-frame");
  var fullBtn = document.getElementById("watchFull");
  var openYt = document.getElementById("watchOpen");

  /* === Replace with your YouTube channel ID (looks like "UCxxxxxxxx") === */
  var CHANNEL = "REPLACE_WITH_YOUR_CHANNEL_ID";
  var EMBED = "https://www.youtube.com/embed/live_stream?channel=" + CHANNEL + "&autoplay=1&rel=0";
  var CHANNEL_URL = "https://www.youtube.com/channel/" + CHANNEL + "/live";
  if (openYt) openYt.href = CHANNEL_URL;

  function load(){ if (player && !player.src) player.src = EMBED; }
  function stop(){ if (player) player.src = ""; }

  document.querySelectorAll('[data-modal="watchModal"]').forEach(function(b){
    b.addEventListener("click", load);
    b.addEventListener("touchend", load, { passive: true });
  });
  modal.querySelectorAll("[data-close]").forEach(function(el){ el.addEventListener("click", stop); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") stop(); });

  if (fullBtn) fullBtn.addEventListener("click", function(){
    var el = frame || player;
    var req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (req){ try { req.call(el); return; } catch (e){} }
    if (player && player.webkitEnterFullscreen){ try { player.webkitEnterFullscreen(); } catch (e){} }
  });
})();

/* Visitor registration form → auto-emails the church via Web3Forms */
(function(){
  var form = document.getElementById("visitForm");
  if (!form) return;
  var status = document.getElementById("visitStatus");
  var btn = form.querySelector(".vf-submit");
  form.addEventListener("submit", function(e){
    e.preventDefault();
    if (!form.checkValidity()){ form.reportValidity(); return; }
    var pl = document.getElementById("vfPhone"), ph = form.querySelector('input[name="phone"]');
    var digits = (pl ? pl.value : "").replace(/\D/g, "").replace(/^0/, "");
    if (digits.length !== 9){ status.className = "vf-status err"; status.textContent = "Please enter a valid 9-digit Ghana number."; if (pl) pl.focus(); return; }
    if (ph) ph.value = "+233 " + digits;
    status.className = "vf-status"; status.textContent = "Sending…";
    if (btn) btn.disabled = true;
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: new FormData(form)
    }).then(function(r){ return r.json(); }).then(function(res){
      if (res.success){
        status.className = "vf-status ok";
        status.textContent = "Thank you! We've received your details and can't wait to welcome you.";
        form.reset();
      } else {
        status.className = "vf-status err";
        status.textContent = (res && res.message) ? res.message : "Something went wrong — please try again.";
      }
    }).catch(function(){
      status.className = "vf-status err";
      status.textContent = "Network error — please check your connection and try again.";
    }).then(function(){ if (btn) btn.disabled = false; });
  });
})();

/* Watch button is live only during the Sunday service window (9:40–11:30 AM) */
(function(){
  var btns = document.querySelectorAll(".watch-btn");
  if (!btns.length) return;
  function upd(){
    var now = new Date(), day = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
    var live = (day === 0 && m >= 580 && m < 690);
    btns.forEach(function(b){
      b.disabled = !live;
      b.classList.toggle("is-live", live);
      b.setAttribute("aria-label", live ? "Watch the service live now" : "Live on Sundays, 9:40 to 11:30 AM");
      var t = b.querySelector(".wb-text");
      if (t) t.textContent = live ? "Watch Live" : "Watch";
    });
  }
  upd();
  setInterval(upd, 30000);
})();
