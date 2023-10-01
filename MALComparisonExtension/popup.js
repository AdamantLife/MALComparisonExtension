

async function updateButtons(){
    let results = await chrome.runtime.sendMessage({compareget: true});
    let tabs = await chrome.tabs.query({active: true, currentWindow: true, url: "https://myanimelist.net/anime/*/characters"});
    let tab = tabs?.[0] ?? null;
    let compare = document.getElementById("compare")
    let remove = document.getElementById("remove")
    if(!tab){
        compare.disabled = true;
        compare.onclick = null;
        remove.disabled = true;
        remove.onclick = null;
        return;
    }
    let showid = await chrome.tabs.sendMessage(tab.id, {getshowid: true});
    showid = showid?.id;
    if(!showid){
        compare.disabled = true;
        compare.onclick = null;
        remove.disabled = true;    
        remove.onclick = null;
        return;
    }
    let compares = results ?? [];
    let index = compares.findIndex((e) => e.id == showid);
    if(index == -1){
        compare.disabled = false;
        remove.disabled = true;
    }
    else{
        compare.disabled = true;
        remove.disabled = false;
    }
}

function messageHandler(request, sender, sendResponse){
    if(request.compareupdate){
        updateButtons();
    }
}

(()=>{
    updateButtons();

    chrome.runtime.onMessage.addListener(messageHandler);

    document.getElementById("compare").addEventListener("click", async function(){
        let tabs = await chrome.tabs.query({active: true, currentWindow: true});
        let tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {compareadd: true}, console.log);
    });

    document.getElementById("remove").addEventListener("click", async function(){
        let tabs = await chrome.tabs.query({active: true, currentWindow: true});
        let tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {compareremove: true}, console.log);
    });

    document.getElementById("clear").addEventListener("click", async function(){
        chrome.runtime.sendMessage({compareclear: true}, console.log);
    });

    document.getElementById("show").addEventListener("click",
        ()=>{
            chrome.tabs.create({url: chrome.runtime.getURL("options.html")})
            window.close();
        }
    );
})()