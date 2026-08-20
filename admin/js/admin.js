import {
  isFirebaseConfigured,
  getFirebase,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  getSiteSettings,
  saveSiteSettings,
  getPageContent,
  savePageContent,
  listDogs,
  saveDog,
  removeDog,
  listPeople,
  savePerson,
  removePerson,
  listNewsPosts,
  saveNewsPost,
  removeNewsPost,
  listContactMessages,
  userIsAdmin,
  registerAdmin,
  uploadImage,
  collection,
  getDocs,
  setDoc,
  doc,
  addDoc,
} from "../../js/firebase.js?v=20260819b";
import { seedData } from "../../js/seed-data.js?v=20260819b";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

let currentPage = "home";
let currentPeopleGroup = "staff";
let dogsCache = [];
let peopleCache = [];
let newsCache = [];
let pageCache = {};
let dogImageFile = null;
let dogImageUrl = "";
let dogExtraImageUrls = [];
let personImageFile = null;
let personImageUrl = "";

function showStatus(el, message, type = "info") {
  if (!el) return;
  el.className = `status ${type}`;
  el.textContent = message;
  el.classList.remove("hidden");
}

function clearStatus(el) {
  if (!el) return;
  el.classList.add("hidden");
}

function setView(name) {
  $$(".view").forEach((v) => v.classList.add("hidden"));
  $(`#view-${name}`)?.classList.remove("hidden");
  $$(".nav-btn[data-view]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === name);
  });
}

/* ---------- Auth ---------- */
async function initAuth() {
  const loginStatus = $("#login-status");
  if (!isFirebaseConfigured()) {
    showStatus(
      loginStatus,
      "Firebase is not configured yet. Open Setup guide and paste keys into js/firebase-config.js.",
      "err"
    );
    $("#login-form").querySelectorAll("input,button").forEach((el) => {
      el.disabled = true;
    });
    return;
  }

  const { auth } = getFirebase();
  onAuthStateChanged(auth, async (user) => {
    try {
      if (user) {
        let adminOk = true;
        try {
          adminOk = await userIsAdmin(user.uid);
        } catch {
          adminOk = true;
        }
        if (!adminOk) {
          $("#login-screen").classList.add("hidden");
          $("#admin-app").classList.remove("hidden");
          updateSetupStatus(true, user.email, false);
          setView("setup");
          showStatus(
            $("#app-status"),
            "Signed in. Click Setup → “Register me as admin” before editing content.",
            "info"
          );
          return;
        }
        $("#login-screen").classList.add("hidden");
        $("#admin-app").classList.remove("hidden");
        await refreshAll();
        updateSetupStatus(true, user.email, true);
      } else {
        $("#login-screen").classList.remove("hidden");
        $("#admin-app").classList.add("hidden");
      }
    } catch (err) {
      console.error(err);
      $("#login-screen").classList.remove("hidden");
      $("#admin-app").classList.add("hidden");
      showStatus(
        loginStatus,
        err.message || "Could not finish sign-in. Check the browser console.",
        "err"
      );
    }
  });

  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    showStatus(loginStatus, "Signing in…", "info");
    try {
      await signInWithEmailAndPassword(
        auth,
        $("#login-email").value.trim(),
        $("#login-password").value
      );
      // onAuthStateChanged will open the app
    } catch (err) {
      const code = err.code || "";
      let msg = err.message || "Login failed";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        msg = "Wrong email or password.";
      } else if (code === "auth/user-not-found") {
        msg = "No account found for that email. Create the user in Firebase Authentication.";
      } else if (code === "auth/too-many-requests") {
        msg = "Too many attempts. Wait a moment or use Forgot Password.";
      } else if (code === "auth/network-request-failed") {
        msg = "Network error. Check your connection.";
      }
      showStatus(loginStatus, msg, "err");
    }
  });

  $("#forgot-password-btn").addEventListener("click", async () => {
    const email = $("#login-email").value.trim();
    if (!email) {
      showStatus(loginStatus, "Enter your email address first, then click Forgot Password.", "err");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      showStatus(
        loginStatus,
        "Password reset email sent. Check your inbox (and spam folder).",
        "ok"
      );
    } catch (err) {
      showStatus(loginStatus, err.message || "Could not send reset email.", "err");
    }
  });

  $("#logout-btn").addEventListener("click", () => signOut(auth));
}

