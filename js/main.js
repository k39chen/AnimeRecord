$(document).ready(function(){

	var THUMBNAILS_DIR = "data/thumbnails/";
	var sortedItems = Data.Animes;
	var activeItems = [];
	
	// initialize the application
	initialize();
	
	// bind hover state behaviour for hover-able items
	enableHoverState($("#sortOptions .sortOption"));
	enableHoverState($("#filters .option"));
	enableHoverState($("#metrics .metric"));
	
	// initialize handlers
	handleSortOrdering();
	handleFilters();
	
	// create the autocomplete data sources
	var searchSource = [];
	for (var i=0; i<Data.Animes.length; i++) {
		searchSource.push({
			label: Data.Animes[i].title,
			value: Data.Animes[i].title
		});
	}
	
	// set up the search records autocomplete text field
	$("#searchBox")
		.click(function(){
			resetFilters();
		})
		.autocomplete({
			source: searchSource,
			minLength: 0,
			response: function(event, ui) {
				// specify the autocomplete filter
				applyFilters(function(data){
					for (var i=0; i<ui.content.length; i++) {
						if (ui.content[i].value == data.title) {
							return true;
						}
					}
					return false;
				});
			}
		});
		
		
	// quick fix for hiding tooltips when scrolling
	$(window).scroll(function(){
		$(".ui-tooltip").hide();
	});
	
	//=======================================================
	
	/**
	 * Initializes the application
	 * 
	 * @method initialize
	 */
	function initialize() {
	
		$("title").html(Data.Title);
		$("#title").html(Data.Title);
	
		calculateDimensions();
		$(window).resize(function(){
			calculateDimensions();
		});
	}
	
	/**
	 * Calculate dimensions for objects in the DOM.
	 *
	 * @calculateDimensions
	 */
	function calculateDimensions() {
		var width = $(window).width() - 480;
		var height = $(window).height();

		$("#banner").width(width - 50);
		$("#content").css({
			width: width
		});
		
		// determine how many items can fit in a row
		var itemWidth = 233;
		var numInRow = Math.floor(width / itemWidth);
		
		// we will set the threshold to 3 items in each row
		// otherwise, if it is any smaller then we will use
		// the smaller item view.
		$("#grid").removeClass("condensed")
		if (numInRow) {
			$("#grid").addClass("condensed");
		}
		
		
		$("#grid").width(itemWidth * numInRow);
	}
	
	/**
	 * Enable hover state.
	 * 
	 * @method enableHoverState
	 * @param {Object} The result of a selector query.
	 * @return {Object} For chained calls
	 */
	function enableHoverState(objects) {
		return objects.hover(
			function(){
				$(this).addClass("hovered");
			},
			function(){
				$(this).removeClass("hovered");
			}
		);
	}
	
	/**
	 * Creates and populates the grid with grid items.
	 *
	 * @method createGrid
	 */
	function createGrid() {
		// start with an empty grid
		$("#grid").empty();
		
		// create all grid items as ordered in the sortedItems array
		for (var i=0; i<sortedItems.length; i++) {
			var item = createGridItem(sortedItems[i]);
			item.attr("index", i);
			$("#grid").append(item);
		}
		
		// initialize mouse triggered events onto the grid items
		enableHoverState($("#grid .item"));
	}
	
	/**
	 * Handles the sort ordering triggered on a click event.
	 *
	 * @method handleSortOrdering
	 */
	function handleSortOrdering() {
		
		$("#sortOptions .sortOption").click(function(){
			$("#sortOptions .sortOption").removeClass("selected");
			$(this).addClass("selected");
			
			// apply the sorting
			applySortOrder();
			
			// reapply the filters
			applyFilters();
		});
		
		// initialize the application with default sort order
		resetSortOrder();
		applySortOrder();
	}
	
	/**
	 * Handles the filters triggered on a click event.
	 *
	 * @method handleFilters
	 */
	function handleFilters() {
		
		$(".filterSection .option").click(function(){
			// get this filter group
			var parent = $(this).parent(".filterSection");
			
			// unselect all the filters in this group
			$(".option", parent).removeClass("selected");
			
			// select this specific option
			$(this).addClass("selected");
			
			// reapply all filters
			applyFilters();
		});
				
		// initialize the application with default filters
		resetFilters();
		applyFilters();
	}
	
	/**
	 * Apply the sorting algorithm.
	 *
	 * @method applySortOrder
	 */
	function applySortOrder() {
	
		// determine which sorting algorithm to use and apply it
		switch ($("#sortOptions .sortOption.selected").attr("value")) {
			case "alphabetical":
				sortedItems = Data.Animes.sort(function(a,b){
					if(a.title < b.title) return -1;
					if(a.title > b.title) return 1;
					return 0;
				});
				break;
			case "stars":
				sortedItems = Data.Animes.sort(function(a,b){
					if (a.stars == b.stars) {
						if(a.title < b.title) return -1;
						if(a.title > b.title) return 1;
						return 0;
					}
					return b.stars-a.stars;
				});
				break;
			case "length":
				sortedItems = Data.Animes.sort(function(a,b){
					var c = Math.max(b.numWatched,b.numTotal);
					var d = Math.max(a.numWatched,a.numTotal);
					if (c == d) {
						if(a.title < b.title) return -1;
						if(a.title > b.title) return 1;
						return 0;
					}
					return c-d;
				});
				break;
			case "status":
				sortedItems = Data.Animes.sort(function(a,b){
					if (a.status == b.status) {
						if(a.title < b.title) return -1;
						if(a.title > b.title) return 1;
						return 0;
					}
					return a.status-b.status;
				});
				break;
			default:
				break;
		}
		// recreate the grid with the new order
		createGrid();
	}
	
	/**
	 * Apply the filters and populate the grid as necessary.
	 * 
	 * @method applyFilters
	 * @param searchFilter {Function} The search filter function.
	 */
	function applyFilters(searchFilter) {
		
		// define filter logic:
		
		// determine what status filter to use
		var statusFilter = null;
		switch($("#status .option.selected").attr("value")) {
			case "completed": 	statusFilter = function(item) { return isStatus(item, STATUS_COMPLETED); }; break;
			case "watching":  	statusFilter = function(item) { return isStatus(item, STATUS_WATCHING); }; break;
			case "queued":  	statusFilter = function(item) { return isStatus(item, STATUS_QUEUED); }; break;
			case "abandoned":  	statusFilter = function(item) { return isStatus(item, STATUS_ABANDONED); }; break;
			default: 			statusFilter = function(item) { return true; }; break;
		}
		// determine what production status filter to use
		var productionFilter = null;
		switch ($("#productionStatus .option.selected").attr("value")) {
			case "ongoing":  	productionFilter = function(item) { return isOngoing(item); }; break;
			case "concluded":  	productionFilter = function(item) { return !isOngoing(item); }; break;
			default:			productionFilter = function(item) { return true; }; break;
		}
		// determine what length filter to use
		var lengthFilter = null;
		switch($("#seriesLength .option.selected").attr("value")) {
			case "L_1_13": 	lengthFilter = function(item){ return isInRange(item, 1,13); }; break;
			case "L_14_26": lengthFilter = function(item){ return isInRange(item, 14,26); }; break;
			case "L_27_54": lengthFilter = function(item){ return isInRange(item, 27,54); }; break;
			case "L_55": 	lengthFilter = function(item){ return isInRange(item, 55); }; break;
			default: 		lengthFilter = function(item){ return true; }; break;
		}
		// determine what genre filter to use
		var genreFilter = null;
		
		//=====================================================
		
		// re-assess the activeItems array
		activeItems = new Array();
		
		// have all the grid items initially hidden
		$("#grid .item").hide();
		
		// iterate through all the animes in our sorted data pool
		for (var i=0; i<sortedItems.length; i++) {
			var animeData = sortedItems[i];
			
			// see if this anime meets our filter requirements
			var statusResult = (!statusFilter) ? true : statusFilter(animeData);
			var productionResult = (!productionFilter) ? true : productionFilter(animeData);
			var lengthResult = (!lengthFilter) ? true : lengthFilter(animeData);
			var searchResult = (!searchFilter) ? true : searchFilter(animeData);
			
			if (statusResult && productionResult && lengthResult && searchResult) {

				// display this as an active item
				$("#grid .item[index=" + i + "]").show();
			
				// register this item in the list of active items in the grid
				activeItems.push(animeData);
			}
		}
		// refresh the metrics now that the active items have been re-evaluated
		refreshMetrics();
	}
	
	/**
	 * Reset filters to initial state.
	 *
	 * @method resetFilters
	 */
	function resetFilters() {
		$("#searchBox").val("");
		$("#filters .option").removeClass("selected");
		$("#filters .option[value=default]").addClass("selected");	
		$("#filters #genres").val("");
	}
	
	/**
	 * Reset sort ordering to initial state.
	 *
	 * @method resetSortOrder
	 */
	function resetSortOrder() {
		$("#sortOptions .sortOption").removeClass("selected");
		$("#sortOptions .sortOption[value=alphabetical]").addClass("selected");
	}
	
	/**
	 * Calculate and refresh the metrics based off the 
	 * items listed in the grid.
	 * 
	 * @method refreshMetrics
	 * @return {Object} The calculation results stored in an object.
 	 */
	function refreshMetrics() {
		var c = {};
		
		// perform the necessary calculations for the metrics
		c.animesListed 		= activeItems.length;
		c.totalOngoing 		= count(activeItems, function(data){ return data.numTotal == N_A; });
		c.totalCompleted 	= count(activeItems, function(data){ return data.status == STATUS_COMPLETED; });
		c.totalWatching 	= count(activeItems, function(data){ return data.status == STATUS_WATCHING; });
		c.totalQueued 		= count(activeItems, function(data){ return data.status == STATUS_QUEUED; });
		c.totalAbandoned 	= count(activeItems, function(data){ return data.status == STATUS_ABANDONED; });
		c.episodesWatched 	= aggregate(activeItems, "numWatched");
		c.averageStars 		= Math.max((aggregate(activeItems, "stars") / activeItems.length).toFixed(1), 0);
		
		// set the metrics pane
		$("#animesListed .number")   .text(formatNum(c.animesListed));
		$("#totalOngoing .number")   .text(formatNum(c.totalOngoing));
		$("#totalCompleted .number") .text(formatNum(c.totalCompleted));
		$("#totalWatching .number")  .text(formatNum(c.totalWatching));
		$("#totalQueued .number")    .text(formatNum(c.totalQueued));
		$("#totalAbandoned .number") .text(formatNum(c.totalAbandoned));
		$("#episodesWatched .number").text(formatNum(c.episodesWatched));
		$("#averageStars .number")   .text(formatNum(c.averageStars));
		
		return c;
	}
	
	/**
	 * Creates a grid item.
	 * 
	 * @method createGridItem
	 * @param itemData {Object} The data of the grid item.
	 * @return {DOM Object} The DOM of the created grid item.
	 */
	function createGridItem(itemData) {
		
		// create the item container
		var item = $("<div>").addClass("item");
		
		// try to load the cover image
		var coverContainer = $("<div>").addClass("coverContainer").appendTo(item);
		var cover = $("<img>").addClass("cover").appendTo(coverContainer);
		
		// create and center the loader
		var loader = $("<img src='assets/loader.gif' />").show().addClass("loader").appendTo(coverContainer);
		loader.css({
			left: (192 - 31)/2,
			top: (284 - 31)/2
		});
		
		if (itemData.cover) {
			cover.attr("src", THUMBNAILS_DIR + itemData.cover + ".jpg")
				.hide()
				.load(function(){
					// we will try and find the optimal size for the source image
					// to fit in the container
					var w = $(this).width();
					var h = $(this).height();
					var scale = 1.0;
					var origWidth = w;
					var origHeight = h;
					
					// container dimensions
					var coverWidth = $(this).parent(".coverContainer").width();
					var coverHeight = $(this).parent(".coverContainer").height();
					
					// first, try scaling down the width first and see if there is any
					// vertical remainder
					scale = coverWidth / origWidth;
					w = origWidth * scale;
					h = origHeight * scale;
					
					// if it is the case that is exposed space in the vertical
					// dimension, then we will attempt to scale the height insteads
					if (h < coverHeight) {
						scale = coverHeight / origHeight;
						w = origWidth * scale;
						h = origHeight * scale;
					}
					
					w = Math.ceil(w);
					h = Math.ceil(h);
					
					// set the dimensions and center the image
					$(this).show().css({
						width: w,
						height: h,
						left: (coverWidth - w)/2,
						top: (coverHeight - h)/2
					});
					
					// hide the loader
					$(".loader", $(this).parent(".coverContainer")).hide();
				 })
				.error(function(){
					$(this).show().attr("src", THUMBNAILS_DIR + "default.jpg").css({
						width: $(this).parent(".coverContainer").width(),
						height: $(this).parent(".coverContainer").height()
					});
					$(".loader", $(this).parent(".coverContainer")).hide();
				 });
		 } else {
			cover.show().attr("src", THUMBNAILS_DIR + "default.jpg").css({
				width: $(this).parent(".coverContainer").width(),
				height: $(this).parent(".coverContainer").height()
			});
			loader.hide();
		 }
		
		// fill the textual item data, if it has been defined
		var title = $("<div>").addClass("title text").appendTo(item);
		if (itemData.title) {
			title.append(itemData.title);
		} else {
			title.append("No title");
		}

		var length = $("<div>").addClass("length text").appendTo(item);
		if (itemData.numTotal) {
			if (itemData.numTotal != N_A) {
				length.append(itemData.numTotal + " Episodes");
			} else {
				length.append("+" + itemData.numWatched + " Episodes (Ongoing)");
			}
		} else {
			length.append("No length specified");
		}
		var stars = createStarGroup("assets/mstar.png", itemData.stars, 5, 12, 10).appendTo(item);
		createStarGroup("assets/bstar.png", itemData.stars, 5, 18, 16); // pre-load tooltip star
		
		// add the status badge
		/*
		var badge = $("<div>").addClass("badge").appendTo(item);
		var badgeImage = $("<img>").addClass("badgeImage")//.appendTo(badge);
		var badgeText = $("<div>").addClass("badgeText").appendTo(badge);
		*/
		
		switch (itemData.status) {
			case STATUS_COMPLETED:
				coverContainer.addClass("completed");
				//badge.addClass("completed");
				//badgeText.append("C");
				break;
			case STATUS_WATCHING:
				coverContainer.addClass("watching");
				//badge.addClass("watching");
				//badgeText.append("W");
				break;
			case STATUS_QUEUED:
				coverContainer.addClass("queued");
				//badge.addClass("queued");
				//badgeText.append("Q");
				break;
			case STATUS_ABANDONED:
				coverContainer.addClass("abandoned");
				//badge.addClass("abandoned");
				//badgeText.append("A");
				break;
			default:
				break;
		}
		
		// create the tooltip for this item
		item.data("animeData", itemData).attr("title", "").tooltip({
			//track: true,
			position: {my: "left top", at: "right+5 top", collision: "flipfit"},
			show: {delay: 500},
			hide: null,
			content: function(){
				var container = $("<div>").addClass("animeTooltipContainer");
				var data = $(this).data("animeData");
			
				// create the sections of the tooltip
				var tooltipHeader = $("<div>").addClass("animeTooltipHeader wrapper").appendTo(container);
				var tooltipTitle = $("<div>").addClass("animeTooltipTitle left").appendTo(tooltipHeader);
				var tooltipLength = $("<div>").addClass("animeTooltipLength right").appendTo(tooltipHeader);
				var tooltipGenres = $("<div>").addClass("animeTooltipGenres").appendTo(container);
				var tooltipDescription = $("<div>").addClass("animeTooltipDescription").appendTo(container);
				var tooltipThemes = $("<div>").addClass("animeTooltipThemes").appendTo(container);
				var tooltipThemesSubject = $("<span>").addClass("subject").append("Themes: ").appendTo(tooltipThemes);
				var tooltipThemesList = $("<span>").addClass("list").appendTo(tooltipThemes);
				container.append($("<div>").addClass("animeTooltipBreak"));
				var tooltipFooter = $("<div>").addClass("animeTooltipFooter wrapper").appendTo(container);
				var tooltipStatus = $("<div>").addClass("animeTooltipStatus left").appendTo(tooltipFooter);
				var tooltipStatusSubject = $("<span>").addClass("subject").append("Status: ").appendTo(tooltipStatus);
				var tooltipStatusText = $("<span>").addClass("text").appendTo(tooltipStatus);
				var tooltipStars = createStarGroup("assets/bstar.png", itemData.stars, 5, 18, 16)
					.addClass("animeTooltipStars right").appendTo(tooltipFooter);
				
				// fill the sections with content
				if (data.title) tooltipTitle.append(data.title);
				if (data.numTotal) {
					tooltipLength.append(((data.numTotal != N_A) 
						? data.numTotal + " Episodes" 
						: "+" + data.numWatched + " Episodes (Ongoing)"));
				}
				if (data.genres) tooltipGenres.append(data.genres.join(", "));
				if (data.description) tooltipDescription.append(data.description);
				if (data.themes) {
					if (data.themes.length > 0) {
						tooltipThemesList.append(data.themes.join(", "));
					} else {
						tooltipThemesList.addClass("empty").append("No themes found.");
					}
				}
				switch (data.status) {
					case STATUS_COMPLETED: 	tooltipStatusText.addClass("completed").append("Completed"); break;
					case STATUS_WATCHING: 	tooltipStatusText.addClass("watching").append("Watching"); break;
					case STATUS_QUEUED: 	tooltipStatusText.addClass("queued").append("Queued"); break;
					case STATUS_ABANDONED: 	tooltipStatusText.addClass("abandoned").append("Abandoned"); break;
					default: break;
				}
				
				return container;
			}
		});
		
		
		return item;
	}
	
	/**
	 * Create star group.
	 *
	 * @method createStarGroup
	 * @param imgPath {String} The path of the star image
	 * @param rating {Number} The current rating
	 * @pram total {Number} The max rating
	 * @param width {Number} The width of a single star
	 * @param height {Number} The height of a single star
	 */
	function createStarGroup(imgPath, rating, total, width, height) {
		var stars = $("<div>").addClass("stars");
		
		var cropper, image;
		for (var i=0; i<total; i++) {
			cropper = $("<div>")
				.addClass("cropper")
				.css({width: width, height: height})
				.appendTo(stars);
			
			image = $("<img src='" + imgPath+ "' />").appendTo(cropper);
			
			if (rating - i < 1 && rating - i > 0) {
				image.css({marginTop: -height*2});
			} else if (i < rating) {
				image.css({marginTop: 0});
			} else {
				image.css({marginTop: -height});
			}
		}
		
		return stars;
	}
	
	/**
	 * Perform a counter operation that aggregates a value based on a specific
	 * field.
	 *
	 * @method aggregate
	 * @param list {Array} The data set provided.
	 * @param field {String} The name of the field that we want to aggregate on.
	 * @return {Number} Returns the value of the counter.
	 */
	function aggregate(list, field) {
		var counter = 0;
		for (var i=0; i<list.length; i++) {
			if (list[i][field]) {
				counter += list[i][field];
			}
		}
		return counter;
	}
	 
	/**
	 * Perform a counter operation that increments the counter based 
	 * on a condition provided.
	 *
	 * @method count
	 * @param list {Array} The data set provided.
	 * @param condition {Function} A condition function that returns either true or false.
	 * @return {Number} Returns the value of the counter.
	 */
	function count(list, condition) {
		var counter = 0;
		for (var i=0; i<list.length; i++) {
			if (condition(list[i])) {
				counter++;
			}
		}
		return counter;
	}
	
	function formatNum(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	function isStatus(item, status) {
		if (item) {
			return item.status == status;
		}
		return false;
	}
	function isOngoing(item) {
		if (item) {
			return item.numTotal == N_A;
		}
		return false;
	}
	function isInRange(item, start, end) {
		if (item) {
			if (item.numTotal != N_A) {
				if (end != null) {
					return item.numTotal >= start && item.numTotal <= end;
				} else {
					return item.numTotal >= start;
				}
			} else {
				if (end != null) {
					return item.numWatched >= start && item.numWatched <= end;
				} else {
					return item.numWatched >= start;
				}
			}
		}
		return false;
	}
});