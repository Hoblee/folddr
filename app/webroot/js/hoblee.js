var isUsersFeed = false;			// ¿Es esto un feed que pertenece al current user?
var isHomeFeed = false;				// ¿Es este el feed sobre el cual se abren los lightboxes que vienen desde una URL?
var nowScrolling = false;
var nowLoadingLightbox = false;
var hitBottom = false;
var notificationsDiscarded = false;
var postingComment = false;
var tourObject = false;
var tourIndex = 0;
var tourNextButton = '<br/><button onclick="tour();" class="btn btn-primary">Next</button>';
var tourEndButton = '<br/><button onclick="tour();" class="btn btn-primary">Finish the tour</button>';
var jcrop_api;
var togglingFav = [];
var alternateContent = false;

jQuery.fn.justtext = function() { return $(this).clone().children().remove().end().text(); };
(function(d){d.fn.shuffle=function(c){c=[];return this.each(function(){c.push(d(this).clone(true));}).each(function(a,b){d(b).replaceWith(c[a=Math.floor(Math.random()*c.length)]);c.splice(a,1);});};d.shuffle=function(a){return d(a).shuffle();};})(jQuery);

jQuery.expr[':'].Contains = function(a,i,m){
	return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase())>=0;
};

function generatePopover(container, title, content){
	var position = container.css('position');
	if ( position != "fixed" && position != "absolute" && position != "relative" ) {
		container.css('position', 'relative');
	}
	var height = container.outerHeight();
	if ( parseInt(container.css('line-height')) > height ) {
		height = parseInt(container.css('line-height'));
	}
	var width = container.outerWidth();
	width = width/2;
	var popover = $('<div style="display:none;" hoblee-tour-popover class="popover bottom">\
		<div class="arrow"></div>\
		<h3 class="popover-title">'+title+'</h3>\
		<div class="popover-content">'+content+'</div>\
	</div>');
	popover.appendTo(container).css('margin-top', height+'px').css('left', width+'px');
	return popover;
}

function tour(exit) {
	// console.log('Tour called');
	if ( exit == true ) {
		$('[hoblee-tour-popover]').hide();
		return false;
	}
	if ( tourObject == false ) {
		$.get('/users/tour', function(data){
			// console.log('Tour received: '+data);
			tourObject = jQuery.parseJSON(data);
			tour();
		});
	} else {
		if ( tourIndex == tourObject.length ) {
			tour(true);
			return false;
		}
		$('[hoblee-tour-popover]').hide();
		// console.log('Calling');
		var tourStep = tourObject[tourIndex];
		var target = $('[hoblee-tour="'+tourStep.selector+'"]');
		var content = tourStep.message+tourNextButton;
		if ( tourIndex+1 == tourObject.length ) {
			content = tourStep.message+tourEndButton;
		}
		var popover = generatePopover(target, tourStep.title, content);
		popover.show();
		tourIndex++;
	}
}

function discardNotifications() {
	// console.log('[Hoblee] NOTIF: Sending request to mark notifications as read.');
	$.post('/users/markNotificationsAsRead',function(data){
		notificationsDiscarded = true;
		// console.log('[Hoblee] NOTIF: Response received: '+data);

		$('div.item div.people-notifications').html('*');
	});
}

function generateAfterfavTag(tag){
	return '<div contenteditable="false" class="item"><div class="label">'+tag+'</div><input type="hidden" name="data[Favorite][tags][]" value="'+tag+'"></div>';
}

function setEndOfContenteditable(contentEditableElement)
{
    var range,selection;
    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
    else if(document.selection)//IE 8 and lower
    {
        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        range.select();//Select the range (make it the visible selection
    }
}