function updateSetupStatus(ok, email = "", isAdminUser = false) {
  const el = $("#setup-status");
  if (!isFirebaseConfigured()) {
    showStatus(el, "Config missing in js/firebase-config.js", "err");
    return;
  }
  if (ok && isAdminUser) {
    showStatus(el, `Connected as admin: ${email}`, "ok");
  } else if (ok) {
    showStatus(
      el,
      `Signed in as ${email}, but not registered as admin yet. Click “Register me as admin”.`,
      "err"
    );
  } else {
    showStatus(el, "Firebase config found. Sign in to manage content.", "info");
  }
}

/* ---------- Dogs ---------- */
async function refreshDogs() {
  dogsCache = await listDogs();
  const list = $("#dogs-list");
  if (!dogsCache.length) {
    list.innerHTML = `<p style="color:#777777">No dogs yet. Add one or run Seed on the Setup tab.</p>`;
    return;
  }
  list.innerHTML = dogsCache
    .map(
      (dog) => `
      <article class="item-card">
        <img src="${dog.imageUrl || "/images/logo.png"}" alt="${escapeHtml(dog.name)}">
        <div>
          <h4>${escapeHtml(dog.name)}</h4>
          <p>${escapeHtml(dog.breed || "")} · ${escapeHtml(dog.sex || "")} · ${escapeHtml(dog.category || "")} · ${
        dog.published === false ? "Hidden" : "Published"
      }${dog.isAvailable === false ? " · Not available" : " · Available"}${dog.featured ? " · Featured" : ""}</p>
        </div>
        <div class="item-actions">
          <button class="btn secondary" data-edit-dog="${dog.id}" type="button">Edit</button>
          <button class="btn danger" data-delete-dog="${dog.id}" type="button">Delete</button>
        </div>
      </article>`
    )
    .join("");
}

function openDogModal(dog = null) {
  $("#dog-modal").classList.remove("hidden");
  $("#dog-modal-title").textContent = dog ? "Edit dog" : "Add dog";
  $("#dog-id").value = dog?.id || "";
  $("#dog-name").value = dog?.name || "";
  $("#dog-breed").value = dog?.breed || "";
  $("#dog-age").value = dog?.age || "";
  $("#dog-sex").value = dog?.sex || "Unknown";
  $("#dog-category").value = dog?.category || "adult";
  $("#dog-temperament").value = dog?.temperament || "";
  $("#dog-vaccinated").value = dog?.vaccinated || "Yes";
  $("#dog-description").value = dog?.description || "";
  $("#dog-order").value = dog?.order ?? dogsCache.length + 1;
  $("#dog-featured").value = String(Boolean(dog?.featured));
  $("#dog-published").value = String(dog?.published !== false);
  $("#dog-available").value = String(dog?.isAvailable !== false);
  dogImageFile = null;
  dogImageUrl = dog?.imageUrl || dog?.imageUrls?.[0] || "";
  dogExtraImageUrls = Array.isArray(dog?.imageUrls)
    ? dog.imageUrls.slice(1)
    : [];
  $("#dog-photo").value = "";
  $("#dog-photos-extra").value = "";
  const preview = $("#dog-preview");
  if (dogImageUrl) {
    preview.src = dogImageUrl;
    preview.classList.remove("hidden");
  } else {
    preview.classList.add("hidden");
  }
}

function closeDogModal() {
  $("#dog-modal").classList.add("hidden");
}

async function handleDogSave(e) {
  e.preventDefault();
  const id = $("#dog-id").value || null;
  let imageUrl = dogImageUrl;
  if (dogImageFile) {
    const path = `dogs/${Date.now()}-${dogImageFile.name}`;
    imageUrl = await uploadImage(dogImageFile, path);
  }
  if (!imageUrl) {
    showStatus($("#app-status"), "Please add a photo for this dog.", "err");
    return;
  }

  const extraFiles = [...($("#dog-photos-extra").files || [])];
  const uploadedExtras = [];
  for (const file of extraFiles) {
    uploadedExtras.push(
      await uploadImage(file, `dogs/${Date.now()}-${file.name}`)
    );
  }
  const imageUrls = [imageUrl, ...dogExtraImageUrls, ...uploadedExtras].filter(
    Boolean
  );

  await saveDog(id, {
    name: $("#dog-name").value.trim(),
    breed: $("#dog-breed").value.trim(),
    age: $("#dog-age").value.trim(),
    sex: $("#dog-sex").value,
    category: $("#dog-category").value,
    temperament: $("#dog-temperament").value.trim(),
    vaccinated: $("#dog-vaccinated").value,
    description: $("#dog-description").value.trim(),
    order: Number($("#dog-order").value) || 1,
    featured: $("#dog-featured").value === "true",
    published: $("#dog-published").value === "true",
    isAvailable: $("#dog-available").value === "true",
    imageUrl,
    imageUrls,
  });
  closeDogModal();
  showStatus($("#app-status"), "Dog saved.", "ok");
  await refreshDogs();
}

