// woo

chrome.app.runtime.onLaunched.addListener(function(launchData) {
    console.log('onLaunched with launchdata',launchData)
    if (launchData.items) {
        window.launchEntry = launchData.items[0].entry
    }
    var info = {type:'onLaunched',
                launchData: launchData}
    var opts = {id:'index'}
    chrome.app.window.create('index.html',
                             opts,
                             function(mainWindow) {
                                 window.mainWindow = mainWindow;
			     });
    console.log('launched')



    function FileEntryHandler(request) {
        DirectoryEntryHandler.prototype.constructor.call(this, request)
    }
    var FEHProto = {
        get: function() {
            this.setHeader('accept-ranges','bytes')
            this.setHeader('connection','keep-alive')
            this.onEntry(window.launchEntry)
            // handle get request
            // this.write('OK!, ' + this.request.uri)
        },
        head: function() {
            return this.get()
        }
    }

    _.extend(FileEntryHandler.prototype, 
             DirectoryEntryHandler.prototype, 
             BaseHandler.prototype, FEHProto)


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