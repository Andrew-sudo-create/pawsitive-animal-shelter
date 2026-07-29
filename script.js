/*=========================================================
    PAWSITIVE ANIMAL SHELTER
    Main JavaScript File

    This file controls all interactive features
    on the website.
=========================================================*/

/*=========================================================
    MOBILE MENU
=========================================================*/

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if(menuBtn && navLinks){
    menuBtn.addEventListener("click", function(){
        navLinks.classList.toggle("show");
    });
}

/*=========================================================
    ANIMATED COUNTERS
=========================================================*/

const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {
    const target = Number(counter.dataset.target);
    let count = 0;
    const speed = target / 100;

    function updateCounter(){
        count += speed;
        if(count < target){
            counter.innerText = Math.ceil(count);
            requestAnimationFrame(updateCounter);
        }
        else{
            counter.innerText = target + "+";
        }
    }

    updateCounter();
});

/*=========================================================
    FADE ANIMATION
=========================================================*/

const fadeElements = document.querySelectorAll(".fade:not(.dog-card)");
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.classList.add("show");
        }
    });
});

fadeElements.forEach(item => {
    observer.observe(item);
});

/*=========================================================
    STICKY HEADER SHADOW
=========================================================*/

const header = document.querySelector("header");

window.addEventListener("scroll", function(){
    if(window.scrollY > 50){
        header.style.boxShadow = "0 10px 25px rgba(0,0,0,.12)";
    }
    else{
        header.style.boxShadow = "0 2px 15px rgba(0,0,0,.05)";
    }
});

/*=========================================================
    SMOOTH SCROLL
=========================================================*/

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e){
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if(target){
            target.scrollIntoView({
                behavior:"smooth"
            });
        }
    });
});

/*=========================================================
    DOG SEARCH
=========================================================*/

const searchInput = document.getElementById("searchInput");

if(searchInput){
    searchInput.addEventListener("keyup", function(){
        const searchValue = this.value.toLowerCase();
        const dogCards = document.querySelectorAll(".dog-card");
        dogCards.forEach(function(card){
            const dogName = card.querySelector("h3").textContent.toLowerCase();
            if(dogName.includes(searchValue)){
                card.style.display = "flex";
            }
            else{
                card.style.display = "none";
            }
        });
    });
}

/*=========================================================
    FILTER BUTTONS
=========================================================*/

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(function(button){
    button.addEventListener("click", function(){
        filterButtons.forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");
        const filter = this.dataset.filter;
        const dogCards = document.querySelectorAll(".dog-card");
        dogCards.forEach(function(card){
            if(filter === "all"){
                card.style.display = "flex";
            }
            else if(card.dataset.category === filter){
                card.style.display = "flex";
            }
            else{
                card.style.display = "none";
            }
        });
    });
});

/*=========================================================
    CONTACT FORM VALIDATION
=========================================================*/

const contactForm = document.getElementById("contactForm");

if(contactForm){
    contactForm.addEventListener("submit", function(event){
        event.preventDefault();
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        if(name === "" || email === "" || message === ""){
            alert("Please complete all required fields.");
            return;
        }

        alert("Thank you! Your message has been sent.");
        contactForm.reset();
    });
}