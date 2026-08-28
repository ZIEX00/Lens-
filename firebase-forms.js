import { ref, push, set, update, onValue, serverTimestamp, runTransaction, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import { signInAnonymously } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getDownloadURL, ref as storageRef, uploadBytes } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-storage.js";
import { auth, database, storage } from "./firebase-config.js";

const supabaseUrl = "https://weukqzktnwihdivccnqs.supabase.co";
const supabasePublishableKey = "sb_publishable_iGOnpCgbcYMte37pX0RMaw_AOtv2qau";
const supabaseBucket = "lens";

const visitorAuthReady = auth.currentUser ? Promise.resolve(auth.currentUser) : signInAnonymously(auth).catch((error) => {
    console.error("Firebase anonymous auth error:", error);
    return null;
});

const showFormToast = (message) => {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");
    if (!toast) return;
    if (toastMessage) toastMessage.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 7000);
};

const saveRequest = async (request) => {
    const visitor = await visitorAuthReady;
    if (!visitor) throw new Error("Visitor authentication failed");
    const requestRef = await push(ref(database, "contactRequests"), {
        ...request,
        ownerUid: visitor.uid,
        status: "new",
        unreadForAdmin: true,
        createdAt: Date.now()
    });
    return requestRef.key;
};

const saveWithTimeout = (request, timeout = 10000) => Promise.race([
    saveRequest(request),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase request timed out")), timeout))
]);

