$(function(){
	// rem调节
	function setHtmlFontSize(initWidth){	
		adjust();	
		$(window).resize(function(){
			adjust();
		})

		function adjust(){
			var windowWidth = $(window).width();
			var fontSize = windowWidth > initWidth ? 100 : (100 * windowWidth) / initWidth;		
			$('html').css('font-size', fontSize + 'px');		
		}
	}
	setHtmlFontSize(1200);

	// 1. 轮播
	function bannerList(args){	
		var container = $(args.container);
		var listContainer = container.find('.banner-box');
		var list = listContainer.find('.banner-item');
		
		if( list.length < args.showNum) return;


		//1. 插入队首和队位图片
		listContainer.append(getOutHtml(0, args.showNum));
		listContainer.prepend(getOutHtml(list.length - args.showNum, list.length));
		list = listContainer.find('.banner-item');

		var width,   				//容器宽度,多加100避免换行
			iwidth,					//单个元素宽度，包括padding
			start_pos,			    //容器初始位置
			end_pos,				//容器结束位置
			reverse_end_pos,		//向左移时的初始位置
			now_pos,
			now_index;      		//当前活动按钮的下标

		var intervalId;   			//用于控制动画
		var btns = $('');
		if( args.isBtns ){		
			if(typeof args.btns != 'undefined') {		//当有自定义的按钮控制器时
				btns = $(args.btns);
			} else {
				var span = '';
				for( var i = 0; i < list.length - args.showNum * 2; i++) {
					span += '<span></span>';
				}
				container.append('<div class="btns">' + span + '</div>');
				btns = container.find('.btns span');
				
			}
			changeActive(now_index);	//初始化当前活动按钮

			btns.click(function(){
				if(!listContainer.is(':animated')){
					clearInterval(intervalId);
					now_pos = start_pos - now_index * iwidth;
					listContainer.css('margin-left', now_pos + 'px');
					var dis = btns.index(this) - now_index;
					doAnimate(dis);
					intervalId = setInterval( function(){
						doAnimate(1);     
					}, args.delay + args.speed)
				}
			})

		}
		
		itemWidthAdjust();   		//开始计算一系列参数

		// 响应式，
		if (args.isResponsive){
			$(window).resize(function(){
				itemWidthAdjust();
			})
		}


		//  鼠标移入时停止动画
		listContainer.hover(function(){
			
			clearInterval(intervalId);
		},function(){
			clearInterval(intervalId);
			intervalId = setInterval( function(){
				doAnimate(1);
			},args.delay + args.speed)
			
		})


		if( args.isNext ){
			container.find('.to-left').click(function(){
				if(!listContainer.is(':animated')){
					clearInterval(intervalId);
					doAnimate(-1)
					intervalId = setInterval( function(){
						doAnimate(1);     
					}, args.delay + args.speed)
				}
			});

			container.find('.to-right').click(function(){
				if(!listContainer.is(':animated')){
					clearInterval(intervalId);
					doAnimate(1)
					intervalId = setInterval( function(){
						doAnimate(1);     
					}, args.delay + args.speed)
				}
			});
		}


		if(args.isSwipe){
			touchEvent.swipeLeft(listContainer[0],function(){  
				if(!listContainer.is(':animated')){
					clearInterval(intervalId);
					doAnimate(1)
					intervalId = setInterval( function(){
						doAnimate(1);     
					}, args.delay + args.speed)
				}
			})

			touchEvent.swipeRight(listContainer[0],function(){
				if(!listContainer.is(':animated')){
					clearInterval(intervalId);
					doAnimate(-1)
					intervalId = setInterval( function(){
						doAnimate(1);     
					}, args.delay + args.speed)
				}			
			})
		}



		function itemWidthAdjust (){
			var windowWidth = $(window).width();

			var finallyShowNum = windowWidth < 768 && args.showNumInPhone? args.showNumInPhone : args.showNum;

			var containerWidth = container.width();    //最外层容器宽度
			
			var listPaddingRight = parseInt(list.css('padding-right'));

			iwidth = (containerWidth + listPaddingRight)  / finallyShowNum;  //根据获取的margin-right值动态设置容器宽度

			list.outerWidth(iwidth);

			//console.log('iwidth: ' + iwidth)
			
			width = iwidth * (list.length) + 100;   //容器宽度,多加100避免换行
			start_pos = - iwidth * finallyShowNum;					 //容器初始位置
			end_pos = - iwidth * (list.length - finallyShowNum);	//容器结束位置
			reverse_end_pos = - iwidth * (list.length - finallyShowNum * 2 ); //向左移到0时，恢复的初始位置
			now_pos = start_pos;
			now_index = 0;      							//当前活动按钮的下标
			changeActive(now_index);
			listContainer.css('width',width + 'px');
			listContainer.css('margin-left',start_pos + 'px');

			clearInterval(intervalId);					//先清除动画
			intervalId = setInterval( function(){
				doAnimate(1);
			},args.delay + args.speed)

		}

		function getOutHtml(start , end){
			var str = '';
			for ( var i = start; i < end; i++ ){
				str += list[i].outerHTML;
				
			}
			return str;
		}

		//传入动画方向，1为右，-1为左,distance表示一次移动的距离
		function doAnimate(direction){
			//console.log(end_pos)
			

			now_pos = now_pos - iwidth * direction;

			listContainer.animate({'margin-left': now_pos + 'px'}, args.speed,function(){
				var offsetError = 20;    //小数计算产生的误差会导致末端切换有问题
				if (now_pos - offsetError <= end_pos){
					listContainer.css('margin-left',start_pos + 'px');
					now_pos = start_pos;
				} else if (now_pos + offsetError >= 0){			
					listContainer.css('margin-left',reverse_end_pos + 'px');
					now_pos = reverse_end_pos;

				}
			})

			now_index = (now_index + direction + btns.length) % btns.length;

			changeActive(now_index);

			
			
		}

		function changeActive(index) {
			if(! args.isBtns) return;
			btns.removeClass('active');
			btns.eq(index).addClass('active');
		}

	}
	
	bannerList({
		container: '.pro-banner',    //最外层选择器
		// btns: '',	//自定义的切换按钮，否则自动添加
		showNum: 4,     //轮播显示个
		showNumInPhone: 3,	//在手机轮播的个数
		isBtns: false,
		isNext: false,
		isSwipe: true,
		isResponsive: true,
		speed: 300,
		delay: 3000
	})


	// 2. 切换显示
	function toggleShow (controller_select, items_select){
		var controller = $(controller_select);
		var items = $(items_select);
		var cur_index = 0;

		items.css('display','none');
		items.eq(0).css('display','inline-block');

		controller.eq(0).addClass('active');

		controller.mouseenter(function(){
			var click_index = controller.index(this);

			if(click_index === cur_index) return;

			controller.eq(cur_index).removeClass('active');
			$(this).addClass('active');

			
			items.eq(cur_index).fadeOut();
			items.eq(click_index).fadeIn();

			cur_index = click_index;
		})
	}

	

	// 3. 回到顶部

	function toTop (select){
		var to_top = $(select);
		to_top.css('display','none');
		$(window).scroll(function(){		
			if($(window).scrollTop() > 500 ){
				to_top.css('display','block');
			} else {
				to_top.css('display','none');
			}
		})

		to_top.click(function(){

			if(!$(window).is(':animated')){
				$('body,html').animate({scrollTop:0},500);
			}

		})
	}

	// 4. 淡入淡出轮播
	function banner (args){
		
		var container = $(args.container),
		list = $(args.list);

		list.css('display','none');
		list.eq(0).css('display','block');
		if (list.length <= 1) return;

		var now_index = 0;

		if (!args.noAuto) {


			var intervalId = setInterval(function () {
				doAnimate(getNextIndex());
			},args.delay + args.speed);
		}
		//  4.1. 鼠标移入时停止动画
		if (!args.noAuto) {

			container.hover(function(){			
				clearInterval(intervalId);
			},function(){
				clearInterval(intervalId);
				intervalId = setInterval( function(){
					doAnimate(getNextIndex());
				},args.delay + args.speed)

			})
		}

		// 4.2. 切换按钮
		//console.log(args.isBtns)
		if (args.isBtns) {
			var span = '';
			for( var i = 0; i < list.length; i++) {
				span += '<span></span>';
			}
			container.append('<div class="btns">' + span + '</div>');

			var btns = container.find('.btns span');
			changeActive(now_index);	//初始化当前活动按钮
			
			btns.mouseenter(function(){
				var click_index = btns.index(this);
				if (click_index != now_index ){
					clearInterval(intervalId);
					doAnimate(click_index);
					now_index = click_index;
					
					if (!args.noAuto) {

						intervalId = setInterval( function(){
							doAnimate(getNextIndex());
						},args.delay + args.speed)
					}
				}
			})
		}

		// 4.3. 左右切换按钮
		if (args.isNext) {
			container.find('.to-left').click(function(){
				//console.log(111)
				if( !list.eq(now_index).is(':animated') ){
					clearInterval(intervalId);
					var perv_index = getPrevIndex ();
					doAnimate(perv_index);
					now_index = perv_index;

					if (!args.noAuto) {

						intervalId = setInterval( function(){
							doAnimate(getNextIndex());
						},args.delay + args.speed)
					}
				}
				
			})

			container.find('.to-right').click(function(){
				if( !list.eq(now_index).is(':animated') ){
					clearInterval(intervalId);
					var next_index = getNextIndex ();
					doAnimate(next_index);
					now_index = next_index;
					
					if (!args.noAuto) {

						intervalId = setInterval( function(){
							doAnimate(getNextIndex());
						},args.delay + args.speed)
					}
				}
				
			})
		}

		//4.3 移动端滑动事件，依赖touchEvent.js
		if(args.isSwipe){
			touchEvent.swipeLeft(container[0],function(){

				if( !list.eq(now_index).is(':animated') ){
					clearInterval(intervalId);
					var next_index = getNextIndex ();
					doAnimate(next_index);
					now_index = next_index;
					
					if (!args.noAuto) {

						intervalId = setInterval( function(){
							doAnimate(getNextIndex());
						},args.delay + args.speed)
					}
				}
			})

			touchEvent.swipeRight(container[0],function(){
				if( !list.eq(now_index).is(':animated') ){
					clearInterval(intervalId);
					var perv_index = getPrevIndex ();
					doAnimate(perv_index);
					now_index = perv_index;

					if (!args.noAuto) {

						intervalId = setInterval( function(){
							doAnimate(getNextIndex());
						},args.delay + args.speed)
					}
				}
				
			})
		}


		



		function changeActive(index) {
			if ( !args.isBtns ) return;
			btns.removeClass('active');
			btns.eq(index).addClass('active');
		}

		function doAnimate(next_index){
			list.eq(now_index).fadeOut(args.speed);
			list.eq(next_index).fadeIn(args.speed);
			now_index = next_index;
			changeActive(now_index);
		}

		function getNextIndex (){
			return (now_index + 1 + list.length) % list.length;
		}

		function getPrevIndex () {
			return (now_index - 1 + list.length) % list.length;
		}


	}



	banner({
		container: '.banner',
		list: '.banner li',
		isBtns: true,
		isNext: false,
		isSwipe: true,
		speed: 1000,
		delay: 4000
	})


	//  响应式menu
	function responsiveMenu(controller, menu) {
		var controller = $(controller);
		var menu = $(menu);
		//console.log(menu)
		controller.click(function(){

			menu.fadeIn();
			menu.find('ul').css('right','-60%').animate({'right':'0'},300);   //目录移动动画
		})
		menu.click(function(e){
			if(e.target == this){
				$(this).fadeOut();
				menu.find('ul').animate({'right':'-60%'},300);
			}
		})
	}
	responsiveMenu('.header-nav-phone i','.responsive-main-menu');
	responsiveMenu('.nav-phone i','.responsive-sub-menu');

	

	//toTop('.to-top');



	// 5.PC导航目录, 滑上滑下显示子目录
	function showNavChildType (container){		
		links = container.find('dl');

		links.hover(function(){
			if(!$(this).hasClass('active')){
				var childType = $(this).find('.child-type');
				if(!childType.is(':animated')) {
					childType.slideDown(300);
				}			
			}
			
		},function(){
			if(!$(this).hasClass('active')){
				var childType = $(this).find('.child-type');
				if(!childType.is(':animated')) {
					childType.slideUp(300);
				}				
			}
		})
	}

	showNavChildType($('.nav'));



	// 6.PHONE导航目录, 通过点击来现在
	function showSubMenu (container, child){
		
		links = container.find(child);  //必须获取a，因为要阻止有子类别的跳转页面

		links.click(function(e){
			var child = $(this).parent().find('.child-type');
			
			if(child.length > 0){
				e.preventDefault();		
				child.slideToggle();
			}
		})
	}
	showSubMenu($('.responsive-menu'),'li>a');
	showSubMenu($('.nav'),'dl>a');


	// 7. 图片自适应，避免有细微大小差距的图片混乱布局
	function imgAdjust(list,percent){
		list.height(list.width() * percent );
		$(window).resize(function(){
			list.height(list.width() * percent );
		})
	}


	// 8. 浮层显示和切换图片
	function showHiddenContent(targetSelect) {
		var target = $(targetSelect);
		if(target.length == 0) return;

		//动态生成一个展示框
		var hash = Math.random().toString().slice(3);
		var hiddenBoxStr = '\
		<div class="hidden-box hidden-box-'+hash+'">\
			<i class="close-btn iconfont icon-guanbi01"></i>\
			<i class="to-left-btn iconfont icon-left"></i>\
			<i class="to-right-btn iconfont icon-right"></i> \
			<div class="hidden-content">\
			\
			</div>\
		</div>';
		$('body').append(hiddenBoxStr)
		var hiddenBox = $('.hidden-box-'+hash);
		var hiddenContent = hiddenBox.find('.hidden-content');
		var closeBtn = hiddenBox.find('.close-btn');
		var toLeftBtn = hiddenBox.find('.to-left-btn');
		var toRightBtn = hiddenBox.find('.to-right-btn');
		var index = 0;

		target.click(function(){
			index = target.index(this);
			var htmlContent = this.innerHTML;
			hiddenContent[0].innerHTML = htmlContent;

			hiddenBox.fadeIn();
			adjust();
		})

		closeBtn.click(function() {
			hiddenBox.fadeOut();

		})

		toLeftBtn.click(function(){
			toggleContent(-1)
		})

		toRightBtn.click(function(){
			toggleContent(1)
		})


		$(window).resize(function(){
			adjust();
		});

		function adjust(){
			var hiddenContentWidth = $(hiddenContent).width(); //  hiddenContent[0].offsetWidth;
			var hiddenContentHeight = $(hiddenContent).height(); // hiddenContent[0].offsetHeight;

			hiddenContent[0].style.marginLeft =  (- hiddenContentWidth / 2) + 'px';
			hiddenContent[0].style.marginTop = (- hiddenContentHeight / 2) + 'px';
		}

		function toggleContent (direction) {           
			index = (index + direction + target.length) % target.length;          
			hiddenContent.fadeOut(300, function(){
				hiddenContent[0].innerHTML = target[index].innerHTML;
				hiddenContent.fadeIn(300);
				adjust();
			});


		}
	}


	//由于一般是图片，所以等页面加载完了再执行
	//在高版本中不支持.load写法
	$(window).on('load',function(){
		showHiddenContent('.honor-area li');
	});

	//9. placeholder 兼容
	function placeholder(nodes,pcolor) {
		
		if(nodes.length && !('placeholder' in document.createElement('input'))){
			nodes.each(function(){
				var _this = this;
				var placeholderValue = _this.getAttribute('placeholder');
				if(placeholderValue === null) {
					return ;
				}  

				$(_this).focus(function(){
					if(_this.value == placeholderValue){
						_this.value = '';
						_this.style.color = '';
					}  
				})

				$(_this).blur(function(){
					if(_this.value == ''){
						_this.value = placeholderValue;
						_this.style.color = pcolor;
					}     
				})
				_this.value = placeholderValue;  
				_this.style.color = pcolor; 
			})
		}
	}   
	placeholder($('input,textarea'),'#acacac');


})