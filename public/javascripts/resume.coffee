# /**
#  * Copyright 2012, Digital Fusion
#  * Licensed under the MIT license.
#  * http://teamdf.com/jquery-plugins/license/
#  *
#  * @author Sam Sehnert
#  * @desc A small plugin that checks whether elements are within
#  *     the user visible viewport of a web browser.
#  *     only accounts for vertical position, not horizontal.
#  */

$ = jQuery
$.fn.visible = (partial) ->
	$t            = $(this)
	$w            = $(window)
	viewTop       = $w.scrollTop()
	viewBottom    = viewTop + $w.height()
	_top          = $t.offset().top
	_bottom       = _top + $t.height()
	compareTop    = if partial == true then _bottom else _top
	compareBottom = if partial == true then _top else _bottom

	(compareBottom <= viewBottom) && (compareTop >= viewTop)


#Code for scrolling in rows
$ ->
	win = $(window)
	allRows = $ '.resume-experience-row'

	allRows.each (i, el) ->
		el = $(el)
		if el.visible(true)
			el.addClass 'already-visible'

	win.scroll (event) ->
		allRows.each (i, el) ->
			el = $(el)
			if el.visible(true)
				el.addClass 'come-in'