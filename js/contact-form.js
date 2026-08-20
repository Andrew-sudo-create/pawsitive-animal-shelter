/**
 * Contact form → Firestore contact_messages
 */
import {
  isFirebaseConfigured,
  submitContactMessage,
} from "./firebase.js";

const form = document.getElementById("contactForm");
if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name")?.value.trim() || "";
    const email = document.getElementById("email")?.value.trim() || "";
    const phone = document.getElementById("phone")?.value.trim() || "";
    const subject = document.getElementById("subject")?.value.trim() || "";
    const message = document.getElementById("message")?.value.trim() || "";

    if (!name || !email || !message) {
      alert("Please complete all required fields.");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      if (!isFirebaseConfigured()) {
        throw new Error(
          "Contact form is not connected yet. Please email pawsitiverasa@gmail.com or call the shelter."
        );
      }
      await submitContactMessage({ name, email, phone, subject, message });
      alert(
        "Thank you for contacting Pawsitive Animal Shelter! We will get back to you as soon as possible."
      );
      form.reset();
    } catch (err) {
      alert(err.message || "Could not send your message. Please try again or call us.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
