const heroVisual = document.querySelector(".hero-visual");
const heroPreview = document.querySelector(".hero-preview");

const supportChat = document.getElementById("support-chat");
const supportChatToggle = document.getElementById("support-chat-toggle");
const supportChatClose = document.getElementById("support-chat-close");
const setSupportChatOpen = (isOpen) => {
    if (!supportChat) return;
    if (!isOpen && document.activeElement?.closest(".support-chat-panel")) supportChatToggle?.focus();
    supportChat.classList.toggle("is-open", isOpen);
    supportChatToggle?.setAttribute("aria-expanded", String(isOpen));
    document.getElementById("support-chat-panel")?.setAttribute("aria-hidden", String(!isOpen));
};

supportChat?.addEventListener("click", (event) => event.stopPropagation());
supportChatToggle?.addEventListener("click", (event) => {
    event.preventDefault();
    const isOpen = !supportChat.classList.contains("is-open");
    setSupportChatOpen(isOpen);
});
supportChatClose?.addEventListener("click", () => setSupportChatOpen(false));
if (window.location.hash === "#support-chat") setSupportChatOpen(true);
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setSupportChatOpen(false);
});

if (heroVisual && heroPreview && window.matchMedia("(pointer: fine)").matches) {
    let pointerFrame = null;

    heroVisual.addEventListener("pointermove", (event) => {
        const bounds = heroVisual.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;

        if (pointerFrame) cancelAnimationFrame(pointerFrame);
        pointerFrame = requestAnimationFrame(() => {
            heroPreview.style.setProperty("--hero-rotate-y", `${x * 5}deg`);
            heroPreview.style.setProperty("--hero-rotate-x", `${y * -5}deg`);
            pointerFrame = null;
        });
    });

    heroVisual.addEventListener("pointerleave", () => {
        heroPreview.style.setProperty("--hero-rotate-y", "0deg");
        heroPreview.style.setProperty("--hero-rotate-x", "0deg");
    });
}

const videoModal = document.getElementById("video-modal");
const imageModal = document.getElementById("image-modal");
const portfolioVideo = document.getElementById("portfolio-video");
const portfolioImage = document.getElementById("portfolio-image");
const mediaTriggers = document.querySelectorAll("[data-video], [data-image]");

const showMediaError = (modal, message) => {
    const error = document.createElement("p");
    error.className = "media-modal-error";
    error.textContent = message;
    modal.append(error);
};

const clearMediaErrors = (modal) => {
    modal.querySelectorAll(".media-modal-error").forEach((error) => error.remove());
};

const closeMediaModal = (modal) => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    portfolioVideo.pause();
    portfolioVideo.removeAttribute("src");
    portfolioVideo.load();
    portfolioImage.removeAttribute("src");
    clearMediaErrors(modal);
};

mediaTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
        if (trigger.dataset.video) {
            clearMediaErrors(videoModal);
            portfolioVideo.src = trigger.dataset.video;
            videoModal.classList.add("is-open");
            videoModal.setAttribute("aria-hidden", "false");
            document.body.classList.add("modal-open");
            portfolioVideo.play().catch(() => {});
        }

        if (trigger.dataset.image) {
            clearMediaErrors(imageModal);
            portfolioImage.src = trigger.dataset.image;
            imageModal.classList.add("is-open");
            imageModal.setAttribute("aria-hidden", "false");
            document.body.classList.add("modal-open");
        }
    });
});

document.querySelectorAll(".media-modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
        if (event.target === modal || event.target.classList.contains("media-modal-close")) {
            closeMediaModal(modal);
        }
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (videoModal.classList.contains("is-open")) closeMediaModal(videoModal);
        if (imageModal.classList.contains("is-open")) closeMediaModal(imageModal);
    }
});

