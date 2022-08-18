function openNotificationsTab() {
    populateNotifications();
}

function populateNotifications() {
    isDisconnected(result => {
        if (!result) {
            chrome.storage.local.get("lastFollowedChannelsRefresh", lastFollowedChannelsRefresh_result => {
                if (lastFollowedChannelsRefresh_result.lastFollowedChannelsRefresh < (Date.now() - 1800000)) {
                    chrome.storage.sync.get("ttvToken", ttvToken_result => {
                        chrome.storage.local.get("ttvUser", ttvUser_result => {
                            getFollowedChannels(
                                ttvToken_result.ttvToken,
                                ttvUser_result.ttvUser.user_id,
                                ttvUser_result.ttvUser.client_id,
                                data => {
                                    chrome.storage.local.set({"lastFollowedChannelsRefresh": Date.now()});
                                    chrome.storage.local.set({"followedChannels": normalizeFollowedChannels(data)}, () => {
                                        chrome.storage.local.get("followedChannels", followedChannels_result => {
                                            chrome.storage.local.get("allTwitchCategories", allTwitchCategories_result => {
                                                if (!allTwitchCategories_result.allTwitchCategorie || allTwitchCategories_result.allTwitchCategories.length < 50) {
                                                    getAllTwitchCategories(
                                                        ttvToken_result.ttvToken, ttvUser_result.ttvUser.user_id,
                                                        ttvUser_result.ttvUser.client_id, data => {
                                                            var twitchCategoriesMap = data.map(elm => elm.name);
                                                            chrome.storage.local.set({"allTwitchCategories": (twitchCategoriesMap)}, () => {
                                                                chrome.storage.local.get("allTwitchCategories", allTwitchCategories_result => {
                                                                    addNotifChannels(followedChannels_result.followedChannels, allTwitchCategories_result.allTwitchCategories);

                                                                });
                                                            });
                                                        },
                                                        null);
                                                } else {
                                                    addNotifChannels(followedChannels_result.followedChannels, allTwitchCategories_result.allTwitchCategories);
                                                }
                                            });
                                        });
                                    });
                                },
                                null);
                        });
                    });
                } else {
                    chrome.storage.local.get("followedChannels", followedChannels_result => {
                        chrome.storage.local.get("allTwitchCategories", allTwitchCategories_result => {
                            addNotifChannels(followedChannels_result.followedChannels, allTwitchCategories_result.allTwitchCategories);

                        });
                    });
                }
            });
        } else {

        }
    })
}

function updateAllAlerts() {
    $(".loading").show();

    this.document.getElementsByClassName("all-alerts")[0].innerHTML = "";

    chrome.storage.sync.get("enabled-notifications", notifieds_result => {
        var enabled_notifications = notifieds_result["enabled-notifications"];
        if (enabled_notifications == null || enabled_notifications === false)
            enabled_notifications = [];


        var q_enabled_notifications = enabled_notifications.reduce((unique, o) => {
            if(!unique.some(obj => obj.type === o.type && obj.login === o.login && obj.fromcat === o.fromcat && obj.tocat === o.tocat)) {
                unique.push(o);
            }
            return unique;
        },[]);


        var html = "";
        q_enabled_notifications.forEach(function (element, i) {
            var text = "I receive an <span class='type'>" + (element.type).toString() + "</span> when <span class='login'>" + (element.login).toString() + "</span> changes category from <span class='fromcat'>" + (element.fromcat).toString() + "</span> to <span class='tocat'>" + (element.tocat).toString()+"</span>";
            var single_alert = "<div class='single-alert'>"+text+"<span><button class='remove-alert'>Remove</button></span></div>"
            html = html + single_alert;
        });

        this.document.getElementsByClassName("all-alerts")[0].innerHTML = html;

        $(".remove-alert").click(function(){
            var type = $(this).parents(".single-alert").children('.type')[0].textContent;
            var login = $(this).parents(".single-alert").children('.login')[0].textContent;
            var fromcat = $(this).parents(".single-alert").children('.fromcat')[0].textContent;
            var tocat = $(this).parents(".single-alert").children('.tocat')[0].textContent;

            removeFromEnabledNotifications(type,login,fromcat,tocat);
        })

        $(".loading").hide();
    });
}

function addNotifChannels(followedChannels, allTwitchCategories) {
    chrome.storage.sync.get("notified-streams", notifieds_result => {

        updateAllAlerts();

        this.document.getElementById("alertcreator").innerHTML = "";
        this.document.getElementById("alertcreator").innerHTML = newStreamElement(notifieds_result["notified-streams"], followedChannels, allTwitchCategories);

        tail.select("select", {
            search: true,
            descriptions: true,
            hideSelected: true,
            hideDisabled: true,
            multiple: false,
        });


        document.querySelectorAll('.notification').forEach(function(el) {
            $(".add-new-alert").click(function(){
                var selects = el.getElementsByTagName('select');

                var select_type;
                var select_login;
                var select_fromcat;
                var select_tocat;


                for (var i = 0; i < selects.length; i++) {
                    var select = selects.item(i);

                    if (i === 0) {
                        select_type = $(select).val();
                    }
                    if (i === 1) {

                        select_login = $(select).val();
                    }
                    if (i === 2) {
                        select_fromcat = $(select).val();
                    }
                    if (i === 3) {
                        select_tocat = $(select).val();
                    }
                }


                addToEnabledNotifications(select_type,select_login,select_fromcat,select_tocat);
            });
        });
    })
}

