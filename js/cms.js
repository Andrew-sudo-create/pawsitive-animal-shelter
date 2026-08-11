/**
 * Public CMS loader — fills the existing page markup from Firestore.
 * If Firebase is not configured or data is missing, static HTML stays as-is.
 */
import {
  isFirebaseConfigured,
  getPageContent,
  getSiteSettings,
  listDogs,
  listPeople,
} from "./firebase.js";

function setText(selector, value) {
  if (value == null || value === "") return;
  document.querySelectorAll(selector).forEach((el) => {
    el.textContent = value;
  });
}

function setHtml(selector, value) {
  if (value == null || value === "") return;
  document.querySelectorAll(selector).forEach((el) => {
    el.innerHTML = value;
  });
}

function setSrc(selector, value, alt) {
  if (!value) return;
  document.querySelectorAll(selector).forEach((el) => {
    el.src = value;
    if (alt) el.alt = alt;
  });
}

function setBg(selector, value) {
  if (!value) return;
  document.querySelectorAll(selector).forEach((el) => {
    el.style.backgroundImage = `url("${value}")`;
  });
}

function pageName() {
  const file = (location.pathname.split("/").pop() || "home.html").toLowerCase();
  if (file === "" || file === "index.html" || file === "home.html") return "home";
  return file.replace(".html", "");
}

function dogCardHtml(dog, detailed = true) {
  if (detailed) {
    return `
      <div class="dog-card" data-category="${dog.category || "adult"}">
        <img src="${dog.imageUrl}" alt="${escapeAttr(dog.name)}">
        <div class="dog-info">
          <h3>${escapeHtml(dog.name)}</h3>
          <p>${escapeHtml(dog.description || "")}</p>
          <div class="dog-details">
            <div class="detail-item"><span class="label">Breed:</span> <span class="value">${escapeHtml(
              dog.breed || ""
            )}</span></div>
            <div class="detail-item"><span class="label">Age:</span> <span class="value">${escapeHtml(
              dog.age || ""
            )}</span></div>
            <div class="detail-item"><span class="label">Temperament:</span> <span class="value">${escapeHtml(
              dog.temperament || ""
            )}</span></div>
            <div class="detail-item"><span class="label">Vaccinated:</span> <span class="value">${escapeHtml(
              dog.vaccinated || ""
            )}</span></div>
          </div>
        </div>
      </div>`;
  }
  return `
    <div class="dog-card">
      <img src="${dog.imageUrl}" alt="${escapeAttr(dog.name)}">
      <div class="dog-info">
        <h3>${escapeHtml(dog.name)}</h3>
        <p>${escapeHtml(dog.breed || "")}</p>
      </div>
    </div>`;
}

function personCardHtml(person) {
  const roleClass =
    person.group === "committee" ? "people-role" : "position";
  return `
    <div class="people-card fade">
      <div class="people-photo">
        <img src="${person.imageUrl || "/images/logo.png"}" alt="${escapeAttr(
    person.name
  )}">
      </div>
      <div class="people-content">
        <h3>${escapeHtml(person.name)}</h3>
        <span class="${roleClass}">${escapeHtml(person.role || "")}</span>
        <p>${escapeHtml(person.bio || "")}</p>
      </div>
    </div>`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(str) {
  return escapeHtml(str);
}

async function applySettings(settings) {
  if (!settings) return;
  if (settings.logoUrl) setSrc(".logo img, footer .footer-logo img, .footer-logo img", settings.logoUrl, "Pawsitive Logo");
  if (settings.contact?.email) {
    setText("[data-cms='contact.email']", settings.contact.email);
    document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
      if (a.textContent.includes("@") || a.dataset.cmsEmail === "true") {
        a.href = `mailto:${settings.contact.email}`;
        if (a.dataset.cmsEmail === "true" || a.textContent.includes("@")) {
          a.textContent = settings.contact.email;
        }
      }
    });
  }
  if (settings.contact?.phone) {
    setText("[data-cms='contact.phone']", settings.contact.phone);
  }
  if (settings.contact?.address) {
    setText("[data-cms='contact.address']", settings.contact.address);
  }
  if (settings.bank) {
    setText("[data-cms='bank.bank']", settings.bank.bank);
    setText("[data-cms='bank.accountName']", settings.bank.accountName);
    setText("[data-cms='bank.accountNumber']", settings.bank.accountNumber);
    setText("[data-cms='bank.branchCode']", settings.bank.branchCode);
    setText("[data-cms='bank.referenceHint']", settings.bank.referenceHint);
  }
  if (settings.footer?.blurb) setText("[data-cms='footer.blurb']", settings.footer.blurb);
  if (settings.footer?.copyright) setText("[data-cms='footer.copyright']", settings.footer.copyright);
  if (settings.social?.facebookUrl) {
    document.querySelectorAll("[data-cms-facebook]").forEach((a) => {
      a.href = settings.social.facebookUrl;
    });
  }
}