const projectForm = document.getElementById("project-contact-form");
if (projectForm) {
    projectForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(projectForm);
        const submitButton = projectForm.querySelector(".btn-submit");
        if (submitButton) submitButton.disabled = true;

        try {
            await saveWithTimeout({
                type: "project",
                name: formData.get("name"),
                email: formData.get("email"),
                brand: formData.get("brand") || "",
                platforms: formData.getAll("platform"),
                contentType: formData.get("content-type") || "",
                message: formData.get("message") || "",
                packageName: formData.get("packageName") || "",
                packagePrice: formData.get("packagePrice") || "",
                discountPercent: formData.get("discountPercent") || "",
                couponCode: formData.get("couponCode") || "",
                discountUsed: Boolean(formData.get("couponCode"))
            });
            projectForm.reset();
            showFormToast("تم إرسال رسالتك بنجاح");
        } catch (error) {
            showFormToast("تعذر إرسال الرسالة، حاول مرة أخرى");
            console.error("Firebase project request error:", error);
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

const quickContactForm = document.getElementById("quick-contact-form");
if (quickContactForm) {
    quickContactForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(quickContactForm);
        const submitButton = quickContactForm.querySelector(".btn-submit");
        if (submitButton) submitButton.disabled = true;

        try {
            await saveWithTimeout({
                type: "quick",
                name: formData.get("quick-name"),
                contact: formData.get("quick-contact"),
                preferredChannel: formData.get("preferred-channel"),
                message: formData.get("quick-message") || "",
                packageName: formData.get("packageName") || "",
                packagePrice: formData.get("packagePrice") || "",
                discountPercent: formData.get("discountPercent") || "",
                couponCode: formData.get("couponCode") || "",
                discountUsed: Boolean(formData.get("couponCode"))
            });
            quickContactForm.reset();
            showFormToast("تم إرسال طلب التواصل بنجاح");
        } catch (error) {
            showFormToast("تعذر إرسال الطلب، حاول مرة أخرى");
            console.error("Firebase quick request error:", error);
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

const supportChatDetailsForm = document.getElementById("support-chat-details-form");
if (supportChatDetailsForm) {
    const chatLanguageText = (arabic, english) => document.documentElement.lang === "en" ? english : arabic;
    if (!localStorage.getItem("lens-chat-reset-complete")) {
        localStorage.removeItem("lens-chat-conversation");
        localStorage.removeItem("lens-chat-identity");
        localStorage.removeItem("lens-chat-rendered-messages");
        localStorage.removeItem("lens-chat-unread");
        localStorage.setItem("lens-chat-reset-complete", "true");
    }
    const chatMessages = document.getElementById("support-chat-messages");
    const chatInput = document.getElementById("support-chat-input");
    const chatName = document.getElementById("support-chat-name");
    const chatContact = document.getElementById("support-chat-contact");
    const chatTopic = document.getElementById("support-chat-topic");
    const chatSendButton = document.getElementById("support-chat-send");
    const chatFile = document.getElementById("support-chat-file");
    const chatFileName = document.getElementById("support-chat-file-name");
    const formError = document.getElementById("support-chat-form-error");
    let stopClientConversation = null;
    let acceptanceNoticeShown = false;
    let renderedMessageIds = new Set(JSON.parse(localStorage.getItem("lens-chat-rendered-messages") || "[]"));
    let unreadCount = Number(localStorage.getItem("lens-chat-unread") || 0);
    const unreadBadge = document.getElementById("support-chat-unread");
    const savedIdentity = localStorage.getItem("lens-chat-identity");
    if (savedIdentity) {
        const [savedName, savedContact] = savedIdentity.split("|");
        chatName.value = savedName || "";
        chatContact.value = savedContact || "";
    }
    const updateUnreadBadge = () => {
        if (!unreadBadge) return;
        unreadBadge.textContent = unreadCount;
        unreadBadge.classList.toggle("is-visible", unreadCount > 0);
    };
    updateUnreadBadge();
    const startClientConversation = (conversationId) => {
        if (stopClientConversation) stopClientConversation();
        stopClientConversation = onValue(ref(database, `conversations/${conversationId}/messages`), (snapshot) => {
            snapshot.forEach((child) => {
                const message = child.val();
                if (!renderedMessageIds.has(child.key)) {
                    renderedMessageIds.add(child.key);
                    addChatMessage(message.message, message.sender === "admin", message.attachmentUrl, message.attachmentName);
                    if (message.sender === "admin" && !document.getElementById("support-chat")?.classList.contains("is-open")) {
                        unreadCount += 1;
                        localStorage.setItem("lens-chat-unread", String(unreadCount));
                        updateUnreadBadge();
                        if ("Notification" in window && Notification.permission === "granted") new Notification("رد جديد من لينس", { body: message.message });
                    }
                }
            });
            localStorage.setItem("lens-chat-rendered-messages", JSON.stringify([...renderedMessageIds].slice(-100)));
        });
    };
    const addChatMessage = (message, isBot = false, attachmentUrl = "", attachmentName = "") => {
        const element = document.createElement("div");
        element.className = `support-chat-message${isBot ? " support-chat-message-bot" : ""}`;
        if (message) {
            const text = document.createElement("span");
            text.textContent = message;
            element.append(text);
        }
        if (attachmentUrl) {
            const image = document.createElement("img");
            image.src = attachmentUrl;
            image.alt = attachmentName || "الصورة المرفقة";
            image.loading = "lazy";
            element.append(image);
        } else if (attachmentName) {
            const fileLabel = document.createElement("small");
            fileLabel.textContent = `📎 ${attachmentName}`;
            element.append(fileLabel);
        }
        chatMessages.append(element);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const setChatStep = (step) => {
        document.querySelectorAll("[data-chat-step]").forEach((element) => element.classList.toggle("is-active", element.dataset.chatStep === step));
    };

    document.getElementById("support-chat-start")?.addEventListener("click", () => setChatStep("details"));

    document.querySelectorAll("[data-chat-message-ar]").forEach((button) => button.addEventListener("click", () => {
        chatInput.value = document.documentElement.lang === "en" ? button.dataset.chatMessageEn : button.dataset.chatMessageAr;
        chatInput.focus();
    }));

    chatFile?.addEventListener("change", () => {
        if (chatFileName) chatFileName.textContent = chatFile.files[0]?.name || "";
    });

    const createConversation = async () => {
        const identity = `${chatName.value.trim()}|${chatContact.value.trim()}`;
        let requestId = localStorage.getItem("lens-chat-conversation");
        let isNewConversation = false;
        if (!requestId || localStorage.getItem("lens-chat-identity") !== identity) {
            isNewConversation = true;
            requestId = await saveWithTimeout({
                type: "chatbot",
                name: chatName.value.trim(),
                contact: chatContact.value.trim(),
                topic: chatTopic.value,
                preferredChannel: "Chatbot",
                message: `Topic: ${chatTopic.value}`
            });
            localStorage.setItem("lens-chat-conversation", requestId);
            localStorage.setItem("lens-chat-identity", identity);
        }
        if (isNewConversation) {
            await update(ref(database, `contactRequests/${requestId}`), { status: "open", unreadForAdmin: true, topic: chatTopic.value, updatedAt: serverTimestamp() });
        }
        startClientConversation(requestId);
        return requestId;
    };

    supportChatDetailsForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (formError) formError.textContent = "";
        const button = supportChatDetailsForm.querySelector("button[type=submit]");
        if (button) button.disabled = true;
        try {
            await createConversation();
            setChatStep("conversation");
        } catch (error) {
            if (formError) formError.textContent = "تعذر بدء المحادثة، حاول مرة أخرى.";
            console.error("Firebase chatbot start error:", error);
        } finally {
            if (button) button.disabled = false;
        }
    });

    const sendChatMessage = async () => {
        const submitButton = chatSendButton;
        const selectedFile = chatFile?.files[0];
        if (!chatInput.value.trim() && !selectedFile) return;
        if (submitButton) submitButton.disabled = true;
        try {
            const requestId = await createConversation();
            let attachmentUrl = "";
            if (selectedFile) {
                const filePath = `chat-attachments/${requestId}/${Date.now()}-${selectedFile.name}`;
                const uploadedFile = await uploadBytes(storageRef(storage, filePath), selectedFile);
                attachmentUrl = await getDownloadURL(uploadedFile.ref);
            }
            await push(ref(database, `conversations/${requestId}/messages`), {
                sender: "client",
                message: chatInput.value,
                attachmentUrl,
                attachmentName: selectedFile?.name || "",
                createdAt: serverTimestamp()
            });
            await update(ref(database, `contactRequests/${requestId}`), {
                status: "open",
                unreadForAdmin: true,
                updatedAt: serverTimestamp()
            });
            startClientConversation(requestId);
            addChatMessage(chatLanguageText("تم إرسال رسالتك.", "Your message was sent."), false, attachmentUrl, selectedFile?.name || "");
            chatInput.value = "";
            if (chatFile) chatFile.value = "";
            if (chatFileName) chatFileName.textContent = "";
        } catch (error) {
            const message = error?.message?.includes("PERMISSION_DENIED")
                ? chatLanguageText("تم حفظ طلبك، لكن المحادثة تحتاج تفعيل صلاحيات Firebase.", "Your request was saved, but Firebase chat permissions need to be enabled.")
                : chatLanguageText("حصلت مشكلة أثناء الإرسال، حاول مرة أخرى.", "Something went wrong while sending. Please try again.");
            addChatMessage(message, true);
            console.error("Firebase chatbot request error:", error);
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    };

    chatSendButton?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        sendChatMessage();
    });
    chatInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendChatMessage();
        }
    });

    document.getElementById("support-chat-end")?.addEventListener("click", async () => {
        const conversationId = localStorage.getItem("lens-chat-conversation");
        if (!conversationId) return;
        await update(ref(database, `contactRequests/${conversationId}`), { status: "resolved", resolvedAt: serverTimestamp(), unreadForAdmin: false });
        localStorage.setItem("lens-chat-last-resolved", conversationId);
        localStorage.removeItem("lens-chat-conversation");
        setChatStep("complete");
    });
    document.getElementById("support-chat-new")?.addEventListener("click", () => {
        localStorage.removeItem("lens-chat-conversation");
        localStorage.removeItem("lens-chat-identity");
        localStorage.removeItem("lens-chat-rendered-messages");
        localStorage.removeItem("lens-chat-unread");
        chatMessages.innerHTML = `<div class="support-chat-message support-chat-message-bot" data-chat-text="conversationGreeting">${chatLanguageText("أهلًا بك! كيف يمكننا مساعدتك اليوم؟", "Hi! How can we help you today?")}</div>`;
        chatName.value = "";
        chatContact.value = "";
        chatTopic.value = "";
        setChatStep("welcome");
    });
    document.querySelectorAll("[data-rating]").forEach((button) => button.addEventListener("click", async () => {
        const conversationId = localStorage.getItem("lens-chat-conversation") || localStorage.getItem("lens-chat-last-resolved");
        if (conversationId) await update(ref(database, `contactRequests/${conversationId}`), { rating: Number(button.dataset.rating) });
        document.querySelectorAll("[data-rating]").forEach((item) => item.classList.toggle("is-selected", Number(item.dataset.rating) <= Number(button.dataset.rating)));
    }));

    const conversationId = localStorage.getItem("lens-chat-conversation");
    if (conversationId) {
        startClientConversation(conversationId);
        onValue(ref(database, `contactRequests/${conversationId}/status`), (snapshot) => {
            const status = snapshot.val();
            setChatStep(status === "resolved" ? "welcome" : status === "open" || status === "accepted" ? "conversation" : "waiting");
        });
    }
}

