// star widget
(function($){
	$.fn.starGroup = function(imgPath, currentStars, totalStars, options){
		var settings = $.extend({width: 12, height: 10, num_types : 3}, options);
	
		var curStarGroup = $(this);
		renderStarGroup();
		
		function renderStarGroup(){
			curStarGroup.append("<div class='star-group-inactive'></div>");
		
			$(".star-group-inactive", curStarGroup)
				.css("background", "url(" + imgPath + ") 0px -" + settings.height + "px")
				.css("width", totalStars * settings.width)
				.css("height", settings.height);
			
			$(".star-group-inactive", curStarGroup).append("<div class='star-group-active'></div>");
			
			$(".star-group-active", curStarGroup)
				.css("background", "url(" + imgPath + ")")
				.css("width", currentStars * settings.width)
				.css("height", settings.height);
		}
	}

})(jQuery);