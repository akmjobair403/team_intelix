(() => {
  "use strict";
  const API = "/api";
  const $ = (id) => document.getElementById(id);
  const uid = () => "sb_" + Math.random().toString(36).slice(2, 10);
  const sample = {
    members: [
      {
        id: "m1",
        name: "Aarav Rahman",
        role: "Founder · Full-stack Engineer",
        bio: "Turns ambitious product ideas into resilient systems. Loves clean architecture, thoughtful interfaces and solving the hard part first.",
        skills: ["Full-stack", "React", "Node.js", "System Design"],
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        x: "https://x.com",
        portfolio: "",
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=85",
      },
      {
        id: "m2",
        name: "Nadia Islam",
        role: "Creative Director · UI/UX",
        bio: "Connects human insight with visual systems to make digital products feel clear, confident and a little unexpected.",
        skills: ["Product Design", "Figma", "Branding", "Research"],
        github: "",
        linkedin: "https://linkedin.com",
        x: "",
        portfolio: "https://www.behance.net",
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=85",
      },
      {
        id: "m3",
        name: "Rafi Chowdhury",
        role: "Security & Backend Engineer",
        bio: "Builds dependable infrastructure and privacy-minded experiences. Curious about cryptography, distributed systems and the details others miss.",
        skills: ["Cybersecurity", "Python", "Linux", "APIs"],
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        x: "https://x.com",
        portfolio: "",
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=85",
      },
      {
        id: "m4",
        name: "Maya Sen",
        role: "Motion & Frontend Developer",
        bio: "Brings interfaces to life with purposeful motion, accessible frontends and a strong eye for the tiny details that make a product memorable.",
        skills: ["JavaScript", "Motion", "CSS", "Accessibility"],
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        x: "",
        portfolio: "https://www.behance.net",
        image:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=85",
      },
    ],
    projects: [
      {
        id: "p1",
        title: "NEXUS / Secure Social",
        description:
          "A privacy-first social experience concept with encrypted conversations, identity controls and a community-led feed architecture.",
        stack: ["React", "Node.js", "WebCrypto", "PostgreSQL"],
        url: "https://github.com",
        image:
          "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=85",
      },
      {
        id: "p2",
        title: "ORBIT / Insight Engine",
        description:
          "A data storytelling dashboard that turns complex signals into useful decisions through a focused interface and real-time visual language.",
        stack: ["Next.js", "TypeScript", "D3.js", "Supabase"],
        url: "https://github.com",
        image:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=85",
      },
      {
        id: "p3",
        title: "AFTERGLOW / Digital Identity",
        description:
          "An expressive identity system and responsive web experience for a new creative community, built around motion, clarity and connection.",
        stack: ["Figma", "React", "Framer Motion", "CSS"],
        url: "https://github.com",
        image:
          "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&q=85",
      },
    ],
    faqs: [
      {
        id: "f1",
        question: "What does Spider Bite actually do?",
        answer:
          "We design and build digital products, web experiences and technical systems. Our work can span product strategy, interface design, frontend and backend engineering, automation and security-minded implementation.",
      },
      {
        id: "f2",
        question: "Can we bring you an early-stage idea?",
        answer:
          "Absolutely. We enjoy shaping ideas from the first sketch. We can help clarify the problem, define a practical scope and turn the strongest direction into a working prototype or product.",
      },
      {
        id: "f3",
        question: "How does a typical collaboration work?",
        answer:
          "We start with a conversation about your goals, audience and constraints. Then we align on scope and milestones, share progress in short feedback loops, and deliver documented work you can maintain.",
      },
      {
        id: "f4",
        question: "Are you open to partnerships or new teammates?",
        answer:
          "Yes. If you have a thoughtful collaboration proposal, complementary skills or a project that deserves a sharp team, send us a note through the inquiry terminal.",
      },
    ],
    settings: { email: "hello@spiderbite.dev" },
  };
  let state = structuredClone(sample);
  async function save() {
    const response = await fetch(`${API}/content`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(state),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        data.error || "Could not save changes. Please sign in again and retry.",
      );
    }
    return true;
  }
  async function loadRemoteStore() {
    const response = await fetch(`${API}/content`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!response.ok) throw new Error("The content service is unavailable.");
    const parsed = await response.json();
    state = {
      ...sample,
      ...parsed,
      settings: { ...sample.settings, ...(parsed.settings || {}) },
    };
  }
  async function commitChanges() {
    try {
      await save();
      return true;
    } catch (err) {
      alert(err.message);
      try {
        await loadRemoteStore();
        renderPublic();
        renderAdmin();
      } catch {}
      return false;
    }
  }
  function safeUrl(url) {
    try {
      const u = new URL(url);
      return ["http:", "https:"].includes(u.protocol) ? u.href : "#";
    } catch {
      return "#";
    }
  }
  function esc(v = "") {
    return String(v).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }
  function initials(name = "SB") {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((x) => x[0] || "")
      .join("")
      .toUpperCase();
  }
  function renderPublic() {
    const grid = $("teamGrid"),
      projects = $("projectGrid"),
      faq = $("faqList");
    if (!grid) return;
    grid.innerHTML = state.members
      .map(
        (m, i) =>
          `<article class="glass-card member-card tilt-card"><div class="member-photo"><span class="member-index">0${i + 1} / SB</span><img src="${esc(m.image || "")}" alt="${esc(m.name)}" loading="lazy" onerror="this.src='https://placehold.co/700x800/11131d/00f0ff?text=${encodeURIComponent(initials(m.name))}'"></div><div class="member-info"><h3>${esc(m.name)}</h3><div class="member-role">${esc(m.role)}</div><p>${esc(m.bio)}</p><div class="tag-row">${(m.skills || []).map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div><div class="social-links">${[
            ["GH", m.github],
            ["IN", m.linkedin],
            ["𝕏", m.x],
            ["↗", m.portfolio],
          ]
            .filter((x) => x[1])
            .map(
              (x) =>
                `<a href="${esc(safeUrl(x[1]))}" target="_blank" rel="noreferrer">${x[0]}</a>`,
            )
            .join("")}</div></div></article>`,
      )
      .join("");
    if (projects)
      projects.innerHTML = state.projects
        .map(
          (p) =>
            `<article class="glass-card project-card tilt-card"><div class="project-image"><img src="${esc(p.image || "")}" alt="${esc(p.title)} thumbnail" loading="lazy" onerror="this.src='https://placehold.co/1000x600/11131d/ff1e56?text=SPIDER+BITE'"></div><div class="project-body"><div class="eyebrow">SELECTED WORK / ${esc(p.id.slice(-2).toUpperCase())}</div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="tag-row">${(p.stack || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div><div class="project-links">${p.url ? `<a href="${esc(safeUrl(p.url))}" target="_blank" rel="noreferrer">SOURCE / PREVIEW ↗</a>` : ""}</div></div></article>`,
        )
        .join("");
    if (faq)
      faq.innerHTML = state.faqs
        .map(
          (f, i) =>
            `<article class="faq-item"><button class="faq-question" type="button" aria-expanded="false"><span>${String(i + 1).padStart(2, "0")} / ${esc(f.question)}</span><span>＋</span></button><div class="faq-answer">${esc(f.answer)}</div></article>`,
        )
        .join("");
    const email = state.settings.email || "hello@spiderbite.dev";
    if ($("contactEmail")) {
      $("contactEmail").textContent = email;
      $("contactEmail").href = "mailto:" + email;
    }
    if ($("footerEmail")) {
      $("footerEmail").textContent = email + " ↗";
      $("footerEmail").href = "mailto:" + email;
    }
    if ($("year")) $("year").textContent = new Date().getFullYear();
    setupTilt();
    setupSpotlight();
  }
  function setupTilt() {
    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        if (e.pointerType === "touch") return;
        const r = card.getBoundingClientRect(),
          x = (e.clientX - r.left) / r.width,
          y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-3px)`;
      });
      card.addEventListener("pointerleave", () => (card.style.transform = ""));
    });
  }
  let spotlightIndex = 0,
    spotTimer = null,
    spotPaused = false,
    spotTransitioning = false,
    spotTransitionToken = 0;
  function spotlightMarkup(m, index) {
    return `<img class="spotlight-photo" src="${esc(m.image || "")}" alt="${esc(m.name)}" onerror="this.src='https://placehold.co/600x700/11131d/eeeeee?text=SB'"><div class="spotlight-text"><div class="eyebrow">SPOTLIGHT / ${String(index + 1).padStart(2, "0")}</div><h3>${esc(m.name)}</h3><div class="member-role">${esc(m.role)}</div><p>“${esc(m.bio)}”</p><div class="tag-row">${(m.skills || []).map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div></div>`;
  }
  function paintSpotlight(index, animate = false) {
    const stage = $("spotlightContent");
    if (!stage) return;
    const members = Array.isArray(state.members) ? state.members : [];
    if (!members.length) {
      stage.innerHTML =
        '<p class="spotlight-empty">Add team members in the admin panel to populate this spotlight.</p>';
      spotlightIndex = 0;
      $("spotlightCount").textContent = "00 / 00";
      return;
    }
    spotlightIndex =
      ((index % members.length) + members.length) % members.length;
    stage.classList.remove("spot-out-up", "spot-in-up");
    stage.innerHTML = spotlightMarkup(members[spotlightIndex], spotlightIndex);
    if (animate) {
      void stage.offsetWidth;
      stage.classList.add("spot-in-up");
    }
    $("spotlightCount").textContent =
      `${String(spotlightIndex + 1).padStart(2, "0")} / ${String(members.length).padStart(2, "0")}`;
  }
  function showSpotlight(direction = 1) {
    const members = Array.isArray(state.members) ? state.members : [];
    const stage = $("spotlightContent");
    if (!stage || !members.length || spotTransitioning) return;
    if (members.length === 1) {
      paintSpotlight(0);
      return;
    }
    spotTransitioning = true;
    const token = ++spotTransitionToken;
    stage.classList.remove("spot-in-up");
    stage.classList.add("spot-out-up");
    setTimeout(() => {
      if (token !== spotTransitionToken) return;
      paintSpotlight(spotlightIndex + direction, true);
      setTimeout(() => {
        if (token === spotTransitionToken) {
          stage.classList.remove("spot-in-up");
          spotTransitioning = false;
        }
      }, 500);
    }, 260);
  }
  function setupSpotlight() {
    if (!$("spotlightContent")) return;
    clearInterval(spotTimer);
    spotTransitioning = false;
    spotTransitionToken++;
    paintSpotlight(0, false);
    spotTimer = setInterval(() => {
      if (!spotPaused && !spotTransitioning && state.members.length > 1)
        showSpotlight(1);
    }, 4200);
  }
  if ($("spotNext"))
    $("spotNext").addEventListener("click", () => showSpotlight(1));
  if ($("spotPrev"))
    $("spotPrev").addEventListener("click", () => showSpotlight(-1));
  if ($("spotPause"))
    $("spotPause").addEventListener("click", () => {
      spotPaused = !spotPaused;
      $("spotPause").textContent = spotPaused ? "▶" : "Ⅱ";
    });
  if ($("spotlightStage")) {
    $("spotlightStage").addEventListener(
      "mouseenter",
      () => (spotPaused = true),
    );
    $("spotlightStage").addEventListener(
      "mouseleave",
      () => (spotPaused = false),
    );
  }
  const faqTypingTimers = new WeakMap();
  if ($("faqList"))
    $("faqList").addEventListener("click", (e) => {
      const btn = e.target.closest(".faq-question");
      if (!btn) return;
      const item = btn.closest(".faq-item"),
        answer = item.querySelector(".faq-answer"),
        open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      btn.querySelector("span:last-child").textContent = open ? "−" : "＋";
      const prior = faqTypingTimers.get(answer);
      if (prior) prior.forEach(clearInterval);
      if (open) {
        const question = btn
          .querySelector("span:first-child")
          .textContent.replace(/^\d+\s*\/\s*/, "");
        const full = answer.dataset.full || answer.textContent;
        answer.dataset.full = full;
        answer.innerHTML =
          '<span class="faq-query-line"></span><span class="faq-answer-line"></span>';
        const qLine = answer.querySelector(".faq-query-line"),
          aLine = answer.querySelector(".faq-answer-line");
        let qi = 0,
          ai = 0;
        const timers = [];
        const qTimer = setInterval(() => {
          qLine.textContent = "> " + question.slice(0, ++qi);
          if (qi >= question.length) {
            clearInterval(qTimer);
            const aTimer = setInterval(() => {
              aLine.textContent = full.slice(0, ++ai);
              if (ai >= full.length) clearInterval(aTimer);
            }, 11);
            timers.push(aTimer);
          }
        }, 16);
        timers.push(qTimer);
        faqTypingTimers.set(answer, timers);
      } else {
        answer.textContent = answer.dataset.full || answer.textContent;
      }
    });
  if ($("transmitBtn"))
    $("transmitBtn").addEventListener("click", () => {
      const q = $("customQuestion").value.trim();
      if (!q) {
        $("customQuestion").focus();
        $("customQuestion").placeholder =
          "Type a message before transmitting...";
        return;
      }
      const email = state.settings.email || "hello@spiderbite.dev";
      const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent("Spider Bite Inquiry")}&body=${encodeURIComponent(q)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  if ($("menuToggle"))
    $("menuToggle").addEventListener("click", () =>
      $("mainNav").classList.toggle("open"),
    );
  if ($("mainNav"))
    $("mainNav").addEventListener("click", (e) => {
      if (e.target.closest("a")) $("mainNav").classList.remove("open");
    });
  /* Admin console */
  let memberImageData = "",
    projectImageData = "";
  async function checkAdminSession() {
    const response = await fetch(`${API}/session`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    return response.ok;
  }
  async function adminInit() {
    if (!$("loginPanel")) return;
    if (await checkAdminSession()) unlock();
    $("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const button = $("loginForm").querySelector('button[type="submit"]');
      button.disabled = true;
      $("loginError").textContent = "Authenticating…";
      try {
        const response = await fetch(`${API}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            username: $("loginUser").value,
            password: $("loginPass").value,
          }),
        });
        if (!response.ok)
          throw new Error("Access denied. Check your credentials.");
        $("loginError").textContent = "";
        $("loginPass").value = "";
        unlock();
      } catch (err) {
        $("loginError").textContent = err.message;
      } finally {
        button.disabled = false;
      }
    });
    $("logoutBtn").addEventListener("click", async () => {
      await fetch(`${API}/logout`, {
        method: "POST",
        credentials: "same-origin",
      });
      $("dashboard").hidden = true;
      $("adminHeaderActions").hidden = true;
      $("loginPanel").hidden = false;
    });
    document.querySelectorAll(".admin-tab").forEach((b) =>
      b.addEventListener("click", () => {
        document
          .querySelectorAll(".admin-tab")
          .forEach((x) => x.classList.toggle("active", x === b));
        document
          .querySelectorAll(".admin-pane")
          .forEach((x) =>
            x.classList.toggle("active", x.id === "pane-" + b.dataset.tab),
          );
      }),
    );
    bindAdminForms();
  }
  function unlock() {
    $("loginPanel").hidden = true;
    $("dashboard").hidden = false;
    $("adminHeaderActions").hidden = false;
    renderAdmin();
  }
  function renderAdmin() {
    if (!$("dashboard")) return;
    $("memberCount").textContent =
      String(state.members.length).padStart(2, "0") + " TOTAL";
    $("projectCount").textContent =
      String(state.projects.length).padStart(2, "0") + " TOTAL";
    $("memberAdminList").innerHTML = state.members
      .map((m, i) => record(m, m.name, m.role, i, "member"))
      .join("");
    $("projectAdminList").innerHTML = state.projects
      .map((p, i) =>
        record(p, p.title, (p.stack || []).join(" · "), i, "project"),
      )
      .join("");
    $("faqAdminList").innerHTML = state.faqs
      .map(
        (f, i) =>
          `<div class="admin-record"><div class="record-avatar">${String(i + 1).padStart(2, "0")}</div><div><h3>${esc(f.question)}</h3><p>${esc(f.answer.slice(0, 90))}${f.answer.length > 90 ? "…" : ""}</p></div><div class="record-actions"><button data-action="edit" data-kind="faq" data-id="${f.id}">EDIT</button><button class="danger" data-action="delete" data-kind="faq" data-id="${f.id}">DELETE</button></div></div>`,
      )
      .join("");
    $("teamEmail").value = state.settings.email || "";
  }
  function record(obj, title, sub, i, kind) {
    return `<div class="admin-record"><img src="${esc(obj.image || "https://placehold.co/100x100/11131d/00f0ff?text=SB")}" alt=""><div><h3>${esc(title)}</h3><p>${esc(sub || "")}</p></div><div class="record-actions">${kind === "member" ? `<button data-action="up" data-kind="${kind}" data-id="${obj.id}" ${i === 0 ? "disabled" : ""}>↑</button><button data-action="down" data-kind="${kind}" data-id="${obj.id}" ${i === state.members.length - 1 ? "disabled" : ""}>↓</button>` : ""}<button data-action="edit" data-kind="${kind}" data-id="${obj.id}">EDIT</button><button class="danger" data-action="delete" data-kind="${kind}" data-id="${obj.id}">DELETE</button></div></div>`;
  }
  function bindAdminForms() {
    $("memberImage").addEventListener("change", (e) =>
      handleImage(
        e.target.files[0],
        "memberPreview",
        (v) => (memberImageData = v),
      ),
    );
    $("projectImage").addEventListener("change", (e) =>
      handleImage(
        e.target.files[0],
        "projectPreview",
        (v) => (projectImageData = v),
      ),
    );
    $("memberForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = $("memberId").value || uid(),
        old = state.members.find((x) => x.id === id);
      const obj = {
        id,
        name: $("memberName").value.trim(),
        role: $("memberRole").value.trim(),
        bio: $("memberBio").value.trim(),
        skills: split($("memberSkills").value),
        github: $("memberGithub").value.trim(),
        linkedin: $("memberLinkedin").value.trim(),
        x: $("memberX").value.trim(),
        portfolio: $("memberPortfolio").value.trim(),
        image: memberImageData || (old && old.image) || "",
      };
      const i = state.members.findIndex((x) => x.id === id);
      if (i >= 0) state.members[i] = obj;
      else state.members.push(obj);
      if (!(await commitChanges())) return;
      clearMember();
      renderAdmin();
      $("memberFormNote").textContent = "Saved. Public page updated.";
    });
    $("projectForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = $("projectId").value || uid(),
        old = state.projects.find((x) => x.id === id);
      const obj = {
        id,
        title: $("projectTitle").value.trim(),
        description: $("projectDescription").value.trim(),
        stack: split($("projectStack").value),
        url: $("projectUrl").value.trim(),
        image: projectImageData || (old && old.image) || "",
      };
      const i = state.projects.findIndex((x) => x.id === id);
      if (i >= 0) state.projects[i] = obj;
      else state.projects.push(obj);
      if (!(await commitChanges())) return;
      clearProject();
      renderAdmin();
    });
    $("faqForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = $("faqId").value || uid(),
        obj = {
          id,
          question: $("faqQuestion").value.trim(),
          answer: $("faqAnswer").value.trim(),
        },
        i = state.faqs.findIndex((x) => x.id === id);
      if (i >= 0) state.faqs[i] = obj;
      else state.faqs.push(obj);
      if (!(await commitChanges())) return;
      clearFaq();
      renderAdmin();
    });
    $("settingsForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      state.settings.email = $("teamEmail").value.trim();
      if (!(await commitChanges())) return;
      $("settingsNote").textContent = "Contact destination updated.";
    });
    $("cancelMember").onclick = clearMember;
    $("cancelProject").onclick = clearProject;
    $("cancelFaq").onclick = clearFaq;
    document.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-action]");
      if (!b) return;
      const { action, kind, id } = b.dataset;
      const arr =
        kind === "member"
          ? state.members
          : kind === "project"
            ? state.projects
            : state.faqs;
      const i = arr.findIndex((x) => x.id === id);
      if (i < 0) return;
      if (action === "delete") {
        if (confirm("Delete this item?")) {
          arr.splice(i, 1);
          if (!(await commitChanges())) return;
          renderAdmin();
        }
      } else if (action === "up" || action === "down") {
        const j = i + (action === "up" ? -1 : 1);
        if (j >= 0 && j < arr.length) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          if (!(await commitChanges())) return;
          renderAdmin();
        }
      } else if (action === "edit") {
        const o = arr[i];
        if (kind === "member") {
          $("memberId").value = o.id;
          $("memberName").value = o.name;
          $("memberRole").value = o.role;
          $("memberBio").value = o.bio;
          $("memberSkills").value = (o.skills || []).join(", ");
          $("memberGithub").value = o.github || "";
          $("memberLinkedin").value = o.linkedin || "";
          $("memberX").value = o.x || "";
          $("memberPortfolio").value = o.portfolio || "";
          memberImageData = o.image || "";
          preview("memberPreview", memberImageData);
          $("memberFormTitle").textContent = "Edit member";
          document.querySelector('[data-tab="members"]').click();
        } else if (kind === "project") {
          $("projectId").value = o.id;
          $("projectTitle").value = o.title;
          $("projectDescription").value = o.description;
          $("projectStack").value = (o.stack || []).join(", ");
          $("projectUrl").value = o.url || "";
          projectImageData = o.image || "";
          preview("projectPreview", projectImageData);
          $("projectFormTitle").textContent = "Edit project";
          document.querySelector('[data-tab="projects"]').click();
        } else {
          $("faqId").value = o.id;
          $("faqQuestion").value = o.question;
          $("faqAnswer").value = o.answer;
          $("faqFormTitle").textContent = "Edit FAQ";
        }
      }
    });
  }
  function split(v) {
    return v
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  function preview(id, data) {
    const el = $(id);
    el.src = data || "";
    el.hidden = !data;
  }
  function clearMember() {
    $("memberForm").reset();
    $("memberId").value = "";
    memberImageData = "";
    preview("memberPreview", "");
    $("memberFormTitle").textContent = "Add a member";
  }
  function clearProject() {
    $("projectForm").reset();
    $("projectId").value = "";
    projectImageData = "";
    preview("projectPreview", "");
    $("projectFormTitle").textContent = "Add a project";
  }
  function clearFaq() {
    $("faqForm").reset();
    $("faqId").value = "";
    $("faqFormTitle").textContent = "Add a FAQ";
  }
  function handleImage(file, previewId, setter) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1100,
          scale = Math.min(1, max / Math.max(img.width, img.height)),
          canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas
          .getContext("2d")
          .drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL("image/jpeg", 0.78);
        setter(data);
        preview(previewId, data);
      };
      img.onerror = () => alert("Could not read that image.");
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
  async function bootSpiderBite() {
    try {
      await loadRemoteStore();
      renderPublic();
      await adminInit();
    } catch (err) {
      console.error(err);
      if ($("loginError"))
        $("loginError").textContent =
          "Cannot reach the secure server. Start the Node.js server and reload.";
      if ($("teamGrid"))
        $("teamGrid").innerHTML =
          '<p class="spotlight-empty">The portfolio content service is temporarily unavailable.</p>';
    }
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", bootSpiderBite, {
      once: true,
    });
  else bootSpiderBite();
  window.addEventListener("pageshow", () => {
    if (
      $("spotlightContent") &&
      (!$("spotlightContent").children.length ||
        !$("spotlightContent").querySelector(".spotlight-text"))
    )
      setupSpotlight();
  });
})();
