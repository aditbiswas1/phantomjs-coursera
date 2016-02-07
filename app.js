var async = require('async');
var page = require('webpage').create();
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36';
page.onResourceError = function(resourceError) {
    page.reason = resourceError.errorString;
    page.reason_url = resourceError.url;
};
async.auto({
    homePage: function(callback) {
        page.open('https://www.coursera.org/?authMode=login', function(status) {

            if (status === "success") {
                page.includeJs("https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js", function(){
        			page.render('coursera-login.png');
        			callback(null, page);
        		})
            } else {
                callback(page.reason);
            }
        });
    },
}, function(error, results) {
    if (error) console.log(err);
    else console.log(results);
    phantom.exit();
});