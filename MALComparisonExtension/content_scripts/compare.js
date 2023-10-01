const SHOWID = /anime\/(?<id>\d+)\/.*?\/characters/.exec(document.location.href)?.groups?.id;
// NOTE- Tested on Detective Conan and afaik there only only two types of character: m_(main) and s_(supporting)
const CHARE = /(?<type>m|s)_(?<name>.*)/

function parseData(){
    let data = {id: SHOWID};
    data.title = document.querySelector("h1.title-name").textContent.trim();
    data.characters = [];
    data.voiceactors = [];
    data.staff = [];
    // NOTE- VA's are also tr and will get caught by ".js-anime-character-table tr"
    let characters = document.querySelectorAll(".js-anime-character-table>tbody>tr");
    for(let character of characters){
        let char = {};
        let link = character.querySelector(".picSurround a").href;
        char.id = /character\/(?<id>\d+)/.exec(link).groups.id;
        let img = character.querySelector(".picSurround img").dataset.src;
        char.img = img;
        let charinfo = character.querySelector(".js-chara-roll-and-name");
        let result = CHARE.exec(charinfo.textContent.trim());
        char.type = result.groups.type == "m" ? "Main" : "Supporting";
        char.name = result.groups.name;
        char.va = [];
        let vas = character.querySelectorAll(".js-anime-character-va-lang");
        for(let va of vas){
            let vaobj = {};
            vaobj.lang = va.querySelector(".js-anime-character-language").textContent.trim();
            let link = va.querySelector("a[href*=people]").href;
            vaobj.id = /people\/(?<id>\d+)/.exec(link).groups.id;
            vaobj.img = va.querySelector(".picSurround img").dataset.src;
            vaobj.name = va.querySelector("a[href*=people]").textContent.trim();
            vaobj.character = char.id;
            char.va.push(vaobj);
            data.voiceactors.push(vaobj);
        }
        data.characters.push(char);
    }

    let stafflink = document.querySelector("a[name=staff]");
    let current = stafflink.nextElementSibling;
    while(current){
        if(current.tagName !== "TABLE"){
            current = current.nextElementSibling;
            continue;
        }
        let staff = {};
        let img = current.querySelector(".picSurround img").dataset.src;
        staff.img = img;
        let link = current.querySelector(".picSurround a").href;
        staff.id = /people\/(?<id>\d+)/.exec(link).groups.id;
        let nametd = current.querySelector("td:has(small)");
        staff.name = nametd.querySelector("a").textContent.trim();
        staff.role = nametd.querySelector("small").textContent.trim();
        data.staff.push(staff);
        current = current.nextElementSibling;
    }

    return data;
}

function setupUI(){
    document.body.insertAdjacentHTML("beforeend", `<div id="compare" style="
    position:fixed;z-index:1000;top:5px;right:5px;
    width:50px;height:50px;max-width:50px;max-height:50px;
    color:white;background-color:#2e51a2;border-radius:50%;
    display:flex;justify-content:center;align-items:center;
    font-size:1.5em;cursor:pointer;
    box-shadow: 3px 3px 3px 0 rgb(17, 65, 110);
    -moz-box-shadow: 3px 3px 3px 0 rgb(17, 65, 110);
    -webkit-box-shadow: 3px 3px 3px 0 rgb(17, 65, 110);
    -o-box-shadow: 3px 3px 3px 0 rgb(17, 65, 110);
    -ms-box-shadow: 3px 3px 3px 0 rgb(17, 65, 110);" data-compare="true"><span>Comp</span></div>`);
    document.getElementById("compare").addEventListener("click", toggleCompare);

    chrome.runtime.sendMessage({compareget: true}, updateButtons);
}

function toggleCompare(){
    let compare = document.getElementById("compare");
    let value = compare.dataset.compare;
    if(value == "true"){
        compareAdd();
    }else{
        compareRemove();
    }    
}

function updateButtons(compares){
    compares = compares ?? [];
    let index = compares.findIndex((e) => e.id == SHOWID);
    let compare = document.getElementById("compare");
    if(index == -1){
        compare.dataset.compare = "true";
        compare.style.backgroundColor = "#2e51a2";
        compare.querySelector("span").textContent = "Comp";
    }else{
        compare.dataset.compare = "false";
        compare.style.backgroundColor = "#a32e2e";
        compare.querySelector("span").textContent = "Rem";
    }
}

async function compareAdd(sendResponse){
    let data = parseData();
    sendResponse = sendResponse ?? console.log;
    chrome.runtime.sendMessage({compareadd: data}, sendResponse);
}

async function compareRemove(sendResponse){
    let data = parseData();
    sendResponse = sendResponse ?? console.log;
    chrome.runtime.sendMessage({compareremove: data}, sendResponse);
}

function messageHandler(request, sender, sendResponse){
    if(request.compareupdate){
        updateButtons(request.compareupdate);
    }
    if(request.compareadd){
        compareAdd(sendResponse);
        return true;
    }
    if(request.compareremove){
        compareRemove(sendResponse);
        return true;
    }
    if(request.getshowid){
        sendResponse({id: SHOWID});
    }
}


(()=>{
    if(!SHOWID) return;
    chrome.runtime.onMessage.addListener(messageHandler);
    setupUI();
})()