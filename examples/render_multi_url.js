// Render Multiple URLs to file

"use strict";
var RenderUrlsToFile, arrayOfUrls, system;

var viewports = [
    {
        width : 1200,
        height : 800
    },
    {
        width : 1024,
        height : 768
    },
    {
        width : 768,
        height : 1024
    },
    {
        width : 480,
        height : 640
    },
    {
        width : 320,
        height : 480
    }
];

system = require("system");

/*
Render given urls
@param array of URLs to render
@param callbackPerUrl Function called after finishing each URL, including the last URL
@param callbackFinal Function called after finishing everything
*/
RenderUrlsToFile = function(urls, callbackPerUrl, callbackFinal) {
    var getFilename, next, page, retrieve, urlIndex, webpage, sizeIndex;
    urlIndex = 0;
    sizeIndex = 0;
    webpage = require("webpage");
    page = null;
    getFilename = function() {
        return "rendermulti-" + urlIndex + ".png";
    };
    next = function(status, url, file) {
        page.close();
        callbackPerUrl(status, url, file);
        return retrieve();
    };
    retrieve = function() {
        var url;
        if (urls.length > 0) {
            //url = urls.shift();
            sizeIndex++;

            if (sizeIndex >= viewports.length) {
                urlIndex++;
                sizeIndex = 0;
            }

            url = urls[urlIndex];

            page = webpage.create();
            page.viewportSize = viewports[sizeIndex];
            console.log(JSON.stringify(page.viewportSize), url);
            page.settings.userAgent = "Phantom.js bot";
            return page.open("http://" + url, function(status) {
                var file;
                file = getFilename();
                if (status === "success") {
                    return window.setTimeout((function() {
                        page.render(file);
                        return next(status, url, file);
                    }), 200);
                } else {
                    return next(status, url, file);
                }
            });

        } else {
            return callbackFinal();
        }
    };
    return retrieve();
};

arrayOfUrls = null;

if (system.args.length > 1) {
    arrayOfUrls = Array.prototype.slice.call(system.args, 1);
} else {
    console.log("Usage: phantomjs render_multi_url.js [domain.name1, domain.name2, ...]");
    arrayOfUrls = ["www.theguardian.com/uk", "http://www.theguardian.com/politics/ng-interactive/2016/jun/23/eu-referendum-live-results-and-analysis", "http://www.thetimes.co.uk/article/eu-referendum-follow-the-results-live-np32xpkh5?shareToken=e30af2e153b96ca70e4953d0ddd67059", "https://www.google.co.uk/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=eu%20referendum%20results", "https://ig.ft.com/sites/elections/2016/uk/eu-referendum/index.html", "http://www.itv.com/news/", "http://www.telegraph.co.uk/", "http://election.news.sky.com/referendum", "http://www.wsj.com/europe"];
}

RenderUrlsToFile(arrayOfUrls, (function(status, url, file) {
    if (status !== "success") {
        return console.log("Unable to render '" + url + "'");
    } else {
        return console.log("Rendered '" + url + "' at '" + file + "'");
    }
}), function() {
    return phantom.exit();
});