/* ---------- People ---------- */
async function refreshPeople() {
  peopleCache = await listPeople();
  const filtered = peopleCache.filter((p) => p.group === currentPeopleGroup);
  const list = $("#people-list");
  if (!filtered.length) {
    list.innerHTML = `<p style="color:#777777">No people in this group yet.</p>`;
    return;
  }
  list.innerHTML = filtered
    .map(
      (person) => `
      <article class="item-card">
        <img src="${person.imageUrl || "/images/logo.png"}" alt="${escapeHtml(person.name)}">
        <div>
          <h4>${escapeHtml(person.name)}</h4>
          <p>${escapeHtml(person.role || "")}</p>
        </div>
        <div class="item-actions">
          <button class="btn secondary" data-edit-person="${person.id}" type="button">Edit</button>
          <button class="btn danger" data-delete-person="${person.id}" type="button">Delete</button>
        </div>
      </article>`
    )
    .join("");
}

function openPersonModal(person = null) {
  $("#person-modal").classList.remove("hidden");
  $("#person-modal-title").textContent = person ? "Edit person" : "Add person";
  $("#person-id").value = person?.id || "";
  $("#person-name").value = person?.name || "";
  $("#person-role").value = person?.role || "";
  $("#person-group").value = person?.group || currentPeopleGroup;
  $("#person-order").value = person?.order ?? 1;
  $("#person-bio").value = person?.bio || "";
  personImageFile = null;
  personImageUrl = person?.imageUrl || "";
  $("#person-photo").value = "";
  const preview = $("#person-preview");
  if (personImageUrl) {
    preview.src = personImageUrl;
    preview.classList.remove("hidden");
  } else {
    preview.classList.add("hidden");
  }
}

function closePersonModal() {
  $("#person-modal").classList.add("hidden");
}

async function handlePersonSave(e) {
  e.preventDefault();
  const id = $("#person-id").value || null;
  let imageUrl = personImageUrl;
  if (personImageFile) {
    const path = `people/${Date.now()}-${personImageFile.name}`;
    imageUrl = await uploadImage(personImageFile, path);
  }
  await savePerson(id, {
    name: $("#person-name").value.trim(),
    role: $("#person-role").value.trim(),
    group: $("#person-group").value,
    order: Number($("#person-order").value) || 1,
    bio: $("#person-bio").value.trim(),
    imageUrl: imageUrl || "",
  });
  closePersonModal();
  showStatus($("#app-status"), "Person saved.", "ok");
  await refreshPeople();
}

/* ---------- News ---------- */
async function refreshNews() {
  newsCache = await listNewsPosts();
  const list = $("#news-list");
  if (!newsCache.length) {
    list.innerHTML = `<p style="color:#777777">No news posts yet. Add one or run Seed.</p>`;
    return;
  }
  list.innerHTML = newsCache
    .map(
      (post) => `
      <article class="item-card">
        <div style="width:56px;height:56px;border-radius:14px;background:#f5f5f5;display:grid;place-items:center;font-size:1.4rem;color:#EF2B2D">
          <i class="fa-solid ${escapeAttr(post.icon || "fa-paw")}"></i>
        </div>
        <div>
          <h4>${escapeHtml(post.title)}</h4>
          <p>${escapeHtml(post.summary || "")} · ${
        post.published === false ? "Hidden" : "Published"
      }</p>
        </div>
        <div class="item-actions">
          <button class="btn secondary" data-edit-news="${post.id}" type="button">Edit</button>
          <button class="btn danger" data-delete-news="${post.id}" type="button">Delete</button>
        </div>
      </article>`
    )
    .join("");
}