const homepageTranslations = {
    ar: {
        title: "لينس للتصوير والتصميم والمونتاج",
        toggle: "English",
        toggleLabel: "التبديل إلى الإنجليزية",
        nav: ["المشاريع", "من نحن", "الباقات", "الأسئلة الشائعة", "تواصل معنا"],
        heroKicker: "فيديو • تصميم • تصوير",
        heroTitle: "نحوّل الأفكار إلى <em>قصص بصرية.</em>",
        heroSubtitle: "مونتاج وتصوير وتصميم يخطف الانتباه ويجعل علامتك لا تُنسى.",
        start: "ابدأ مشروعك <i class=\"fas fa-arrow-left\"></i>",
        work: "شاهد أعمالنا",
        proof: ["<i class=\"fas fa-check\"></i> تسليم سريع", "<i class=\"fas fa-check\"></i> جاهز للنشر", "<i class=\"fas fa-check\"></i> أسلوب مميز"],
        studio: "استوديو إبداعي",
        production: "إنتاج لينس",
        idea: "فكرتك <strong>إبداعنا</strong>",
        video: "<i class=\"fas fa-film\"></i> فيديو",
        photo: "<i class=\"fas fa-camera\"></i> صورة",
        reelTitle: "شاهد إبداعنا <em>في الحركة.</em>",
        reelSubtitle: "شاهد أبرز أعمالنا للمبدعين والعلامات التجارية والحملات الرقمية.",
        projectsTitle: "أعمال مختارة",
        projectsSubtitle: "مشاريع حقيقية للقنوات والعلامات التجارية والحملات.",
        projectNames: ["مختارات من سلسلة يوتيوب", "إعلانات منتجات تيك توك", "تصوير فوتوغرافي", "ريلز تعليمية لإنستجرام"],
        projectDescriptions: ["مونتاج سريع مع موشن جرافيك وسرد قصصي يحافظ على تفاعل الجمهور.", "عرض حيوي للمنتجات مع أصوات رائجة وترجمة وخطافات تلفت الانتباه.", "مجموعة صور فوتوغرافية مختارة بعناية لإظهار التفاصيل والهوية.", "محتوى تعليمي واضح مع نصوص وعلامات وخطوات بإيقاع جذاب."],
        projectLinks: ["شاهد الفيديو", "شاهد الفيديو", "شاهد الصور", "شاهد الفيديو"],
        packagesTitle: "الباقات",
        packagesSubtitle: "خطط مرنة للمونتاج مصممة حسب محتواك ومنصتك وأهداف نموك.",
        aboutTitle: "من نحن",
        aboutText: "نحن فريق متخصص في مونتاج فيديوهات السوشيال ميديا والتصوير والتصميم. نركز على جذب المشاهد من الثواني الأولى، والحفاظ على تفاعله، وبناء محتوى يحكي قصة قوية بأسلوب مناسب لكل منصة.",
        skillsTitle: "ماذا نقدم",
        skills: ["مونتاج فيديوهات يوتيوب الطويلة", "محتوى قصير لتيك توك وريلز", "الترجمة والكتابة على الفيديو", "موشن جرافيك أساسي", "تلوين وتصميم صوتي", "Premiere Pro وAfter Effects وDaVinci"],
        processTitle: "كيف نعمل معًا",
        processTitles: ["شارك محتواك وأهدافك", "احصل على أسلوب مصمم لك", "راجع وعدّل"],
        processDescriptions: ["احكِ لنا عن قناتك أو علامتك وشارك الملفات الخام ورؤيتك.", "نصمم طريقة مونتاج تناسب هويتك وتساعد محتواك على تحقيق نتائج أفضل.", "ستحصل على نسخة أولية للمراجعة ونعدّلها حتى تصل للنتيجة التي تتخيلها."],
        testimonialsTitle: "ماذا يقول العملاء",
        testimonials: ["\"لينس ساعدني أحوّل قناتي إلى محتوى احترافي. فهمهم للإيقاع والسرد ممتاز.\"", "\"تسليم سريع وجودة احترافية ودائمًا يفهمون المطلوب من أول مرة.\"", "\"الاهتمام بالتفاصيل واضح في كل قصّة وانتقال وترجمة. هذا ما يميزهم.\""],
        authors: ["سارة جونسون", "إيميلي رودريغيز", "ديفيد بارك"],
        roles: ["صانعة محتوى على يوتيوب", "مديرة سوشيال ميديا", "صانع محتوى"],
        faqTitle: "الأسئلة الشائعة",
        faqQuestions: ["كيف يتم تحديد السعر؟", "ما مدة التسليم المعتادة؟", "كم عدد التعديلات المتاحة؟", "كيف نشارك الملفات؟", "هل تعملون مع المبدعين الجدد؟"],
        faqAnswers: ["نوفر باقات أو تسعيرًا لكل فيديو حسب احتياجك. تواصل معنا لنحدد عرضًا مناسبًا لنوع المحتوى ومدته وتعقيده.", "محتوى تيك توك وريلز يستغرق عادة من يومين إلى ثلاثة أيام عمل، وفيديوهات يوتيوب من خمسة إلى سبعة أيام حسب التفاصيل.", "يشمل كل مشروع جولتين من التعديلات لضمان رضاك الكامل.", "يمكنك استخدام Google Drive أو Dropbox أو WeTransfer أو Frame.io، وسنسلّمك الملفات بالجودة والصيغة التي تفضلها.", "نعم، نعمل مع المبدعين في كل المراحل ونصمم أسلوبنا حسب احتياجاتك وأهدافك."],
        contactTitle: "جاهز لتطوير محتواك؟",
        contactSubtitle: "شاركنا قناتك وأسلوبك وأهدافك، وسنرد عليك بأفكار وخيارات مناسبة.",
        labels: ["الاسم *", "البريد الإلكتروني *", "اسم العلامة أو القناة", "المنصات", "نوع المحتوى", "رسالة أو تفاصيل المشروع"],
        platforms: ["يوتيوب", "تيك توك", "إنستجرام", "تصوير", "أخرى"],
        contentTypes: ["محتوى قصير", "محتوى طويل", "الاثنان"],
        send: "إرسال الرسالة",
        direct: "تفضل البريد الإلكتروني؟ تواصل معنا مباشرة على",
        footer: "© 2025 لينس للتصوير. جميع الحقوق محفوظة.",
        modalVideo: "فيديو الأعمال", modalPhoto: "صورة من الأعمال", closeVideo: "إغلاق الفيديو", closePhoto: "إغلاق الصورة"
    },
    en: {
        title: "Lens Photography - graphics Design - editing", toggle: "العربية", toggleLabel: "Switch to Arabic",
        nav: ["PROJECTS", "ABOUT US", "PACKAGES", "FAQ", "CONTACT"], heroKicker: "VIDEO • DESIGN • PHOTOGRAPHY", heroTitle: "We Turn Ideas Into <em>Visual Stories.</em>", heroSubtitle: "Scroll-stopping editing, photography, and graphics built to make your brand impossible to ignore.", start: "Start a project <i class=\"fas fa-arrow-right\"></i>", work: "Explore our work", proof: ["<i class=\"fas fa-check\"></i> Fast turnaround", "<i class=\"fas fa-check\"></i> Platform-ready", "<i class=\"fas fa-check\"></i> Personal style"], studio: "CREATIVE STUDIO", production: "LENS PRODUCTION", idea: "YOUR IDEA <strong>OUR CRAFT</strong>", video: "<i class=\"fas fa-film\"></i> VIDEO", photo: "<i class=\"fas fa-camera\"></i> PHOTO", reelTitle: "Featured Show reel", reelSubtitle: "A highlight of edits for creators, brands, and digital campaigns.", projectsTitle: "Selected Projects", projectsSubtitle: "Real edits for real channels, brands, and campaigns.", projectNames: ["YouTube Series Highlights", "TikTok Product Ads", "Photography photo", "Instagram Tutorial Reels"], projectDescriptions: ["Fast-paced editing with motion graphics and retention-focused storytelling.", "High-energy product showcases with trending sounds, captions, and scroll-stopping hooks.", "A carefully selected photography collection that captures detail and identity.", "Clear how-to content with text overlays, step markers, and engaging pacing."], projectLinks: ["Watch Video", "Watch Video", "Watch photo", "Watch Video"], packagesTitle: "Packages", packagesSubtitle: "Flexible editing plans built around your content, platform, and growth goals.", aboutTitle: "About Us", aboutText: "We are a creative team specializing in social media video editing, photography, and design. We focus on hooking viewers in the first seconds, maintaining attention, and building strong stories in a style made for each platform.", skillsTitle: "What We Do", skills: ["YouTube long-form editing", "TikTok/Reels short-form content", "Captioning & Subtitles", "Motion Graphics Basics", "Color Grading & Sound Design", "Premiere Pro, After Effects, and DaVinci"], processTitle: "How We Work Together", processTitles: ["Share Your Content & Goals", "Get a Tailored Edit Style", "Review & Refine"], processDescriptions: ["Tell us about your channel or brand and share your raw files and vision.", "We create an editing approach that matches your identity and supports better results.", "You receive a first cut for feedback and we refine it until it feels right."], testimonialsTitle: "What Clients Say", testimonials: ["\"Lens helped me turn my channel into polished content. Their sense of pacing and storytelling is excellent.\"", "\"Fast delivery, professional quality, and they always understand the brief from the start.\"", "\"The attention to detail shows in every cut, transition, and caption. That is what sets them apart.\""], authors: ["Sara Johnson", "Emily Rodriguez", "David Park"], roles: ["YouTube Creator", "Social Media Manager", "Content Creator"], faqTitle: "FAQ", faqQuestions: ["How does pricing work?", "What's the typical turnaround time?", "How many revisions are included?", "How do we share content and files?", "Do you work with new creators?"], faqAnswers: ["We offer packages and per-video pricing depending on your needs. Contact us for a quote based on content type, length, and complexity.", "Short-form content usually takes two to three business days, while YouTube videos take five to seven depending on complexity.", "Every project includes two rounds of revisions to make sure you are fully satisfied.", "You can use Google Drive, Dropbox, WeTransfer, or Frame.io. We deliver in your preferred format and quality.", "Yes. We work with creators at every stage and tailor our approach to your needs and goals."], contactTitle: "Ready to Level Up Your Content?", contactSubtitle: "Share your channel, style, and goals. We'll reply with ideas and options.", labels: ["Name *", "Email *", "Brand / Channel Name", "Platform(s)", "Content Type", "Message / Project Details"], platforms: ["YouTube", "TikTok", "Instagram", "Photography", "Other"], contentTypes: ["Short-form", "Long-form", "Both"], send: "Send Message", direct: "Prefer email? Reach us directly at", footer: "© 2025 Lens Photography. All rights reserved.", modalVideo: "Portfolio video", modalPhoto: "Portfolio photo", closeVideo: "Close video", closePhoto: "Close photo"
    }
};