var scrollIfNotEnoughContent = function(){
	if($(window).height()+200 >= $("[hoblee-posts-container]").height()){
		// console.log('Window height is bigger than document height. Scrollin.');
		infiniteScroll();
	} else if($(window).scrollTop() + $(window).height() > $(document).height() - 500) {
		if ( $("[hoblee-posts-container]").length > 0 && nowScrolling == false && hitBottom == false ) {
			infiniteScroll();
		}
	}
};

function infiniteScroll(){
	if ( nowScrolling == false && alternateContent == false ) {
		// console.log('Scrolling triggered');
		nowScrolling = true;
		$("#loader").fadeIn();
		var filters = filterData;
		var postsContainer = $("[hoblee-posts-container]");
		//alert('scrollin ');
		var page = parseInt(postsContainer.attr('hoblee-posts-page'));
		if ( page == 0  ) {
			postsContainer.empty();
			itemArray = [];
		}
		page = page+1;
		postsContainer.attr('hoblee-posts-page',page);

		locationUri = location.href.substring(0, location.href.indexOf('?'));
		if(locationUri == '') {
			locationUri = location.href;
		}
		var requestURI = locationUri+'/'+page;
		if ( isHomeFeed == true ) {
			requestURI = locationUri+'/0/'+page;		// Si es feed Home, colocar fav id 0, para que no cargue nada raro
		}
		if ( filterData != false ) {
			requestURI = '/favorites/filter/'+page;
		}
		if ( customFeed != false ) {
			requestURI = '/favorites/custom_feed/'+customFeed+'/'+page;
			filters = false;
		}
		// console.log(requestURI);
		$.get(requestURI, filterData, function(data) {
			//console.log(data);
			$("#loader").fadeOut();
			$(".ajax-container").html(data);
			if ( $(".ajax-container [hoblee-post-item]").length == 0 ) {
				hitBottom = true;
			} else {
				//$(".ajax-container [hoblee-post-item]").shuffle();
				var newposts = $(".ajax-container [hoblee-post-item]");
				postsContainer.append(newposts);
				doSearchFiltering(true);
				doFiltering(false,true);
				renderBlocks();	//Calling bock :')
				jQuery("abbr.timeago").timeago();

				bindPosts();

				//setTimeout(scrollIfNotEnoughContent, 1000);
			}
			nowScrolling = false;
			$(".ajax-container").empty();
		});
	} else {
		// console.log('Sorry, my nigga. Were already scrollin.');
	}

}

function lockScroll(lock) {
	if ( lock == true ) {
		var scrollPosition = [
			self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
			self.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
		];
		var html = jQuery('html'); // it would make more sense to apply this to body, but IE7 won't have that
		html.data('scroll-position', scrollPosition);
		html.data('previous-overflow', html.css('overflow'));
		html.css('overflow', 'hidden');
		window.scrollTo(scrollPosition[0], scrollPosition[1]);
	} else if ( lock == false) {
		var html = jQuery('html');
		var scrollPosition = html.data('scroll-position');
		html.css('overflow', html.data('previous-overflow'));
		window.scrollTo(scrollPosition[0], scrollPosition[1]);
	}
}

function bindPosts() {

	$('[hoblee-post-binded="false"] .carousel[hoblee-carousel-active="false"]').each(function(){
		var carousel = $(this);
		carousel.attr('hoblee-carousel-active','true');
		carousel.carousel({
			interval: 3000
		});
		carousel.on('slid', function(){
			var index = carousel.find('.item.active').index();
			carousel.find('.bullet').removeClass('active');
			carousel.find('.bullet[data-target="'+index+'"]').addClass('active');
		});
		carousel.find('.bullet').each(function(){
			var target = parseInt($(this).attr('data-target'));
			$(this).click(function(){
				carousel.carousel(target);
			});
		});
	});

	$('[hoblee-post-binded="false"] [hoblee-fav-toggle]').click(function(){
		var id = $(this).attr('hoblee-id');
		toggleFav(id);
	});

	/* Lightbox */
	$('[hoblee-post-item][hoblee-post-binded="false"] > .item > .content').click(function(event){	// Abrir Lightbox al clickear elemento.
		if ( !$(event.target).is('a') ) {
			var id = $(this).closest('[hoblee-post-item]').attr('hoblee-id');
			if ( nowLoadingLightbox == false ) {
				lightbox(id);
			}
		}
	});

	$('[hoblee-post-binded="false"]').attr('hoblee-post-binded', 'true');

}

