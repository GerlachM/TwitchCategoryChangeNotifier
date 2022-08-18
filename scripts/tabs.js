window.addEventListener("load", function() {
    Array.from(document.getElementById("bottom-bar").getElementsByClassName("tab-button")).forEach(element => {
        element.onclick = function(click) {
            switchTab(element.id);
        };
    });


    switchTab("streams-notifications-button");
});

function switchTab(tabName) {
    removeAllSelected();
    hideAllTabs();


    switch(tabName) {
        case "streams-notifications-button":
            chrome.storage.local.set({"currentTab": tabName});
            this.document.getElementById("streams-notifications-button").classList.add("selected");
            this.document.getElementById("notifications-page").style["display"] = "block";
            openNotificationsTab();
            break;
    }
}

function removeAllSelected() {
    var selected = Array.from(document.getElementById("bottom-bar").getElementsByClassName("selected"));
    selected.forEach(element => {
        element.classList.remove("selected");
    });
}

function hideAllTabs() {
    var selected = Array.from(document.getElementsByClassName("tab"));
    selected.forEach(element => {
        element.style["display"] = "none";
    });
}