const supportChatTranslations = {
    ar: {
        header: "دردشة الدعم", online: "نحن هنا لمساعدتك", welcomeTitle: "أهلًا بك! 👋", welcomeQuestion: "كيف يمكننا مساعدتك اليوم؟", welcomeSubtitle: "نحن هنا لمساعدتك!", start: "ابدأ المحادثة", replyTime: "نرد عادةً خلال دقائق قليلة.", introduce: "عرّفنا بنفسك 👋", name: "الاسم", email: "البريد الإلكتروني", topicLabel: "كيف يمكننا مساعدتك؟", topicPlaceholder: "اختر موضوعًا", topicPhoto: "باقة تصوير", topicVideo: "تعديل فيديو", topicGeneral: "استفسار عام", startConversation: "ابدأ المحادثة", waitingTitle: "شكرًا لتواصلك معنا!", waitingText: "طلبك في انتظار أحد أفراد فريق الدعم.", waitingConnect: "سنتواصل معك بمجرد قبول المحادثة.", conversationGreeting: "أهلًا بك! كيف يمكننا مساعدتك اليوم؟", messagePlaceholder: "اكتب رسالتك...", end: "إنهاء المحادثة", completeTitle: "تم كل شيء بنجاح! 🎉", completeText: "فريقنا سيتواصل معك قريبًا.", ratingQuestion: "كيف كانت تجربتك؟", newConversation: "بدء محادثة جديدة", quickActions: ["تفاصيل الباقات", "بدء مشروع", "مدة التسليم"]
    },
    en: {
        header: "Support Chat", online: "We're here to help", welcomeTitle: "Hi! 👋", welcomeQuestion: "How can we help you today?", welcomeSubtitle: "We're here to help!", start: "Start Chat", replyTime: "We usually reply within a few minutes.", introduce: "Please introduce yourself 👋", name: "Your name", email: "Your email", topicLabel: "What can we help you with?", topicPlaceholder: "Select a topic", topicPhoto: "Photography package", topicVideo: "Video editing", topicGeneral: "General inquiry", startConversation: "Start Conversation", waitingTitle: "Thanks for reaching out!", waitingText: "Your request is waiting for a support agent.", waitingConnect: "We'll connect you as soon as someone accepts the chat.", conversationGreeting: "Hi! How can we help you today?", messagePlaceholder: "Type your message...", end: "End conversation", completeTitle: "You're all set! 🎉", completeText: "Our team will be with you in a moment.", ratingQuestion: "How was your experience?", newConversation: "Start a new conversation", quickActions: ["Package details", "Start a project", "Delivery time"]
    }
};