function showCaptioner(id, fav_id, type, lightbox) {
	var captioner = $("#captioner");
	captioner.removeClass('lightbox');
	if ( lightbox == true ) {
		captioner.addClass('lightbox');
	}
	captioner.keyup(function(event){
		if ( event.which == 13 ) {
			event.preventDefault();
			postCaption();
		}
	});
	captioner.keypress(function(e){
		if ( e.which == 13 ) {
			e.preventDefault();
		}
	});
	var offset = false;
	var top = 0;
	var left = 0;
	if ( $('[hoblee-post-item][hoblee-id="'+id+'"] [hoblee-fav-toggle]').length > 0 ) {
		var offset = $('[hoblee-post-item][hoblee-id="'+id+'"] [hoblee-fav-toggle]').offset();
		var top = offset.top-120;
		var left = offset.left-265;
	} 
	if ( lightbox == true ) {
		offset = $('[hoblee-post-lightbox] [hoblee-fav-toggle]').offset();
		top = offset.top+80;
		left = offset.left-260;
	}
	captioner.hide();
	// console.log(offset);
	captioner.css('top', top+'px').css('left', left+'px');
	captioner.attr('hoblee-id', fav_id);
	captioner.attr('hoblee-type', type);
	captioner.find('textarea').val('').focus();
	captioner.show();
	captioner.find('[hoblee-privacy]').attr('hoblee-privacy', '0');
	captioner.find('[hoblee-share-twitter]').attr('hoblee-share-twitter', '0');
}

function hideCaptioner() {
	$("#captioner").fadeOut();
}

function postCaption() {
	var captioner = $("#captioner");
	var id = captioner.attr('hoblee-id');
	var caption = captioner.find('textarea').val();
	var type = captioner.attr('hoblee-type');
	var twitter_share = false;
	$(".toggle.post").addClass('working');
	if ( $("[hoblee-share-twitter]").attr('hoblee-share-twitter') == "1" ) {
		twitter_share = true;
	}
	$.post('/favorites/comment_tag', {"data[Favorite][id]": id, "data[Favorite][description]": caption, type: type, twitter: twitter_share}, function(data){
		captioner.hide();
		$(".toggle.post").removeClass('working');
		// console.log('captioner: '+data);
	});
}

function postComment(){
	if ( postingComment == false ) {
		$("[hoblee-comment-form]").addClass('working');
		var comment = $("[hoblee-comment-form] input").val();
		var id = $("[hoblee-comment-form]").attr('hoblee-id');
		var item_id = $("[hoblee-comment-form]").attr('hoblee-item-id');
		// console.log(comment);
		// console.log(id);
		// console.log(item_id);
		postingComment = true;
		$.ajax({
			url: '/favorites/comment',
			dataType: 'json',
			type: 'post',
			data: {comment: comment, fav_id: id, item_id: item_id},
			success: function(data) {
				// console.log(data);
				postingComment = false;
				$("[hoblee-comment-form]").removeClass('working');
				if(data == true) {
					$(".no-comment").remove();
					$("[hoblee-sample-comment] .comment").text(comment);
					// $("#fav-comments").append($("#fav-comment-user"));
					$("[hoblee-sample-comment]").clone().removeAttr('hoblee-sample-comment').appendTo('[hoblee-comments-container]').fadeIn();
					$("[hoblee-comment-form] input").val('');
				}
			}
		});
	}
}

