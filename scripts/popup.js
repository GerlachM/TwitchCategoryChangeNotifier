window.addEventListener("load", function() {
    this.document.getElementById("user-infos-top").onclick = function(me) {
        chrome.storage.sync.remove("ttvToken", () => {
            disconnect();
        });
    };

    chrome.storage.sync.get("notify-all-streams", notify_result => {
        this.document.getElementById("notify-all-streams-checkbox").checked = notify_result["notify-all-streams"];
    });
    this.document.getElementById("notify-all-streams-checkbox").onchange = function(me) {
        chrome.storage.sync.set({"notify-all-streams": me.target.checked});
    };

    this.document.getElementById("searchbox").addEventListener("input", val => {
        chrome.storage.local.get("currentTab", currentTab_result => {
            switch(currentTab_result.currentTab) {
                case "followed-streams-button":
                    chrome.storage.local.get("ttvStreams_data", ttvStreams_data_result => {
                        let ttvStreams_data = ttvStreams_data_result.ttvStreams_data;
                        
                        let newStreamData = ttvStreams_data.filter(element => {
                            return element.user_name.toLowerCase().includes(this.document.getElementById("searchbox").value.toLowerCase());
                        })
            
                        populateStreams(newStreamData);
                    });
                    break;
                case "streams-notifications-button":
                    chrome.storage.local.get("followedChannels", followedChannels_result => {
                        let followedChannels = followedChannels_result.followedChannels;
                        
                        let newNotifsData = followedChannels.filter(element => {
                            return element.name.toLowerCase().includes(this.document.getElementById("searchbox").value.toLowerCase());
                        })
            
                        addNotifChannels(newNotifsData);
                    });
                    break;
            }
        });
    });

    populatePage();
});

function disconnect() {
    chrome.storage.sync.remove("ttvToken");
    chrome.storage.local.remove("ttvStreams_data", () => {
        chrome.storage.local.remove("ttvUser_data", () => {
            populatePage();
        });
    });
    chrome.storage.local.remove("ttvUser");
}

function populatePage() {
    isDisconnected(result => {
        if (!result) {
            this.document.getElementById("login-twitch").style["display"] = "none";
            this.document.getElementById("user-infos-top").style["display"] = "inline-block";
            this.document.getElementById("disconnected-tip").style["display"] = "none";
            this.document.getElementById("disconnected-stream-tip").style["display"] = "none";
            this.document.getElementById("searchbox").style["display"] = "inline-block";
            this.document.getElementById("informations").style["display"] = "block";
            this.document.getElementById("bottom-bar").style["display"] = "block";


            chrome.storage.local.get("ttvUser_data", ttvUser_data_result => {
                let ttvUser_data = ttvUser_data_result.ttvUser_data;

                // Populating username + user picture
                this.document.getElementById("username-top").innerText = ttvUser_data.display_name;
                this.document.getElementById("user-pic-top").src = ttvUser_data.profile_image_url;
            });

            chrome.storage.local.get("ttvStreams_data", ttvStreams_data_result => {
                let ttvStreams_data = ttvStreams_data_result.ttvStreams_data;

            });
        } else {
            this.document.getElementById("login-twitch").style["display"] = "inline-block";
            this.document.getElementById("user-infos-top").style["display"] = "none";
            this.document.getElementById("disconnected-tip").style["display"] = "inline-block";
            this.document.getElementById("disconnected-stream-tip").style["display"] = "block";
            this.document.getElementById("searchbox").style["display"] = "none";
            this.document.getElementById("informations").style["display"] = "none";
            this.document.getElementById("bottom-bar").style["display"] = "none";
        }
    })

    setTimeout(populatePage, 10000);
}

function populateStreams(stream_data) {
    this.document.getElementById("streams").innerHTML = "";
    stream_data.forEach(element => {
        this.document.getElementById("streams").innerHTML += newDiv(element);
    });
}