function openNewsModal(post = null) {
  $("#news-modal").classList.remove("hidden");
  $("#news-modal-title").textContent = post ? "Edit news post" : "Add news post";
  $("#news-id").value = post?.id || "";
  $("#news-title").value = post?.title || "";
  $("#news-summary").value = post?.summary || "";
  $("#news-icon").value = post?.icon || "fa-paw";
  $("#news-order").value = post?.order ?? newsCache.length + 1;
  $("#news-published").value = String(post?.published !== false);
}

function closeNewsModal() {
  $("#news-modal").classList.add("hidden");
}

async function handleNewsSave(e) {
  e.preventDefault();
  const id = $("#news-id").value || null;
  await saveNewsPost(id, {
    title: $("#news-title").value.trim(),
    summary: $("#news-summary").value.trim(),
    icon: ($("#news-icon").value.trim() || "fa-paw").replace(/^fa-solid\s+/, ""),
    order: Number($("#news-order").value) || 1,
    published: $("#news-published").value === "true",
  });
  closeNewsModal();
  showStatus($("#app-status"), "News post saved.", "ok");
  await refreshNews();
}

/* ---------- Messages ---------- */
async function refreshMessages() {
  const list = $("#messages-list");
  try {
    const messages = await listContactMessages();
    if (!messages.length) {
      list.innerHTML = `<p style="color:#777777">No contact messages yet.</p>`;
      return;
    }
    list.innerHTML = messages
      .map((m) => {
        const when = m.createdAt?.toDate
          ? m.createdAt.toDate().toLocaleString()
          : "";
        return `
        <article class="item-card">
          <div>
            <h4>${escapeHtml(m.name || "Anonymous")}</h4>
            <p><strong>${escapeHtml(m.email || "")}</strong>${
          m.phone ? ` · ${escapeHtml(m.phone)}` : ""
        }${m.subject ? ` · ${escapeHtml(m.subject)}` : ""}${
          when ? ` · ${escapeHtml(when)}` : ""
        }</p>
            <p>${escapeHtml(m.message || "")}</p>
          </div>
        </article>`;
      })
      .join("");
  } catch (err) {
    list.innerHTML = `<p style="color:#777777">${escapeHtml(
      err.message || "Could not load messages."
    )}</p>`;
  }
}

/* ---------- Pages ---------- */
const pageFieldSchemas = {
  home: [
    ["hero.headline", "Hero headline", "text"],
    ["hero.subtext", "Hero subtext", "textarea"],
    ["hero.ctaPrimary", "Primary CTA label", "text"],
    ["hero.ctaSecondary", "Secondary CTA label", "text"],
    ["hero.imageUrl", "Hero image URL", "image"],
    ["mission.title", "Mission title", "text"],
    ["mission.body", "Mission body", "textarea"],
    ["cta.tag", "Bottom CTA tag", "text"],
    ["cta.headline", "Bottom CTA headline", "text"],
    ["cta.body", "Bottom CTA body", "textarea"],
    ["cta.button", "Bottom CTA button", "text"],
  ],
  about: [
    ["hero.headline", "Hero headline", "text"],
    ["hero.subtext", "Hero subtext", "textarea"],
    ["hero.imageUrl", "Hero banner image", "image"],
    ["story.title", "Story title", "text"],
    ["story.body", "Story body", "textarea"],
    ["story.imageUrl", "Story image", "image"],
    ["facilitiesIntro", "Facilities intro", "textarea"],
  ],
  dogs: [
    ["hero.tag", "Hero tag", "text"],
    ["hero.headline", "Hero headline", "text"],
    ["hero.subtext", "Hero subtext", "textarea"],
    ["hero.imageUrl", "Hero banner image", "image"],
    ["readyToAdopt.headline", "Ready to adopt headline", "text"],
    ["readyToAdopt.body", "Ready to adopt body", "textarea"],
    ["readyToAdopt.button", "Ready to adopt button", "text"],
  ],
  donate: [
    ["hero.tag", "Hero tag", "text"],
    ["hero.headline", "Hero headline", "text"],
    ["hero.subtext", "Hero subtext", "textarea"],
    ["hero.imageUrl", "Hero banner image", "image"],
    ["paymentNote", "Payment note", "text"],
    ["snapscanImageUrl", "SnapScan QR image", "image"],
    ["taxBlurb", "Tax blurb", "textarea"],
  ],
  contact: [
    ["hero.tag", "Hero tag", "text"],
    ["hero.headline", "Hero headline", "text"],
    ["hero.subtext", "Hero subtext", "textarea"],
    ["hero.imageUrl", "Hero banner image", "image"],
    ["mapEmbedUrl", "Google Maps embed URL", "text"],
  ],
};

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function setByPath(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;
  keys.forEach((key, i) => {
    if (i === keys.length - 1) cur[key] = value;
    else {
      if (!cur[key] || typeof cur[key] !== "object") cur[key] = {};
      cur = cur[key];
    }
  });
}