function toggleFav(id, lightbox) {
	if ( togglingFav[id] == true ) {
		// console.log('Already in faving process.');
	} else {
		togglingFav[id] = true;
		$.ajax({
			url: '/favorites/add',
			dataType: 'json',
			type: 'post',
			context: $(this),
			data: {id: id},
			success: function(data) {
				togglingFav[id] = false;
				if(data.action == "faved") {
					var type = $('[hoblee-fav-toggle][hoblee-id="'+id+'"]').closest('[hoblee-type]').attr('hoblee-type');
					// console.log(type);
					$('[hoblee-fav-toggle][hoblee-id="'+id+'"], [hoblee-post-item][hoblee-id="'+id+'"] .infobar').addClass('active');
					$('[hoblee-post-lightbox] [hoblee-id="'+id+'"] [hoblee-fav-toggle]').addClass('active');
					if ( isUsersFeed == true ) {
						$('[hoblee-post-item][hoblee-id="'+id+'"]').css('opacity', '1');
					}
					if ( lightbox == true ) {
						var n = parseInt($('[hoblee-post-lightbox] [hoblee-id="'+id+'"] .numeric').text());
						n = n+1;
						$('[hoblee-post-lightbox] [hoblee-id="'+id+'"] .numeric').text(n);
						showCaptioner(id, data.id, type, true);
					} else {
						showCaptioner(id, data.id, type);
					}
				} else if (data.action == "unfaved") {
					$('[hoblee-fav-toggle][hoblee-id="'+id+'"], [hoblee-post-item][hoblee-id="'+id+'"] .infobar').removeClass('active');
					$('[hoblee-post-lightbox] [hoblee-id="'+id+'"] [hoblee-fav-toggle]').removeClass('active');
					if ( isUsersFeed == true ) {
						$('[hoblee-post-item][hoblee-id="'+id+'"]').css('opacity', '.5');
					}
					if ( lightbox == true ) {
						var n = parseInt($('[hoblee-post-lightbox] [hoblee-id="'+id+'"] .numeric').text());
						n = n-1;
						$('[hoblee-post-lightbox] [hoblee-id="'+id+'"] .numeric').text(n);
					}
					hideCaptioner();
				}
			}
		});
	}
}

function lightbox(open) {
	if ( open != false ) {
		nowLoadingLightbox = true;
		$.post("/favorites/get_favorite", {id: open}, function(response){		// Retrieve HTML modal contents
			$("[hoblee-lightbox]").show();
			$("[hoblee-post-lightbox]").html(response);								// Build contents into modal
			jQuery("abbr.timeago").timeago();
			var h = $('#lightbox .lightbox_container .sidebar .data').height();
			$("#lightbox .lightbox_container .sidebar").css('padding-top', h+'px');
			lockScroll(true);												// Lock scrolling
			history.pushState('lightbox','','/f/'+open);
			nowLoadingLightbox = false;
			$('[hoblee-post-lightbox] [hoblee-fav-toggle]').click(function(){
				var id = $('[hoblee-post-lightbox] [hoblee-id]').attr('hoblee-id');
				toggleFav(id, true);
			});
		}, 'html');
	} else if ( open == false ) {
		$("[hoblee-lightbox]").hide();
		$('[hoblee-post-lightbox] .content_container .content').html('');
		hideCaptioner();
		lockScroll(false);												// Unlock scrolling
		history.back();
	}
}

function doSearchFiltering(avoidMasonry) {
	var query = $("#thisfeed-search").val();

	if (jQuery.trim(query) == ''){
		$("body > .container > .posts > .item").show().attr('hoblee-search-hidden','false');
	} else {
		$("body > .container > .posts > .item").hide().attr('hoblee-search-hidden','true');
		$("body > .container > .posts > .item:Contains("+query+")").show().attr('hoblee-search-hidden','false');
	}

	//if ( avoidMasonry != true ) {
		//$('body > .container > .posts').masonry('reload');
	//}

	//setTimeout(scrollIfNotEnoughContent, 1000);

}

