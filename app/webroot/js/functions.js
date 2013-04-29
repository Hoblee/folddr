// remap jQuery to $
var filterData = false;
var customFeed = false;

(function($){})(window.jQuery);

function format(state) {
	var o = state.element;
	var n = $(o).attr('hoblee-site-name');
	if (!state.id) return state.text; // optgroup
	return "<img style='margin-right:5px; position:relative; top:2px;' class='flag' src='/img/social/"+n+".png'/>" + state.text;
}

function format2(state) {
	var o = state.element;
	var n = $(o).attr('hoblee-site-name');
	if (!state.id) return state.text; // optgroup
	return "<img style='margin-right:5px; position:relative; top:3px;' class='flag' src='/img/social/"+n+".png'/>";
}

function format3(state){
	var o = state.element;
	var icon = $(o).data('icon');
	var span = $(o).data('text');
	return icon+span;
}

function format4(state){
	var o = state.element;
	var icon = $(o).data('icon');
	return icon;
}

function mobileSearch() {
	var q = prompt('Search for favorites and hashtags on Hoblee:');
	if ( q != null && jQuery.trim(q) != "" ) {
		location.href="/search/"+encodeURIComponent(q);
	} 
}

/* trigger when page is ready */
$(document).ready(function (){

	if ( jQuery.trim($("#mobile-tab-bar").html()) == "" ) {
		$("#mobile-tab-bar").remove();
	}

	$("#mobile-tab-bar").mousedown(function(){
		$(this).toggleClass('active');
		$(this).find('.h-dropdown').toggleClass('active');
	});

	$("[hoblee-notifications-discarded]").click(function(){
		var d = $("[hoblee-notifications-discarded]").attr('hoblee-notifications-discarded');
		if ( d == "false" ) {
			discardNotifications();
			$(".badg").hide();
			$("[hoblee-notifications-discarded]").attr('hoblee-notifications-discarded', 'true');
		}
	});

	$("#flashMessage").click(function(){$(this).slideUp();});

	$(window).scroll(function(){
		if ( mobile != true ) {
			hideCaptioner();
		}
	});

	$("#mobile-tab-bar .h-dropdown .item:not(.bullshit)").mousedown(function(){
		var feed_id = $(this).attr('hoblee-feed-id');
		if ( typeof feed_id != "undefined" ) {
			var feed_name = $(this).text();
			$("#mobile-tab-bar .h-dropdown .item.hidden").removeClass('hidden');
			$(this).addClass('hidden');
			$("#mobile-tab-bar .current-feed").attr('hoblee-feed-id', feed_id).find('span').text(feed_name);
			changeFeed();
		}
	});

	$("[h-dropdown]").click(function(event){
		var eventTarget = $(event.target);
		if ( eventTarget.is('.h-dropdown') == false && eventTarget.is('.h-dropdown *') == false ) {
			var target = $(this).find(".h-dropdown");
			if ( $(".h-dropdown.active").is(target) == false ) {
				$(".h-dropdown").removeClass('active');
			}
			target.toggleClass('active');
		}
	});

	$("#tab-bar .tab[hoblee-feed-id]:not(.non-selectable)").live('mousedown', function(e){
		if ( $(e.target).is('[hoblee-feed-delete]') ) {
			console.log('deletin');
		} else {
			$("#tab-bar .tab[hoblee-feed-id].active").removeClass('active');
			$(this).addClass('active');
			changeFeed();
		}
	});

	$("[hoblee-feed-delete]").click(function(){
		var feed_id = $('[hoblee-customfeed].active').attr('hoblee-feed-id');
		$.post('/users/delete_feed', {feed_id: feed_id}, function(d){console.log(d);});
		$('[hoblee-customfeed].active').remove();
		$('[hoblee-feed-id="follow"]').addClass('active');
		changeFeed();
	});

	if ( $("#mobilecheck").is(':visible') == true ) {
		$("#menu-toggle").click(function(){
			$("body").toggleClass('menuon');
		});
	}

	$(".filter-toggle").click(function(){
		$("html").toggleClass('filters');
	});



	$("[select2-sources]").select2({
		formatResult: format,
		formatSelection: format2,
   		escapeMarkup: function(m) { return m; }
	});

	$("[select2-types]").select2({
		formatResult: format3,
		formatSelection: format4,
   		escapeMarkup: function(m) { return m; }
	});

	var plac = $("[select2-scope]").data('placeholder');

	$("[select2-scope]").select2({
		minimumResultsForSearch: 4000,
		placeholder: plac
	});

	$(".left-buttons input").keypress(function(e){
		if ( e.which == 13 ) {
			location.href='/search/'+$(this).val();
		}
 	});

 	$("[hoblee-alternate]").click(function(){
 		$("[hoblee-alternate].active").removeClass('active');
 		$(this).addClass('active');
		$("[hoblee-posts-container], [hoblee-profile-following], [hoblee-profile-followers]").hide();
 		var alternate = $(this).attr('hoblee-alternate');
 		if ( alternate == "hoblee-posts-container" ) {
 			alternateContent = false;
 			$("[hoblee-posts-container]").show();
 		} else {
 			alternateContent = true;
 			$('['+alternate+']').show();
 		}
 	})

});

