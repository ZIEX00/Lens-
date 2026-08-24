import { ref, push, update, onValue, serverTimestamp, runTransaction } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import { getDownloadURL, ref as storageRef, uploadBytes } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-storage.js";
import { database, storage } from "./firebase-config.js";

if (!sessionStorage.getItem("lens-visitor-counted")) {
    runTransaction(ref(database, "siteStats/visits"), (visits) => (visits || 0) + 1)
        .then(() => sessionStorage.setItem("lens-visitor-counted", "true"))
        .catch((error) => console.error("Firebase visitor tracking error:", error));
}

const showFormToast = (message) => {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");
    if (!toast) return;
    if (toastMessage) toastMessage.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 7000);
};

const saveRequest = async (request) => {
    const requestRef = await push(ref(database, "contactRequests"), {
        ...request,
        status: "new",
        unreadForAdmin: true,
        createdAt: serverTimestamp()
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
                message: formData.get("message") || ""
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
                message: formData.get("quick-message") || ""
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
        if (!requestId || localStorage.getItem("lens-chat-identity") !== identity) {
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
        await update(ref(database, `contactRequests/${requestId}`), { status: "open", unreadForAdmin: true, topic: chatTopic.value, updatedAt: serverTimestamp() });
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
            setChatStep("waiting");
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
            setChatStep(status === "resolved" ? "welcome" : status === "accepted" ? "conversation" : "waiting");
            if (status === "accepted" && !acceptanceNoticeShown) {
                acceptanceNoticeShown = true;
                addChatMessage(chatLanguageText("تم قبول المحادثة. يمكنك الآن التحدث مع فريق الدعم.", "Your chat has been accepted. You can now talk to our support team."), true);
            }
        });
    }
}