function doFiltering(kill,avoidMasonry) {
	if ( kill == true ) {
		$(".hoblee-filter").attr('hoblee-filter-status','off');
		doFiltering();
	} else {
		var filters = $('[hoblee-filter-status="on"]');
		var container = $('body > .container > .posts');
		if ( filters.length > 0 ) {
			container.find('.item[hoblee-origin][hoblee-search-hidden="false"]').hide();
			filters.each(function(){
				var criteria = $(this).attr('hoblee-filter-criteria');
				var target = $(this).attr('hoblee-filter-target');
				container.find('.item[hoblee-search-hidden="false"][hoblee-'+criteria+'="'+target+'"]').show();
			});
		} else {
			container.find('.item[hoblee-origin][hoblee-search-hidden="false"]').show();
		}

		//if ( avoidMasonry != true ) {
			//container.masonry('reload');
		//}

		//setTimeout(scrollIfNotEnoughContent, 1000);

	}
}

function doFavorite(){

}

function confirmDeletion(target) {
	$("#hoblee-prompt").show();
	$("#hoblee-prompt").find('.btn-primary').click(function(){
		target.removeClass('active').click();
		$("#hoblee-prompt").hide();
		$(this).unbind();
		//lightbox(true);
	});
	$("#hoblee-prompt").find('.btn:not(.btn-primary)').click(function(){
		$("#hoblee-prompt").hide();
	});
}

function releaseAvatarCoordinates(){
	var iW = $(".cropbox").attr('hoblee-cropper-w');
	var iH = $(".cropbox").attr('hoblee-cropper-h');
	$('[name="coords[\'x\']"]').val('0');
	$('[name="coords[\'y\']"]').val('0');
	$('[name="coords[\'w\']"]').val(iW);
	$('[name="coords[\'h\']"]').val(iH);
}

function setAvatarCoordinates(c) {
	// console.log('setting coordinates for avatar cropping.');
	var cW = $(".jcrop-holder").width();
	var cH = $(".jcrop-holder").height();
	var iW = $(".cropbox").attr('hoblee-cropper-w');
	var iH = $(".cropbox").attr('hoblee-cropper-h');
	var x2 = (c.x*iW)/cW;
	var y2 = (c.y*iH)/cH;
	var w2 = (c.w*iW)/cW;
	var h2 = (c.h*iH)/cH;
	$('[name="coords[\'x\']"]').val(parseInt(x2));
	$('[name="coords[\'y\']"]').val(parseInt(y2));
	$('[name="coords[\'w\']"]').val(parseInt(w2));
	$('[name="coords[\'h\']"]').val(parseInt(h2));
	// console.log(parseInt(x2)+', '+parseInt(y2)+', '+parseInt(w2)+', '+parseInt(h2));
}

function disableAvatarCropper(){
	var control = $("#profile-image");
	control.replaceWith(control.val('').clone(true));
	jcrop_api.destroy();
	$("#profile-image-crop").replaceWith('<img id="profile-image-crop">');
	$('.form-picture').find('.upload').show();
	$('.form-picture').find('.cropper').hide();
}

function enableAvatarCropper(){
	var files = $("#profile-image").prop('files');
	if ( files.length > 0 ) {
		var image = files[0];
		var imageType = /image.*/;
		if ( !image.type.match(imageType) ) {
			alert('Please select an IMAGE, man.');
		} else {
			var freader = new FileReader();
			freader.onload = function(e){
				var imageURL = e.target.result;
				$('<img class="measurement-img" src="'+imageURL+'">').appendTo('body');
				$(".measurement-img")[0].onload = function(){
					var width = $(".measurement-img").width();
					var height = $(".measurement-img").height();
					$(".measurement-img").remove();
					$(".cropbox").attr('hoblee-cropper-w', width);
					$(".cropbox").attr('hoblee-cropper-h', height);
					$('.form-picture').find('.upload').hide();
					$('.form-picture').find('.cropper').show();
					$("#profile-image-crop")[0].onload = function() {
						$("#profile-image-crop").Jcrop({
							onSelect: setAvatarCoordinates,
							onRelease: releaseAvatarCoordinates,
							setSelect: [0, 0, 100, 100],
							aspectRatio: 1,
							boxWidth: 272,
							boxHeight: 272
						},function(){
							jcrop_api = this;
						});
						$(".cropbox").popover('show');
					};
					$("#profile-image-crop").attr('src',imageURL);
				};
			};
			freader.readAsDataURL(image);
		}
	}
}

