# Firebase + Vercel setup (Pawsitive Admin)

The public site stays on **Vercel**. **Firebase** stores content (Firestore), images (Storage), and the admin login (Auth).

Admin portal: `/admin/` (local: `http://localhost:8000/admin/` · live: `https://your-site.vercel.app/admin/`)

---

## 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Add project**
2. Enable **Authentication** → **Email/Password**
3. Create **one** user (the admin email + password)
4. Create **Firestore Database** (production mode is fine — we deploy rules next)
5. Create **Storage**
6. Project settings → **Your apps** → Web (`</>`) → register app → copy the config object

---

## 2. Add config to the repo

1. Open `js/firebase-config.example.js`
2. Copy it to `js/firebase-config.js` (already present)
3. Paste your real values into `js/firebase-config.js`:

```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

These web keys are public by design. Security comes from Auth + rules.

---

## 3. Deploy security rules

Install Firebase CLI (once):

```bash
npm install -g firebase-tools
firebase login
```

From the project root:

```bash
firebase use --add
# select your project

firebase deploy --only firestore:rules,storage
```

Or paste the contents of `firestore.rules` and `storage.rules` into the Firebase Console Rules editors and publish.

**Rules summary**
- Anyone can **read** dogs, people, pages, settings, news_posts
- Anyone can **create** `contact_messages` (contact form)
- Only users listed in the **`admins`** collection can **write** content
- Storage: public read; authenticated image uploads under 8MB

### Register the first admin (required after rules deploy)

1. Create an Email/Password user in Firebase Authentication
2. Sign in at `/admin/`
3. Open **Setup / seed** → **Register me as admin**  
   (creates `admins/{yourAuthUid}`)
4. Then run **Seed default content**

If writes fail with “Missing or insufficient permissions”, you are not registered in `admins` yet, or rules are not deployed.

---

## 4. Seed content

1. Open `/admin/`
2. Sign in with the admin user
3. **Register me as admin** (once)
4. Go to **Setup / seed** → **Seed default content**

This loads dogs, people, news posts, page text, bank details, and settings from the current site defaults.

---

## 5. Deploy on Vercel

Redeploy the same way you already do:

```bash
npx vercel --prod
```

Or push to GitHub if the project is connected to Vercel.

No Node build step is required — this remains a static site.

After deploy, open:

`https://your-deployment.vercel.app/admin/`

---

## What the admin can do

| Tab | Actions |
|-----|---------|
| **Dogs gallery** | Add / edit / delete dogs (`sex`, `imageUrls[]`, `isAvailable`, photos), featured + published flags |
| **People** | Staff, directors, committee photos & bios |
| **News** | CRUD for Home “Latest News” posts |
| **Messages** | View contact form submissions |
| **Page text & images** | Home, About, Dogs, Donate, Contact headlines + hero images |
| **Site settings** | Logo, contact, footer, bank details, hours |
| **Setup / seed** | Register admin + first-time content import |

Public features: **Forgot Password** on admin login, **Privacy Policy** page, footer **Admin** link, contact form → Firestore.

The public layout/CSS stays the same; only the data changes.

---

## Local testing

```bash
python -m http.server 8000
```

- Site: http://localhost:8000/home.html  
- Admin: http://localhost:8000/admin/

Use a browser that supports ES modules (all modern browsers).

---

## PayGate (later)

Donations still use the existing UI. Card payments need PayGate merchant credentials + a small serverless function. That can be added after the CMS is live.

---

## Checklist

- [ ] Firebase project created  
- [ ] Email/Password auth + 1 admin user  
- [ ] Firestore + Storage enabled  
- [ ] `js/firebase-config.js` filled in  
- [ ] **Rules deployed** (`firestore.rules` + `storage.rules`)  
- [ ] **Register me as admin** from Setup tab  
- [ ] Seeded from admin  
- [ ] Redeployed to Vercel  
- [ ] Client can log into `/admin/` and update a dog  
- [ ] Test Forgot Password email  
- [ ] Test Contact form appears under Messages  