const footerTranslations = {
    ar: { description: "استوديو إبداعي متخصص في التصوير والتصميم والمونتاج.", pagesTitle: "صفحات الموقع", prices: "الأسعار", projects: "أعمالنا", faq: "الأسئلة الشائعة", contact: "تواصل معنا", policyTitle: "سياسات وقوانين", privacy: "سياسة الخصوصية", terms: "شروط الاستخدام", refund: "سياسة الاسترجاع", contactTitle: "تواصل معنا", emailLabel: "البريد الإلكتروني:", phoneLabel: "الهاتف:", addressLabel: "العنوان:", address: "مصر", copyright: "© 2026 لينس. جميع الحقوق محفوظة.", madeWith: "صُنع بإبداع في مصر" },
    en: { description: "A creative studio specializing in photography, design, and video editing.", pagesTitle: "Website Pages", prices: "Pricing", projects: "Our work", faq: "FAQ", contact: "Contact us", policyTitle: "Policies & Legal", privacy: "Privacy policy", terms: "Terms of use", refund: "Refund policy", contactTitle: "Contact us", emailLabel: "Email:", phoneLabel: "Phone:", addressLabel: "Address:", address: "Egypt", copyright: "© 2026 Lens. All rights reserved.", madeWith: "Made creatively in Egypt" }
};

