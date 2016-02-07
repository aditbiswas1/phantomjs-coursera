var async = require('async');
var page = require('webpage').create();

// coursera related 
// SET URL
var courseUrl = 'https://www.coursera.org/learn/ml-regression/';
var waitTime = 10000;

page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36';
page.viewportSize = {
  width: 1366,
  height: 768
};

page.onResourceError = function(resourceError) {
    page.reason = resourceError.errorString;
    page.reason_url = resourceError.url;
};
async.auto({
    homePage: function(callback) {
        page.open(courseUrl+'?authMode=login', function(status) {
        	console.log('home loaded');
            if (status === "success") {
                page.includeJs("https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js", function(){
        			/*console.log('jquery loaded')*/
        			setTimeout(function(){
        				/*page.render('coursera-login.png');*/
        				return callback(null, page);
        			}, waitTime);
        		});
            } else {
                return callback(page.reason);
            }
        });
    },
    login:['homePage', function(callback, results){
    	var page = results.homePage;
    	page.evaluate(function(){
    		// SET PASSWORD
    		var courseU = 'EMAIL';
			var courseP = 'PASSWORD';
    		$($('.rc-LoginForm input[type="email"]')).val(courseU);
    		$($('.rc-LoginForm input[type="password"]')).val(courseP);
    		$('.rc-LoginForm button[data-js="submit"]').click();

    	});
    	setTimeout(function(){
    		console.log("logged in");
    		/*page.render('coursera-login-with-up.png');*/
    		return callback(null, page);
    	}, waitTime);
    }],
    courseHome: ['login', function(callback, results){
    	var page = results.login;
    	page.evaluate(function(){
    		$('.rc-MainNavItem a')[0].click();
    	});
    	setTimeout(function(){
    		console.log("on course page");
    		/*page.render('coursePage.png');*/
    		var links = page.evaluateJavaScript("function(){x = $('.week-title'); return  x.map(function(element){ return $(x[element]).attr('href') });}");
    		return callback(null, {page: page, links: links});
    	}, 2000);
    }],
    weeks: ['courseHome', function(callback, results){
    	var page = results.courseHome.page;
    	var links = results.courseHome.links;
    	async.mapSeries(links, function(link, mapCallback){
    		console.log("visiting " + link);
    		page.open("https://coursera.org/"+ link, function(status){
    			/*console.log("successfully opened " + link);*/
    			if(status === "success"){
    				setTimeout(function(){
    					/*
    					var saveName = link.split('/').join('-');
	    				page.render( saveName + '.png');
	    				*/
	    				var unOpenedlinks = page.evaluateJavaScript("function(){ x = $('.rc-ItemLink i.cif-item-video').parent().parent().parent().parent().parent();  return  x.map(function(element){ return $(x[element]).attr('href') }); }");
	    				var openedLinks = page.evaluateJavaScript("function(){ x = $('.rc-ItemLink i.cif-play').parent().parent().parent().parent().parent().parent();  return  x.map(function(element){ return $(x[element]).attr('href') }); }"); 
	    				var links = [];
	    				for(var i= 0; i < unOpenedlinks.length; i++){
	    					links.push(unOpenedlinks[i]);
	    				}
	    				for(var i= 0; i < openedLinks.length; i++){
	    					links.push(openedLinks[i]);
	    				}
	    				return mapCallback(null, links);
	    			}, waitTime);	
    			}
    			else{
    				/*console.log(page.reason);*/
    				return mapCallback(page.reason);
    			}
    		});
    	},function(err, mapResults){
    		if(err) return callback(err);
    		return callback(null, {page: page, links: mapResults});
    	});
    }],
    lessons: ['weeks', function(callback, results){
    	var page = results.weeks.page;
    	var lessons = results.weeks.links;
    	async.mapSeries(lessons, function(lesson, parentMapCallback){
    		async.mapSeries(lesson, function(link, mapCallback){
    			console.log("opening "+ link );
    			page.open("https://www.coursera.org" + link, function(status){
    				/*console.log("opened "+ link);*/
    				if(status==="success"){
    					setTimeout(function(){
	    					/*var saveName = link.split('/').join('-');
	    					page.render(saveName + '.png');

	    					console.log("evaluating download link");*/
	    					var fileDownload = 	page.evaluate(function(){
	    						return $('.rc-LectureDownloadItem a').attr('href');
	    					});
	    					mapCallback(null, fileDownload);
	    				}, waitTime);	
    				}
    				else{
    					return mapCallback(page.reason);
    				}
    			});
    		}, function(err, parentCallbackResults){
    			var links = [];
    			for(var i = 0; i < parentCallbackResults.length; i++){
    				for (var j = 0; j < parentCallbackResults[i].length; j++){
    					links.push(parentCallbackResults[i][j]);
    				}
    			}
    			parentMapCallback(null, links);
    		});
    	}, callback);
    }],
}, function(error, results) {
    if (error) console.log(error);
    else{
    	for(var i = 0; i < results.lessons.length; i++){
    		console.log(results.lessons[i].join(""));
    	}
    }
    phantom.exit();
});