$(document).ready(function() {

	$(document).mouseup(function (e){
		var container = $("[h-dropdown]:not(.ignore)");
		if (container.has(e.target).length === 0) { container.find(".h-dropdown").removeClass('active'); }
		var container = $("#filters");
		if (container.has(e.target).length === 0 && $(e.target).is('[class*=select2]') == false && $(e.target).is("#filters") == false) { $("html").removeClass('filters'); }
	});

	$(".cropbox").popover({
		title: 'Crop your picture',
		content: 'Drag the box and its corners to select the area you want to use as your profile picture.',
		trigger: 'manual'
	});

	$('#welcomeModal').modal();
	$(".cropper").hide();

	if ( $("[hoblee-posts-container] [hoblee-post-item]").length == 0 ) {
		$("#loader").fadeOut();
		hitBottom = true;
	}

	if($(window).height() >= $(document).height()){
		infiniteScroll();
	}

	jQuery("abbr.timeago").timeago();

	//$('[hoblee-posts-container] [hoblee-post-item]').shuffle();

	var $container = $("[hoblee-posts-container]");	//Ordenar automáticamente con Masonry.
	//$container.imagesLoaded(function(){
	  /*$container.masonry({
		itemSelector : '.item[hoblee-origin]:visible',
		columnWidth : 200,
		isAnimated: true
	  });*/
	//});

	$("[hoblee-lightbox]").click(function(e){	//Cerrar Lightbox al clickear fuera.
		if(e.target != this) { return; }
		lightbox(false);
	});

	$('[hoblee-post-lightbox] [hoblee-fav-toggle]').click(function(){
		var id = $('[hoblee-post-lightbox] [hoblee-id]').attr('hoblee-id');
		toggleFav(id, true);
	});

	//Toggle de Filtros.
	$(".hoblee-filter").click(function(){
		var status = $(this).attr('hoblee-filter-status');
		if ( status == "off" ) { status = "on"; } else {status = "off";}
		$(this).attr('hoblee-filter-status', status);
		doFiltering();
	});


	$(".icony img").click(function(){ $(this).toggleClass('active'); }); //PROTOTIPICO: Toggle de Filtros.

	$("[tooltip]").each(function(){	// Generación de Tooltips
		var title = $(this).attr('tooltip');
		var pos = "top";
		var trig = "hover";
		if ( typeof $(this).attr('tooltip-pos') != "undefined" ) { pos = $(this).attr('tooltip-pos'); }
		if ( typeof $(this).attr('tooltip-trig') != "undefined" ) { pos = $(this).attr('tooltip-trig'); }
		$(this).tooltip({placement: pos, title: title, trigger: trig});
	});



	$(document).keyup(function(e) {
		if (e.keyCode == 27) { 
			if ( $('#favedby').is(':visible') == true ) {
				$('#favedby').hide();
			} else {
				lightbox(false);
			}	
		}
	});


	/* Desplegado de Menús */
	$(".filter-act").click(function(){	//Filter Menu
		$("body").toggleClass('filtering');
		$(".filter-act").toggleClass('active');
		$(".filterbar").slideToggle(200);
	});


	$(".headbar .nav .item.notifications").click(function(e){	//User menu
		if ( $(this).is('.active') == false ) {
			$(".pull-right .headbar .nav .item").removeClass('active');
			$(".headbar .nav .menu").hide();
		}
		$(this).toggleClass('active');
		$(".usermenu-notifications").toggle();
	});



	/* WIP */
	$(".service").click(function(){
		if ($(this).is(".active") ) {
			$(this).toggleClass('active');
			$(this).find('input').val('null');
		} else {
			var service = $(this).find(".name").text();
			$(location).attr('href','/sites/connect/' + service);
		}
	});

	$("#coming-soon-form").validate({
		onkeyup: false,
		rules: {
			'data[Follower][email]': {
				required: true,
				email: true
			}
		},
		messages: {
			'data[Follower][email]': "Please enter a valid email address.",
		},
		submitHandler: function(form) {
			form.submit();
		}
	});


	/* Register Form */

	$("#signup-form, #UserRegisterForm").validate({
		onkeyup: false,
		rules: {
			'data[User][name]': "required",
			'data[User][username]': {
				required: true,
				minlength: 4,
				remote: {
					url: "/users/userExists",
					type: "post",
					data: {
						action: function () {
							return "checkusername";
						},
						username: function() {
							var username = $("#input-username").val();
							return username;
						}
					}
				}
			},
			'data[User][email]': {
				required: true,
				email: true
			},
			'data[User][password]': {
				required: true,
				minlength: 5
			},
			'data[User][password_control]': {
				required: true,
				minlength: 5,
				equalTo: "#input-password"
			},
			'data[User][born][year]': {
				required: true,
				min: 1912
			}
		},
		messages: {
			'data[User][name]': "Please enter your full name.",
			'data[User][password_control]': "The passwords do not match.",
			'data[User][password]': {
				required: "Please enter your password.",
				minlength: "Your password must be at least 5 characters long."
			},
			'data[User][username]': {
				required: "Please enter your username.",
				minlength: "Your username must be at least 4 characters long.",
				remote: "This username is already in use. Try another one."
			},
			'data[User][email]': "Please enter a valid email address.",
			'data[User][born][year]': "I'm having a hard time believing that! ;)"
		},
		submitHandler: function(form) {
			form.submit();
		},
		highlight: function(element) {
			$(element).parents('.control-group').addClass('error');
		},
		unhighlight: function(element) {
			$(element).parents('.control-group').removeClass('error');
		}
	});

	$("form.signup input").tooltip({placement: 'right', trigger: 'focus'});

	$("[hoblee-follow]").click(function(){
		$(this).addClass('working');
		$.ajax({
			url: '/users/follow',
			dataType: 'json',
			type: 'post',
			context: $(this),
			data: {id:$(this).attr('hoblee-user-id')},
			success: function(data) {
				$("[hoblee-follow]").removeClass('working');
				var currentValue = parseInt($("#follower_count").text(),10);
				if(data.action == 'followed') {
					currentValue = currentValue + 1;
					$("#follower_count").text(currentValue);
					$(this).addClass('active');
				} else {
					currentValue = currentValue - 1;
					$("#follower_count").text(currentValue);
					$(this).removeClass('active');
				}
			}
		});
	});

	$(".signup-follow").click(function(event){
		event.preventDefault();
		$(this).attr('disabled','disabled');
		$.ajax({
			url: '/users/follow',
			dataType: 'json',
			type: 'post',
			context: $(this),
			data: {id:$(this).attr('hoblee-user-id')},
			success: function(data) {
				if(data.action == 'followed') {
					$(this).addClass('active');
					$(this).unbind('click');
				}
			}
		});
	});

	$(".profile-tab-switch").click(function(){
		var target = $(this).attr('tab-target');
		$(".profile-tab-switch.active").removeClass('active');
		$(this).addClass('active');
		$(".profile-tab-active").removeClass('profile-tab-active');
		$(".profile-tab-"+target).addClass('profile-tab-active');
	});

	$("[hoblee-toggle]").click(function() {
		var target = $(this).attr('hoblee-toggle');
		$(target).toggle();
		var group = $(this).attr('hoblee-toggle-group');
		if ( typeof group != 'undefined' ) {
			$('[hoblee-toggle-group="'+group+'"]').each(function() {
				var thisTarget = $(this).attr('hoblee-toggle');
				if ( $(thisTarget).is(target) == false ) {
					$(thisTarget).hide();
				}
			});
		}

		if ( target == ".notifications-menu" && $(target).is(':visible') == true && notificationsDiscarded == false ) {
			discardNotifications();
		}


		if ( target == ".filterbar" && $(target).is(':visible') == false ) {
			$("body").removeClass('filtering');
		} else if ( target == ".filterbar" && $(target).is(':visible') == true ) {
			$("body").addClass('filtering');
		}
	});


	$("[hoblee-comment-form] input").live('keyup', function(e){
		if ( e.which == 13 && jQuery.trim($(this).val()) != "" ) {
			postComment();
		}
	});

	$("[hoblee-comment-form-do]").live('click', function(){
		if ( jQuery.trim($(this).parent().find('input').val()) != "" ) {
			postComment();
		}
	});


	$("#thisfeed-search").keyup(function(){
		doSearchFiltering();
	});

	$(window).scroll(function() {
		if($(window).scrollTop() + $(window).height() > $(document).height() - 500) {
			if ( $("[hoblee-posts-container]").length > 0 && nowScrolling == false && hitBottom == false ) {
				infiniteScroll();
			}
		}
	});


	$("[hoblee-privacy]").live('click',function(){
		var btn = $(this);
		var privacy = btn.attr('hoblee-privacy');
		var id = btn.closest('[hoblee-id]').attr('hoblee-id');
		if ( privacy == '0' ) {
			btn.addClass('working');
			$.get('/favorites/privateset/'+id+'/1', function(d){
				btn.removeClass('working');
				btn.attr('hoblee-privacy', '1');
				// console.log(d);
			});
		} else {
			btn.addClass('working');
			$.get('/favorites/privateset/'+id+'/0', function(d){
				btn.removeClass('working');
				btn.attr('hoblee-privacy', '0');
				// console.log(d);
			});
		}
	});

	$("[hoblee-share-twitter]").click(function(){
		var btn = $(this);
		var twitter_share = btn.attr('hoblee-share-twitter');
		if ( twitter_share == '0' ) {
			btn.attr('hoblee-share-twitter', '1');
		} else {
			btn.attr('hoblee-share-twitter', '0');
		}
	});

	/* Edit password validation*/
	jQuery.validator.addMethod("notEqual", function(value, element, param) {
		return this.optional(element) || value != $(param).val();
	}, "This has to be different...");
	$("#password-form").validate({
		onkeyup: false,
		rules: {
			'data[User][current_password]': {
				required: true,
				minlength: 4
			},
			'data[User][password]': {
				required: true,
				minlength: 5,
				notEqual:'#input-current-password'
			},
			'data[User][password_control]': {
				required: true,
				minlength: 5,
				equalTo: "#input-password"
			}
		},
		messages: {
			'data[User][password_control]': "The passwords do not match.",
			'data[User][password]': {
				required: "Please enter your password.",
				minlength: "Your password must be at least 5 characters long.",
				notEqual: "Yor password has to be different to your previous one."
			},
			'data[User][current_password]': {
				required: "Please enter your current password.",
				minlength: "Your password must be at least 5 characters long."
			}
		},
		submitHandler: function(form) {
			form.submit();
		},
		highlight: function(element) {
			$(element).parents('.control-group').addClass('error');
		},
		unhighlight: function(element) {
			$(element).parents('.control-group').removeClass('error');
		}
	});



	bindPosts();	// Set up all post-related DOM event bindings.
});