const applyFooterLanguage = (language) => {
    const text = footerTranslations[language] || footerTranslations.ar;
    document.querySelectorAll("[data-footer-text]").forEach((element) => {
        const value = text[element.dataset.footerText];
        if (value) element.textContent = value;
    });
};

const applySupportChatLanguage = (language) => {
    const text = supportChatTranslations[language] || supportChatTranslations.ar;
    document.querySelectorAll("[data-chat-text]").forEach((element) => {
        const value = text[element.dataset.chatText];
        if (value) element.textContent = value;
    });
    document.querySelectorAll("[data-chat-placeholder]").forEach((element) => {
        element.placeholder = text[element.dataset.chatPlaceholder] || element.placeholder;
    });
    document.querySelectorAll("[data-chat-message-ar]").forEach((button, index) => {
        button.textContent = text.quickActions[index];
    });
    const topicOptions = ["topicPlaceholder", "topicPhoto", "topicVideo", "topicGeneral"];
    document.querySelectorAll("#support-chat-topic option").forEach((option, index) => {
        option.textContent = text[topicOptions[index]];
    });
    document.querySelector(".support-chat-rating")?.setAttribute("aria-label", language === "ar" ? "قيّم تجربتك" : "Rate your experience");
    document.dispatchEvent(new CustomEvent("lens-language-change", { detail: { language } }));
};

