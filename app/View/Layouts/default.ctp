<!doctype html>

<!--[if lt IE 7 ]> <html class="ie ie6 no-js" lang="en"> <![endif]-->
<!--[if IE 7 ]>    <html class="ie ie7 no-js" lang="en"> <![endif]-->
<!--[if IE 8 ]>    <html class="ie ie8 no-js" lang="en"> <![endif]-->
<!--[if IE 9 ]>    <html class="ie ie9 no-js" lang="en"> <![endif]-->
<!--[if gt IE 9]><!--><html class="no-js" lang="en"><!--<![endif]-->

<head id="www-sitename-com" data-template-set="html5-reset">

	<?php echo $this->Html->charset(); ?>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

	<title><?php echo $title_for_layout; ?></title>

	<?php

		echo $this->Html->meta('favicon', '/favicon.ico?v4', array('type' => 'icon'));

		echo $this->Html->script("jquery-1.9.1.min");
		echo $this->Html->script("jquery.migrate");
		echo $this->Html->script("bootstrap.min");
		echo $this->Html->script("prefixfree.min");
		echo $this->Html->script("jquery.masonry.min");
		echo $this->Html->script("jquery.validate.min");
		echo $this->Html->script("jquery.Jcrop.min");
		echo $this->Html->script("jquery.timeago");
		echo $this->Html->script("jquery.scrollto.min");
		echo $this->Html->script("jquery.coloranimate");
		echo $this->Html->script("jquery.nicescroll.min");
		echo $this->Html->script("select2.min");
		echo $this->Html->script("hoblee"); //

		echo $this->Html->css("old"); //
		echo $this->Html->css("fonts"); //
		echo $this->Html->css("bootstrap");
		echo $this->Html->css("jquery.Jcrop.min");
		echo $this->Html->css("select2");

		echo $this->fetch('meta');
		echo $this->fetch('css');
		echo $this->fetch('script');
	?>

	<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

	<!-- CSS: screen, mobile & print are all in the same file -->
	<link rel="stylesheet" href="/css/entypo.css">
	<link rel="stylesheet" href="/css/font-awesome.min.css">
	<!--<link rel="stylesheet" href="/css/style.css">-->
	<link rel="stylesheet" href="/css/style.css">

	<link href='http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,700italic,400,300,700,800' rel='stylesheet' type='text/css'>

	<script src="/js/modernizr-1.7.min.js"></script>
	<script src="http://code.jquery.com/jquery-migrate-1.1.1.js"></script>
</head>

<body>

	<div id="mobilecheck"></div>

	<div id="mobile-headbar">
		<div onclick="mobileSearch();" class="pull-right mhb"><i class="icon-search"></i></div>
		<a href="/" class="go"></a>
		<div onclick="$('html').toggleClass('menuon');" class="pull-left mhb"><i class="icon-align-justify"></i></div>
	</div>

	<div class="mobile" id="menu">
		<a class="item" href="/home">
			<i class="icon-home"></i>
			Dashboard
		</a>
		<a class="item" href="/hotnow">
			<i class="icon-fire"></i>
			Discover
		</a>
		<div class="separator">About Hoblee</div>
		<a class="item" href="/about/tos">Terms of Service</a>
		<a class="item" href="/about/privacy">Privacy Policy</a>
		<a class="item" href="/logout">Logout</a>
	</div>

	<div id="favedby">
		<div class="head">
			<div onclick="$('#favedby').hide();" class="close"><i class="icon-remove"></i></div>
			<span>People who faved this item</span>
		</div>
		<div class="users">

		</div>
	</div>

	<div id="captioner">
		<i class="icon-caret-down icon-white"></i>
		<i class="icon-caret-up icon-white"></i>
		<textarea placeholder="Tell us in a few words why did you like this. You can add some #hashtags too."></textarea>
		<div onclick="postCaption();" class="toggle post">Post</div>
		<div class="toggle privacy" hoblee-privacy="0"><i class="icon-lock"></i><i class="icon-unlock"></i></div>
		<div class="toggle twitter-share" hoblee-share-twitter="0"><i class="icon-twitter"></i></div>
	</div>

	<div hoblee-lightbox id="lightbox">
		<div hoblee-post-lightbox class="lightbox_container">

		</div>
	</div>

	<div class="wrapper">

		<?php //echo $this->element('Navigation/header'); ?>


		<?=$this->Session->flash();?>
		<?php echo $this->fetch('content'); ?>

		<? if (true) { ?>
			<div class="ajax-container"></div>
			<div id="loader">
				<img src="/img/loader.gif">
				<div class="text"><?=__('Loading more items...');?></div>
			</div>
		<? } ?>

		</div>

	</div>

<!-- here comes the javascript -->


<!-- this is where we put our custom functions -->
<!--<script src="/js/functions.js"></script>
<script src="/js/bock.js"></script>-->
<script src="/js/functions.js"></script>
<script src="/js/bock.js"></script>

<?php echo $this->Html->script("analytics"); ?>

</body>
</html>