(() => {
  const $ = (sel) => document.querySelector(sel);

  const DATA = window.APP_DATA;
  const LS_KEY = "TS4KZ_VOCAB_STATE_V1";

  const state = loadState() || {
    user: null,
    screen: "login", // login | modules | lessons | vocab | teacher
    moduleId: null,
    lessonId: null,
  };

  function saveState() {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }
  function loadState() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch { return null; }
  }

  function toast(msg) {
    let t = $("#toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._tm);
    t._tm = setTimeout(() => t.classList.remove("show"), 1400);
  }

  function escapeHtml(s=""){
    return String(s).replace(/[&<>"']/g, m => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  function getModule(id){ return DATA.modules.find(m => m.id === id); }
  function getLesson(mid, lid){
    const m = getModule(mid);
    return m?.lessons?.find(l => l.id === lid);
  }

  function render() {
    const root = $("#app");
    root.innerHTML = `
      <div class="wrap">
        ${topbar()}
        ${screen()}
      </div>
    `;
    bind();
  }

  function topbar(){
    const who = state.user ? `${state.user.role === "teacher" ? "TEACHER" : "STUDENT"} • ${state.user.login}` : "OFFLINE";
    return `
      <div class="topbar">
        <div class="brand">
          <img src="img/logo.png" onerror="this.style.display='none'" alt="logo">
          <div>
            <div class="t1">${escapeHtml(DATA.appTitle || "Visual Vocabulary")}</div>
            <div class="t2">Book-based • EN/RU • Images • Audio</div>
          </div>
        </div>
        <div class="pills">
          <div class="pill"><b>Status:</b> ${escapeHtml(who)}</div>
          <div class="pill"><b>Mode:</b> ${escapeHtml(state.screen)}</div>
        </div>
      </div>
    `;
  }

  function screen(){
    if (state.screen === "login") return loginScreen();
    if (state.screen === "modules") return modulesScreen();
    if (state.screen === "lessons") return lessonsScreen();
    if (state.screen === "vocab") return vocabScreen();
    if (state.screen === "teacher") return teacherScreen();
    return loginScreen();
  }

  function loginScreen(){
    return `
      <div class="grid cols-2" style="margin-top:14px">
        <div class="card">
          <h2>Student Login</h2>
          <div class="sub">Введите логин класса и PIN.</div>

          <div class="field">
            <div class="sub">Login</div>
            <input class="input" id="loginStudent" placeholder="например: 4GL1" autocomplete="off">
          </div>
          <div class="field">
            <div class="sub">PIN</div>
            <input class="input" id="pinStudent" placeholder="PIN" type="password" inputmode="numeric">
          </div>

          <div class="btnrow">
            <button class="btn primary" id="btnStudent">Enter</button>
          </div>

          <div class="sub" style="margin-top:10px">
            Подсказка для учителя: список логинов хранится в <span class="kbd">data.js</span>.
          </div>
        </div>

        <div class="card">
          <h2>Teacher</h2>
          <div class="sub">Вход в просмотр структуры (модули/уроки/слова). Можно расширить под “Teacher Journal”.</div>

          <div class="field">
            <div class="sub">Teacher PIN</div>
            <input class="input" id="pinTeacher" placeholder="PIN" type="password" inputmode="numeric">
          </div>

          <div class="btnrow">
            <button class="btn" id="btnTeacher">Enter as Teacher</button>
            ${state.user ? `<button class="btn danger" id="btnLogout">Logout</button>` : ``}
          </div>
        </div>
      </div>
    `;
  }

  function modulesScreen(){
    const cards = DATA.modules.map(m => `
      <div class="item" data-mid="${m.id}">
        <div class="left">
          <div class="ttl">${escapeHtml(m.title)}</div>
          <div class="meta">${m.lessons.length} lessons</div>
        </div>
        <div class="badge">Open</div>
      </div>
    `).join("");

    return `
      <div class="card" style="margin-top:14px">
        <h2>Modules</h2>
        <div class="sub">Выберите модуль.</div>
        <div class="list" id="moduleList">${cards}</div>
        <div class="btnrow">
          <button class="btn" id="goTeacher">Teacher</button>
          <button class="btn danger" id="btnLogout">Logout</button>
        </div>
      </div>
    `;
  }

  function lessonsScreen(){
    const m = getModule(state.moduleId);
    if (!m) { state.screen="modules"; saveState(); return modulesScreen(); }

    const items = m.lessons.map(l => {
      const count = (l.words||[]).length;
      return `
        <div class="item" data-lid="${l.id}">
          <div class="left">
            <div class="ttl">${escapeHtml(l.title)}</div>
            <div class="meta">${count} words</div>
          </div>
          <div class="badge">Open</div>
        </div>
      `;
    }).join("");

    return `
      <div class="card" style="margin-top:14px">
        <h2>${escapeHtml(m.title)} — Lessons</h2>
        <div class="sub">Выберите урок.</div>
        <div class="list" id="lessonList">${items}</div>
        <div class="btnrow">
          <button class="btn" id="backModules">Back</button>
          <button class="btn danger" id="btnLogout">Logout</button>
        </div>
      </div>
    `;
  }

  function vocabScreen(){
    const m = getModule(state.moduleId);
    const l = getLesson(state.moduleId, state.lessonId);
    if (!m || !l) { state.screen="modules"; saveState(); return modulesScreen(); }

    const words = (l.words || []);
    const cards = words.length ? words.map(w => {
      const img = w.img || "";
      const audio = w.audio || "";
      return `
        <div class="wordcard">
          <img src="${escapeHtml(img)}" alt="${escapeHtml(w.en)}" onerror="this.src='';this.style.display='none'">
          <div>
            <div class="en">${escapeHtml(w.en)}</div>
            <div class="ru">${escapeHtml(w.ru || "")}</div>
            <div class="actions">
              <button class="small" data-say="${escapeHtml(w.en)}">🔊 Speak</button>
              ${audio ? `<button class="small" data-audio="${escapeHtml(audio)}">▶ Audio</button>` : ``}
            </div>
          </div>
        </div>
      `;
    }).join("") : `<div class="sub" style="margin-top:10px">Пока нет слов. Добавь в <span class="kbd">data.js</span>.</div>`;

    return `
      <div class="card" style="margin-top:14px">
        <h2>${escapeHtml(m.title)} • ${escapeHtml(l.title)}</h2>
        <div class="sub">Visual vocabulary (EN/RU). Картинки: <span class="kbd">img/</span>, аудио: <span class="kbd">audio/</span></div>
        <div class="wordgrid">${cards}</div>

        <div class="btnrow">
          <button class="btn" id="backLessons">Back</button>
          <button class="btn" id="btnPrint">Print</button>
          <button class="btn danger" id="btnLogout">Logout</button>
        </div>
      </div>
    `;
  }

  function teacherScreen(){
    const summary = DATA.modules.map(m => {
      const wordsCount = m.lessons.reduce((s,l)=>s+(l.words?.length||0),0);
      return `<div class="item">
        <div class="left">
          <div class="ttl">${escapeHtml(m.title)}</div>
          <div class="meta">${m.lessons.length} lessons • ${wordsCount} words</div>
        </div>
        <div class="badge">OK</div>
      </div>`;
    }).join("");

    return `
      <div class="card" style="margin-top:14px">
        <h2>Teacher View</h2>
        <div class="sub">Проверка наполнения словаря. (Можно расширить до Teacher Journal позже.)</div>
        <div class="list">${summary}</div>
        <div class="btnrow">
          <button class="btn" id="backModules2">Back</button>
          <button class="btn danger" id="btnLogout">Logout</button>
        </div>
      </div>
    `;
  }

  function bind(){
    // login
    const btnStudent = $("#btnStudent");
    if (btnStudent) btnStudent.onclick = () => {
      const login = ($("#loginStudent")?.value || "").trim();
      const pin = ($("#pinStudent")?.value || "").trim();

      if (!DATA.allowedLogins.includes(login)) return toast("Неверный логин");
      if (pin !== DATA.studentPin) return toast("Неверный PIN");

      state.user = { role: "student", login };
      state.screen = "modules";
      state.moduleId = null; state.lessonId = null;
      saveState(); render();
      toast("Вход выполнен");
    };

    const btnTeacher = $("#btnTeacher");
    if (btnTeacher) btnTeacher.onclick = () => {
      const pin = ($("#pinTeacher")?.value || "").trim();
      if (pin !== DATA.teacherPin) return toast("Неверный Teacher PIN");
      state.user = { role: "teacher", login: "TEACHER" };
      state.screen = "modules";
      saveState(); render();
      toast("Teacher mode");
    };

    const btnLogout = $("#btnLogout");
    if (btnLogout) btnLogout.onclick = () => {
      localStorage.removeItem(LS_KEY);
      location.reload();
    };

    // modules
    const ml = $("#moduleList");
    if (ml) ml.onclick = (e) => {
      const el = e.target.closest("[data-mid]");
      if (!el) return;
      state.moduleId = el.dataset.mid;
      state.screen = "lessons";
      saveState(); render();
    };

    const goTeacher = $("#goTeacher");
    if (goTeacher) goTeacher.onclick = () => { state.screen="teacher"; saveState(); render(); };

    // lessons
    const backModules = $("#backModules");
    if (backModules) backModules.onclick = () => { state.screen="modules"; saveState(); render(); };

    const ll = $("#lessonList");
    if (ll) ll.onclick = (e) => {
      const el = e.target.closest("[data-lid]");
      if (!el) return;
      state.lessonId = el.dataset.lid;
      state.screen = "vocab";
      saveState(); render();
    };

    // vocab
    const backLessons = $("#backLessons");
    if (backLessons) backLessons.onclick = () => { state.screen="lessons"; saveState(); render(); };

    const btnPrint = $("#btnPrint");
    if (btnPrint) btnPrint.onclick = () => window.print();

    // speak/audio buttons
    document.querySelectorAll("[data-say]").forEach(btn => {
      btn.onclick = () => speak(btn.getAttribute("data-say"));
    });
    document.querySelectorAll("[data-audio]").forEach(btn => {
      btn.onclick = () => playAudio(btn.getAttribute("data-audio"));
    });

    const backModules2 = $("#backModules2");
    if (backModules2) backModules2.onclick = () => { state.screen="modules"; saveState(); render(); };
  }

  function speak(text){
    try{
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    }catch{
      toast("Speech не поддерживается");
    }
  }

  function playAudio(src){
    try{
      const a = new Audio(src);
      a.play();
    }catch{
      toast("Audio не поддерживается");
    }
  }

  // старт
  if (!state.user) state.screen = "login";
  render();
})();