homepageTranslations.ar.packageEyebrows = ["للمحتوى السريع", "للنمو المستمر", "للعلامات التجارية والحملات"];
homepageTranslations.ar.packageNames = ["البداية", "صانع المحتوى", "العلامة التجارية"];
homepageTranslations.ar.packageDescriptions = ["باقة مركزة للمبدعين الذين يحتاجون فيديوهات قصيرة مصقولة وجاهزة للنشر.", "سير عمل شهري متكامل للمبدعين الذين يريدون أسلوبًا ثابتًا وسردًا أقوى.", "شراكة إبداعية مخصصة للعلامات التجارية والحملات وفِرق المحتوى الكبيرة."];
homepageTranslations.ar.packagePrices = ["00$", "00$", "00$"];
homepageTranslations.ar.packagePeriods = ["لكل مشروع", "شهريًا", "خطة مخصصة"];
homepageTranslations.ar.packageFeatures = [["مونتاج فيديوهات قصيرة", "ترجمة وتصميم صوتي", "جولتان من التعديلات", "تصدير جاهز للمنصة"], ["مونتاج قصير وطويل", "موشن جرافيك وصور مصغرة", "توجيه بصري للمحتوى", "أولوية في التسليم"], ["دعم إبداعي متكامل", "باقات محتوى للحملات", "خيارات تصوير وتصميم", "سير عمل مخصص للمشروع"]];
homepageTranslations.en.packageEyebrows = ["For quick content", "For consistent growth", "For brands and campaigns"];
homepageTranslations.en.packageNames = ["Starter", "Creator", "Brand"];
homepageTranslations.en.packageDescriptions = ["A focused package for creators who need polished short-form videos that are ready to post.", "A complete monthly workflow for creators who want consistency, stronger storytelling, and a recognizable style.", "A tailored creative partnership for brands, campaigns, and teams with a bigger content pipeline."];
homepageTranslations.en.packagePrices = ["Custom quote", "Custom quote", "Custom quote"];
homepageTranslations.en.packagePeriods = ["per project", "monthly", "tailored plan"];
homepageTranslations.en.packageFeatures = [["Short-form video editing", "Captions and sound design", "2 revision rounds", "Platform-ready export"], ["Short-form and long-form edits", "Motion graphics and thumbnails", "Content style direction", "Priority turnaround"], ["Full creative editing support", "Campaign content packages", "Photography and design options", "Dedicated project workflow"]];
homepageTranslations.ar.packageBadge = "الأكثر طلبًا";
homepageTranslations.ar.packageButtons = ["اختر البداية", "اختر صانع المحتوى", "اختر العلامة التجارية"];
homepageTranslations.en.packageBadge = "Most popular";
homepageTranslations.en.packageButtons = ["Choose Starter", "Choose Creator", "Choose Brand"];
homepageTranslations.ar.projectsTitle = "مختارات من <em>أعمالنا.</em>";
homepageTranslations.en.projectsTitle = "Selected <em>Projects.</em>";
homepageTranslations.ar.aboutTitle = "من نحن <em>ولماذا لينس؟</em>";
homepageTranslations.en.aboutTitle = "About Us <em>and Lens.</em>";
homepageTranslations.ar.aboutSubtitle = "فريق إبداعي يحوّل الفكرة الخام إلى محتوى له حضور وشخصية.";
homepageTranslations.en.aboutSubtitle = "A creative team turning raw ideas into content with presence and personality.";
homepageTranslations.ar.aboutLabel = "خلف الكواليس";
homepageTranslations.en.aboutLabel = "BEHIND THE SCENES";
homepageTranslations.ar.aboutImageLabel = "استوديو لينس الإبداعي";
homepageTranslations.en.aboutImageLabel = "LENS CREATIVE STUDIO";
homepageTranslations.ar.aboutStats = ["3× مجالات إبداعية", "1 رؤية متكاملة"];
homepageTranslations.en.aboutStats = ["3× Creative fields", "1 Unified vision"];
homepageTranslations.ar.processTitle = "كيف نعمل <em>معًا؟</em>";
homepageTranslations.en.processTitle = "How We Work <em>Together.</em>";
homepageTranslations.ar.processSubtitle = "من أول فكرة لحد النسخة النهائية، كل خطوة محسوبة وواضحة.";
homepageTranslations.en.processSubtitle = "From the first idea to the final cut, every step is clear and considered.";
homepageTranslations.ar.processKicker = "خطوات واضحة";
homepageTranslations.en.processKicker = "CLEAR STEPS";
homepageTranslations.ar.testimonialsTitle = "ماذا يقول <em>عملاؤنا؟</em>";
homepageTranslations.en.testimonialsTitle = "What Our <em>Clients Say.</em>";
homepageTranslations.ar.testimonialsSubtitle = "كلمات من أصحاب المحتوى الذين عملنا معهم.";
homepageTranslations.en.testimonialsSubtitle = "A few words from the creators and brands we have worked with.";
homepageTranslations.ar.testimonialsKicker = "تجارب حقيقية";
homepageTranslations.en.testimonialsKicker = "REAL EXPERIENCES";
homepageTranslations.ar.faqTitle = "الأسئلة <em>الشائعة.</em>";
homepageTranslations.en.faqTitle = "Frequently Asked <em>Questions.</em>";
homepageTranslations.ar.faqSubtitle = "إجابات سريعة على أهم الأسئلة قبل بداية مشروعك.";
homepageTranslations.en.faqSubtitle = "Quick answers to the questions that matter before your project begins.";
homepageTranslations.ar.faqKicker = "قبل أن نبدأ";
homepageTranslations.en.faqKicker = "BEFORE WE START";
homepageTranslations.ar.contactTitle = "جاهز لتطوير <em>محتواك؟</em>";
homepageTranslations.en.contactTitle = "Ready to Level Up <em>Your Content?</em>";
homepageTranslations.ar.contactKicker = "لنعمل معًا";
homepageTranslations.en.contactKicker = "LET'S WORK TOGETHER";

