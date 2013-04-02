$ = jQuery
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

$.fn.offScreen = (distance) ->
	$t            = $(this)
	$w            = $(window)
	viewTop       = $w.scrollTop()
	viewBottom    = viewTop + $w.height()
	_top          = $t.offset().top - distance
	_bottom       = $t.offset().top + $t.height() + distance

	top: _bottom <= viewTop
	bottom: _top >= viewBottom

#Code for scrolling in rows
#from http://codepen.io/PawelGIX/pen/kmhLl
$ ->
	win = $(window)
	allRows = $ '.resume-experience-row'

	allRows.each (i, el) ->
		el = $(el)
		if !el.offScreen(200).bottom
		#if el.visible(true)
			el.addClass 'already-visible'

	win.on 'scroll resize', (event) ->
		allRows.each (i, el) ->
			el = $(el)
			if !el.offScreen(200).top && !el.offScreen(200).bottom
				el.removeClass 'already-visible off-screen-top off-screen-bottom'
				el.addClass 'come-in'
			else
				el.addClass (if el.offScreen(200).top then 'off-screen-top' else 'off-screen-bottom')
			#if el.visible(true)
			#	el.addClass 'come-in'

	win.trigger 'scroll'