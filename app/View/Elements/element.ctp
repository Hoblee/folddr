<?php
	$sizes = array(
		'image' => array('2', '3'),
		'video' => array('2', '2'),
		'quote' => array('2', '2'),
		'text' => array('2', '3')
	);

	$chosen = strtolower($d['type']);

?>
<div class="block" 
	bock-w="<?=$sizes[$chosen][0]?>" 
	bock-h="<?=$sizes[$chosen][1]?>" 
	hoblee-post-item 
	hoblee-post-binded="false"
	hoblee-id="<?=$d['id']?>" 
	hoblee-origin="<?=$d['site_name']?>" 
	hoblee-type="<?=strtolower($d['type'])?>" 
	hoblee-search-hidden="false">
	<div class="item">
		<div class="source <?=$d['site_name']?>"></div>
		<?=$this->element('Type/'.strtolower($d['type']), array('d' => $d));?>
		<?//=$this->element('Feed/element_infobar', array('d' => $d));?>
	</div>
</div>