chrome.runtime.getBackgroundPage( function(bg) {
    window.bg = bg;
})

window.GOTSTART = false

if (window.analytics && analytics.getService) {
    var service = analytics.getService('EBook Offline Reader');
    var gatracker = service.getTracker('UA-48050412-3');
    gatracker.sendAppView('MainView')
    gatracker.sendEvent('index.js')
}

function noentry() {
    document.getElementById('noentry').style.display = 'block'
}

if (window.location.search && window.location.search.indexOf('noentry') != -1) {
    noentry()
}

window.reviewid = 'leavereview' + Math.floor(Math.random() * 1000)
window.totalplays = null
window.leftreview = null
window.dontreview = null

function fetchthings() {
    chrome.storage.local.get(['totalplays','leftreview','dontreview'], function(d) {

        if (d['leftreview'] !== undefined) {
            leftreview = d['leftreview']
        }

        if (d['dontreview'] !== undefined) {
            dontreview = d['dontreview']
        }

        if (d['totalplays'] !== undefined) {
            totalplays = d['totalplays']
        } else {
            totalplays = 0
            chrome.storage.local.set({'totalplays':0})
        }
    })
}

function incrementplays() {
    totalplays++
    chrome.storage.local.set({'totalplays':totalplays})
}

chrome.notifications.onButtonClicked.addListener(function(id,idx) {
    chrome.notifications.clear(reviewid,function(){})

    if (id == reviewid) {
        if (idx == 0) {
            openwebstore()
            leftreview = true
        } else if (idx == 1) {
            dontreview = true
            chrome.storage.local.set({dontreview:true})
        }
    }
})
function openwebstore() {
    var webstore_url = "https://chrome.google.com/webstore/detail/ebook-offline-reader/fkidldjfpemdgkehdhkoehplkbkcadfa"
    chrome.storage.local.set({'leftreview':true})
    window.open(webstore_url,'_blank')
}

function askleavereview() {
    chrome.notifications.create(reviewid,
                                {
                                    priority:1,
                                    type:"basic",
                                    iconUrl:'/book-128.png',
                                    buttons:[
                                        {title:"Leave a Review", iconUrl:"/cws_32.png"},
                                        {title:"Don't show this message again"}
                                    ],
                                    title:"Leave a Review",
                                    message:"Do you like EBook Reader for Chrome? Help other users discover it by leaving a review!"
                                },
                                function(n){console.log('created notification',n)})
}

webview_initd = false

function initwebview() {
    if (webview_initd) { 
        //console.warn('webview already initd'); 
        return
    }
    console.log('initwebview')
    gatracker.sendEvent('initwebview')
    var webview = document.getElementById('webview')
    webview.contentWindow.postMessage({command:'initialize'},"*");
    webview_initd = true
}

function onchoseentry(fileEntries) {
    console.log('chose entries',fileEntries)
    if (fileEntries && fileEntries.length > 0) {
        chrome.runtime.getBackgroundPage( function(bg) {
            gatracker.sendEvent('choseentry')
            bg.launchEntry = fileEntries[0]
            document.getElementById('noentry').style.display = 'none'
            initwebview()
        })
    }
}

function onload() {
    document.getElementById('choose-file').addEventListener('click',function(evt) {
        chrome.fileSystem.chooseEntry({type:"openFile",
                                       accepts:[
                                           {
                                               mimeTypes: [ "application/epub+zip" ],
                                               extensions: ["epub"]
                                           }
                                       ],
                                       acceptsMultiple: true},
                                      onchoseentry)
    })


    var webview = document.getElementById('webview')
    webview.addEventListener('consolemessage', function(e) {
        //console.log('Guest page logged a message: ', e.message);
    });

    window.addEventListener('message', function(e) {
        console.log("GOT MSG",e.data)
        if (e.data && e.data.event) {
            console.log("GOT EVENT",e.data.event, e.data.metaData, e.data.basic, e.data.data)
            if (e.data.event == 'onError') {
                console.error("GOT ERROR!",e.data)
            } else if (e.data.event == 'rendered') {
                if (window.gatracker) { gatracker.sendEvent('rendered') }
                incrementplays()

                if (totalplays > 3 && totalplays % 2 == 0) {
                    if (dontreview !== true) {
                        console.log('ask leave review')
                        askleavereview()
                    }
                }
            }
        } else {
            console.log('windowmessage: ', e);
        }
    });

/*
    webview.contentWindow.addEventListener('message', function(msg) {
        console.log('webview msg',msg)
    })
*/

    webview.addEventListener("loadstop", function(e) {
        console.log('loadstop')
        // seems to get triggered for every asset loaded (i.e. javascript file, etc)

        webview.addEventListener('message', function(msg, src) {
            console.log('got msg from embeddee',msg,src)
        })
        chrome.runtime.getBackgroundPage(function(bg) {
            if (bg.launchEntry) {
                initwebview()
            }
        })
    });

    //webview.contentWindow.postMessage("HI","*")

    fetchthings()
}

document.addEventListener("DOMContentLoaded", onload)