async function loadPageEditor() {
  pageCache[currentPage] =
    (await getPageContent(currentPage)) ||
    structuredClone(seedData.pages[currentPage] || {});
  const data = pageCache[currentPage];
  const fields = pageFieldSchemas[currentPage] || [];
  const editor = $("#page-editor");
  editor.innerHTML = fields
    .map(([path, label, type]) => {
      const value = getByPath(data, path) ?? "";
      if (type === "textarea") {
        return `<label>${label}<textarea data-path="${path}">${escapeHtml(
          String(value)
        )}</textarea></label>`;
      }
      if (type === "image") {
        return `<label>${label}
          <input type="text" data-path="${path}" value="${escapeAttr(String(value))}" placeholder="Image URL">
          <input type="file" accept="image/*" data-upload-path="${path}">
          ${
            value
              ? `<img class="preview" src="${escapeAttr(String(value))}" alt="">`
              : ""
          }
        </label>`;
      }
      return `<label>${label}<input data-path="${path}" value="${escapeAttr(
        String(value)
      )}"></label>`;
    })
    .join("");
}

async function saveCurrentPage() {
  const data = pageCache[currentPage] || {};
  $$("#page-editor [data-path]").forEach((input) => {
    setByPath(data, input.dataset.path, input.value);
  });
  for (const fileInput of $$("#page-editor [data-upload-path]")) {
    const file = fileInput.files?.[0];
    if (!file) continue;
    const path = fileInput.dataset.uploadPath;
    const url = await uploadImage(file, `pages/${currentPage}/${Date.now()}-${file.name}`);
    setByPath(data, path, url);
  }
  await savePageContent(currentPage, data);
  pageCache[currentPage] = data;
  showStatus($("#app-status"), `${currentPage} page saved.`, "ok");
  await loadPageEditor();
}

/* ---------- Settings ---------- */
async function loadSettingsEditor() {
  const data =
    (await getSiteSettings()) || structuredClone(seedData.settings);
  const editor = $("#settings-editor");
  editor.innerHTML = `
    <h3>Logo & contact</h3>
    <div class="grid-2">
      <label>Logo URL
        <input data-s="logoUrl" value="${escapeAttr(data.logoUrl || "")}">
        <input type="file" accept="image/*" id="logo-upload">
        ${data.logoUrl ? `<img class="preview" src="${escapeAttr(data.logoUrl)}" alt="Logo">` : ""}
      </label>
      <label>Email <input data-s="contact.email" value="${escapeAttr(
        data.contact?.email || ""
      )}"></label>
      <label>Phone <input data-s="contact.phone" value="${escapeAttr(
        data.contact?.phone || ""
      )}"></label>
      <label>Address <textarea data-s="contact.address">${escapeHtml(
        data.contact?.address || ""
      )}</textarea></label>
    </div>
    <h3 style="margin-top:22px">Social & footer</h3>
    <div class="grid-2">
      <label>Facebook URL <input data-s="social.facebookUrl" value="${escapeAttr(
        data.social?.facebookUrl || ""
      )}"></label>
      <label style="grid-column:1/-1">Footer blurb <textarea data-s="footer.blurb">${escapeHtml(
        data.footer?.blurb || ""
      )}</textarea></label>
      <label style="grid-column:1/-1">Copyright <input data-s="footer.copyright" value="${escapeAttr(
        data.footer?.copyright || ""
      )}"></label>
    </div>
    <h3 style="margin-top:22px">Bank details (Donate page)</h3>
    <div class="grid-2">
      <label>Bank <input data-s="bank.bank" value="${escapeAttr(
        data.bank?.bank || ""
      )}"></label>
      <label>Account name <input data-s="bank.accountName" value="${escapeAttr(
        data.bank?.accountName || ""
      )}"></label>
      <label>Account number <input data-s="bank.accountNumber" value="${escapeAttr(
        data.bank?.accountNumber || ""
      )}"></label>
      <label>Branch code <input data-s="bank.branchCode" value="${escapeAttr(
        data.bank?.branchCode || ""
      )}"></label>
      <label>Reference hint <input data-s="bank.referenceHint" value="${escapeAttr(
        data.bank?.referenceHint || ""
      )}"></label>
    </div>
    <h3 style="margin-top:22px">Visiting hours</h3>
    <div class="grid-2">
      <label>Weekday hours <input data-s="hours.weekday" value="${escapeAttr(
        data.hours?.weekday || ""
      )}"></label>
      <label>Sunday hours <input data-s="hours.sunday" value="${escapeAttr(
        data.hours?.sunday || ""
      )}"></label>
      <label>Monday hours <input data-s="hours.monday" value="${escapeAttr(
        data.hours?.monday || ""
      )}"></label>
      <label>Note <input data-s="hours.note" value="${escapeAttr(
        data.hours?.note || ""
      )}"></label>
    </div>
  `;
}

