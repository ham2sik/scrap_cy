$(function() {
	var tabUrl;

	function getCurrentTabUrl(callback) {
		var queryInfo = {
			active: true,
			currentWindow: true
		};

		chrome.tabs.query(queryInfo, function(tabs) {
			var tab = tabs[0];
			var url = tab.url;
			console.assert(typeof url == 'string', 'tab.url should be a string');
			callback(url);
		});
	}

	getCurrentTabUrl(function(url) {
		tabUrl=encodeURIComponent(url);
	});
	
	chrome.windows.getCurrent(function (currentWindow) {
		chrome.tabs.query({ active: true, windowId: currentWindow.id }, function (activeTabs) {
			chrome.tabs.executeScript(activeTabs[0].id, { file: 'send_images.js', allFrames: true });
		});
	});

	var allImages = [];
	var visibleImages = [];
	//var invisibleImages = [];
	var linkedImages = {};

	chrome.extension.onMessage.addListener(function (result) {
		$.extend(linkedImages, result.linkedImages);
		for (var i = 0; i < result.images.length; i++) {
			if (allImages.indexOf(result.images[i]) === -1) {
				allImages.push(result.images[i]);
			}
		}
		filterImages();
	});

	var timeoutID;
	var filter_min_width=125;
	var filter_min_height=40;

	function filterImages() {
		clearTimeout(timeoutID);
		timeoutID = setTimeout(function () {
			var images_cache = $('#images_cache');
			var cached_images = images_cache.children().length;
			for (var i = cached_images; i < allImages.length; i++) {
				images_cache.append($('<img src="' + allImages[i] + '" />').on('load', filterImages));
			}

			visibleImages = allImages.slice(0);
			//invisibleImages = visibleImages;

			visibleImages = visibleImages.filter(function (url) {
				var image = images_cache.children('img[src="' + url + '"]')[0];
				return (filter_min_width <= image.naturalWidth) && (filter_min_height <= image.naturalHeight);
			});
			/*
			invisibleImages = invisibleImages.filter(function (url) {
				var image = images_cache.children('img[src="' + url + '"]')[0];
				return !((filter_min_width <= image.naturalWidth) && (filter_min_height <= image.naturalHeight));
			});
			*/
			displayImages();
		}, 200);
	}

	var timeoutTxt;

	function displayImages() {
		clearTimeout(timeoutTxt);
		var imgList = $('.imgList').empty();

		if (visibleImages.length > 0 ) {
			for (var i = 0; i < visibleImages.length; i++) {
				if (i === visibleImages.length) break;
				var image = '<li><a href="http://m.scoop-scoop.com/collection/web/add?url='+tabUrl+'&source='+encodeURIComponent(visibleImages[i])+'" target="_blank" ><img id="image' + i + '" src="' + visibleImages[i] + '" /></a></li>';
				imgList.append(image);
			}
			$('.infoTxt').html('스쿱에 가져갈 이미지를 선택하세요.');
		/*} else if (invisibleImages.length > 0 ) {
			for (var i = 0; i < invisibleImages.length; i++) {
				if (i === invisibleImages.length) break;
				var image = '<li><a href="http://m.scoop-scoop.com/collection/web/add?url='+tabUrl+'&source='+encodeURIComponent(invisibleImages[i])+'" target="_blank" ><img id="image' + i + '" src="' + invisibleImages[i] + '" /></a></li>';
				imgList.append(image);
			}
			$('.infoTxt').html('스쿱에 가져갈 이미지를 선택하세요.');*/
		}
		timeoutTxt = setTimeout(function () {
			if (visibleImages.length == 0 ) {
				$('.infoTxt').html('스쿱에 가져갈 이미지가 없습니다.<br/><a href="http://m.scoop-scoop.com/collection/web/add?url='+tabUrl+'" target="_blank" >이미지 없이 스쿱하기</a>');
			}
		}, 800);
	}
});
