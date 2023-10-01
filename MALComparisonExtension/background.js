/**
 * @fileoverview Background script for the extension.
 */

/** 
 * Plugin workflow:
 *   The Background script handles all plugin storage (i.e.- the comparison list)
 *   Whenever the Background script updates the storage, it sends a message to the content_script
 *   and the Plugin itself (tabs.sendMessage and runtime.sendMessage)
 * 
 *   Adding and Removing shows from the comparison list is only initiated by the content_script, which
 *   delivers a properly formatted request to the background script
 *   Therefore, the popup sends Add/Remove requests to the content_script
 * 
 *   Clear and Get can be initiated by either the popup or the content_script directly
 */

/**
 * 
 * @param {*} data 
 * @param {*} sendResponse 
 * @returns 
 */
async function compareModify(data, sendResponse, addMode){
    let compares = await chrome.storage.session.get("malcomparisons")
    compares = compares.malcomparisons ?? [];
    let index = compares.find((e) => e.id == data.id);
    if(addMode && index > -1){
        sendResponse({error: "Already exists"});
        return;
    }
    if(!addMode && index == -1){
        sendResponse({error: "Does not exist"});
        return;
    }
    if(addMode){
        compares.push(data);
    }else{
        compares.splice(index, 1);
    }

    await chrome.storage.session.set({"malcomparisons": compares});
    let tabs = await chrome.tabs.query({url:["https://myanimelist.net/*"]});
    for (let tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {compareupdate: compares}).catch(console.log);
    }
    chrome.runtime.sendMessage({compareupdate: compares}).catch(console.log);
    sendResponse({success: true});
}

async function compareClear(data, sendResponse){
    await chrome.storage.session.set({"malcomparisons": []});
    let tabs = await chrome.tabs.query({url:["https://myanimelist.net/*"]});
    for (let tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {compareupdate: []}).catch(console.log);
    }
    chrome.runtime.sendMessage({compareupdate: []}).catch(console.log);
    sendResponse({success: true});
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.compareadd){
        compareModify(request.compareadd, sendResponse, true);
        return true;
    }
    if(request.compareremove){
        compareModify(request.compareremove, sendResponse, false);
        return true;
    }
    if(request.compareclear){
        compareClear(request.compareclear, sendResponse);
        return true;
    }
    if(request.compareget){
        chrome.storage.session.get("malcomparisons", function(result){
            sendResponse(result.malcomparisons ?? []);
        });
        return true;
    }
});