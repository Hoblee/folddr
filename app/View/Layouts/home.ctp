<?$flash = $this->Session->flash();?>
<!DOCTYPE html>
<html>
	<head>
		<title>Hoblee</title>
		<meta property="og:url" content="http://www.hoblee.com/" />
		<meta property="og:title" content="Hoblee - Share Your Favs" />
		<meta property="og:description" content="Hoblee is the place where you can share and organize your favorite things." />
		<meta property="og:image" content="http://www.hoblee.com/img/comingsoon/preview_logo.png" />
		<meta property='og:site_name' content='Hoblee' />

		<meta name="title" content="Hoblee - Share Your Favs" />
		<meta name="description" content="Hoblee is the place where you can share and organize your favorite things." />

		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

		<link rel="img_src" type="image/png"  href="http://www.hoblee.com/img/comingsoon/preview_logo.png" />
		<link rel="stylesheet" href="/css/font-awesome.min.css">
		<link rel="stylesheet" href="/css/comingsoon/style2.css">
		
		<link href='http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,700italic,400,300,700,800' rel='stylesheet' type='text/css'>

		<!-- <link href="/css/comingsoon2/style.css" rel="stylesheet" /> -->
		<?
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
		echo $this->Html->script("select2.min");
		// echo $this->Html->script("hoblee"); //
		?>
		<? echo $this->Html->script("analytics");?>
	</head>
	<body>
		<div id="mobile">
			<div class="w">
				<!-- <div class="logo"></div> -->
				<div class="text">Each minute, millions of things get favorited and liked.<br>And they get lost in time.<h4>Until now.</h4></div>
				<div class="signup">
					<?=$flash;?>
					<a href="javascript:askEmail();" class="signup"><span>Sign me up</span></a>
					<div class="login">or <a href="/login">login</a></div>
				</div>
			</div>
		</div>

		<div class="wrapper">
			<!-- <div id="head"></div> -->
			<div id="big-message">
				<div class="normal">Social search engine.</div>
				<div class="big">Folddr</div>
			</div>
			<form action="/search/" id="coming-soon-form" method="post" accept-charset="utf-8">
				<div class="container">

					<i class="icon-envelope-alt"></i>
					<input placeholder="" name="data[Search][term]" type="text">
					<div class="border"></div>
					<?=$flash;?>
					<input type="submit" value="Search">
				</div>
			</form>			
			<div id="footer">
				<div class="share">
					<span>Share!</span>
					<div class="social">
						<a class="facebook" href="http://facebook.com/JoinHoblee" target="_blank"></a>
						<a class="twitter" href="http://twitter.com/JoinHoblee" target="_blank"></a>
					</div>
				</div>

			</div>
		</div>
		<script type="text/javascript">
			function askEmail(){
				var email = prompt('');
				if ( email != null && jQuery.trim(email) != "" ) {
					$('[name="data[Follower][email]"]').val(email);
					document.forms[0].submit();
				} 
			}
		</script>	
	</body>
</html>