async function saveSettings() {
  const data = (await getSiteSettings()) || structuredClone(seedData.settings);
  $$("#settings-editor [data-s]").forEach((input) => {
    setByPath(data, input.dataset.s, input.value);
  });
  const logoFile = $("#logo-upload")?.files?.[0];
  if (logoFile) {
    data.logoUrl = await uploadImage(logoFile, `site/logo-${Date.now()}-${logoFile.name}`);
  }
  await saveSiteSettings(data);
  showStatus($("#app-status"), "Site settings saved.", "ok");
  await loadSettingsEditor();
}

/* ---------- Seed ---------- */
async function seedContent() {
  const { db } = getFirebase();
  showStatus($("#app-status"), "Seeding content…", "info");

  await setDoc(doc(db, "settings", "site"), {
    ...seedData.settings,
    updatedAt: new Date().toISOString(),
  });

  for (const [pageId, pageData] of Object.entries(seedData.pages)) {
    await setDoc(doc(db, "pages", pageId), {
      ...pageData,
      updatedAt: new Date().toISOString(),
    });
  }

  const dogsSnap = await getDocs(collection(db, "dogs"));
  if (dogsSnap.empty) {
    for (const dog of seedData.dogs) {
      await addDoc(collection(db, "dogs"), dog);
    }
  }

  const peopleSnap = await getDocs(collection(db, "people"));
  if (peopleSnap.empty) {
    for (const person of seedData.people) {
      await addDoc(collection(db, "people"), person);
    }
  }

  const newsSnap = await getDocs(collection(db, "news_posts"));
  if (newsSnap.empty && seedData.news_posts?.length) {
    for (const post of seedData.news_posts) {
      await addDoc(collection(db, "news_posts"), post);
    }
  }

  showStatus(
    $("#app-status"),
    "Seed complete. Settings/pages updated; dogs, people & news added if collections were empty.",
    "ok"
  );
  await refreshAll();
}

async function refreshAll() {
  try {
    await Promise.all([
      refreshDogs(),
      refreshPeople(),
      refreshNews(),
      refreshMessages(),
      loadPageEditor(),
      loadSettingsEditor(),
    ]);
  } catch (err) {
    showStatus(
      $("#app-status"),
      err.message || "Could not load content. Did you register as admin and seed Firestore yet?",
      "err"
    );
  }
}

/* ---------- Helpers ---------- */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll("`", "&#96;");
}

