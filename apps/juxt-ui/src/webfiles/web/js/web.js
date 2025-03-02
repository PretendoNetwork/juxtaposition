let pjax;
setInterval(checkForUpdates, 30000);

/* global Pjax */
function initNavBar() {
    let els = document.querySelectorAll("#nav-menu > li");
    if (!els) return;
    for (let i = 0; i < els.length; i++) {
        els[i].addEventListener("click", function(e) {
            let el = e.currentTarget;
            for(let i = 0; i < els.length; i++) {
                if(els[i].classList.contains('selected'))
                    els[i].classList.remove('selected');
            }
            el.classList.add("selected");
        });
    }
}
function initYeah() {
    let els = document.querySelectorAll("span[data-post]");
    if (!els) return;
    for (let i = 0; i < els.length; i++) {
        els[i].removeEventListener('click', yeah);
        els[i].addEventListener("click", yeah);
    }
    function yeah(e) {
        let el = e.currentTarget, id = el.getAttribute("data-post");
        let parent = document.getElementById(id);
        let count = document.getElementById("count-" + id);
        el.disabled = true;
        let params = "postID=" + id;
        if(el.classList.contains('selected')) {
            el.classList.remove('selected');
            parent.classList.remove('yeah');
            count.innerText -= 1;

        }
        else {
            el.classList.add('selected');
            parent.classList.add('yeah');
            count.innerText = ++count.innerText;
        }

        POST('/posts/empathy', params, function a(data) {
            let post = JSON.parse(data.response);
            if(!post || post.status !== 200) {
                // Apparently there was an actual error code for not being able to yeah a post, who knew!
                // TODO: Find more of these
                Toast(1155927);
            }
            el.disabled = false;
            count.innerText = post.count;
        });
    }
}
function initTabs() {
    let els = document.querySelectorAll(".tab-button");
    if (!els) return;
    for (let i = 0; i < els.length; i++) {
        els[i].removeEventListener('click', tabs);
        els[i].addEventListener("click", tabs);
    }
    function tabs(e) {
        e.preventDefault();
        let el = e.currentTarget;
        let child = el.children[0];

        for(let i = 0; i < els.length; i++) {
            if(els[i].classList.contains('selected'))
                els[i].classList.remove('selected');
        }
        el.classList.add("selected");

        GET(child.getAttribute('href') + "?pjax=true", function a(data) {
            let response = data.response;
            if(response && data.status === 200) {
                document.getElementsByClassName("tab-body")[0].innerHTML = data.response;
                window.history.pushState({ url: child.href, title: "", scrollPos: [0, 0]}, "", child.href);
                initPosts();
                initMorePosts();
            }
        })

    }
}
function initPosts() {
    let els = document.querySelectorAll(".post-content[data-href]");
    if (!els) return;
    for (let i = 0; i < els.length; i++) {
        els[i].addEventListener("click", function(e) {
            pjax.loadUrl(e.currentTarget.getAttribute('data-href'));
        });
    }
    initYeah();
    initSpoilers();
}
function initMorePosts() {
    let els = document.querySelectorAll("#load-more[data-href]");
    if (!els) return;
    for (let i = 0; i < els.length; i++) {
        els[i].addEventListener("click", function(e) {
            let el = e.currentTarget;
            GET(el.getAttribute('data-href'), function a(data) {
                let response = data.response;
                if(response && data.status === 200) {
                    el.parentElement.outerHTML = data.response;
                    initPosts();
                    initMorePosts();
                }
                else
                    el.parentElement.remove();
            })

        });
    }
}
function initPostModules() {
    let els = document.querySelectorAll("[data-module-show]");
    console.log(els)
    if (!els) return;
    for (let i = 0; i < els.length; i++) {
        els[i].addEventListener("click", function(e) {
            let el = e.currentTarget,
                show = el.getAttribute("data-module-show"),
                hide = el.getAttribute("data-module-hide"),
                header = el.getAttribute("data-header"),
                menu = el.getAttribute("data-menu");
            if(!show || !hide) return;
            document.getElementById(hide).style.display = 'none';
            document.getElementById(show).style.display = 'block';
            if(header === 'true')
                document.getElementById("header").style.display = 'block';
            else
                document.getElementById("header").style.display = 'none';
            if(menu === 'true')
                document.getElementById("nav-menu").style.display = 'block';
            else
                document.getElementById("nav-menu").style.display = 'none';
            initNewPost();
        });
    }
}
function initPostEmotion() {
    let els = document.querySelectorAll("input[data-mii-face-url]");
    if (!els) return;
    for (let i = 0; i < els.length; i++) {
        els[i].addEventListener("click", function(e) {
            let el = e.currentTarget;
            document.getElementById("mii-face").src = el.getAttribute('data-mii-face-url');
        });
    }
}
function initNewPost() {
    initPostEmotion();
    initScreenShots();
}
function initSpoilers() {
    let els = document.querySelectorAll("button[data-post-id]");
    if (!els) return;
    for (let i = 0; i < els.length; i++) {
        els[i].addEventListener("click", function(e) {
            let el = e.currentTarget;
            document.getElementById('post-' + el.getAttribute('data-post-id')).classList.remove('spoiler');
            el.remove();
        });
    }
}

