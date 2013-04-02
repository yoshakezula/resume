// An example Backbone application contributed by
// [JÃ©rÃ´me Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone-localstorage.html)
// to persist Backbone models within your browser.

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Post Model
  // ----------

  // Our basic **Post** model has `text`, `order`, and `done` attributes.
  window.Post = Backbone.Model.extend({
	  idAttribute: "_id",

    // Default attributes for a todo item.
    defaults: function() {
    },

  });

  // Post Collection
  // ---------------

  // The collection of posts is backed by *localStorage* instead of a remote
  // server.
  window.Posts = Backbone.Collection.extend({

    model: Post,

	url: '/api/posts',

	initialize: function() {
		this._siteMap = {};
		this._averages = {};
		this.on('add', this._addModelToMaps);
		this.on('reset', this._addAllModelsToMaps);
	},

	_addModelToMaps: function(model) {
		if (!this._siteMap[model.get('page_name')])
			this._siteMap[model.get('page_name')] = {};
		this._siteMap[model.get('page_name')][model.get('fb_id')] = model;
	},

	_addAllModelsToMaps: function() {
		var _this = this;
		this._siteMap = {};
		_.each(this.models, function(model) { _this._addModelToMaps(model); });
	},

	computeAverages: function() {
		var _this = this;
		_.each(this._siteMap, function(site) {
	    	var likes = 0, comments = 0, shares = 0;
			posts = _.sortBy(site, function(post) {
				likes += post.get('likes_count');
				comments += post.get('comments_count');
				shares += post.get('shares_count');
				return new Date(post.get('created_time'));
			});
			//Compute averages
			_this._averages[posts[0].get('page_name')] = {
				likes: likes / posts.length,
				comments: comments / posts.length,
				shares : shares / posts.length,
				name : posts[0].get('page_name')
			};

			//Filter to values above 10% of avg
			posts = _.filter(posts, function(post) {
				return post.get('likes_count') > (_this._averages[posts[0].get('page_name')]['likes'] * 0.1);
			});

      if (posts.length > 0) {
        //Recompute averages
        var likes = 0, comments = 0, shares = 0;
        _.each(posts, function(post) {
          likes += post.get('likes_count');
          comments += post.get('comments_count');
          shares += post.get('shares_count');
        });
        //Compute averages
        _this._averages[posts[0].get('page_name')] = {
          likes: likes / posts.length,
          comments: comments / posts.length,
          shares : shares / posts.length,
          name : posts[0].get('page_name')
        };
      }
		});
	},
	computeVirality: function() {
		var virality = 0, engagement = 0;
		var _this = this;
		_.each(this.models, function(model) {
			virality = 0.7*(model.get('shares_count') / _this._averages[model.get('page_name')]['shares']) + 0.3*(model.get('likes_count') / _this._averages[model.get('page_name')]['likes']);
			if (isNaN(virality)) virality = -1;
      engagement = 0.7*(model.get('comments_count') / _this._averages[model.get('page_name')]['comments']) + 0.3*(model.get('likes_count') / _this._averages[model.get('page_name')]['likes']);
      if (isNaN(engagement)) engagement = 0;
      model.set({
        virality: virality,
        engagement : engagement
      });
		});
	}

  });
  window.Posts = new Posts;

  window.PostView = Backbone.View.extend({

    className: 'post',
    template: _.template('<div class="post-site-name"><%=post.get("page_name")%></div><div class="post-time"><%=time%></div><div class="post-message-wrapper"><div class="post-message"><%=message%></div><div class="post-link"><% if(post.get("link")) { %><a class="link-subtle yellow-hover" href="<%=post.get("link")%>" target="_blank">See Post</a><% } %></div><% if(post.get("picture")) { %><div class="post-image-wrapper"><% if(post.get("link")) { %><a href="<%=post.get("link")%>" target="_blank"><% } %><img src="<%=post.get("picture")%>" class="post-image"><% if(post.get("link")) { %></a><% } %></div><% } %><div class="clear"></div></div></div><div class="post-score-box"><span class="post-virality-score-helper-label gray-helper-label">Virality Score:</span><div class="post-virality-score"><%=virality%></div><div class="post-score-box-bottom"><div class="post-engagement-score"><div class="post-engagement-score-helper-label gray-helper-label label-small">Engagement</div><div class="post-engagement-score-value"><%=engagement%></div></div><div class="post-score-box-minor-stats"><div class="post-likes"><div class="post-score-box-minor-stats-helper-label gray-helper-label label-small"><i class="icon-thumbs-up"></i></div><%=likes%></div><div class="post-comments"><div class="post-score-box-minor-stats-helper-label gray-helper-label label-small"><i class="icon-comment"></i></div><%=comments%></div></div><div class="post-shares"><div class="post-score-box-minor-stats-helper-label gray-helper-label label-small"><i class="icon-share-alt"></i></div><%=shares%></div></div><div class="post-star yellow-hover"><i class="icon-star-empty"></i></div><div class="clear"></div></div></div><div class="clear"></div>'),

    events: {
      'click .post-star' : 'starPost',
      'mouseenter .post-virality-score' : 'showViralityTooltip',
      'mouseenter .post-engagement-score-value' : 'showEngagementTooltip'
    },

    initialize: function() {
    },

    showViralityTooltip: function() {
      var viralityScore = this.$('.post-virality-score');
      viralityScore.attr({
        'data-toggle': 'tooltip',
        'title' : 'A page-weighted measure of how widely a post was shared and liked',
        'data-placement' : 'bottom'
      });
      viralityScore.tooltip('show');
    },

    showEngagementTooltip: function() {
      var engagementScore = this.$('.post-engagement-score-value');
      engagementScore.attr({
        'data-toggle': 'tooltip',
        'title' : 'A page-weighted measure of commenting and likes',
        'data-placement' : 'bottom'
      });
      engagementScore.tooltip('show');
    },

    populateShareLink: function() {
      var body = "I'd like to share a few viral posts I found on Arkad so we can improve our own engagement and sales through Facebook: "
      _.each($('.starred-post'), function(post) {
        body += $(post).attr('data-post-site-name') + ' post (';
        body += $(post).attr('data-post-virality').match(/([0-9]+\.[0-9])/)[0] + ' Virality)';
        if ($(post).attr('data-post-link').length > 0)
          body += ': ' + encodeURIComponent($(post).attr('data-post-link'));
        body += ' | ';
      });
      //Trim off last separator
      body = body.slice(0,-3);
      $('#starred-posts-share-link').attr('href', 'mailto: ?subject=Starred Posts from Arkad&body=' + body);
    },

    starPost: function() {
      var _this = this;
      var fb_id = this.model.get("fb_id");

      //Skip if already starred
      if ($('.starred-post[data-post-id="' + fb_id + '"]').length > 0) return;
      
      //Take care of helper text
      $('#starred-posts-helper-text').hide();
      $('#starred-posts-share-link-wrapper').show();

      //Update share link
      this.populateShareLink();

      this.$('.post-star').addClass('post-star-active');
      $('#starred-posts-dropdown-link').addClass('yellow-flash');
      setTimeout(function() {
        $('#starred-posts-dropdown-link').removeClass('yellow-flash');
      }, 500);
      $('#starred-posts-dropdown-menu').append('<li><a href="#" data-post-link="' + this.model.get('link') + '" data-post-virality="' + this.model.get('virality') + '" data-post-site-name="' + this.model.get('page_name') + '" data-post-id="' + fb_id + '" class="starred-post">' + this.model.get('page_name') + ' post<span class="starred-post-virality-score">' + (this.model.get('virality') || 0).toFixed(1) + '</span></a></li>');
      $('.starred-post[data-post-id="' + fb_id + '"]').click(function() {
        _this.scrollToPost(fb_id);
      });
    },

    scrollToPost: function(postId) {
      $('html, body').animate({
          scrollTop: $('.post[data-post-id="' + postId + '"]').offset().top - 50
      }, 500);
    },

    formatTime: function(time) {
      var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      var hour = (time.getHours() < 13) ? time.getHours() : time.getHours() - 12;
      var ampm = (time.getHours() < 12) ? 'am' : 'pm';
      return dayNames[time.getDay()] + ' ' + (time.getMonth() + 1) + '/' + time.getDate() + ' <span class="post-date-hidden">' + hour + ':' + ((time.getMinutes() < 10) ? '0' : '') + time.getMinutes() + ampm + '</span>'
    },

    // Re-render the contents of the todo item.
    render: function() {
      var message = this.model.get("message");
      var time = new Date(this.model.get("created_time"))
      //Add post id to this el
      this.$el.attr('data-post-id', this.model.get("fb_id"));
      this.$el.attr('data-post-site-name', this.model.get("page_name"));

      //Set message contents
      if (message) {
        var url = message.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);
        if (url)
          message = message.replace(url[0], '<a href="' + url[0] + '" target="_blank" class="post-inline-link">' + url[0] + '</a>');
      } 

      $(this.el).html(this.template({
        post: this.model,
        likes : (this.model.get("likes_count") || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        comments : (this.model.get("comments_count") || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        shares : (this.model.get("shares_count") || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        message: message,
        time: this.formatTime(time),
        virality: (this.model.get("virality") || 0).toFixed(1),
        engagement: (this.model.get("engagement") || 0).toFixed(1)

      }));
      //this.setText();
      return this;
    },

    // To avoid XSS (not that it would be harmful in this particular app),
    // we use `jQuery.text` to set the contents of the todo item.
    setText: function() {
      var text = this.model.get('text');
      this.$('.todo-text').text(text);
      this.input = this.$('.todo-input');
      this.input.bind('blur', _.bind(this.close, this)).val(text);
    },

  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  window.AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#app"),

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template('test'),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      'change #site-chooser' : 'siteChooserChangeHandler',
      'click #remove-all-sites' : 'removeAllSites',
      'click #add-all-sites' : 'addAllSites'
    },

    initialize: function() {
      this.params = {};
      this.getParams();

      Posts.bind('sync', this.render, this);
      Posts.fetch({
      	data : this.params,
      });
      this.allSites = [];
      this.currentSites = [];
    },

    removeAllSites: function() {
      $('#site-chooser').val('');
      $('#site-chooser').trigger("liszt:updated");
      $('.post').slideUp();
    },

    addAllSites: function() {
      $('#site-chooser').val(this.allSites);
      $('#site-chooser').trigger("liszt:updated");
      $('.post').slideDown();
    },

    siteChooserChangeHandler: function(e) {
      var newSites = $(e.target).val(), removed = '', added = '';
      removed = _.difference(this.currentSites, newSites);
      added = _.difference(newSites, this.currentSites);
      $('.post[data-post-site-name="' + removed[0] + '"]').slideUp();
      $('.post[data-post-site-name="' + added[0] + '"]').slideDown();
      this.currentSites = newSites;
    },

    getParams: function() {
    	var _this = this;
    	var query = window.location.search.substring(1);
    	var params = query.split("&");
    	_.each(params, function(param){
    		var pair = param.split("=");
    		_this.params[pair[0]] = pair[1];
    	});
    },

    renderSiteChooser: function() {
      var options = '';
      var _this = this;
      var siteNames = [];
      this.$('#site-chooser-wrapper').html('<select id="site-chooser" data-placeholder="Choose Facebook pages to compare" class="chzn-select" multiple></select><span id="add-all-sites" class="link-subtle">all</span><span id="remove-all-sites" class="link-subtle">none</span>');
      siteNames = _.map(Posts._siteMap, function(val, key) {
        return key;
      });
      siteNames = _.sortBy(siteNames, function(site) { return site; });
      _.each(siteNames, function(key) { 
        options += '<option selected value="' + key + '">' + key + '</option>';
        _this.allSites.push(key);
        _this.currentSites.push(key);
      } );
      this.$('#site-chooser').html(options).chosen();
    },

    render: function() {
      var _this = this;
      //Posts.computeAverages();
      //Posts.computeVirality();
      this.$el.html('<div id="site-chooser-wrapper"></div><div id="posts-list"></div>');
      this.renderSiteChooser();
    	//this.showAverages();
    	this.addAllPosts();
    },

    addPost: function(post) {
      var view = new PostView({model: post});
      this.$("#posts-list").append(view.render().el);
    },

    showAverages: function() {
    	if (Posts.models.length == 0) return;

    	var _this = this;
    	_.each(Posts._averages, function(site) {
    		var sharePercent = ((site['shares'] / site['likes']) * 100).toFixed(1) + '%'
    		var commentPercent = ((site['comments'] / site['likes']) * 100).toFixed(1) + '%'
    		_this.$el.prepend('<br>Avg Likes for ' + site['name'] + ':' + site['likes'].toFixed(1) + '<br>');
    		_this.$el.prepend('<br>Avg shares for ' + site['name'] + ':' + site['shares'].toFixed(1) + ' (' + sharePercent + ' of likes)');
    		_this.$el.prepend('<br>Avg comments for ' + site['name'] + ':' + site['comments'].toFixed(1) + ' (' + commentPercent + ' of likes)');
    	});
    },

    addAllPosts: function() {
    	if (Posts.models.length == 0) return;
    	var _this = this;
		
      // posts = _.filter(Posts.models, function(model) {
      //   return model.get('virality') > 1;
      // });
  		posts = _.sortBy(Posts.models, function(model) {
  			return 10000 - model.get('virality');
  		});

  		_.each(posts, function(post) {_this.addPost(post)});
    },
    addAllPostsByDate: function() {
    	var _this = this;
    	var dates = [];
    	var today = new Date();
    	for (i=0; i<50;i++) {
    		dates.push(new Date(today.setDate(today.getDate() - 1)));
    	}
    	var prevDate = new Date();
    	_.each(dates, function(date) {
    		this.$("#posts-list").append('<li><strong>' + date + '</strong></li>');
    		posts = _.filter(Posts.models, function(post) {
    			var postDate = new Date(post.get('created_time'))
    			return postDate < prevDate && postDate > date;
    		});
    		_.each(posts, function(post) {_this.addPost(post)});
    		prevDate = new Date(date);
    	});
    },

  });

  // Finally, we kick things off by creating the **App**.
  window.App = new AppView;

});