const setTextList = (selector, values, html = false) => document.querySelectorAll(selector).forEach((element, index) => {
    if (values[index] === undefined) return;
    if (html) element.innerHTML = values[index]; else element.textContent = values[index];
});

const setElementText = (selector, value, html = false) => {
    const element = document.querySelector(selector);
    if (!element) return;
    if (html) {
        element.innerHTML = value;
        return;
    }
    element.textContent = value;
};

const setTrailingText = (selector, value) => {
    const element = document.querySelector(selector);
    if (!element || !element.lastChild) return;
    element.lastChild.textContent = value;
};

const applyHomepageLanguage = (language) => {
    const text = homepageTranslations[language];
    if (!text) return;

    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    applySupportChatLanguage(language);
    applyFooterLanguage(language);
    document.title = text.title;

    const languageToggle = document.getElementById("language-toggle");
    if (languageToggle) {
        languageToggle.textContent = text.toggle;
        languageToggle.setAttribute("aria-label", text.toggleLabel);
    }

    setTextList(".nav-links a", text.nav);
    setTrailingText(".hero-kicker", ` ${text.heroKicker}`);
    setElementText(".hero-title", text.heroTitle, true);
    setElementText(".hero-subtitle", text.heroSubtitle);
    setTextList(".hero-buttons .btn", [text.start, text.work], true);
    setTextList(".hero-proof span", text.proof, true);
    setElementText(".hero-tool-badge", `<i class="fas fa-wand-magic-sparkles"></i> ${text.studio}`, true);
    const heroPreviewTopline = document.querySelector(".hero-preview-topline");
    if (heroPreviewTopline && heroPreviewTopline.lastChild && heroPreviewTopline.lastChild.previousSibling) {
        heroPreviewTopline.lastChild.previousSibling.textContent = ` ${text.production} `;
    }
    setElementText(".hero-preview-label", text.idea, true);
    setTextList(".hero-floating-tag", [text.video, text.photo], true);
    setTextList("#Reel .section-title", [text.reelTitle], true); setTextList("#Reel .section-subtitle", [text.reelSubtitle]);
    setTextList("#Projects .section-title", [text.projectsTitle], true); setTextList("#Projects .section-subtitle", [text.projectsSubtitle]);
    setTextList(".project-label", text.projectNames); setTextList(".project-description", text.projectDescriptions); document.querySelectorAll(".project-link").forEach((link, index) => { const icon = link.querySelector("i")?.outerHTML || ""; link.innerHTML = `${text.projectLinks[index]} ${icon}`; });
    setTextList("#Packages .section-title", [text.packagesTitle]); setTextList("#Packages .section-subtitle", [text.packagesSubtitle]); setTextList(".package-eyebrow", text.packageEyebrows); setTextList(".package-name", text.packageNames); setTextList("#Packages .package-description", text.packageDescriptions); document.querySelectorAll(".package-price").forEach((price, index) => { price.innerHTML = `${text.packagePrices[index]} <span>${text.packagePeriods[index]}</span>`; }); const packageBadge = document.querySelector(".package-badge"); if (packageBadge) packageBadge.textContent = text.packageBadge; setTextList(".package-button", text.packageButtons); document.querySelectorAll(".package-features").forEach((list, packageIndex) => list.querySelectorAll("li").forEach((item, featureIndex) => { const icon = item.querySelector("i")?.outerHTML || ""; item.innerHTML = `${icon} ${text.packageFeatures[packageIndex][featureIndex]}`; }));
    setTextList("#About .section-title", [text.aboutTitle], true); setTextList("#About .about-heading .section-subtitle", [text.aboutSubtitle]); setTrailingText(".about-kicker", ` ${text.aboutLabel}`); setTrailingText(".about-image-label", ` ${text.aboutImageLabel}`); document.querySelectorAll(".about-stats span").forEach((item, index) => { const strong = item.querySelector("strong")?.outerHTML || ""; item.innerHTML = `${strong} ${text.aboutStats[index]}`; }); setElementText(".about-text", text.aboutText); setElementText(".skills-title", text.skillsTitle); document.querySelectorAll(".skills-list li").forEach((item, index) => { const icon = item.querySelector("i")?.outerHTML || ""; item.innerHTML = `${icon} ${text.skills[index]}`; });
    setTextList(".process-section .section-title", [text.processTitle], true); setTextList(".process-section .section-subtitle", [text.processSubtitle]); setTrailingText(".process-kicker", ` ${text.processKicker}`); setTextList(".process-step-title", text.processTitles); setTextList(".process-step-description", text.processDescriptions);
    setTextList("#Testimonials .section-title", [text.testimonialsTitle], true); setTextList("#Testimonials .section-subtitle", [text.testimonialsSubtitle]); setTrailingText(".testimonials-kicker", ` ${text.testimonialsKicker}`); setTextList(".testimonial-quote", text.testimonials); setTextList(".testimonial-author strong", text.authors); setTextList(".testimonial-author span", text.roles);
    setTextList("#FAQ .section-title", [text.faqTitle], true); setTextList("#FAQ .section-subtitle", [text.faqSubtitle]); setTrailingText(".faq-kicker", ` ${text.faqKicker}`); setTextList(".faq-question", text.faqQuestions); setTextList(".faq-answer p", text.faqAnswers);
    setTextList("#Contact .section-title", [text.contactTitle], true); setTextList("#Contact .section-subtitle", [text.contactSubtitle]); setTrailingText(".contact-kicker", ` ${text.contactKicker}`); setTextList(".form-group > label", text.labels); setTextList(".checkbox-label span", text.platforms); setTextList(".radio-label span", text.contentTypes); setElementText("#project-contact-form .btn-submit", text.send);
    const contactDirect = document.querySelector(".contact-direct p"); if (contactDirect) contactDirect.innerHTML = `${text.direct} <a href="mailto:lensphotography.202@gmail.com">lensphotography.202@gmail.com</a>`; const footerText = document.querySelector(".footer p"); if (footerText) footerText.textContent = text.footer;
    const videoModal = document.getElementById("video-modal"); const imageModal = document.getElementById("image-modal"); if (videoModal) videoModal.setAttribute("aria-label", text.modalVideo); if (imageModal) imageModal.setAttribute("aria-label", text.modalPhoto); const videoClose = document.querySelector("#video-modal .media-modal-close"); if (videoClose) videoClose.setAttribute("aria-label", text.closeVideo); const imageClose = document.querySelector("#image-modal .media-modal-close"); if (imageClose) imageClose.setAttribute("aria-label", text.closePhoto);
    localStorage.setItem("lens-language", language);
};