function addToEnabledNotifications(type,login,fromcat,tocat) {


    chrome.storage.sync.get("enabled-notifications", notifieds_result => {
        var enabled_notifications = notifieds_result["enabled-notifications"];
        if (enabled_notifications == null || enabled_notifications === false )
            enabled_notifications = [];

        enabled_notifications.push({
            type: type,
            login: login,
            fromcat: fromcat,
            tocat: tocat,
        });


        var q_enabled_notifications = enabled_notifications.reduce((unique, o) => {
            if(!unique.some(obj => obj.type === o.type && obj.login === o.login && obj.fromcat === o.fromcat && obj.tocat === o.tocat)) {
                unique.push(o);
            }
            return unique;
        },[]);


        chrome.storage.sync.set({"enabled-notifications": q_enabled_notifications});

        chrome.storage.sync.get("enabled-notifications", notifieds_result => {
            var enabled_notifications = notifieds_result["enabled-notifications"];

            updateAllAlerts();
            alert("Done!");
        });
    });
}

function removeFromEnabledNotifications(type,login,fromcat,tocat) {

    chrome.storage.sync.get("enabled-notifications", notifieds_result => {
        var enabled_notifications = notifieds_result["enabled-notifications"];
        if (enabled_notifications == null || enabled_notifications === false)
            enabled_notifications = [];


        var q_enabled_notifications = enabled_notifications.reduce((unique, o) => {
            if(!unique.some(obj => obj.type === o.type && obj.login === o.login && obj.fromcat === o.fromcat && obj.tocat === o.tocat)) {
                unique.push(o);
            }
            return unique;
        },[]);



        var index = -1;
        q_enabled_notifications.forEach(function (element, i) {
            console.log(element);
            console.log(type+login+fromcat+tocat);

            if (element.type === type && element.login === login && element.fromcat === fromcat && element.tocat === tocat) {
                index = i;
            }
        });
        if (index !== -1) {
            var removed = q_enabled_notifications.splice(index, 1);

            chrome.storage.sync.set({"enabled-notifications": q_enabled_notifications});

            chrome.storage.sync.get("enabled-notifications", notifieds_result => {
                var enabled_notifications = notifieds_result["enabled-notifications"];
                updateAllAlerts();
                alert("Done!");
            });
        }
    });
}




function addToNotified(login) {
    chrome.storage.sync.get("notified-streams", notifieds_result => {
        var notifieds = notifieds_result["notified-streams"];
        if (notifieds == null)
            notifieds = [];
        notifieds.push(login);
        chrome.storage.sync.set({"notified-streams": notifieds});
    });
}

function removeFromNotified(login) {
    chrome.storage.sync.get("notified-streams", notifieds_result => {
        var notifieds = notifieds_result["notified-streams"];
        if (notifieds == null)
            notifieds = [];
        if (notifieds.includes(login)) {
            notifieds.splice(notifieds.indexOf(login), 1);
            chrome.storage.sync.set({"notified-streams": notifieds});
        }
    });
}

function newStreamElement(notified_streams, followedChannels, allTwitchCategories){

    var dropdowntwitchCategories = document.createElement("select");
    let any = document.createElement("option");
    any.text = "ANY CATEGORY";
    any.value = "ANY CATEGORY";
    dropdowntwitchCategories.add(any);
    let off = document.createElement("option");
    off.text = "OFFLINE";
    off.value = "OFFLINE";
    dropdowntwitchCategories.add(off);
    allTwitchCategories.forEach(element => {
        let optEle = document.createElement("option");
        optEle.text = element;
        optEle.value = element;
        dropdowntwitchCategories.add(optEle);
    });



    var dropdownfollowedChannels = document.createElement("select");
    let ansy = document.createElement("option");
    ansy.text = "ANY STREAMER";
    ansy.value = "ANY STREAMER";
    dropdownfollowedChannels.add(ansy);
    followedChannels.forEach(element => {
        let optEle = document.createElement("option");
        optEle.text = element.login;
        optEle.value = element.login;
        dropdownfollowedChannels.add(optEle);
    });


    var dropdownNotificationTypes = document.createElement("select");
    var notificationTypes = [{label: "ALERT", value: "alert"},];
    notificationTypes.forEach(element => {
        let optEle = document.createElement("option");
        optEle.text = element.label;
        optEle.value = element.value;
        dropdownNotificationTypes.add(optEle);
    });


    var newStream =
        '<div class="notification">' +
        '   <div class="notif-text">' +
        '	   <div class="user-notification"><span>I receive an</span> <span>'+dropdownNotificationTypes.outerHTML+'</span> <span>when</span> <span>'+dropdownfollowedChannels.outerHTML+'</span> <span>changes category from</span> <span>'+dropdowntwitchCategories.outerHTML+'</span> <span>to</span> <span>'+dropdowntwitchCategories.outerHTML+'</span>' + '</div>' +
        '	   <label class="enable-notifications switch">' +
        '		   <button class="add-new-alert">Add Alert</button>' +
        '		</label>' +
        '	</div>' +
        '</div>'
    return newStream;
}

function getFollowedTime(time) {
    let date = new Date(time);
    return date.toLocaleString("en-US", {month: "long", day: "numeric", year: "numeric"}) + " &#183; " + date.toLocaleTimeString("en-US", {hour12: false}).substring(0, 5);
}

function hasNotificationsEnabled(notified_streams, login) {
    if (notified_streams == null) {
        return false;
    }
    return notified_streams.includes(login);
}