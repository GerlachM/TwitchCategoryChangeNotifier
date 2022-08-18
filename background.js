chrome.alarms.create("refresh", {
    "delayInMinutes": 0.1,
    "periodInMinutes": 0.1
});
chrome.alarms.onAlarm.addListener(alarm => {
    refreshToken(true);
})

chrome.runtime.onInstalled.addListener(() => {
    onStart();
});

chrome.runtime.onStartup.addListener(() => {
    onStart();
});

function onStart() {
    initValues();

    chrome.storage.local.set({"lastFollowedChannelsRefresh": 1});
    chrome.storage.local.set({"lastTTVTokenRefresh": 1});
    chrome.storage.local.set({"lastStreamsRefresh": 0});
    chrome.storage.local.set({"callUserInfos": true});
    chrome.storage.local.set({"totalRefreshCount": 0}, () => {
        chrome.storage.sync.set({"alreadyNotifiedStreams": []}, () => {
            chrome.storage.sync.set({"alreadyNotifiedCategoryChanges": []}, () => {
                forceRefresh();
            });
        });
    });
}

function initValues() {
    chrome.storage.sync.get("viewercount-order", value => {
        if (value["viewercount-order"] == null)
            chrome.storage.sync.set({"viewercount-order": "descendant"});
    });
    chrome.storage.sync.get("streams-layout", value => {
        if (value["streams-layout"] == null)
            chrome.storage.sync.set({"streams-layout": "regular"});
    });
    chrome.storage.sync.get("notified-streams", value => {
        if (value["notified-streams"] == null)
            chrome.storage.sync.set({"notified-streams": []});
    });
    chrome.storage.sync.get("notify-all-streams", value => {
        if (value["notify-all-streams"] == null)
            chrome.storage.sync.set({"notify-all-streams": true});
    });
    chrome.storage.sync.get("enabled-notifications", value => {
        if (value["enabled-notifications"] == null)
            chrome.storage.sync.set({"enabled-notifications": []});
    });
}

function refreshToken(refreshAll) {
    /**
     * We validate the ttv token every 1h
     * This also allows to get some values from Twitch
     */
    chrome.storage.sync.get("ttvToken", ttvToken_result => {
        var ttvToken = ttvToken_result.ttvToken;
        if (ttvToken != null && ttvToken != "failed" && ttvToken != "none") {
            chrome.storage.local.get("lastTTVTokenRefresh", lastTTVTokenRefresh_result => {
                if (lastTTVTokenRefresh_result.lastTTVTokenRefresh < (Date.now() - 3600000)) {
                    validateTTVToken(ttvToken, data => {
                        if (data == null) {
                            hardDisconnect();
                        } else {
                            chrome.storage.local.remove("disconnected");
                            let ttvUser = {
                                "client_id": data.client_id,
                                "expires_in": data.expires_in,
                                "login": data.login,
                                "user_id": data.user_id
                            };
                            chrome.storage.local.set({"ttvUser": ttvUser});
                            if (refreshAll)
                                refresh(ttvToken, ttvUser);
                        }
                    });
                } else if (refreshAll) {
                    chrome.storage.local.get("ttvUser", ttvUser_result => {
                        refresh(ttvToken, ttvUser_result.ttvUser);
                    });
                }
            });
        }
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
    });
}

