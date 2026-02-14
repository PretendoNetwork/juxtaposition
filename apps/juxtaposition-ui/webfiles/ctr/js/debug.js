if (typeof cave === 'undefined') {
	window.cave = {
		/**
         * Enables or disabled the back button on the toolbar
         * @param enable
         */
		toolbar_enableBackBtnFunc: function (enable) {
			console.log('cave.toolbar_enableBackBtnFunc(enable = ' + enable + ')');
		},
		/**
         * Sets the callback function for a given toolbar button
         * @param btnType
         * @param callback
         */
		toolbar_setCallback: function (btnType, callback) {
			console.log('cave.toolbar_setCallback(btnType = ' + btnType + ', callback = ' + typeof callback + ')');
		},
		/**
         * Toggles the visibility of the toolbar
         * @param visibility
         */
		toolbar_setVisible: function (visibility) {
			console.log('cave.toolbar_setVisible(visibility = ' + visibility + ')');
		},
		/**
         * (untested) Appears to set the "corner button" type.
         * @param type
         */
		toolbar_setButtonType: function (type) {
			console.log('cave.toolbar_setButtonType(type = ' + type + ')');
		},
		/**
         * Highlight a button - usually done in a button's own callback function to show that it has been activated.
         * @param btnType
         */
		toolbar_setActiveButton: function (btnType) {
			console.log('cave.toolbar_setActiveButton(btnType = ' + btnType + ')');
		},
		/**
         * Open the drawing tool interface.
         */
		memo_open: function () {
			console.log('cave.memo_open()');
		},
		/**
         * Clear the current drawing.
         */
		memo_clear: function () {
			console.log('cave.memo_clear()');
		},
		/**
         * Unknown
         * @returns {boolean}
         */
		memo_hasValidImage: function () {
			console.log('cave.memo_hasValidImage()');
			return true;
		},
		/**
         * Returns the drawing as base64 encoded BMP image.
         * @returns {string}
         */
		memo_getImageBmp: function () {
			console.log('cave.memo_getImageBmp()');
			return 'Qk1SEwAAAAAAAJIAAAB8AAAAQAEAAHgAAAABAAEAAAAAAMASAAASCwAAEgsAAAIAAAACAAAAAAD/AAD/AAD/AAAAAAAA/0JHUnOPwvUoUbgeFR6F6wEzMzMTZmZmJmZmZgaZmZkJPQrXAyhcjzIAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAP///wD/////////////////////+P/////8f/////////////////////////////////////////////j//////H/////////////////////////////////////////////4//////x/////////////////////////////////////////////+P/////8f////////////////////////////////////////4A///h//////H////////////////////////////////////////4AH//4f/////x////////////////////////////////////////+Hx///H/////8f////////////////////////////////////////j8H//x//////H////////////////////////////////////////4wB//8f/////x////////////////////////////////////////+AAP//D//h//8f////////////////////////////////////////wPh//4//4f//H////////////////////////////////////////8H4f/+P/+H//x/////////////////////////////////////////h/D//j/////8f////////////////////////////////////////4f4f/4//////H/////////////////////////////////////////D/D/+P/////x/////////////////////////////////////////w/w//j/////8f////////////////////////////////////////+H+H/4//////H/////////////////////////////////////////w/g/+P/////x/////////////////////////////////////////8P+H/j//A//8f/////////////////////////////////////////h/h/4//wP//H/////////////////////////////////////////8f8P+P/4B//x//////////////////////////////////////////D/D/j/8Mf/8f/////////////////////////////////////////4f4f4/+HD//H/////////////////////////////////////////+D+H+P/h4//x//////////////////////////////////////////4fwfj/w+H/8f/wB//////////////////////////////////////+H+H4/8Ph//H/wAP//////////////////////////////////////w/w+H+H4P/x/wPA//////////////////////////////////////+H+Hx/h+D/8fwH4H//////////////////////////////////////x/w8f4Pgf/HwP/wf/////////////////////////////////////8P8HH8D4H/x4H/8D//////////////////////////////////////h/wx/A8A/8YP//4H/////////////////////////////////////8f8EfgPEP/EH///B//////////////////////////////////////D/gH4jxj/wH///8H/////////////////////////////////////4f8B+I8Y/8D////g//////////////////////////////////////D/gfCHGH/D/8B/8D/////////////////////////////////////4f8Hwhxx/w/+AP/gf/////////////////////////////////////D/h8cccf///Bg/+D/////////////////////////////////////4f//HHHH///g8H/wf/////////////////////////////////////D//hxhw///w/gf+D/////////////////////////////////////wf/48YeP//4P+D/4f/////////////////////////////////////D/+PCPj//4P/wf/A/////////////////////////////////////w//Dwj4//8H//B/4H////////////////////////////////////+D/x+A+P/+D//4H/h/////////////////////////////////////w/8fgPj//D///g/4D////////////////////////////////////+D/GAAAf/B///+D8AP////////////////////////////////////w/xAAAH/g////wPDD////////////////////////////////////+H8ADAB/w/////BB4f////////////////////////////////////w/Aggwf4f////4A/H////////////////////////////////////+HweA/D4P/////gfh/////////////////////////////////////w4Pgfw8H/////8Hwf///////////////////////////////////+AAAAB+EH//////wAP//////////////////////////////////+AAAAAAAAAf/////8AH//////////////////////////////////gAB+P//gAAAAH////////////////////////////////////////4B///////H4AB////////////////////////////////////////+P//////////4f////////////////////////////////////////j//////////+H////////////////////////////////////////4///////////j////////////////////////////////////////+P//////////4/////////////////////////////////////////j//////////8P////////////////////////////////////////4///////////D////////////////////////////////////////+P//////////x/////////////////////////////////////////j//////////8f////////////////////////////////////////4////wD/////H////////////////////////////////////////+P///4AP////x/////////////////////////////////////////h///wPAH///8f////////////////////////////////////////4f//4H8Af///H//////////////////////////////////////8ADH//wP/+AP//x//////////////////////////////////////8AAB//wH//4B//8YB////////////////////////////////////+D/Af/wP///8B//AAAP///////////////////////////////////j/8H/4H////gH/wHgA/////////////////////////////////8AA//x/8P/////gP8f/8H///////AAAAAAAAP////////////////+AAP/8f+H/////+A/H//x///////wAAAAAAAD////////////////+D////H+D8P///H8Bx//4f//////////////w/////////////////h////x/B/D///x/wEf/8AH///////////////////////////////4////8fB/x///8f/gH//AAP//////////////////////////////+H////HA/8f///H/8B///+B/////////////////////////////8AA////xg//H///x//4f///8H////////////////////////////8AAP///8Q//x///8f//H////h////////////////////////////8D//////Af/4f///H//x////8f///////////////////////////+D//////wP/+P///x//8f////H////////////////////////////D//////8H//j///8f//H////h////////////////////////////h///////H//4////H//x////w////////////////////////////4///////x///////x//8D///gf///////////////////////////+P/////8Af//////////AH//4D////////////////////////////j/////AAH//////////xAP/+AD////////H//////////////////4/////ADj//////////8eB///Af///////w//////////////////+P///wA/4///////////H8H///D///////+H//////////////////h///wA/8P//////////x/gf//w//////g/g//////////////////8P//AP//D//////////8f+B//+P/////4P+P//////////////////D/+AP//w/gAAAAAAAAAH/4H//j/////+H/j//////////////////4P4A///8AAAAAAAAAAAB//gf/4////j/w/////////////////////BgB////gAf///////////+D/+P///4f+P////////////////////4AH///////////////////4H/D////D/h/4D//////////////////Af////////////////////Afg/x//w/AP+A////////////////////////////////////////+Awf8f/+MAB/h/////////////////////////////////////////wAP/D//gA4f8f/////////////////////////////////////////wP/4//8D/D///////////////////////////////////////////+D/+P//A/4///////////////////////////////////////////////j//4f+H//////////////////////////////////////////////4f//H/x///////////////////////////////////////////////H//w/////////////////////////////////////////////////w//8H////////////////////////////////////////////////+P//x/////////////////////////////////////////////////h////////////////////////////////////////////////////8P////////////////////////////////////////////////////D////////////////////////////////////////////////////4////////////////////////////////////////////////////+P////////////////////////////////////////////////////j////////////////////////////////////////////////////4//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8=';
		},
		/**
         * (untested) Returns the drawing as base64 encoded TGA image.
         * @returns {string}
         */
		memo_getImageRawTga: function () {
			console.log('cave.memo_getImageRawTga()');
			return 'Qk1CAAAAAAAAAD4AAAAoAAAAAQAAAAEAAAABAAEAAAAAAAQAAADEDgAAxA4AAAAAAAAAAAAAAAAAAP///wCAAAAAAAAA';
		},
		/**
         * Set the current notification count
         * @param count
         */
		toolbar_setNotificationCount: function (count) {
			console.log('cave.toolbar_setNotificationCount(' + count + ')');
		},
		/**
         * Calls system error viewer with specified error code
         * @param errorCode
         */
		error_callErrorViewer: function (errorCode) {
			var fakeMessage = 'Message for error code ' + errorCode;
			alert(errorCode + '\n\n' + fakeMessage);
		},
		/**
         * Calls system error viewer with specified error code and message
         * @param errorCode
         */
		error_callFreeErrorViewer: function (errorCode, message) {
			alert(errorCode + '\n\n' + message);
		},
		/**
         * Begins transition to new page
         */
		transition_begin: function () {
			console.log('cave.transition_begin()');
		},
		/**
         * Ends transition to new page
         */
		transition_end: function () {
			console.log('cave.transition_end()');
		},
		/**
         * Begins transition to new page without grey screen
         */
		transition_beginWithoutEffect: function () {
			console.log('cave.transition_beginWithoutEffect()');
		},
		/**
         * Ends transition to new page without grey screen
         */
		transition_endWithoutEffect: function () {
			console.log('cave.transition_endWithoutEffect()');
		},
		/**
         * Session storage of key value pair
         * @param key
         * @param value
         * @returns {undefined}
         */
		ls_setItem: function (key, value) {
			console.log('cave.ls_setItem()');
			// string でないと実機でエラー出るので挙動を合わせる
			// If it is not string, an error will occur on the actual machine, so match the behavior
			for (var i = 0; i < 2; i++) {
				if (typeof arguments[i] !== 'string') {
					console.error('Argument ' + i + ' should be string');
					console.error('JavaScript Extension error. Arguments Count or Argument Type is not mutch. Or , too big arguments.');
					return undefined;
				}
			}
			sessionStorage.setItem(key, value);
		},
		/**
         * Fetches value for key from session storage
         * @param key
         * @returns {undefined|string}
         */
		ls_getItem: function (key) {
			console.log('cave.ls_getItem()');
			if (typeof key !== 'string') {
				console.error('Argument 0 should be string');
				console.error('JavaScript Extension error. Arguments Count or Argument Type is not mutch. Or , too big arguments.');
				return undefined;
			}
			return sessionStorage.getItem(key);
		},
		/**
         * Removes value for key from session storage
         * @param key
         */
		ls_removeItem: function (key) {
			console.log('cave.ls_removeItem()');
			sessionStorage.removeItem(key);
		},
		/**
         * ゲスト初回起動済みフラグをセットする (Set guest first started flag)
         * Puts the applet into guest mode
         * @param bool
         */
		ls_setGuestModeLaunched: function (bool) {
			console.log('cave.ls_setGuestModeLaunched( ' + bool + ' )');
		},
		/**
         * Sets value for specified key in local storage
         * @param key
         * @param value
         */
		lls_setItem: function (key, value) {
			console.log('cave.lls_setItem()');
			localStorage.setItem(key, value);
		},
		/**
         * Fetches the number of values in local storage
         * @returns {number}
         */
		lls_getCount: function () {
			console.log('cave.lls_getCount()');
			return localStorage.length;
		},
		/**
         * Fetches value for key from local storage
         * @param key
         * @returns {string}
         */
		lls_getItem: function (key) {
			console.log('cave.lls_getItem()');
			return localStorage.getItem(key);
		},
		/**
         * Removes value for key from local storage
         * @param key
         */
		lls_removeItem: function (key) {
			console.log('cave.lls_removeItem()');
			return localStorage.removeItem(key);
		},
		/**
         * Returns if key 'custk' has value '1'
         * @returns {boolean}
         */
		ls_canUseCachedServiceToken: function () {
			console.log('cave.ls_canUseCachedServiceToken()');
			return sessionStorage.getItem('custk') === '1' ? true : false;
		},
		/**
         * Sets 'custk' key to specified value
         * @param can_use
         */
		ls_setCanUseCachedServiceToken: function (can_use) {
			console.log('cave.ls_setCanUseCachedServiceToken');
			var flag = can_use ? '1' : '0';
			sessionStorage.setItem('custk', flag);
		},
		/**
         * Shows a dialog box with one button
         * @param title
         * @param message
         * @param button_text
         * @returns {number}
         */
		dialog_oneButton: function (title, message, button_text) {
			console.log('cave.dialog_oneButton()');
			alert('タイトル:' + title + '\n' + 'メッセージ:' + message + '\n\n[ ' + button_text + ' ]');
			return 0;
		},
		/**
         * Returns key at specified index
         * @param index
         * @returns {string}
         */
		lls_getKeyAt: function (index) {
			console.log('cave.lls_getKeyAt index = ' + index);
			return localStorage.key(index);
		},
		/**
         * Returns B64 encoded user Mii image with requested expression
         * @param expression {number} 0-5
         * @returns {string}
         */
		mii_getIconBase64: function (expression) {
			console.log('cave.mii_getIconBase64 expression = ' + expression);
			// 本来表情毎に出し分けるべきだが、とりあえず固定のものを出す
			// Originally, it should be displayed separately for each expression, but for the time being, a fixed one should be displayed
			return 'data:image/png;base64,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';
		},
		/**
         * Returns name of user Mii
         * @returns {string}
         */
		mii_getName: function () {
			console.log('cave.mii_getName');
			return 'chris4403';
		},
		/**
         * Shows a dialog box with two buttons
         * @param title
         * @param message
         * @param buttonL_text
         * @param buttonR_text
         * @returns {number}
         */
		dialog_twoButton: function (title, message, buttonL_text, buttonR_text) {
			console.log('cave.dialog_twoButton()');
			var result = confirm('タイトル:' + title + '\n' + 'メッセージ:' + message + '\n\n[ ' + buttonL_text + ' (Cancel) ] [ ' + buttonR_text + ' (OK) ]');
			return result ? 1 : 0;
		},

		brw_scrollImmediately: function (posX, posY) {
			console.log('cave.brw_scrollImmediately(posX=' + posX + ', posY=' + posY + ')');
			window.scroll(posX, posY);
		},

		brw_getScrollTopX: function () {
			console.log('cave.brw_getScrollTopX()');
			return window.pageXOffset;
		},

		brw_getScrollTopY: function () {
			console.log('cave.brw_getScrollTopY()');
			return window.pageYOffset;
		},

		brw_notifyPageMoving: function () {
			console.log('cave.brw_notifyPageMoving()');
		},

		requestGc: function () {
			console.log('requestGc');
		},
		/**
         * Exits the app
         */
		exitApp: function () {
			console.log('cave.exitApp()');
		},
		/**
         * Returns a JSON string, containing app IDs
         * @param minutes
         * @returns {string}
         */
		plog_getPlayTitlesFilteredByPlayTime: function (minutes) {
			console.log('cave.plog_getPlayTitlesFilteredByPlayTime(' + minutes + ')');
			return '{"IDs":["0004001000020700"]}'; // Miiスタジオ (Mii studio)
		},
		/**
         * Jumps to user account settings
         */
		jump_toAccount: function () {
			console.log('cave.jump_toAccount()');
		},
		/**
         * play (predefined) sound effect
         * @param label
         */
		/* Values:
        SE_OLV_CANCEL
        SE_OLV_OK
        SE_OLV_OK_SUB
        SE_OLV_CHECKBOX_CHECK
        SE_OLV_CHECKBOX_UNCHECK
        SE_OLV_MII_ADD
        SE_OLV_RELOAD
        SE_OLV_BALLOON_OPEN
        SE_OLV_BALLOON_CLOSE
        SE_WAVE_SCROLL_PAGE
        SE_WAVE_SCROLL_PAGE_LR
        SE_WAVE_SCROLL_LIMIT_LR
        SE_CTR_COMMON_TOUCH
        SE_CTR_COMMON_TOUCHOUT
        SE_CTR_COMMON_TOUCHOUT_S
        SE_CTR_COMMON_TOUCHIN
        SE_CTR_COMMON_TOGGLE
        SE_CTR_COMMON_SILENT
        SE_CTR_COMMON_BUTTON
        SE_CTR_COMMON_OK
        SE_CTR_COMMON_RETURN
        SE_CTR_COMMON_CANCEL
        SE_CTR_COMMON_WAIT
        SE_CTR_COMMON_WAIT_END
        SE_CTR_COMMON_CONNECT
        SE_CTR_COMMON_ERROR
        SE_CTR_COMMON_NOTICE
        SE_CTR_COMMON_NOMOVE
        SE_CTR_COMMON_SCROLL
        SE_CTR_COMMON_SCROLL_LIST
        SE_CTR_COMMON_SCROLL_TEXT
        SE_CTR_COMMON_SCROLL_END
        SE_CTR_COMMON_DIALOG
        SE_CTR_COMMON_SYSAPPLET_END
        SE_CTR_SPIDER_HG_Prev
        SE_CTR_SPIDER_HG_Next
        SE_CTR_SPIDER_MV_START
        SE_CTR_SPIDER_LINK
        SE_CTR_SPIDER_YOMIKOMI
        SE_CTR_SPIDER_YOMIEND
        SE_CTR_SPIDER_YomiCancel
        SE_CTR_SPIDER_MV_KAKTEI
        SE_CTR_SPIDER_MV_LINE
        SE_CTR_SPIDER_MV_CURSOR
        SE_CTR_SPIDER_FavCursor
        SE_CTR_SPIDER_Navi
        SE_CTR_SPIDER_Navi_On
        SE_CTR_SPIDER_Navi_Off
        SE_CTR_SPIDER_ZOOM2BIG
        SE_CTR_SPIDER_ZOOM2SMALL
        SE_CTR_SPIDER_LINK_CLICK
        SE_CTR_SPIDER_BTN_CLICK
        SE_CTR_SPIDER_Ticker
        SE_CTR_SPIDER_SEL_START
        SE_CTR_SPIDER_SEL_CURSOR
        SE_CTR_SPIDER_InfoOn
        SE_CTR_SPIDER_SEL_END
         */
		snd_playSe: function (label) {
			console.log('cave.snd_playSe(' + label + ')');
		},
		/**
         * Play (predefined) background music
         * @param label
         */
		/* Values:
        BGM_ACCOUNT_OP
        BGM_CAVE_MAIN
        BGM_CAVE_MAIN_LOOP
        BGM_CAVE_MAIN_LOOP_NOWAIT
        BGM_CAVE_WORLD_MAP_MINT
        BGM_CAVE_WORLD_MAP
        BGM_CAVE_MAIN_OFFLINE
        BGM_CAVE_SETTING
        BGM_CAVE_SYOKAI
        BGM_CAVE_SYOKAI2
         */
		snd_playBgm: function (label) {
			console.log('cave.snd_playBgm(' + label + ')');
		},
		/**
         * Checks if suspended application is running
         * @returns {boolean}
         */
		sap_exists: function () {
			console.log('cave.sap_exists()');
			return false;
		},
		/**
         * Fetches the program ID for the suspended application
         * @returns {undefined}
         */
		sap_programId: function () {
			console.log('cave.sap_programId()');
			return undefined;
		},
		/**
         * Captures the lower screen of the suspended app. Returns as a base64 encoded image (todo: clarify format).
         */
		capture_getLowerImage: function () {
			console.log('cave.capture_getLowerImage()');
		},
		/**
         * Captures the left-eye image from the upper screen of the suspended app. Returns as a base64 encoded image (todo: clarify format).
         */
		capture_getUpperImageLeft: function () {
			console.log('cave.capture_getUpperImageLeft()');
		},
		/**
         * Captures the right-eye image from the upper screen of the suspended app. Returns as a base64 encoded image (todo: clarify format)
         */
		capture_getUpperImageRight: function () {
			console.log('cave.capture_getUpperImageRight()');
		},
		/**
         * (untested) Presumably captures both left and right images from the top screen.
         */
		capture_getUpperImage3D: function () {
			console.log('cave.capture_getUpperImage3D()');
		},
		/**
         * More advanced version of capture_getUpperImage3D that allows for customisation.
         * @param width
         * @param height
         * @param quality
         * @param format
         */
		capture_getLowerImageDetail: function (width, height, quality, format) {
			console.log('cave.capture_getLowerImageDetail(' +
				[width, height, quality, format].join(', ') +
				')');
		},
		/**
         * More advanced version of capture_getUpperImageLeft that allows for customisation.
         * @param width
         * @param height
         * @param quality
         * @param format
         */
		capture_getUpperImageLeftDetail: function (width, height, quality, format) {
			console.log('cave.capture_getUpperImageLeftDetail(' +
				[width, height, quality, format].join(', ') +
				')');
		},
		/**
         * More advanced version of capture_getUpperImageRight that allows for customisation.
         * @param width
         * @param height
         * @param quality
         * @param format
         */
		capture_getUpperImageRightDetail: function (width, height, quality, format) {
			console.log('cave.capture_getUpperImageRightDetail(' +
				[width, height, quality, format].join(', ') +
				')');
		},
		/**
         * More advanced version of capture_getUpperImage3D that allows for customisation.
         * @param width
         * @param height
         * @param quality
         * @param format
         */
		capture_getUpperImage3DDetail: function (width, height, quality, format) {
			console.log('cave.capture_getUpperImage3DDetail(' +
				[width, height, quality, format].join(', ') +
				')');
		},
		/**
         * Unknown
         */
		capture_notifyUpdatedLocalList: function () {
			console.log('cave.capture_notifyUpdatedLocalList()');
		},
		/**
         * Check if the suspended software allows screenshots.
         * @returns {boolean}
         */
		capture_isEnabled: function () {
			console.log('cave.capture_isEnabled()');
			return false;
		},
		/**
         * Same as capture_isEnabled, but instead checks the capture status of a single screen. Set screenIndex to 0 to check the top screen, or 1 to check the lower screen.
         * @param screen
         * @returns {boolean|boolean}
         */
		capture_isEnabledEx: function (screen) {
			console.log('cave.capture_isEnabledEx(' + screen + ')');

			// テスト等でスクショの有無を固定したい場合にクッキーで指定できるようにする, 実機ではこの挙動は存在しない
			// If you want to fix the presence or absence of screenshots in tests, etc., make it possible to specify with cookies, this behavior does not exist on the actual device
			var force = Olv.Cookie.get('force_screenshot_for_test');
			if (force === 'true') {
				return true;
			}
			if (force === 'false') {
				return false;
			}

			return Math.random() >= 0.5 ? true : false;
		},

		boss_regist: function (interval_hour) {
			console.log('cave.boss_regist(' + interval_hour + ')');
			return true;
		},
		boss_registEx: function (interval_hour, count) {
			console.log('cave.boss_regist(' + interval_hour + ',' + count + ')');
			return true;
		},

		boss_unregist: function () {
			console.log('cave.boss_unregist()');
		},

		boss_isRegisted: function () {
			console.log('cave.boss_isRegisted()');
			return true;
		},

		boss_clearNewArrival: function () {
			console.log('cave.boss_clearNewArrival()');
		},
		lls_clear: function () {
			console.log('cave.lls_clear()');
			localStorage.clear();
		},
		lls_setCaptureImage: function (key, value) {
			console.log('cave.setCaptureImage(' + [key, value].join(', ') + ')');
			localStorage.setItem(key, value);
			return 0;
		},
		lls_getPath: function (key) {
			console.log('cave.getPath(' + key + ')');
			var value = localStorage.getItem(key);
			if (value == 0) {
				return '/img/dummy-image/screenshot-dummy-3ds-low.jpeg';
			} else {
				return '/img/dummy-image/screenshot-dummy-3ds-upper.jpeg';
			}
		},
		/**
         * Fetches history from previoys
         * @returns {string}
         */
		history_getPrev: function () {
			console.log('cave.history_getPrev()');
			// 直前の履歴項目の URL を返す API だが、
			// とりあえずは referrer で代用しておく。
			// An API that returns the URL of the previous history item, but
			// Substitute with referrer for the time being.
			return document.referrer;
		},
		/**
         * Removes previous entry from history
         */
		history_removePrev: function () {
			console.log('cave.history_removePrev()');
		},
		/**
         * Fetches URL at provided index
         * @param backIndex
         * @returns {string}
         */
		history_getAt: function (backIndex) {
			console.log('cave.history_getAt(' + backIndex + ')');
			return '';
		},
		/**
         * Removes history at provided index
         * @param backIndex
         */
		history_removeAt: function (backIndex) {
			console.log('cave.history_removeAt(' + backIndex + ')');
		},
		/**
         * Determines if browser can navigate back
         * @returns {number}
         */
		history_getBackCount: function () {
			console.log('cave.history_getBackCount()');
			// 戻ることのできるページ数を返すAPIだが、
			// とりあえずは referrer で代用しておく。
			// API that returns the number of pages that can be returned,
			// Substitute with referrer for the time being.
			return document.referrer ? 1 : 0;
		},

		toolbar_setMode: function (mode) {
			console.log('cave.toolbar_setMode(' + mode + ')');
		},
		toolbar_setWideButtonMessage: function (message) {
			console.log('cave.toolbar_setWideButtonMessage(' + message + ')');
		},
		jump_existsWebbrs: function () {
			console.log('jump_existsWebbrs()');
			return true;
		},
		jump_toSystemUpdate: function (type) {
			console.log('jump_toSystemUpdate(' + type + ')');
		},
		jump_toWebbrs: function (url) {
			console.log('cave.jump_toWebbrs(' + url + ')');
			window.location.href = url;
			return true;
		},
		jump_toShop: function (dialog, titleId) {
			console.log('cave.jump_toShop(' + dialog + ', ' + titleId + ')');
			return true;
		},
		jump_getYoutubeVersion: function () {
			console.log('cave.jump_getYoutubeVersion()');
			return -1;
		},
		jump_suspendedToutube: function (query) {
			console.log('cave.jump_suspendedToutube(' + query + ')');
			return 1;
		},
		jump_toYoutube: function (dialog, query) {
			console.log('cave.jump_toYoutube(' + dialog + ', ' + query + ')');
			return 1;
		},
		jump_existsApplication: function (titleId) {
			console.log('jump_existsApplication(' + titleId + ')');
			return true;
		},
		jump_resetParamToApp: function () {
			console.log('jump_resetParamToApp');
		},
		jump_canUseQuery: function (titleId) {
			console.log('jump_canUseQuery(' + titleId + ')');
			return true;
		},
		jump_setModeToApp: function (mode) {
			console.log('jump_setModeToApp(' + mode + ')');
		},
		jump_setDataUTF8ToApp: function (type, data) {
			console.log('jump_setDataUTF8ToApp(' + type + ', ' + data + ')');
		},
		jump_setNumberDataToApp: function (type, data) {
			console.log('jump_setNumberDataToApp(' + type + ', ' + data + ')');
		},
		jump_setBase64DataToApp: function (type, data) {
			console.log('jump_setBase64DataToApp(' + type + ', ' + data + ')');
		},
		jump_toApplication: function (dialog, titleId) {
			console.log('cave.jump_toApplication(' + dialog + ', ' + titleId + ')');
			return true;
		},
		convertTimeToString: function (unixTime) {
			console.log('cave.convertTimeToString(' + unixTime + ')');
			var date = new Date(unixTime * 1000);
			return date.getFullYear() + '-' + this._toDoubleDigits(date.getMonth() + 1) + '-' + this._toDoubleDigits(date.getDate()) +
				' ' + this._toDoubleDigits(date.getHours()) + ':' + this._toDoubleDigits(date.getMinutes()) + ':' + this._toDoubleDigits(date.getSeconds());
		},
		_toDoubleDigits: function (num) {
			num += '';
			if (num.length === 1) {
				num = '0' + num;
			}
			return num;
		},
		getLocalTimeSeconds: function () {
			console.log('cave.getLocalTimeSeconds()');
			return parseInt(new Date().getTime() / 1000);
		},
		effect_scrollGuide: function (flag) {
			console.log('cave.effect_scrollGuide( ' + flag + ' )');
		},
		effect_setScrollGuideOffsetPos: function (x, y) {
			console.log('effect_setScrollGuideOffsetPos( x = ' + x + ', y = ' + y + ' )');
		},
		// キーボードアプレットに入力した文字列が返り値になるので window.prompt でエミュレートする
		// Since the string entered in the keyboard applet will be the return value, emulate it with window.prompt
		swkbd_callFullKeyboard: function (text, _maxLength, _minLength, _isMonospace, _isMultiline, _isConvertible) {
			console.log('cave.callFullKeyboard( ' + Array.prototype.join.call(arguments, ', ') + ' )');
			return window.prompt('cave.callFullKeyboard', text);
		},
		swkbd_callFullKeyboardWithGuide: function (text, maxLength, minLength, isMonospace, isMultiline, isConvertible, guide) {
			console.log('cave.callFullKeyboardWithGuide( ' + Array.prototype.join.call(arguments, ', ') + ' )');
			return window.prompt('cave.callFullKeyboardWithGuide [' + guide + ']', text);
		},
		viewer_setOnCloseCallback: function (callback) {
			console.log('cave.viewer_setOnCloseCallback(callback = ' + typeof callback + ')');
		},
		home_setEnabled: function (flag) {
			console.log('cave.home_setEnabled', flag);
		}
	};
}
