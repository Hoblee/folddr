//jQuery Bock by René Morales
//Grids and more grids
//Inspired by Masonry

var container = 1200;
var mobile = false;

if ( $("#mobilecheck").is(':visible') == true ) {
	mobile = true;
	//alert('Mobile.');
}

var gutter = 10;
var column = 6;
var selector = $("#elements");
var itemSelector = ".block";
var itemW = selector.width()/column;
var itemH = 115;

var itemArray = [];

function insertRows(n) {
	var n = n; if ( typeof n === 'undefined' ) { n = 10; }
	for (var i = 0; i < n; i++) {
		var ar = [];
		for (var c = 0; c < column; c++) {
			ar.push(0);
		}
		itemArray.push(ar);
	};
}

//XX, XY = eXplorer Axis, iterator's zero-based index position on array.
// X, Y  = Readable position.

function drawDebug(w,h,x,y){
	var xpx = x*itemW;
	var ypx = y*itemH;
	var wpx = w*itemW;
	var hpx = h*itemH; //Assuming square blocks.
	var html = '<div class="block" style="padding: '+gutter+'px; width: '+wpx+'px; height: '+hpx+'px; top:'+ypx+'px; left:'+xpx+'px;"></div>';
	selector.append(html);
	otherBlocks(w, h, x, y, true);
}

function adaptMobile() {
	selector.find(itemSelector+':not([bock-placed="true"])').each(function(){
		var type = $(this).attr('hoblee-type');
		$(this).attr('bock-w', '1');
		if ( type == 'image' ) {	// Calculates original block aspect ratio; renders it on small view.
			var w = parseInt($(this).attr('bock-w'));
			var h = parseInt($(this).attr('bock-h'));
			var nh = h/w;
			nh = nh*100;
			$(this).css('height', nh+'px');
		} else if ( type == 'audio' ) {
			$(this).css('height', '280px');
		} else if ( type == 'video' ) {
			$(this).css('height', '240px');
		}
		$(this).attr('bock-placed', 'true')
	});
}

function renderBlocks() {
	if ( mobile == false ) {
		//This function finds block elements in the DOM to further process them and place them in the grid.
		selector.find(itemSelector+':not([bock-placed="true"])').each(function(){
			var w = $(this).attr('bock-w');
			var h = $(this).attr('bock-h');
			insertBlock($(this), parseInt(w), parseInt(h));
		});
	} else {
		adaptMobile();
	}
}

function styleBlock(e, w, h, x, y){
	var xpx = x*itemW;
	var ypx = y*itemH;
	var wpx = w*itemW;
	var hpx = h*itemH;
	e.attr('bock-placed', 'true').css('padding', gutter+'px').css('width', wpx+'px').css('height', hpx+'px').css('left', xpx+'px').css('top', ypx+'px');
	otherBlocks(w, h, x, y, true);
}

function otherBlocks(w, h, x, y, fill) {
	// This function loops through the blocks that belong in the specified quadrangle.
	// If fill is set to true, will set blocks to 1 (which means they're being used). It should be called with fill=true after drawing.
	// Else, it will look through each hole and return true if all blocks are empty or false if one or more are already in use.
	
	var pht = y+h;
	var pwt = x+w;

	if ( pht > itemArray.length ) {
		insertRows(h);
	}

	for ( var ph = y; ph < pht; ph++ ) {
		for ( var pw = x; pw < pwt; pw++ ) {
			if ( fill == true ) {
				itemArray[ph][pw] = 1;
				//console.log('Filling block: '+pw+', '+ph);
			} else {
				//console.log('Testing: '+pw+', '+ph+' -- result: '+itemArray[ph][pw]);
				if ( itemArray[ph][pw] == 1 ) {
					return false;
				}
			}
		}
	}
	return true;
}

function insertBlock(e, w, h) {
	//This function automatically determines where should a block be placed given a certain width and height.
	//Returns placing coordenates if successful, returns false in case of failure (i.e, not enough space left).

	if ( itemArray.length+h > itemArray.length ) {
		insertRows(h);
	}

	var w = w; var h = h; if ( typeof w === 'undefined' ) { w = 2; } if ( typeof h === 'undefined' ) { h = 2; }
	theloop:
	for (var i = 0; i < itemArray.length; i++) {
		var xy = i;
		for (var xx = 0; xx < column; xx++) {
			if ( itemArray[xy][xx] == 0 ) {
				//Check if item fits.
				if ( w > column ) {		//Basic size-checking. If block width is bigger than the amount of columns, it'll never fit.
					//console.log('Skipping, will never fit. There are '+column+' cols, item size is '+w+'x'+h);
					break theloop;
					return false;
				} else {
					//Using horizontal position see if fits to right.
					//sl = space left
					var sl = column-xx;
					//console.log('Horizontal space left to right: '+sl);
					if ( sl >= w ) { 
						console.log('Could fit in here. Check rest of blocks now.');
						if ( otherBlocks(w, h, xx, xy) == true ) {
							styleBlock(e, w, h, xx, xy);
							break theloop;
							return true;
						}							
					}
				}

			} else {
				//console.log('Filled up. Go on.');
			}
		};
	};
}


renderBlocks();