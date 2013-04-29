<?

$linker = $this->Helpers->load('Linker');
$newString = $linker->htmlEscapeAndLinkUrls($d['text']);

?>

<div class="content">
	<div class="quote">
		<div class="info"><? if ( $d['site_name'] == "twitter" ) {  ?>
			<div class="avatar" style="background-image:url(<?=str_replace("_normal","",$d['avatar']);?>)"></div>
			<? } ?>
			<div class="author">
				<div class="name"><?=$d['site_username'];?></div>
				<div class="username"><?=$d['site_username'];?></div>
			</div>
		</div>
		<div class="text"><?=$newString;?></div>	
	</div>
</div>