function applyFilters(){
	var data = new Object();

	var site_id = "";
	var sitesArray = $("#filters [select2-sources]").val();
	if ( sitesArray != null ) {
		sitesArray.forEach(function(item, i){
			if ( i == 0 ) {
				site_id = item;
			} else {
				site_id = site_id+','+item;
			}
		});
		data.site_id = site_id;
	}

	var type_id = "";
	var typesArray = $("#filters [select2-types]").val();
	if ( typesArray != null ) {
		typesArray.forEach(function(item, i){
			if ( i == 0 ) {
				type_id = item;
			} else {
				type_id = type_id+','+item;
			}
		});
		data.type_id = type_id;
	}

	var scope = $('[hoblee-posts-container]').attr('hoblee-feed-scope');
	data.scope = scope;

	var query = $('[hoblee-posts-container]').attr('hoblee-feed-query');
	if ( typeof query != 'undefined' ) {
		data.query = query;
	} else if ( $("#filters [hoblee-feed-query]").length > 0 ) {
		data.query = $("#filters [hoblee-feed-query]").val();
	}

	var user = $('[hoblee-posts-container]').attr('hoblee-feed-user');
	if ( typeof user != 'undefined' ) {
		data.user_id = user;
	}

	filterData = data;

	$('[hoblee-posts-container]').attr('hoblee-posts-page', '0');
	$("html").toggleClass('filters');
	infiniteScroll();
}

function saveFeed(){
	$("#addfeed").removeClass('active');

	var name = $('#addfeed input[name="name"]').val();
	if ( jQuery.trim(name) == "" ) {
		alert('Please provide a name for your feed.');
		return false;
	}
	var scope = $("#addfeed [select2-scope]").val();
	var query = '';
	if ( jQuery.trim($('#addfeed input[name="query"]').val()) != "" ) {
		query = jQuery.trim($('#addfeed input[name="query"]').val());
	}
	var site_id = "";
	var sitesArray = $("#addfeed [select2-sources]").val();
	if ( sitesArray != null ) {
		sitesArray.forEach(function(item, i){
			if ( i == 0 ) {
				site_id = item;
			} else {
				site_id = site_id+','+item;
			}
		});
	}
	if ( site_id == "" ) { site_id = false	; }
	var type_id = "";
	var typesArray = $("#addfeed [select2-types]").val();
	if ( typesArray != null ) {
		typesArray.forEach(function(item, i){
			if ( i == 0 ) {
				type_id = item;
			} else {
				type_id = type_id+','+item;
			}
		});
	}
	if ( type_id == "" ) { type_id = false; }
	$.post('/users/save_custom_feed', {name: name, query: query, scope: scope, site_id: site_id, type_id: type_id}, function(data){
		var d = jQuery.parseJSON(data);
		var html = '<div hoblee-feed-id="'+d.id+'" hoblee-customfeed class="tab"><span>'+name+'</span></div>';
		$(html).insertBefore('#createfeed');
		if ( $("[hoblee-customfeed]").length > 4 ) {
			$("#createfeed").remove();
		}
	});
}

function changeFeed() {
	var feed_id = $("#tab-bar .tab[hoblee-feed-id].active").attr('hoblee-feed-id');
	if ( mobile == true ) {
		feed_id = $("#mobile-tab-bar .current-feed").attr('hoblee-feed-id');
	}
	if ( feed_id == "follow" ) {
		customFeed = false;
		$("[hoblee-posts-container]").attr('hoblee-feed-id', 'follow');
		$(".filter-toggle").show();
		$(".delete-feed").hide();
	} else {
		customFeed = feed_id;
		$("[hoblee-posts-container]").attr('hoblee-feed-id', feed_id);
		$(".filter-toggle").hide();
		$(".delete-feed").show();
	}
	$('[hoblee-posts-container]').attr('hoblee-posts-page', '0');
	infiniteScroll();
}

function getFavers(item_id) {
	$("#favedby .users").empty();
	$.get('/favorites/get_favers/'+item_id, function(data){
		var favers = jQuery.parseJSON(data);
		favers.forEach(function(item, i){
			var html = '<div class="item"><div class="avatar" style="background-image:url('+item.avatar+')"></div><div class="info"><a href="/p/'+item.username+'" class="name">'+item.name+'</a></div></div>';
			$(html).appendTo('#favedby .users');
		});
		$("#favedby").fadeIn();
	});
}

/* optional triggers

$(window).load(function() {

});

$(window).resize(function() {

});

*/