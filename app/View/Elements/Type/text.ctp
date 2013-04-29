<div class="content">
	<div class="article">
		<div class="image" style="background-image:url(<?=$d['Item']['thumb_url'];?>)">
			<? if ( trim($d['Item']['title']) != '' ) : ?>
				<div class="title"><?=$d['Item']['title'];?></div>
			<? endif; ?>
		</div>
		<div class="text">
			<?=$d['Item']['text'];?>
		</div>
	</div>
</div>