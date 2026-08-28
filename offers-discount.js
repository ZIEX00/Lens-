const gift = document.getElementById("discount-gift");
const giftTrigger = document.getElementById("discount-gift-trigger");
const giftPanel = document.getElementById("discount-gift-panel");
const giftClose = document.getElementById("discount-gift-close");
const giftPercent = document.getElementById("discount-gift-percent");
const giftCode = document.getElementById("discount-gift-code");
const copyButton = document.getElementById("discount-gift-copy");
const copyStatus = document.getElementById("discount-gift-copy-status");

const offersText = {
    ar: { title: "جميع عروض لينس", nav: ["المشاريع", "الباقات", "تواصل معنا"], kicker: "عروض لينس", heading: "اختار العرض المناسب لقَصتك.", description: "عروض متخصصة للريلز والتصوير والتصميم والمحتوى المستمر، ويمكن تخصيص كل عرض حسب احتياج مشروعك.", names: ["ريلز سريعة", "باقة الريلز الشهرية", "تصوير منتجات", "تصميم بصري", "فيديو يوتيوب", "حملة متكاملة"], buttons: ["اطلب العرض", "ابدأ الباقة", "اطلب العرض", "اطلب العرض", "اطلب العرض", "تحدث معنا"], home: "الرئيسية", toggle: "English" },
    en: { title: "Lens Offers", nav: ["PROJECTS", "PACKAGES", "CONTACT"], kicker: "LENS OFFERS", heading: "Choose the right offer for your story.", description: "Focused offers for reels, photography, design, and ongoing content, tailored to your project.", names: ["Quick Reels", "Monthly Reels Package", "Product Photography", "Visual Design", "YouTube Video", "Full Campaign"], buttons: ["REQUEST OFFER", "START PACKAGE", "REQUEST OFFER", "REQUEST OFFER", "REQUEST OFFER", "TALK TO US"], home: "HOME", toggle: "العربية" }
};

const applyOffersLanguage = (language) => {
    const text = offersText[language] || offersText.ar;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.title = text.title;
    document.querySelectorAll(".nav-links a").forEach((link, index) => link.textContent = text.nav[index]);
    document.querySelector(".offers-kicker").lastChild.textContent = ` ${text.kicker}`;
    document.querySelector(".offers-hero h1").textContent = text.heading;
    document.querySelector(".offers-hero p").textContent = text.description;
    document.querySelectorAll(".offers-grid .package-name").forEach((name, index) => name.textContent = text.names[index]);
    document.querySelectorAll(".offers-grid .package-button").forEach((button, index) => { const icon = button.querySelector("i")?.outerHTML || ""; button.innerHTML = `${text.buttons[index]} ${icon}`; });
    document.querySelector(".offers-back a").lastChild.textContent = ` ${language === "ar" ? "العودة إلى الصفحة الرئيسية" : "Back to homepage"}`;
    document.querySelector(".nav .language-toggle").textContent = text.home;
    document.getElementById("offers-language-toggle").textContent = text.toggle;
    localStorage.setItem("lens-language", language);
};

const savedLanguage = localStorage.getItem("lens-language") || "ar";
applyOffersLanguage(savedLanguage);
document.getElementById("offers-language-toggle")?.addEventListener("click", () => applyOffersLanguage(document.documentElement.lang === "ar" ? "en" : "ar"));

if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
    sessionStorage.removeItem("lens-discount");
}

const createCode = (discount) => `LENS${discount}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
const applyDiscount = (discount) => document.querySelectorAll(".package-price[data-base-price]").forEach((price) => {
    const basePrice = Number(price.dataset.basePrice);
    const discountedPrice = Math.round(basePrice * (1 - discount / 100));
    const period = price.querySelector("span")?.textContent || "";
    price.innerHTML = `<del>${basePrice}$</del> ${discountedPrice}$<span>${period}</span>`;
    price.classList.add("has-discount");
});

let savedOffer = JSON.parse(sessionStorage.getItem("lens-discount") || "null");
if (savedOffer) {
    giftPercent.textContent = `${savedOffer.discount}%`;
    giftCode.textContent = savedOffer.code;
    applyDiscount(savedOffer.discount);
}

giftTrigger?.addEventListener("click", () => {
    if (!savedOffer) {
        const discount = Math.floor(Math.random() * 11) + 5;
        savedOffer = { code: createCode(discount), discount };
        sessionStorage.setItem("lens-discount", JSON.stringify(savedOffer));
    }
    giftPercent.textContent = `${savedOffer.discount}%`;
    giftCode.textContent = savedOffer.code;
    applyDiscount(savedOffer.discount);
    gift.classList.add("is-open");
    giftTrigger.setAttribute("aria-expanded", "true");
    giftPanel.setAttribute("aria-hidden", "false");
    giftClose.focus();
});

giftClose?.addEventListener("click", () => {
    gift.classList.remove("is-open");
    giftTrigger.setAttribute("aria-expanded", "false");
    giftPanel.setAttribute("aria-hidden", "true");
    giftTrigger.focus();
});

copyButton?.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(giftCode.textContent);
        copyStatus.textContent = "تم نسخ الكود";
    } catch {
        copyStatus.textContent = "انسخ الكود يدويًا";
    }
});
