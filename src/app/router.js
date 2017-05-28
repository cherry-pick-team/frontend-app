import Mn from 'backbone.marionette'

export default Mn.AppRouter.extend({
  appRoutes: {
    '': 'pageSearchForm',
    'search': 'pageSearchForm',
    'search/:query': 'pageSearch',
    'trends': 'pageTrends',
    'collection': 'pageCollection',

    '*notFound': 'pageNotFound',
  },

  onRoute: function (name, path, args) {
    this.controller.triggerMethod('route', name, path, args);
  }
})
