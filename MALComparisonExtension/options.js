var COMPARISONS = [];

function updateComparisons(comparisons){
    COMPARISONS = comparisons;
    let table = document.getElementById("comparisonTable");
    let header = table.querySelector("thead");
    let body = table.querySelector("tbody");
    body.innerHTML = "";
    header.innerHTML = "";
    document.getElementById("count").innerHTML = COMPARISONS.length;
    console.log(COMPARISONS);
    if(COMPARISONS.length == 0){
        table.style.display = "none";
        return;
    }
    table.style.display = "table";
    if(COMPARISONS.length == 1){
        header.innerHTML = `<h4>No Other Animes to compare ${COMPARISONS[0].title} to</h4>`;
        return;
    }

    let characters = {};
    let voiceactors = {};
    let staff = {};

    header.insertAdjacentHTML("beforeend", `<tr><th></th></tr>`);

    for(let i= 0; i < COMPARISONS.length; i++){
        let show = COMPARISONS[i];
        let showvas = {};
        header.children[0].insertAdjacentHTML("beforeend", `<th>${show.title}</th>`);
        for(let char of show.characters){
            characters[char.id] = characters[char.id] ?? [];
            characters[char.id].push(char);
            char['index'] = i;
        }
        // Consolidate voice actors before adding to comparison
        for(let va of show.voiceactors){
            if(showvas[va.id]) showvas[va.id].character.push(va.character);
            else{
                showvas[va.id] = va;
                showvas[va.id].character = [va.character];
            }
            va['index'] = i;
        }
        for(let vaid in showvas){
            voiceactors[vaid] = voiceactors[vaid] ?? [];
            voiceactors[vaid].push(showvas[vaid]);
        }
        for(let s of show.staff){
            staff[s.id] = staff[s.id] ?? [];
            staff[s.id].push(s);
            s['index'] = i;
        }
    }
    for(let charid in characters){
        let chars = characters[charid];
        if(chars.length <= 1) continue;
        body.insertAdjacentHTML("beforeend", `<tr></tr>`);
        let row = body.lastChild;
        for(let i = 0; i < COMPARISONS.length+1; i++){
            row.insertAdjacentHTML("beforeend", `<td></td>`);
        }
        let td = row.children[0];
        td.insertAdjacentHTML("beforeend", `<a href="https://myanimelist.net/character/${chars[0].id}"><img src="${chars[0].img}" title="${chars[0].name}" alt="${chars[0].name}"/></a>`);
        for(let char of chars){
            let td = row.children[char.index+1];
            td.insertAdjacentHTML("beforeend", `${chars[0].type} Character`);
        }
    }

    for(let vaid in voiceactors){
        let vas = voiceactors[vaid];
        if(vas.length <= 1) continue;
        body.insertAdjacentHTML("beforeend", `<tr></tr>`);
        let row = body.lastChild;
        for(let i = 0; i < COMPARISONS.length+1; i++){
            row.insertAdjacentHTML("beforeend", `<td></td>`);
        }
        let td = row.children[0];
        td.insertAdjacentHTML("beforeend", `<a href="https://myanimelist.net/people/${vas[0].id}"><img src="${vas[0].img}" title="${vas[0].name}" alt="${vas[0].name}"/></a>`);
        for(let va of vas){
            let td = row.children[va.index+1];
            for(let charid of va.character){
                let char = characters[charid][0];
                td.insertAdjacentHTML("beforeend", `<a href="https://myanimelist.net/character/${char.id}"><img src="${char.img}" title="${char.name}" alt="${char.name}"/></a>`);
            }
        }
    }

    for(let sid in staff){
        let s = staff[sid];
        if(s.length <= 1) continue;
        body.insertAdjacentHTML("beforeend", `<tr></tr>`);
        let row = body.lastChild;
        for(let i = 0; i < COMPARISONS.length+1; i++){
            row.insertAdjacentHTML("beforeend", `<td></td>`);
        }
        let td = row.children[0];
        td.insertAdjacentHTML("beforeend", `<a href="https://myanimelist.net/people/${s[0].id}"><img src="${s[0].img}" title="${s[0].name}" alt="${s[0].name}"/></a>`);
        for(let st of s){
            let td = row.children[st.index+1];
            td.insertAdjacentHTML("beforeend", `${st.role}`);
        }
    }
}

(()=>{
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if(request.compareupdate) updateComparisons(request.compareupdate);
    });
    chrome.runtime.sendMessage({compareget: true}, updateComparisons);
})()