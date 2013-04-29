<? $images = json_decode($d['img_url'], true); ?>
<? if ( count($images) == 1 ) { ?>
<div class="content" style="background-image:url(<?=$images[0]['url']?>);"></div>
<? } else { ?>
<div hoblee-carousel-active="false" class="content carousel slide">
	<div class="carousel-inner">
		<? foreach ( $images as $image ) { ?>
			<div class="item" style="background-image:url(<?=$image['url'];?>)"></div>
		<? } ?>
	</div>
	<div class="carousel-navigation">
		<? $count=0; foreach ( $images as $image ) { ?>
			<div class="bullet" data-target="<?=$count;?>"></div>
		<? $count++; } ?>
	</div>
</div>
<? } ?>