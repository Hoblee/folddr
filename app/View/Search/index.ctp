<? if(!empty($data)): ?>
	<div hoblee-feed-scope="follow" hoblee-feed-id="follow" hoblee-posts-container hoblee-posts-page="1" id="elements">
		<? foreach($data as $d): ?>
			<? if(empty($d['type'])) { /*pr($d);die;*/ } ?>
			<?php echo $this->element('element' , array('d' => $d)); ?>
		<? endforeach;?>
	</div>
<? endif; ?>