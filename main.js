const scrapButton = document.getElementById("scrap-button");
const filterButton = document.getElementById("filter-button");
const sortButton = document.getElementById("sort-button");
const inputBox = document.getElementById("input-box");
const ul = document.getElementById("result-list");

// Global emails
let emails = [];

// Constant (unually defined in the constant file)
const CLICK = "click";
const LI = "li";
const INLINE_BLOCK = "inline-block";
const BLOCK = "block";
const NONE = "none";
const NO_EMAILS = "Emails not found";

// Event handlers
sortButton.addEventListener(CLICK, () => {
    // Sort mails based on domain
    const sorted_emails = emails.sort((a, b) =>
        a.split("@")[1].localeCompare(b.split("@")[1])
    );
    setInputToEmpty();
    addMails(sorted_emails);
});

filterButton.addEventListener(CLICK, () => {
    const inputQuery = inputBox.value;
    if (inputQuery === "") {
        addMails(emails);
        return;
    }
    const filteredEmails = emails.filter((email) => email.includes(inputQuery));
    addMails(filteredEmails);
});

scrapButton.addEventListener(CLICK, async () => {
    // Get current active window
    const currentTab = await chrome.tabs.query({
        currentWindow: true,
        active: true,
    });
    // Execure script on it
    chrome.scripting.executeScript({
        target: { tabId: currentTab[0].id },
        func: () => {
            const search_in = document.body.innerHTML;
            string_context = search_in.toString();
            array_mails = string_context.match(
                /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
            );
            // Runtime to talk back to our extension context
            chrome.runtime.sendMessage({ array_mails });
        },
    });
});

// Listen to any messages
chrome.runtime.onMessage.addListener((message) => {
    setInputToEmpty();
    emails = Array.from(new Set(message.array_mails).values());
    addMails(emails, true);
});

// Helper functions
const createLiTag = (content) => {
    const li = document.createElement(LI);
    li.innerText = content;
    return li;
};

const setInputToEmpty = () => {
    inputBox.value = "";
}

const addMails = (mails, enableButtons = false) => {
    showResultList();
    ul.innerHTML = "";
    if (mails.length === 0) {
        ul.appendChild(createLiTag(NO_EMAILS));
    } else {
        if (enableButtons) {
            EnableButtonsAndInputPostResult();
        }
        mails.forEach((email) => {
            ul.appendChild(createLiTag(email));
        });
    }
};

const showResultList = () => {
    if (ul.style.display === "" || ul.style.display === NONE) {
        ul.style.display = BLOCK;
    }
};

const EnableButtonsAndInputPostResult = () => {
    if (
        filterButton.style.display === "" ||
        filterButton.style.display === NONE
    ) {
        filterButton.style.display = INLINE_BLOCK;
        sortButton.style.display = INLINE_BLOCK;
        inputBox.style.display = INLINE_BLOCK;
    }
};