/* ---------- Events ---------- */
function bindEvents() {
  $$(".nav-btn[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  $("#add-dog-btn").addEventListener("click", () => openDogModal());
  $("#dog-cancel").addEventListener("click", closeDogModal);
  $("#dog-form").addEventListener("submit", (e) => {
    handleDogSave(e).catch((err) =>
      showStatus($("#app-status"), err.message, "err")
    );
  });
  $("#dog-photo").addEventListener("change", (e) => {
    dogImageFile = e.target.files?.[0] || null;
    if (dogImageFile) {
      const url = URL.createObjectURL(dogImageFile);
      $("#dog-preview").src = url;
      $("#dog-preview").classList.remove("hidden");
    }
  });
  $("#dogs-list").addEventListener("click", async (e) => {
    const editId = e.target.closest("[data-edit-dog]")?.dataset.editDog;
    const deleteId = e.target.closest("[data-delete-dog]")?.dataset.deleteDog;
    if (editId) {
      openDogModal(dogsCache.find((d) => d.id === editId));
    }
    if (deleteId && confirm("Delete this dog?")) {
      await removeDog(deleteId);
      await refreshDogs();
    }
  });

  $("#add-person-btn").addEventListener("click", () => openPersonModal());
  $("#person-cancel").addEventListener("click", closePersonModal);
  $("#person-form").addEventListener("submit", (e) => {
    handlePersonSave(e).catch((err) =>
      showStatus($("#app-status"), err.message, "err")
    );
  });
  $("#person-photo").addEventListener("change", (e) => {
    personImageFile = e.target.files?.[0] || null;
    if (personImageFile) {
      const url = URL.createObjectURL(personImageFile);
      $("#person-preview").src = url;
      $("#person-preview").classList.remove("hidden");
    }
  });
  $("#people-list").addEventListener("click", async (e) => {
    const editId = e.target.closest("[data-edit-person]")?.dataset.editPerson;
    const deleteId = e.target.closest("[data-delete-person]")?.dataset.deletePerson;
    if (editId) {
      openPersonModal(peopleCache.find((p) => p.id === editId));
    }
    if (deleteId && confirm("Delete this person?")) {
      await removePerson(deleteId);
      await refreshPeople();
    }
  });
  $$("#people-group-tabs .tab").forEach((tab) => {
    tab.addEventListener("click", async () => {
      currentPeopleGroup = tab.dataset.group;
      $$("#people-group-tabs .tab").forEach((t) =>
        t.classList.toggle("active", t === tab)
      );
      await refreshPeople();
    });
  });

  $$("#page-tabs .tab").forEach((tab) => {
    tab.addEventListener("click", async () => {
      currentPage = tab.dataset.page;
      $$("#page-tabs .tab").forEach((t) =>
        t.classList.toggle("active", t === tab)
      );
      await loadPageEditor();
    });
  });
  $("#save-page-btn").addEventListener("click", () => {
    saveCurrentPage().catch((err) =>
      showStatus($("#app-status"), err.message, "err")
    );
  });
  $("#save-settings-btn").addEventListener("click", () => {
    saveSettings().catch((err) =>
      showStatus($("#app-status"), err.message, "err")
    );
  });
  $("#seed-btn").addEventListener("click", () => {
    if (!confirm("Seed / update default content in Firebase?")) return;
    seedContent().catch((err) =>
      showStatus($("#app-status"), err.message, "err")
    );
  });

  $("#register-admin-btn").addEventListener("click", async () => {
    try {
      const { auth } = getFirebase();
      const user = auth.currentUser;
      if (!user) {
        showStatus($("#app-status"), "Sign in first.", "err");
        return;
      }
      await registerAdmin(user.uid, user.email || "");
      showStatus(
        $("#app-status"),
        "Admin registered. You can now seed and manage content.",
        "ok"
      );
      updateSetupStatus(true, user.email, true);
      await refreshAll();
    } catch (err) {
      showStatus($("#app-status"), err.message || "Could not register admin.", "err");
    }
  });

  $("#add-news-btn").addEventListener("click", () => openNewsModal());
  $("#news-cancel").addEventListener("click", closeNewsModal);
  $("#news-form").addEventListener("submit", (e) => {
    handleNewsSave(e).catch((err) =>
      showStatus($("#app-status"), err.message, "err")
    );
  });
  $("#news-list").addEventListener("click", async (e) => {
    const editId = e.target.closest("[data-edit-news]")?.dataset.editNews;
    const deleteId = e.target.closest("[data-delete-news]")?.dataset.deleteNews;
    if (editId) {
      openNewsModal(newsCache.find((p) => p.id === editId));
    }
    if (deleteId && confirm("Delete this news post?")) {
      await removeNewsPost(deleteId);
      await refreshNews();
    }
  });

  $("#refresh-messages-btn").addEventListener("click", () => {
    refreshMessages().catch((err) =>
      showStatus($("#app-status"), err.message, "err")
    );
  });
}

bindEvents();
initAuth().catch((err) => {
  showStatus($("#login-status"), err.message, "err");
});
updateSetupStatus(false);
