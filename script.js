/*=========================================================
    PAWSITIVE ANIMAL SHELTER
    Main JavaScript File

    Author: Kaylynne Squire

    This file controls all interactive features
    on the website.
=========================================================*/


/*=========================================================
    MOBILE MENU
=========================================================*/

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {

    menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("show");
    });

    // Close menu after clicking a link

    document.querySelectorAll(".nav-links a").forEach(link => {

        link.addEventListener("click", () => {

            navLinks.classList.remove("show");

        });

    });

    // Close menu with Escape key

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            navLinks.classList.remove("show");

        }

    });

}


/*=========================================================
    STICKY HEADER SHADOW
=========================================================*/

const header = document.querySelector("header");

window.addEventListener("scroll", () => {

    if (header) {

        if (window.scrollY > 50) {

            header.style.boxShadow = "0 10px 25px rgba(0,0,0,.12)";

        } else {

            header.style.boxShadow = "0 2px 15px rgba(0,0,0,.05)";

        }

    }

});


/*=========================================================
    ANIMATED COUNTERS
=========================================================*/

const counters = document.querySelectorAll(".counter");

if (counters.length > 0) {

    const counterObserver = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                const counter = entry.target;

                const target = Number(counter.dataset.target);

                let current = 0;

                const increment = target / 80;

                function updateCounter() {

                    current += increment;

                    if (current < target) {

                        counter.textContent = Math.ceil(current) + "+";

                        requestAnimationFrame(updateCounter);

                    } else {

                        counter.textContent = target + "+";

                    }

                }

                updateCounter();

                counterObserver.unobserve(counter);

            }

        });

    });

    counters.forEach(counter => {

        counterObserver.observe(counter);

    });

}


/*=========================================================
    FADE-IN ANIMATION
=========================================================*/

const fadeItems = document.querySelectorAll(".fade");

if (fadeItems.length > 0) {

    const fadeObserver = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    }, {
        threshold: 0.2
    });

    fadeItems.forEach(item => {

        fadeObserver.observe(item);

    });

}


/*=========================================================
    CARD ANIMATION
=========================================================*/

const cards = document.querySelectorAll(
    ".stat-card, .mission-card, .dog-card"
);

if (cards.length > 0) {

    const cardObserver = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.style.opacity = "1";

                entry.target.style.transform = "translateY(0)";

            }

        });

    }, {
        threshold: 0.15
    });

    cards.forEach(card => {

        card.style.opacity = "0";

        card.style.transform = "translateY(40px)";

        card.style.transition = ".7s ease";

        cardObserver.observe(card);

    });

}


/*=========================================================
    SMOOTH SCROLL
=========================================================*/

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            e.preventDefault();

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});


/*=========================================================
    DOG SEARCH
=========================================================*/

const searchInput = document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("keyup", function () {

        const value = this.value.toLowerCase();

        const dogCards = document.querySelectorAll(".dog-card");

        dogCards.forEach(card => {

            const dogName = card.querySelector("h3").textContent.toLowerCase();

            if (dogName.includes(value)) {

                card.style.display = "flex";

            } else {

                card.style.display = "none";

            }

        });

    });

}


/*=========================================================
    DOG FILTER BUTTONS
=========================================================*/

const filterButtons = document.querySelectorAll(".filter-btn");

if (filterButtons.length > 0) {

    filterButtons.forEach(button => {

        button.addEventListener("click", function () {

            filterButtons.forEach(btn => {

                btn.classList.remove("active");

            });

            this.classList.add("active");

            const filter = this.dataset.filter;

            const dogCards = document.querySelectorAll(".dog-card");

            dogCards.forEach(card => {

                if (filter === "all") {

                    card.style.display = "flex";

                }

                else if (card.dataset.category === filter) {

                    card.style.display = "flex";

                }

                else {

                    card.style.display = "none";

                }

            });

        });

    });

}

/* ==========================================
   AUTO-FILL CONTACT SUBJECT
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const subjectInput = document.getElementById("subject");

    if (!subjectInput) return;

    const params = new URLSearchParams(window.location.search);

    const subject = params.get("subject");

    if (subject) {

        subjectInput.value = subject;

    }

});


/*=========================================================
    CONTACT FORM — handled by js/contact-form.js (Firestore)
=========================================================*/
