chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getAuthToken") {
        chrome.cookies.getAll({domain: "my.itmo.ru"}, (cookies) => {
            let tokenCookie = cookies.find(c => c.name === "auth._token.itmoId");
            if (!tokenCookie || !tokenCookie.value.includes("Bearer")) {
                sendResponse({success: false, error: "Login required. Token missing."});
                return;
            }

            const token = decodeURIComponent(tokenCookie.value).replace("Bearer ", "");
            sendResponse({success: true, token});
        });

        return true; // async response
    }
});
