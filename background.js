const tabHistory = []
let tabPointer = -1
let isTabActivationByCommand = false

function logHistory() {
    console.log("New Tab History: ", tabHistory)
    console.log("New Tab Pointer at index: ", tabPointer)
}

chrome.tabs.query({active: true}).then((tab) => {
    tabHistory.push(tab[0].id)
    tabPointer += 1
    // console.log("Current tab added to nav history!")
})

async function goToPointedTab(isGoingForward = false) {
    const newTabId = tabHistory[tabPointer]

    chrome.tabs.update(newTabId, {active: true}, (tab) => {
        if(tab){
            // console.log(`Tab with ID ${newTabId} is now active!`)
            isTabActivationByCommand = true
            // logHistory()
        }else{
            if(isGoingForward){
                tabPointer += 1
                goToPointedTab(isGoingForward)
            }else{
                tabPointer -= 1
                goToPointedTab(isGoingForward)
            }  
        }
    })
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const {tabId} = activeInfo
    // console.log("Active tab changed to Id: ", tabId)
    const tab = await chrome.tabs.get(tabId)

    if(tab && !isTabActivationByCommand){
        while (tabPointer < tabHistory.length - 1){
            tabHistory.pop()
        }
        tabHistory.push(tab.id)
        tabPointer += 1
        
    }
    isTabActivationByCommand = false
    // logHistory()
})

chrome.commands.onCommand.addListener(async (command) => {
    if(command == "go-back-history"){
        if(tabHistory.length > 0 && tabPointer > 0){
            // console.log("Going back in history...")
            tabPointer -= 1
            goToPointedTab()
        }
    }

    if(command == "go-forward-history"){
        if(tabHistory.length > 1 && tabPointer < tabHistory.length - 1){
            // console.log("Going forward in history...")
            tabPointer += 1
            goToPointedTab(true)
        }
    }
})