function onload() {
    var webview = document.getElementById('webview')
    console.log('webview',webview)
    if (webview) {
        webview.addEventListener('consolemessage', function(e) {
            //console.log('Guest page logged a message: ', e.message);
        });


        webview.addEventListener("loadstop", function(e) {
            webview.addEventListener('message', function(msg, src) {
                console.log('got msg from embeddee',msg,src)
            })
            if (webview.contentWindow) {
                webview.contentWindow.postMessage({command:'initialize'},"*");
            } else {
                console.warn('webview.contentWindow not yet present?')
            }
        });
    }
}
document.addEventListener("DOMContentLoaded", onload)