function initAll() {
    initNavBar();
    initTabs();
    initPosts();
    initMorePosts();
    initPostModules();
    pjax.refresh();
}

console.debug("Document initialized:" + window.location.href);
document.addEventListener("pjax:send", function() {
    console.debug("Event: pjax:send", arguments);
});
document.addEventListener("pjax:complete", function() {
    console.debug("Event: pjax:complete", arguments);
});
document.addEventListener("pjax:error", function(e) {
    Toast('Error: Unable to load element. \nPlease send the error code and what you were doing in #support');
    console.debug(e);
});
document.addEventListener("pjax:success", function() {
    console.debug("Event: pjax:success", arguments);
    initAll();
});
document.addEventListener("DOMContentLoaded", function() {
    pjax = new Pjax({
        elements: "a[data-pjax]" +
            "",
        selectors: ["title", "#body"],
        switches: {"#nav-menu": Pjax.switches.replaceNode, ".tab-body": Pjax.switches.replaceNode}
    })
    console.debug("Pjax initialized.", pjax);
    initAll();
});

function follow(el) {
    let id = el.getAttribute("data-community-id");
    let count = document.getElementById("followers");
    let oldtext = el.innerText, newtext = el.getAttribute("data-text");
    el.disabled = true;
    let params = "id=" + id;
    if(el.classList.contains('checked')) {
        el.classList.remove('checked');
    }
    else {
        el.classList.add('checked');
    }
    el.setAttribute("data-text", oldtext);
    el.innerText = newtext;
    POST(el.getAttribute("data-url"), params, function a(data) {
        let element = JSON.parse(data.response);
        if(!element || element.status !== 200) {
            // Apparently there was an actual error code for not being able to yeah a post, who knew!
            // TODO: Find more of these
            return Toast('Unable to follow. Please try again later.');
        }
        el.disabled = false;
        count.innerText = element.count;
    });
}
function checkForUpdates() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let notificationObj = JSON.parse(this.responseText);
            let messages = document.getElementById("message-badge");
            let news = document.getElementById("news-badge");
            /**/
            if(notificationObj.message_count > 0  && notificationObj.message_count < 99) {
                messages.innerHTML = notificationObj.message_count;
                messages.style.display = "unset";
            }
            else if(notificationObj.message_count >= 99) {
                messages.innerHTML = "99+";
                messages.style.display = "unset";
            }
            else {
                messages.innerHTML = "";
                messages.style.display = "none";
            }
            /*Check for Notifications*/
            if(notificationObj.notification_count > 0  && notificationObj.notification_count < 99) {
                news.innerHTML = notificationObj.notification_count;
                news.style.display = "unset";
            }
            else if(notificationObj.notification_count >= 99) {
                news.innerHTML = "99+";
                news.style.display = "unset";
            }
            else {
                news.innerHTML = "";
                news.style.display = "none";
            }
        }
    };
    xhttp.open("GET", "/notifications.json", true);
    xhttp.send();
}
function POST(url, data, callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState === 4) {
            return callback(this);
        }
    }
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(data);
}
function GET(url, callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState === 4) {
            return callback(this);
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

window.onscroll = function(ev) {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
        document.getElementById('load-more').click();
    }
};
function copyToClipboard(text) {
    let inputc = document.getElementsByTagName("header")[0].appendChild(document.createElement("input"));
    inputc.value = text;
    inputc.focus();
    inputc.select();
    document.execCommand('copy');
    inputc.parentNode.removeChild(inputc);
    Toast("Copied to clipboard.");
}
function Toast(text) {
    let x = document.getElementById("toast");
    x.innerText = text;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}
function downloadURI(uri, name) {
    let link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}