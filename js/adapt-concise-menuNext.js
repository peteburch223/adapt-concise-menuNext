define([
    'core/js/adapt',
    'backbone',
    "./next"

], function(Adapt, Backbone, getNextContentObject) {

  var MenuNext = Backbone.Controller.extend({

    currentView: null,
    bookmarkLevel: null,
    watchViewIds: null,
    watchViews: [],
    currentLocationID: null,

    initialize: function(){
      this.listenToOnce(Adapt, "router:location", this.onAdaptInitialize);
    },

    onAdaptInitialize: function() {
        this.setupEventListeners();
    },

    setupEventListeners: function() {
      this.bookmarkLevel = "page";
      this.listenTo(Adapt, 'navigation:nextButton',  this.navigateToNext);
      this.listenTo(Adapt, 'menuView:ready', this.setupMenu);
      this.listenTo(Adapt, 'pageView:preRender', this.setupPage);
    },

    navigateToNext: function()
    {
      console.log("navigateToNext", this.currentView);
      var next = getNextContentObject(this.currentView.model, false)
      var nextPageId = next && next.get("_id");
      if (nextPageId) {
          Backbone.history.navigate('#/id/' + nextPageId, {trigger: true});
      }
    },

    setupMenu: function(menuView) {
      this.currentView = menuView;
    },

    setupPage: function (pageView) {
      this.currentView = pageView;
    }

  });

  return new MenuNext();
});
