define([
    'core/js/adapt',
    'backbone',
    "./next"

], function(Adapt, Backbone, getNextContentObject) {

  var MenuNext = Backbone.Controller.extend({

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
        this._onScroll = _.debounce(_.bind(this.checkLocation, this), 1000);
        this.listenTo(Adapt, 'navigation:nextButton',  this.navigateToNext);
        this.listenTo(Adapt, 'menuView:ready', this.setupMenu);
        this.listenTo(Adapt, 'pageView:preRender', this.setupPage);
    },

    navigateToNext: function()
    {
      console.log("navigateToNext");
      // debugger;
      // getNextContentObject(this.currentLocationID, true)
    },

    setupMenu: function(menuView) {
        var menuModel = menuView.model;
        //set location as menu id unless menu is course, then reset location
        if (menuModel.get("_parentId")) return this.setLocationID(menuModel.get("_id"));
        else this.resetLocationID();
    },

    setupPage: function (pageView) {
        console.log(pageView);
        //set location as page id
        this.setLocationID(pageView.model.get('_id'));

        console.log("setupPage", pageView.model.get('_id'));

        this.watchViewIds = _.map(pageView.model.findDescendantModels(this.bookmarkLevel+"s"), function(desc) {
            return desc.get("_id");
        });
        this.listenTo(Adapt, this.bookmarkLevel + "View:postRender", this.captureViews);
        this.listenToOnce(Adapt, "remove", this.releaseViews);
        $(window).on("scroll", this._onScroll);
    },

    captureViews: function (view) {
        this.watchViews.push(view);
    },

    releaseViews: function () {
        this.watchViews.length = 0;
        this.watchViewIds.length = 0;
        this.stopListening(Adapt, 'remove', this.releaseViews);
        this.stopListening(Adapt, this.bookmarkLevel + 'View:postRender', this.captureViews);
        $(window).off("scroll", this._onScroll);
    },

    checkLocation: function() {
        var highestOnscreen = 0;
        var highestOnscreenLocation = "";

        var locationObjects = [];
        for (var i = 0, l = this.watchViews.length; i < l; i++) {
            var view = this.watchViews[i];

            var isViewAPageChild = (_.indexOf(this.watchViewIds, view.model.get("_id")) > -1 );

            if ( !isViewAPageChild ) continue;

            var element = $("." + view.model.get("_id"));
            var measurements = element.onscreen();

            if (!measurements.onscreen) continue;
            if (measurements.percentInview > highestOnscreen) {
                highestOnscreen = measurements.percentInview;
                highestOnscreenLocation = view.model.get("_id");
            }
        }

        //set location as most inview component
        if (highestOnscreenLocation) this.setLocationID(highestOnscreenLocation);
    },

    setLocationID: function (id) {
      console.log("MenuNext currentLocationId", id);
        this.currentLocationID = id;
    },

    resetLocationID: function () {
        this.setLocationID('');
    },
  });

  return new MenuNext();
});