async function applyHome(page, dogs) {
  if (!page) return;
  setText(".hero-content h1", page.hero?.headline);
  setText(".hero-content .hero-text", page.hero?.subtext);
  setBg(".hero", page.hero?.imageUrl);
  if (page.mission?.title) setText(".mission .section-title h2, .mission-section h2", page.mission.title);
  if (page.mission?.body) setText("[data-cms='home.mission.body']", page.mission.body);

  const featured = dogs.filter((d) => d.featured && d.published !== false).slice(0, 3);
  const grid = document.querySelector("[data-cms-dogs='featured']") || document.querySelector(".dogs-grid");
  if (grid && featured.length) {
    grid.innerHTML = featured.map((d) => dogCardHtml(d, false)).join("");
  }
}

async function applyDogsPage(page, dogs) {
  if (page) {
    setText(".page-hero-content h1, .dogs-hero h1", page.hero?.headline);
    setText(".page-hero-content p, .dogs-hero p", page.hero?.subtext);
    setText(".page-hero-content .section-tag", page.hero?.tag);
    setBg(".page-hero, .dogs-hero", page.hero?.imageUrl);
    setText("[data-cms='dogs.ready.headline']", page.readyToAdopt?.headline);
    setText("[data-cms='dogs.ready.body']", page.readyToAdopt?.body);
  }

  const published = dogs.filter((d) => d.published !== false);
  const grid = document.querySelector("[data-cms-dogs='gallery']") || document.querySelector(".dogs-grid");
  if (grid && published.length) {
    grid.innerHTML = published.map((d) => dogCardHtml(d, true)).join("");
  }
}

async function applyAbout(page, people) {
  if (page) {
    setText(".page-hero-content h1", page.hero?.headline);
    setText(".page-hero-content p", page.hero?.subtext);
    setBg(".page-hero, .about-hero", page.hero?.imageUrl);
    setText("[data-cms='about.story.title']", page.story?.title);
    setText("[data-cms='about.story.body']", page.story?.body);
    setSrc("[data-cms='about.story.image']", page.story?.imageUrl, "About Pawsitive");
  }

  const groups = {
    staff: document.querySelector("[data-cms-people='staff']"),
    directors: document.querySelector("[data-cms-people='directors']"),
    committee: document.querySelector("[data-cms-people='committee']"),
  };
  for (const [group, el] of Object.entries(groups)) {
    if (!el) continue;
    const items = people.filter((p) => p.group === group);
    if (items.length) el.innerHTML = items.map(personCardHtml).join("");
  }
}

async function applyDonate(page, settings) {
  if (page) {
    setText(".page-hero-content .section-tag", page.hero?.tag);
    setText(".page-hero-content h1", page.hero?.headline);
    setText(".page-hero-content p", page.hero?.subtext);
    setBg(".page-hero, .donate-hero", page.hero?.imageUrl);
    setText(".payment-note", page.paymentNote);
    if (page.snapscanImageUrl) {
      const qr = document.querySelector(".qr-placeholder");
      if (qr) {
        qr.innerHTML = `<img src="${escapeAttr(
          page.snapscanImageUrl
        )}" alt="SnapScan QR" style="max-width:220px;width:100%;height:auto;">`;
      }
    }
  }
  if (settings?.bank) await applySettings(settings);
}

async function applyContact(page) {
  if (!page) return;
  setText(".page-hero-content .section-tag", page.hero?.tag);
  setText(".page-hero-content h1", page.hero?.headline);
  setText(".page-hero-content p", page.hero?.subtext);
  setBg(".page-hero, .contact-hero", page.hero?.imageUrl);
  if (page.mapEmbedUrl) {
    const iframe = document.querySelector(".map-container iframe, iframe[src*='google.com/maps']");
    if (iframe) iframe.src = page.mapEmbedUrl;
  }
}

async function boot() {
  if (!isFirebaseConfigured()) return;

  try {
    const name = pageName();
    const [settings, page, dogs, people] = await Promise.all([
      getSiteSettings(),
      getPageContent(name),
      listDogs().catch(() => []),
      listPeople().catch(() => []),
    ]);

    await applySettings(settings);

    if (name === "home") await applyHome(page, dogs);
    if (name === "dogs") await applyDogsPage(page, dogs);
    if (name === "about") await applyAbout(page, people);
    if (name === "donate") await applyDonate(page, settings);
    if (name === "contact") await applyContact(page);
  } catch (err) {
    console.warn("CMS load skipped:", err.message);
  }
}

boot();
