function getClickHandler() {
	return function(info, tab) {
		var url='http://m.scoop-scoop.com/collection/web/add?url='+encodeURIComponent(tab.url)+'&source='+encodeURIComponent(info.srcUrl);
		chrome.tabs.create({ url: url});
	};
};

chrome.contextMenus.create({
	"title" : "스쿱하기",
	"type" : "normal",
	"contexts" : ["image"],
	"onclick" : getClickHandler()
});