const languageToggle = document.getElementById("language-toggle");
if (languageToggle) {
    const savedLanguage = localStorage.getItem("lens-language") || "ar";
    applyHomepageLanguage(savedLanguage);
    languageToggle.addEventListener("click", () => applyHomepageLanguage(document.documentElement.lang === "ar" ? "en" : "ar"));
}

const packageCards = document.querySelectorAll(".package-card");
if (packageCards.length) {
    packageCards.forEach((card) => card.classList.add("package-reveal"));
    if ("IntersectionObserver" in window) {
        const packageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.2, rootMargin: "0px 0px -8%" });
        packageCards.forEach((card) => packageObserver.observe(card));
    } else {
        packageCards.forEach((card) => card.classList.add("is-visible"));
    }
}

document.querySelectorAll(".testimonial-play").forEach((button) => {
    button.addEventListener("click", () => button.classList.toggle("is-playing"));
});

document.querySelectorAll(".review-rating button").forEach((button, index, buttons) => {
    button.addEventListener("click", () => buttons.forEach((star, starIndex) => star.classList.toggle("is-selected", starIndex <= index)));
});

const faqItems = document.querySelectorAll(".faq-item");
if (faqItems.length) {
    faqItems.forEach((item) => item.classList.add("faq-reveal"));
    if ("IntersectionObserver" in window) {
        const faqObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -6%" });
        faqItems.forEach((item) => faqObserver.observe(item));
    } else {
        faqItems.forEach((item) => item.classList.add("is-visible"));
    }
}

portfolioVideo.addEventListener("error", () => {
    showMediaError(videoModal, "Add your video at photo/portfolio-video.mp4 to display it here.");
});

portfolioImage.addEventListener("error", () => {
    showMediaError(imageModal, "Add your photo at photo/portfolio-image.jpg to display it here.");
});