const setupReviewForm = (reviewForm, type) => {
    if (!reviewForm) return;
    let recorder;
    let recordingChunks = [];
    let recordedBlob = null;
    let recordingTimer = null;
    const recordButton = reviewForm.querySelector(".review-record-button");
    const stopButton = reviewForm.querySelector(".review-stop-button");
    const status = reviewForm.querySelector(".review-recording-status");
    const preview = reviewForm.querySelector(".review-audio-preview");
    const isAudioForm = type === "audio";
    const imageInput = reviewForm.querySelector('input[name="review-image"]');
    const imageLabel = imageInput?.closest("label");
    if (imageLabel) {
        imageLabel.firstChild.textContent = document.documentElement.lang === "en" ? "Client photo" : "صورة العميل";
        const flagLabel = document.createElement("label");
        flagLabel.innerHTML = `${document.documentElement.lang === "en" ? "Country flag" : "علم الدولة"}<input type="file" name="review-flag" accept="image/png,image/jpeg,image/webp">`;
        imageLabel.parentElement.append(flagLabel);
    }
        const uploadReviewImage = async (file, folder, id) => {
        if (!file || !file.size) return "";
        if (!file.type.startsWith("image/")) throw new Error("Review image is invalid");
        const imageBlob = await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(image.width * scale));
                canvas.height = Math.max(1, Math.round(image.height * scale));
                canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Review image compression failed")), "image/jpeg", 0.78);
            };
            image.onerror = () => reject(new Error("Review image is invalid"));
            image.src = URL.createObjectURL(file);
        });
        if (imageBlob.size > 2000000) throw new Error("Review image is too large");
        const imagePath = `reviews/${folder}/${id}.jpg`;
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/${supabaseBucket}/${imagePath}`, {
            method: "POST",
            headers: {
                apikey: supabasePublishableKey,
                Authorization: `Bearer ${supabasePublishableKey}`,
                "Content-Type": "image/jpeg",
                "x-upsert": "true"
            },
            body: imageBlob
        });
        if (!uploadResponse.ok) throw new Error(`Supabase review image upload failed: ${uploadResponse.status}`);
        return `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${imagePath}`;
    };
    const stopRecording = () => {
        if (recorder?.state === "recording") recorder.stop();
        if (recordingTimer) { clearTimeout(recordingTimer); recordingTimer = null; }
        if (recordButton) recordButton.disabled = false;
        if (stopButton) stopButton.disabled = true;
    };
    recordButton?.addEventListener("click", async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            recordingChunks = [];
            recorder = new MediaRecorder(stream, { audioBitsPerSecond: 16000 });
            recorder.addEventListener("dataavailable", (event) => recordingChunks.push(event.data));
            recorder.addEventListener("stop", () => {
                stream.getTracks().forEach((track) => track.stop());
                recordedBlob = new Blob(recordingChunks, { type: recorder.mimeType || "audio/webm" });
                if (preview) { preview.src = URL.createObjectURL(recordedBlob); preview.hidden = false; }
                if (status) status.textContent = "تم حفظ التسجيل، يمكنك إرساله الآن";
            });
            recorder.start();
            recordButton.disabled = true;
            if (stopButton) stopButton.disabled = false;
            if (status) status.textContent = "جاري التسجيل... (الحد الأقصى دقيقة)";
            recordingTimer = setTimeout(() => { if (status) status.textContent = "تم إيقاف التسجيل بعد دقيقة"; stopRecording(); }, 60000);
        } catch (error) {
            if (status) status.textContent = "تعذر الوصول إلى الميكروفون";
            console.error("Review recorder error:", error);
        }
    });
    stopButton?.addEventListener("click", stopRecording);
    reviewForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (recorder?.state === "recording") await new Promise((resolve) => { recorder.addEventListener("stop", resolve, { once: true }); stopRecording(); });
        const formData = new FormData(reviewForm);
        const stars = reviewForm.querySelectorAll(".review-rating button.is-selected").length;
        const submitButton = reviewForm.querySelector("button[type=submit]");
        if (submitButton) submitButton.disabled = true;
        try {
            if (isAudioForm && !recordedBlob) throw new Error("Record an audio review first");
            if (recordedBlob && recordedBlob.size > 800000) throw new Error("Audio recording is too large");
            if (!(await visitorAuthReady)) throw new Error("Visitor authentication failed");
            const reviewId = isAudioForm ? crypto.randomUUID() : push(ref(database, "reviews")).key;
            const imageUrl = await uploadReviewImage(formData.get("review-image"), "photos", reviewId);
            const flagUrl = await uploadReviewImage(formData.get("review-flag"), "flags", reviewId);
            if (isAudioForm) {
                const audioPath = `reviews/${reviewId}.webm`;
                let audioUrl = "";
                const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/${supabaseBucket}/${audioPath}`, {
                    method: "POST",
                    headers: {
                        apikey: supabasePublishableKey,
                        Authorization: `Bearer ${supabasePublishableKey}`,
                        "Content-Type": recordedBlob.type || "audio/webm",
                        "x-upsert": "false"
                    },
                    body: recordedBlob
                });
                if (!uploadResponse.ok) throw new Error(`Supabase audio upload failed: ${uploadResponse.status}`);
                audioUrl = `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${audioPath}`;
                const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/reviews`, {
                    method: "POST",
                    headers: { apikey: supabasePublishableKey, Authorization: `Bearer ${supabasePublishableKey}`, "Content-Type": "application/json", Prefer: "return=minimal" },
                    body: JSON.stringify({ id: reviewId, name: formData.get("review-name"), service: formData.get("review-service"), country: formData.get("review-country"), image_url: imageUrl, flag_url: flagUrl, message: "", rating: stars, type, audio_url: audioUrl, status: "pending" })
                });
                if (!supabaseResponse.ok) throw new Error(`Supabase review save failed: ${supabaseResponse.status}`);
            } else {
                await set(ref(database, `reviews/${reviewId}`), { name: formData.get("review-name"), service: formData.get("review-service"), country: formData.get("review-country"), imageUrl, flagUrl, message: formData.get("review-message") || "", rating: stars, type, audioUrl: "", status: "pending", createdAt: Date.now() });
            }
            reviewForm.reset(); recordedBlob = null; if (preview) { preview.hidden = true; preview.removeAttribute("src"); } if (status) status.textContent = "يمكنك تسجيل رسالة صوتية قصيرة"; reviewForm.querySelectorAll(".review-rating button").forEach((star) => star.classList.remove("is-selected")); showFormToast("تم إرسال تقييمك للمراجعة بنجاح");
        } catch (error) {
            const message = error.message.includes("Audio recording is too large")
                ? "التسجيل كبير جدًا، اجعله أقصر من دقيقة"
                : error.message.includes("Review image")
                    ? "صورة العميل أو العلم غير صالحة أو حجمها كبير"
                : error.message.includes("Record an audio")
                    ? "سجّل رأيك الصوتي أولًا"
                    : recordedBlob
                    ? "التسجيل كبير جدًا للخطة المجانية، سجّل رسالة أقصر"
                    : "تعذر إرسال التقييم، حاول مرة أخرى";
            showFormToast(message);
            console.error("Firebase review error:", error);
        } finally { if (submitButton) submitButton.disabled = false; }
    });
};

let activeReviewAudio = null;
const connectReviewAudio = (audio, playButton, card) => {
    audio.addEventListener("play", () => {
        if (activeReviewAudio && activeReviewAudio !== audio) activeReviewAudio.pause();
        activeReviewAudio = audio;
        playButton.classList.add("is-playing");
        card.classList.add("is-playing");
    });
    const reset = () => {
        playButton.classList.remove("is-playing");
        card.classList.remove("is-playing");
        if (activeReviewAudio === audio) activeReviewAudio = null;
    };
    audio.addEventListener("pause", reset);
    audio.addEventListener("ended", reset);
    playButton.addEventListener("click", () => { audio.paused ? audio.play() : audio.pause(); });
};

setupReviewForm(document.getElementById("audio-client-review-form"), "audio");
setupReviewForm(document.getElementById("written-client-review-form"), "written");

const renderApprovedReviews = () => onValue(query(ref(database, "reviews"), orderByChild("status"), equalTo("approved")), (snapshot) => {
    const audioGrid = document.querySelector(".audio-testimonials-grid");
    const writtenGrid = document.querySelector(".written-testimonials");
    if (!audioGrid || !writtenGrid) return;
    writtenGrid.querySelectorAll("[data-review-id]").forEach((card) => card.remove());
    snapshot.forEach((child) => {
        const review = { id: child.key, ...child.val() };
        if (review.status !== "approved" || review.type !== "written") return;
        const card = document.createElement("article");
        card.dataset.reviewId = review.id;
        card.className = review.type === "audio" ? "audio-testimonial-card" : "testimonial-card";
        if (review.type === "audio") {
            card.innerHTML = `<div class="testimonial-card-top"><div class="testimonial-avatar"></div><div class="testimonial-person"><strong></strong><span></span></div><img class="testimonial-flag" alt="علم الدولة" hidden></div><div class="testimonial-player"><time>رأي عميل</time><div class="testimonial-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><button class="testimonial-play" type="button" aria-label="تشغيل الرأي الصوتي"><i class="fas fa-play"></i></button></div>`;
            if (review.imageUrl) card.querySelector(".testimonial-avatar").innerHTML = `<img src="${review.imageUrl}" alt="صورة ${review.name || "العميل"}">`;
            if (review.flagUrl) { const flag = card.querySelector(".testimonial-flag"); flag.src = review.flagUrl; flag.hidden = false; }
            if (!review.imageUrl) card.querySelector(".testimonial-avatar").textContent = (review.name || "ع").trim().charAt(0);
            card.querySelector(".testimonial-person strong").textContent = review.name || "عميل لينس";
            card.querySelector(".testimonial-person span").textContent = [review.service, review.country].filter(Boolean).join(" • ") || "تجربة مع لينس";
            card.querySelector(".testimonial-person").insertAdjacentHTML("beforeend", `<span class="testimonial-stars" aria-label="${review.rating || 0} من 5 نجوم">${"★".repeat(Number(review.rating) || 0)}</span>`);
            const audio = new Audio(review.audioUrl);
            const playButton = card.querySelector(".testimonial-play");
            connectReviewAudio(audio, playButton, card);
            audioGrid.append(card);
        } else {
            card.innerHTML = `<div class="testimonial-card-top"><div class="testimonial-avatar"></div><div class="testimonial-person"><strong></strong><span></span></div><img class="testimonial-flag" alt="علم الدولة" hidden></div><p class="testimonial-quote"></p><div class="testimonial-author"><strong></strong><span></span></div>`;
            if (review.imageUrl) card.querySelector(".testimonial-avatar").innerHTML = `<img src="${review.imageUrl}" alt="صورة ${review.name || "العميل"}">`;
            if (review.flagUrl) { const flag = card.querySelector(".testimonial-flag"); flag.src = review.flagUrl; flag.hidden = false; }
            card.querySelector(".testimonial-quote").textContent = `"${review.message || "تجربة رائعة مع لينس."}"`;
            card.querySelector(".testimonial-author strong").textContent = review.name || "عميل لينس";
            card.querySelector(".testimonial-author span").textContent = [review.service, review.country].filter(Boolean).join(" • ") || "عميل لينس";
            card.querySelector(".testimonial-person").insertAdjacentHTML("beforeend", `<span class="testimonial-stars" aria-label="${review.rating || 0} من 5 نجوم">${"★".repeat(Number(review.rating) || 0)}</span>`);
            writtenGrid.append(card);
        }
    });
});
renderApprovedReviews();