function isDisconnected(callback) {
    chrome.storage.local.get("disconnected", disconnected_result => {
        if (disconnected_result.disconnected != null) {
            callback(true);
            return;
        }
        chrome.storage.sync.get("ttvToken", ttvToken_result => {
            if (ttvToken_result.ttvToken == null || ttvToken_result.ttvToken == "failed" || ttvToken_result.ttvToken == "none") {
                callback(true);
                return;
            }
            callback(false);
        });
    });
}

function newDiv(stream_info){
    var newStream = 
        '<a href="https://www.twitch.tv/' + stream_info.user_login + '" target="_blank"><div class="stream">' +
        '<img class="stream-pic" src="' + stream_info.thumbnail_url.replace("{width}", "128").replace("{height}", "72") + '" />' +
        '<div class="streamer-name" title="' + sanitizeString(stream_info.user_name) + '">' + sanitizeString(stream_info.user_name) + '</div>' +
        '<div class="right-part">' +
        '    <div class="stream-title" title="' + sanitizeString(stream_info.title) + '">' + sanitizeString(stream_info.title) + '</div>' +
        '    <div class="stream-game" title="' + sanitizeString(stream_info.game_name) + '">' + sanitizeString(stream_info.game_name) + '</div>' +
        '    <div class="viewer-count"><span class="live-circle"></span>' + new Intl.NumberFormat('fr-FR').format(stream_info.viewer_count) + '</div>' +
        '    <div class="stream-tags">' +
        '        <div class="stream-time">' + getStreamUptime(stream_info.started_at) + '</div>' +
        '        <div class="stream-language">' + stream_info.language + '</div>' + (stream_info.is_mature ?
        '        <div class="stream-mature">18+</div>':'') +
        '    </div>' +
        '</div>' +
        '</div></a>';
    
    return newStream;
}

function sanitizeString(str){
    str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
    return str.trim();
}

function getStreamUptime(startTime) {
    let start = new Date(startTime);
    let now = new Date();
    let hours = (((now - start) / 1000) / 60) / 60;
    let minutes = (((now - start) / 1000) / 60) % 60;

    return parseInt(hours) + ":" + parseInt(minutes).toString().padStart(2, '0');
}

function getFollowedChannels(ttvToken, ttvUserId, clientId, callback, page) {
    fetch("https://api.twitch.tv/helix/users/follows?first=100&from_id=" + ttvUserId + (page != null ? "&after=" + page : ""), {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + ttvToken,
            "Client-Id": clientId
        }
    }).then(response => {
        response.json().then(data => {
            if (data.pagination != null && Object.keys(data.pagination).length !== 0 && data.total > 100) {
                let totalData = [];
                Array.prototype.push.apply(totalData, data.data);
                getFollowedChannels(ttvToken, ttvUserId, clientId, data => {
                    Array.prototype.push.apply(totalData, data);
                    callback(totalData);
                }, data.pagination.cursor);
            } else {
                callback(data.data);
            }
        })
    }, reason => {
        // TODO: handle this case
        console.log(reason);
    });
}

function getAllTwitchCategories(ttvToken, ttvUserId, clientId, callback, page) {
    fetch("https://api.twitch.tv/helix/games/top?first=100" + (page != null ? "&after=" + page : ""), {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + ttvToken,
            "Client-Id": clientId
        }
    }).then(response => {
        response.json().then(data => {
            if (data.pagination != null && Object.keys(data.pagination).length !== 0) {
                let totalData = [];
                Array.prototype.push.apply(totalData, data.data);
                getAllTwitchCategories(ttvToken, ttvUserId, clientId, data => {
                    Array.prototype.push.apply(totalData, data);
                    callback(totalData);
                }, data.pagination.cursor);
            } else {
                callback(data.data);
            }
        })
    }, reason => {
        // TODO: handle this case
        console.log(reason);
    });
}

/**
 * 
 * @param {*} data Data to normalize
 * @returns Returns alphabetically sorted normalized data array
 */
function normalizeFollowedChannels(data) {
    var newData = [];

    data.forEach(element => {
        newData.push({
            "id": element.to_id,
            "name": element.to_name,
            "login": element.to_login,
            "date": element.followed_at
        });
    });

    newData.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });

    return newData;
}