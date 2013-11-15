(function($) {
	$.widget( "kvn.sortable", {
		// caches the original table rows
		cached_elem: [],
	
		// These options will be used as defaults
		options: {
			default_sort: null,
			sort: []
		},

		// Set up the widget
		_create: function() {
			var self = this;
			
			self.cached_elem = [];
			
			// mark that this table has been made sortable
			$(self.element).addClass("sortable");
			
			// number all of the non-header rows
			$("tbody tr", self.element).each(function(index){
				self.cached_elem.push($(this));
				$(this).attr("index", index + 1);
			});
			
			// set odd and even rows
			$("tbody tr:even", self.element).addClass("sortable-row-even");
			$("tbody tr:odd", self.element).addClass("sortable-row-odd");
			
			// append an inline icon indicating sorting direction
			$("thead th", self.element).append("<span class='sortable-direction-icon'></span>");
			
			// handle each of the header elements in the table
			$("thead th", self.element)
				.data("direction", 0)
				.disableSelection()
				.css("cursor", "pointer")
				.click(function(e){
					// determine the column index of the clicked element
					var column_index = $(this).index() + 1;
					self._sort(column_index, $(this), true);
				});
				
			// perform a default sort if requested
			var default_sort = self.options.default_sort;
			if (default_sort) {
				var header = $("thead th:nth-child(" + default_sort.column + ")", self.element);
				header.data("direction", default_sort.direction);
				self._sort(default_sort.column, header, false);
			}
		},
		
		// this will sort by a column
		_sort: function(column_index, header, evaluate_next_direction) {
			var self = this;
			
			// reset the ordering for all the other columns
			$("thead th", self.element).each(function(index){
				if (index != column_index - 1) {
					$(this).data("direction", 0);
				}
			});
		
			// change the sorting direction after clicking a table header element
			$(".sortable-direction-icon", self.element).html("");
			if (evaluate_next_direction) {
				switch (header.data("direction")) {
					case 1: header.data("direction", -1); break;
					case -1: header.data("direction", 0); break;
					case 0: // fall through
					default: header.data("direction", 1); break;
				}
			}
			// draw the sorting direction icon
			switch (header.data("direction")) {
				case 0:  $(".sortable-direction-icon", header).html(""); break;
				case 1:  $(".sortable-direction-icon", header).html("&nbsp;&#x25BC;"); break;
				case -1: $(".sortable-direction-icon", header).html("&nbsp;&#x25B2;"); break;
				default:  $(".sortable-direction-icon", header).html(""); break;
			}
			
			// construct a data array, from the column clicked, to perform sort upon
			var is_numerical = false;
			var data = [];
			$("tbody tr td:nth-child(" + column_index + ")", self.element).each(function(index){
				var datum = $(this).html();
										
				if (datum && datum.length > 0) {
					if (!isNaN(datum)) {
						datum = Number(datum);
						is_numerical = true;
					}
				} else {
					datum = $(this).val();
				}
				data.push({index: index, value: datum});
			});
			
			if (header.data("direction") == 0) {
						
				// just set it back to the original table
				$("tbody", self.element).empty();
				
				for (var i=0; i<self.cached_elem.length; i++) {
					$("tbody", self.element).append(self.cached_elem[i]);
				}
				
				// number all of the non-header rows
				$("tbody tr", self.element).each(function(index){
					$(this).attr("index", index + 1);
				});
				
			} else {
				// if a custom sorting algorithm has been specified for the clicked
				// column, then we apply it, otherwise use default supplied
				if (self.options.sort[column_index]) {
					data = data.sort(self.options.sort[column_index]);
				} else {
					if (is_numerical) {
						data = data.sort(function(a, b){
							return a.value - b.value;
						});
					} else {
						// case insensitive alphabetic sort
						data = data.sort(function(a, b) {
							if (a.value.toLowerCase() < b.value.toLowerCase()) return -1;
							if (a.value.toLowerCase() > b.value.toLowerCase()) return 1;
							return 0;
						});
					}
				}
				// if the sorting order is descending, take our ascending sorted data and reverse it
				if (header.data("direction") == -1) {
					data = data.reverse();
				}
			
				// shift the order of the elements in the table
				for (var i=0; i<data.length; i++) {
					var src_row_index = data[i].index + 1;
					var src_row = $("tbody tr[index=" + src_row_index + "]", self.element);
					$(self.element).append(src_row);
				}
				
				// reindex the table row elements
				$("tbody tr", self.element).each(function(index){
					$(this).attr("index", index + 1);
				});
			}
			
			// set odd and even rows
			$("tbody tr", self.element).removeClass("sortable-row-even sortable-row-odd");
			$("tbody tr:even", self.element).addClass("sortable-row-even");
			$("tbody tr:odd", self.element).addClass("sortable-row-odd");
		},

		// Use the _setOption method to respond to changes to options
		_setOption: function( key, value ) {
			var self = this.options;
			switch( key ) {
				case "default_sort":
					self.options = value;
					break;
				case "sort":
					self.options = value;
					break;	
			}

			// In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
			$.Widget.prototype._setOption.apply( this, arguments );
		},

		// Use the destroy method to clean up any modifications your widget has made to the DOM
		destroy: function() {
			var self = this;
			
			self.cached_elem = [];
		
			// remove the sortable feature
			$(self.element).removeClass("sortable");
			
			// remove all alternating row orderings and the index numberings
			$("tbody tr", self.element).each(function(index){
				$(this).removeClass("sortable-row-even sortable-row-odd")
				$(this).removeAttr("index");
			});
			
			// remove the inline icon indicating sorting direction
			$(".sortable-direction-icon", self.element).remove();
		
			// In jQuery UI 1.8, you must invoke the destroy method from the base widget
			$.Widget.prototype.destroy.call( this );
		}
	});
}(jQuery));