const loadApprovedAudioReviews = async () => {
    const audioGrid = document.querySelector(".audio-testimonials-grid");
    if (!audioGrid) return;
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/reviews?select=id,name,service,country,image_url,flag_url,rating,audio_url&status=eq.approved&type=eq.audio&order=created_at.desc`, {
            headers: { apikey: supabasePublishableKey, Authorization: `Bearer ${supabasePublishableKey}` }
        });
        if (!response.ok) throw new Error(`Supabase approved audio read failed: ${response.status}`);
        audioGrid.replaceChildren();
        (await response.json()).forEach((review) => {
            if (!review.audio_url) return;
            const card = document.createElement("article");
            card.className = "audio-testimonial-card";
            card.dataset.reviewId = review.id;
            card.innerHTML = `<div class="testimonial-card-top"><div class="testimonial-avatar"></div><div class="testimonial-person"><strong></strong><span></span></div><img class="testimonial-flag" alt="علم الدولة" hidden></div><div class="testimonial-player"><time>رأي عميل</time><div class="testimonial-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><button class="testimonial-play" type="button" aria-label="تشغيل الرأي الصوتي"><i class="fas fa-play"></i></button></div>`;
            if (review.image_url) card.querySelector(".testimonial-avatar").innerHTML = `<img src="${review.image_url}" alt="صورة ${review.name || "العميل"}">`;
            if (review.flag_url) { const flag = card.querySelector(".testimonial-flag"); flag.src = review.flag_url; flag.hidden = false; }
            if (!review.image_url) card.querySelector(".testimonial-avatar").textContent = (review.name || "ع").trim().charAt(0);
            card.querySelector(".testimonial-person strong").textContent = review.name || "عميل لينس";
            card.querySelector(".testimonial-person span").textContent = [review.service, review.country].filter(Boolean).join(" • ") || "تجربة مع لينس";
            card.querySelector(".testimonial-person").insertAdjacentHTML("beforeend", `<span class="testimonial-stars" aria-label="${review.rating || 0} من 5 نجوم">${"★".repeat(Number(review.rating) || 0)}</span>`);
            const audio = new Audio(review.audio_url);
            const playButton = card.querySelector(".testimonial-play");
            connectReviewAudio(audio, playButton, card);
            audioGrid.append(card);
        });
    } catch (error) {
        console.error("Supabase approved audio reviews error:", error);
    }
};
loadApprovedAudioReviews();