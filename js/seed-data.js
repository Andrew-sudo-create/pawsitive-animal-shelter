/**
 * Default seed content matching the current static site.
 * Used by Admin → "Seed / reset content from site defaults".
 */
export const seedData = {
  settings: {
    logoUrl: "/images/logo.png",
    contact: {
      email: "pawsitiverasa@gmail.com",
      phone: "+27 76 485 4448",
      address: "Plot 143 Pretorius street Laezonia, Centurion, Gauteng, 0026",
    },
    social: {
      facebookUrl:
        "https://www.facebook.com/p/Pawsitive-Animal-Shelter-61573736377122/",
      instagramUrl: "",
    },
    footer: {
      blurb:
        "Registered NPO dedicated to rescuing, rehabilitating and rehoming animals. Every animal deserves love, care and a forever home.",
      copyright: "© 2026 Pawsitive Animal Shelter. All rights reserved.",
    },
    bank: {
      bank: "First National Bank",
      accountName: "Pawsitive Animal Shelter",
      accountNumber: "1234567890",
      branchCode: "250655",
      referenceHint: "Your Name",
    },
    hours: {
      weekday: "Tue–Sat: 9:00 – 17:00",
      sunday: "Sun: 10:00 – 15:00",
      monday: "Monday: Closed",
      note: "Visits by appointment only",
    },
  },

  pages: {
    home: {
      hero: {
        headline: "Every Paw Deserves a Home",
        subtext:
          "Join us in giving our 50 rescued dogs a second chance at happiness",
        ctaPrimary: "Donate Now",
        ctaSecondary: "Meet Our Dogs",
        imageUrl: "/images/hero.jpg",
      },
      stats: [
        { value: "50+", label: "Dogs in Care" },
        { value: "200+", label: "Dogs Rehomed" },
        { value: "10", label: "Years Operating" },
        { value: "100%", label: "NPO Registered" },
      ],
      mission: {
        title: "Our Mission",
        body: "Dedicated to rescuing, rehabilitating, and rehoming animals in need while educating our community about responsible pet ownership.",
      },
      cta: {
        tag: "MAKE A DIFFERENCE",
        headline: "Every Donation Helps Save A Life",
        body: "Your support provides food, medical treatment, and shelter for dogs waiting for their forever homes.",
        button: "Support Our Cause",
      },
    },
    about: {
      hero: {
        headline: "About Pawsitive Animal Shelter",
        subtext:
          "A registered NPO dedicated to animal welfare, rescue, and community education.",
        imageUrl: "/images/about-banner.jpg",
      },
      story: {
        title: "Who We Are",
        body: "Founded in 2016, Pawsitive Animal Shelter is a registered Non-Profit Organisation committed to animal welfare and community education. Our farm-based sanctuary provides a safe haven for up to 50 dogs at any given time.",
        imageUrl: "/images/about-story.jpg",
      },
      facilitiesIntro:
        "Our farm-based sanctuary provides safe, spacious environments for every dog in our care.",
    },
    dogs: {
      hero: {
        tag: "ADOPT • LOVE • RESCUE",
        headline: "Meet Our Dogs",
        subtext:
          "Every dog has a unique story and is waiting for a loving forever home.",
        imageUrl: "/images/dogs-banner.jpg",
      },
      readyToAdopt: {
        headline: "Ready to Adopt?",
        body: "Our adoption process is simple, supportive, and designed to find the perfect match for both you and your new companion.",
        button: "Contact Us About Adoption",
      },
    },
    donate: {
      hero: {
        tag: "EVERY DONATION MAKES A DIFFERENCE",
        headline: "Support Our Mission",
        subtext:
          "Your generosity helps us rescue, rehabilitate, and rehome dogs in need.",
        imageUrl: "/images/donate-banner.jpg",
      },
      paymentNote: "Secure payment processing via Payfast | PayGate",
      snapscanImageUrl: "",
      taxBlurb:
        "Donations to Pawsitive Animal Shelter may qualify for a Section 18A tax certificate. Contact us for details.",
    },
    contact: {
      hero: {
        tag: "WE'D LOVE TO HEAR FROM YOU",
        headline: "Contact Us",
        subtext:
          "Reach out about adoptions, volunteering, donations, or visiting the shelter.",
        imageUrl: "/images/contact-banner.jpg",
      },
      mapEmbedUrl:
        "https://www.google.com/maps?q=Plot+143+Pretorius+street+Laezonia+Centurion&output=embed",
    },
  },

  dogs: [
    {
      name: "Max",
      breed: "Golden Retriever Mix",
      age: "3 years",
      temperament: "Friendly, Energetic, Playful",
      vaccinated: "Yes",
      category: "adult",
      description:
        "Golden retriever, 3 years old. Max is friendly and energetic.",
      imageUrl: "/images/dog1.jpg",
      featured: true,
      published: true,
      order: 1,
    },
    {
      name: "Luna",
      breed: "Beagle",
      age: "2 years",
      temperament: "Playful, Curious, Social",
      vaccinated: "Yes",
      category: "puppy",
      description:
        "Luna is a playful Beagle who loves exploring and meeting new families.",
      imageUrl: "/images/dog2.jpg",
      featured: true,
      published: true,
      order: 2,
    },
    {
      name: "Buddy",
      breed: "Labrador Retriever",
      age: "4 years",
      temperament: "Gentle, Calm, Loving",
      vaccinated: "Yes",
      category: "adult",
      description:
        "Buddy is a gentle Labrador who enjoys cuddles and calm family time.",
      imageUrl: "/images/dog3.jpg",
      featured: true,
      published: true,
      order: 3,
    },
  ],

  people: [
    {
      name: "Popo Okolie",
      role: "Housekeeping",
      bio: "Popo helps maintain a clean, safe, and welcoming shelter environment.",
      imageUrl: "/images/popo.jpg",
      group: "staff",
      order: 1,
    },
    {
      name: "Derrick Doncabe",
      role: "Driver / Outreach Assistant",
      bio: "Derrick assists with animal transportation and community outreach.",
      imageUrl: "/images/derrick.jpg",
      group: "staff",
      order: 2,
    },
    {
      name: "Emmanuel Gwanda",
      role: "Senior Shelter Assistant",
      bio: "Emmanuel oversees daily care of the animals and supports shelter operations.",
      imageUrl: "/images/emmanuel.jpg",
      group: "staff",
      order: 3,
    },
    {
      name: "Sizani Khumalo",
      role: "Shelter Assistant",
      bio: "Sizani provides daily feeding, cleaning, enrichment, and general care.",
      imageUrl: "/images/sizani.jpg",
      group: "staff",
      order: 4,
    },
    {
      name: "Alan Keschner",
      role: "Director (Chairperson)",
      bio: "Alan provides strategic leadership and governance for the organisation.",
      imageUrl: "/images/alan.jpg",
      group: "directors",
      order: 1,
    },
    {
      name: "Ute Schutz",
      role: "Animal Welfare",
      bio: "Ute oversees animal welfare standards and compassionate care.",
      imageUrl: "/images/ute.jpg",
      group: "directors",
      order: 2,
    },
    {
      name: "Paul Daniec",
      role: "Facilities Management",
      bio: "Paul manages the shelter's facilities and infrastructure.",
      imageUrl: "/images/paul.jpg",
      group: "directors",
      order: 3,
    },
    {
      name: "Natalie Pope",
      role: "Shelter Manager",
      bio: "Natalie oversees the shelter's daily operations and coordinates staff.",
      imageUrl: "/images/natalie.jpg",
      group: "committee",
      order: 1,
    },
    {
      name: "Raffaella Ruttell",
      role: "Treasurer",
      bio: "Raffaella manages the organisation's finances and reporting.",
      imageUrl: "/images/raffaella.jpg",
      group: "committee",
      order: 2,
    },
    {
      name: "Annette Veldsman",
      role: "Outreach Programme",
      bio: "Annette leads community outreach and education initiatives.",
      imageUrl: "/images/annette.jpg",
      group: "committee",
      order: 3,
    },
    {
      name: "Willy van Ek",
      role: "Administration",
      bio: "Willy manages administrative operations and communications.",
      imageUrl: "/images/willy.jpg",
      group: "committee",
      order: 4,
    },
    {
      name: "Seten Naidoo",
      role: "Fundraising",
      bio: "Seten supports fundraising and community engagement efforts.",
      imageUrl: "/images/seten.jpg",
      group: "committee",
      order: 5,
    },
  ],
};