function refresh(ttvToken, ttvUser) {
    chrome.storage.local.get("callUserInfos", callUserInfos_result => {
        if (callUserInfos_result.callUserInfos) {
            chrome.storage.local.set({"callUserInfos": false});
            getUserInfos(ttvToken, ttvUser.client_id, data => {
                chrome.storage.local.set({"ttvUser_data": data.data[0]});
            });
        } else {
            chrome.storage.local.set({"callUserInfos": true});
        }
    });

    getAllTwitchCategories(
        ttvToken, ttvUser.user_id, ttvUser.client_id, data => {
            var twitchCategoriesMap = data.map(elm => elm.name);
            chrome.storage.local.set({"allTwitchCategories": (twitchCategoriesMap)}, () => {});
        },
        null);

    getLiveFollowedStreams(ttvToken, ttvUser.user_id, ttvUser.client_id, data => {
        chrome.storage.local.set({"lastStreamsRefresh": Date.now()});
        chrome.storage.local.set({"ttvStreams_data": data.data});

        var allStreams = [];
        var allCategoryChanges = [];
        data.data.forEach(el => {
            allStreams.push(el["user_login"]);
            allCategoryChanges.push({
                game_name: el["game_name"],
                user_login: el["user_login"],
            });
        })


        chrome.storage.sync.get("notified-streams", notified_streams_result => {
            var notified_streams = notified_streams_result["notified-streams"];
            chrome.storage.sync.get("notify-all-streams", notify_result => {
                var notify_streams = notify_result["notify-all-streams"];
                chrome.storage.local.get("totalRefreshCount", (totalRefreshCount_result) => {
                    if (totalRefreshCount_result.totalRefreshCount != 0) {
                        chrome.storage.sync.get("alreadyNotifiedStreams", (alreadyNotifiedStreams_result) => {
                            let alreadyNotifiedStreams = alreadyNotifiedStreams_result.alreadyNotifiedStreams;

                            //alreadyNotifiedStreams.pop();

                            let notifiedStreams =  [];
                            let newStreams = allStreams;
                            let stoppedStreams =  [];
                            if (alreadyNotifiedStreams != null) {
                                newStreams = allStreams.filter(x => !alreadyNotifiedStreams.includes(x))
                                stoppedStreams = alreadyNotifiedStreams.filter(x => !allStreams.includes(x))
                                notifiedStreams = allStreams.filter(x => !stoppedStreams.includes(x))
                            }

                            // If "enable all notifications" checkbox isnt checked, we filter out streams
                            if (!notify_streams) {
                                newStreams = newStreams.filter(x => notified_streams.includes(x))
                            }

                            if (newStreams.length > 0) {
                                newNotification(newStreams);
                            }
                            chrome.storage.sync.set({"alreadyNotifiedStreams": notifiedStreams});
                        });

                        chrome.storage.sync.get("alreadyNotifiedCategoryChanges", (alreadyNotifiedCategoryChanges_result) => {
                            let alreadyNotifiedCategoryChanges = alreadyNotifiedCategoryChanges_result.alreadyNotifiedCategoryChanges;

                            //alreadyNotifiedCategoryChanges.pop();


                            let notifiedCategoryChanges =  [];
                            let newCategoryChanges = [];
                            let stoppedCategoryChanges =  [];
                            if (alreadyNotifiedCategoryChanges != null) {

                                for (const element of allCategoryChanges) {
                                    var current_user_login = (element.user_login);
                                    var current_game_name = (element.game_name);

                                    if (!(alreadyNotifiedCategoryChanges.filter(e => e.user_login === current_user_login).length > 0)) {
                                        //streamer is not in alreadyNotifiedCategoryChanges
                                        //means a new streamer went online

                                        newCategoryChanges.push({
                                            game_name: current_game_name,
                                            user_login: current_user_login,
                                            user_just_went_online: true,
                                        });
                                    } else {
                                        //streamer is in alreadyNotifiedCategoryChanges (already notified)
                                        //means check if game changed
                                        for (const el of alreadyNotifiedCategoryChanges) {
                                            if (el.user_login === current_user_login) {
                                                if (el.game_name !== current_game_name) {
                                                    newCategoryChanges.push({
                                                        game_name: current_game_name,
                                                        old_game_name: el.game_name,
                                                        user_login: current_user_login,
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }



                                for (const ell of alreadyNotifiedCategoryChanges) {
                                    if (!(allCategoryChanges.filter(e => e.user_login === ell.user_login).length > 0)) {
                                        //one stream went offline
                                        stoppedCategoryChanges.push({
                                            game_name: ell.game_name,
                                            user_login: ell.user_login,
                                        });
                                    }
                                }



                                for (const elll of allCategoryChanges) {
                                    if (!(stoppedCategoryChanges.filter(e => e.user_login === elll.user_login).length > 0)) {
                                        notifiedCategoryChanges.push({
                                            game_name: elll.game_name,
                                            user_login: elll.user_login,
                                        });
                                    }
                                }

                            }

                            if (newCategoryChanges.length > 0) {
                                newCategoryNotification(newCategoryChanges);
                            }
                            chrome.storage.sync.set({"alreadyNotifiedCategoryChanges": notifiedCategoryChanges});
                        });
                    } else {
                        chrome.storage.sync.set({"alreadyNotifiedStreams": allStreams});
                        chrome.storage.sync.set({"alreadyNotifiedCategoryChanges": allCategoryChanges});
                    }
                    chrome.storage.local.set({"totalRefreshCount": totalRefreshCount_result.totalRefreshCount + 1});
                });
            });
        });
    });
}



async function currentTabHandlesCategoryChangeNotification(new_category_changes) {
    /**
     * (c) David Konrad 2018-
     * MIT License
     *
     * Javascript function to convert plain text to unicode variants
     *
     * Loosely based on the nodejs monotext CLI utility https://github.com/cpsdqs/monotext
     * (c) cpsdqs 2016
     *
     * For more inspiration see  http://unicode.org/charts/
     *
     */

    /*
     * supported unicode variants
     *
     * m: monospace
     * b: bold
     * i: italic
     * c: script (Mathematical Alphanumeric Symbols)
     * g: gothic / fraktur
     * d: double-struck
     * s: sans-serif
     * o: circled text
     * p: parenthesized latin letters
     * q: squared text
     * w: fullwidth
     */

    function toUnicodeVariant(str, variant, flags) {
        str = str.toUpperCase();

        const offsets = {
            m: [0x1d670, 0x1d7f6],
            b: [0x1d400, 0x1d7ce],
            i: [0x1d434, 0x00030],
            bi: [0x1d468, 0x00030],
            c: [0x0001d49c, 0x00030],
            bc: [0x1d4d0, 0x00030],
            g: [0x1d504, 0x00030],
            d: [0x1d538, 0x1d7d8],
            bg: [0x1d56c, 0x00030],
            s: [0x1d5a0, 0x1d7e2],
            bs: [0x1d5d4, 0x1d7ec],
            is: [0x1d608, 0x00030],
            bis: [0x1d63c, 0x00030],
            o: [0x24B6, 0x2460],
            on: [0x0001f150, 0x2460],
            p: [0x249c, 0x2474],
            q: [0x1f130, 0x00030],
            qn: [0x0001F170, 0x00030],
            w: [0xff21, 0xff10],
            u: [0x2090, 0xff10]
        }

        const variantOffsets = {
            'monospace': 'm',
            'bold' : 'b',
            'italic' : 'i',
            'bold italic' : 'bi',
            'script': 'c',
            'bold script': 'bc',
            'gothic': 'g',
            'gothic bold': 'bg',
            'doublestruck': 'd',
            'sans': 's',
            'bold sans' : 'bs',
            'italic sans': 'is',
            'bold italic sans': 'bis',
            'parenthesis': 'p',
            'circled': 'o',
            'circled negative': 'on',
            'squared': 'q',
            'squared negative': 'qn',
            'fullwidth': 'w'
        }

        // special characters (absolute values)
        const special = {
                m: {
                    ' ': 0x2000,
                    '-': 0x2013
                },
                i: {
                    'h': 0x210e
                },
                g: {
                    'C': 0x212d,
                    'H': 0x210c,
                    'I': 0x2111,
                    'R': 0x211c,
                    'Z': 0x2128
                },
                d: {
                    'C': 0x2102,
                    'H': 0x210D,
                    'N': 0x2115,
                    'P': 0x2119,
                    'Q': 0x211A,
                    'R': 0x211D,
                    'Z': 0x2124
                },
                o: {
                    '0': 0x24EA,
                    '1': 0x2460,
                    '2': 0x2461,
                    '3': 0x2462,
                    '4': 0x2463,
                    '5': 0x2464,
                    '6': 0x2465,
                    '7': 0x2466,
                    '8': 0x2467,
                    '9': 0x2468,
                },
                on: {},
                p: {},
                q: {},
                qn: {},
                w: {}
            }
            //support for parenthesized latin letters small cases
            //support for full width latin letters small cases
            //support for circled negative letters small cases
            //support for squared letters small cases
            //support for squared letters negative small cases
        ;['p', 'w', 'on', 'q', 'qn'].forEach(t => {
            for (var i = 97; i <= 122; i++) {
                special[t][String.fromCharCode(i)] = offsets[t][0] + (i-97)
            }
        })

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
        const numbers = '0123456789'

        const getType = function(variant) {
            if (variantOffsets[variant]) return variantOffsets[variant]
            if (offsets[variant]) return variant
            return 'm' //monospace as default
        }
        const getFlag = function(flag, flags) {
            if (!flags) return false
            return flag.split('|').some(f => flags.split(',').indexOf(f) > -1)
        }

        const type = getType(variant)
        const underline = getFlag('underline|u', flags)
        const strike = getFlag('strike|s', flags)
        let result = ''

        for (let c of str) {
            let index
            if (special[type] && special[type][c]) c = String.fromCodePoint(special[type][c])
            if (type && (index = chars.indexOf(c)) > -1) {
                result += String.fromCodePoint(index + offsets[type][0])
            } else if (type && (index = numbers.indexOf(c)) > -1) {
                result += String.fromCodePoint(index + offsets[type][1])
            } else {
                result += c
            }
            if (underline) result += '\u0332' // add combining underline
            if (strike) result += '\u0336' // add combining strike
        }
        return result
    }


    if (typeof module === 'object' && module && typeof module.exports === 'object') {
        module.exports = toUnicodeVariant
    }




    var msg = "";

    chrome.storage.sync.get("enabled-notifications", enabled_notifications_result => {
        var enabled_notifications = enabled_notifications_result["enabled-notifications"];

        if (enabled_notifications) {
            for (const enabled_notification of enabled_notifications) {

                for (const new_category_change of new_category_changes) {
                    if (new_category_change.user_just_went_online) {
                        if (enabled_notification.login === "ANY STREAMER" || enabled_notification.login === new_category_change.user_login) {

                            if (enabled_notification.fromcat === "OFFLINE") {

                                if (enabled_notification.tocat === "ANY CATEGORY" || enabled_notification.tocat === new_category_change.game_name) {
                                    //send alert
                                    msg = msg + "[" + toUnicodeVariant(new_category_change.user_login, 'bs') + "] just went online and has changed the category to ["+ toUnicodeVariant(new_category_change.game_name, 'bs') + "]. ";
                                }
                            }
                        }
                    } else {

                        if (enabled_notification.login === "ANY STREAMER" || enabled_notification.login === new_category_change.user_login) {

                            if (enabled_notification.fromcat === "ANY CATEGORY" || enabled_notification.fromcat === new_category_change.old_game_name) {

                                if (enabled_notification.tocat === "ANY CATEGORY" || enabled_notification.tocat === new_category_change.game_name) {
                                    //send alert
                                    msg = msg + "[" + toUnicodeVariant(new_category_change.user_login, 'bs') + "] has changed the category from [" + toUnicodeVariant(new_category_change.old_game_name, 'bs') + "] to [" + toUnicodeVariant(new_category_change.game_name, 'bs') + "]. ";
                                }

                            }

                        }
                    }
                }


            }
        }


        if (msg !== "") {
            alert(msg + "\n\nɴᴏᴛɪꜰɪᴇᴅ ʙʏ ᴛᴡɪᴛᴄʜ ᴄᴀᴛᴇɢᴏʀʏ ᴄʜᴀɴɢᴇ ɴᴏᴛɪꜰɪᴇʀ");
        }
    });
}

async function currentTabHandlesNotification(streamers) {
    var msg = "Message: ";

    for (const streamer of streamers) {
        msg = msg + streamer + " went online. ";
    }
}


function newCategoryNotification(new_category_changes) {

    chrome.tabs.query({active: true, currentWindow: true}).then(([tab]) => {

        chrome.scripting.executeScript(
            {
                target: {tabId: tab.id},
                //files: ['test.js'],
                function: currentTabHandlesCategoryChangeNotification,
                args: [new_category_changes],
            });



    }).catch(err => setTimeout(function(){ newCategoryNotification(new_category_changes); }, 5000))
}

function newNotification(streamers) {

    chrome.tabs.query({active: true, currentWindow: true}).then(([tab]) => {
        chrome.scripting.executeScript(
            {
                target: {tabId: tab.id},
                //files: ['test.js'],
                function: currentTabHandlesNotification,
                args: [streamers],
            })
    }).catch(err => setTimeout(function(){ newNotification(streamers); }, 3000))
}

function forceRefresh() {
    chrome.storage.local.set({"lastTTVTokenRefresh": 0}, () => {
        chrome.storage.local.set({"callUserInfos": true}, () => {
            refreshToken(true);
        });
    });
}

function disconnect() {
    chrome.storage.sync.remove("ttvToken");
    chrome.storage.local.remove("ttvStreams_data");
    chrome.storage.local.remove("ttvUser_data");
    chrome.storage.local.remove("ttvUser");
}

chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        if (sender.origin === "https://strikr.alwaysdata.net") {
            if (request.requestType == "setTtvToken") {
                if (request.ttvToken != "none") {
                    chrome.storage.sync.set({"ttvToken": request.ttvToken}, () => {
                        forceRefresh();
                    });
                    sendResponse({status: "success"});
                } else {
                    chrome.storage.sync.set({"ttvToken": "failed"});
                    sendResponse({status: "token_none"});
                }
            } else {
                console.log("Unknown message type");
                sendResponse({status: "unknown_msg"});
            }
        }
    }
);

function validateTTVToken(ttvToken, callback) {
    fetch("https://id.twitch.tv/oauth2/validate", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + ttvToken
        }
    }).then(response => {
        chrome.storage.local.set({"lastTTVTokenRefresh": Date.now()});
        response.json().then(data => {
            callback(data);
        })
    }, reason => {
        callback(null);
    });
}

function getLiveFollowedStreams(ttvToken, ttvUserId, clientId, callback) {
    fetch("https://api.twitch.tv/helix/streams/followed?user_id=" + ttvUserId, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + ttvToken,
            "Client-Id": clientId
        }
    }).then(response => {
        response.json().then(data => {
            callback(data);
        })
    }, reason => {
        // TODO: handle this case
        console.log(reason);
    });
}

function getUserInfos(ttvToken, clientId, callback) {
    fetch("https://api.twitch.tv/helix/users", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + ttvToken,
            "Client-Id": clientId
        }
    }).then(response => {
        response.json().then(data => {
            callback(data);
        })
    }, reason => {
        // TODO: handle this case
        console.log(reason);
    });
}
