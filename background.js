// woo
chrome.runtime.getBackgroundPage( function(bg) {
    window.bg = bg
})


chrome.runtime.onMessage.addListener( function(sender, message, sendResponse) {
    console.log('got message',sender,message)
})

chrome.app.window.onClosed.addListener(function(evt) {
    console.log('chrome app window onClosed',evt)
})

chrome.app.runtime.onLaunched.addListener(function(launchData) {
    console.log('onLaunched with launchdata',launchData)
    var haveEntry = false
    var iurl = 'index.html'
    if (launchData.items) {
        window.launchEntry = launchData.items[0].entry
        haveEntry = true
    } else {
        iurl = 'index.html?noentry=1'

    }
    var info = {type:'onLaunched',
                launchData: launchData}
    var opts = {id:'index'}
    chrome.app.window.create(iurl,
                             opts,
                             function(mainWindow) {
                                 window.mainWindow = mainWindow;
			     });
    console.log('launched')



    function FileEntryHandler(request) {
        DirectoryEntryHandler.prototype.constructor.call(this, request)
    }
    _.extend(FileEntryHandler.prototype, 
             DirectoryEntryHandler.prototype, 
             BaseHandler.prototype, {
        get: function() {
            this.setHeader('accept-ranges','bytes')
            this.setHeader('connection','keep-alive')
            this.onEntry(window.bg.launchEntry)
            // handle get request
            // this.write('OK!, ' + this.request.uri)
        }
    })

    chrome.runtime.getPackageDirectoryEntry( function(entry) {
        window.fs = new FileSystem(entry)
    })

    var handlers = [
//        ['.*', MainHandler]
//        ['.*', FileEntryHandler]
        ['/EBOOKENTRY.epub', FileEntryHandler],
        ['.*', DirectoryEntryHandler]
    ]

    var app = new chrome.WebApplication({handlers:handlers, host:'127.0.0.1', port:19685})
    app.start()
    window.app = app
});

function reload() { chrome.runtime.reload() }