import {
  isFirebaseConfigured,
  getFirebase,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
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
  uploadImage,
  collection,
  getDocs,
  setDoc,
  doc,
  addDoc,
} from "../../js/firebase.js";
import { seedData } from "../../js/seed-data.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

let currentPage = "home";
let currentPeopleGroup = "staff";
let dogsCache = [];
let peopleCache = [];
let pageCache = {};
let dogImageFile = null;
let dogImageUrl = "";
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
    if (user) {
      $("#login-screen").classList.add("hidden");
      $("#admin-app").classList.remove("hidden");
      await refreshAll();
      updateSetupStatus(true, user.email);
    } else {
      $("#login-screen").classList.remove("hidden");
      $("#admin-app").classList.add("hidden");
    }
  });

  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(
        auth,
        $("#login-email").value.trim(),
        $("#login-password").value
      );
      clearStatus(loginStatus);
    } catch (err) {
      showStatus(loginStatus, err.message || "Login failed", "err");
    }
  });

  $("#logout-btn").addEventListener("click", () => signOut(auth));
}

function updateSetupStatus(ok, email = "") {
  const el = $("#setup-status");
  if (!isFirebaseConfigured()) {
    showStatus(el, "Config missing in js/firebase-config.js", "err");
    return;
  }
  if (ok) {
    showStatus(el, `Connected. Signed in as ${email}`, "ok");
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
          <p>${escapeHtml(dog.breed || "")} · ${escapeHtml(dog.category || "")} · ${
        dog.published === false ? "Hidden" : "Published"
      }${dog.featured ? " · Featured" : ""}</p>
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
  $("#dog-category").value = dog?.category || "adult";
  $("#dog-temperament").value = dog?.temperament || "";
  $("#dog-vaccinated").value = dog?.vaccinated || "Yes";
  $("#dog-description").value = dog?.description || "";
  $("#dog-order").value = dog?.order ?? dogsCache.length + 1;
  $("#dog-featured").value = String(Boolean(dog?.featured));
  $("#dog-published").value = String(dog?.published !== false);
  dogImageFile = null;
  dogImageUrl = dog?.imageUrl || "";
  $("#dog-photo").value = "";
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
  await saveDog(id, {
    name: $("#dog-name").value.trim(),
    breed: $("#dog-breed").value.trim(),
    age: $("#dog-age").value.trim(),
    category: $("#dog-category").value,
    temperament: $("#dog-temperament").value.trim(),
    vaccinated: $("#dog-vaccinated").value,
    description: $("#dog-description").value.trim(),
    order: Number($("#dog-order").value) || 1,
    featured: $("#dog-featured").value === "true",
    published: $("#dog-published").value === "true",
    imageUrl,
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
      <label>Instagram URL <input data-s="social.instagramUrl" value="${escapeAttr(
        data.social?.instagramUrl || ""
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

  showStatus(
    $("#app-status"),
    "Seed complete. Settings/pages updated; dogs & people added if collections were empty.",
    "ok"
  );
  await refreshAll();
}

async function refreshAll() {
  try {
    await Promise.all([
      refreshDogs(),
      refreshPeople(),
      loadPageEditor(),
      loadSettingsEditor(),
    ]);
  } catch (err) {
    showStatus(
      $("#app-status"),
      err.message || "Could not load content. Did you seed Firestore yet?",
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
}

bindEvents();
initAuth().catch((err) => {
  showStatus($("#login-status"), err.message, "err");
});
updateSetupStatus(false);
