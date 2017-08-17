import Mn from 'backbone.marionette'

export default Mn.AppRouter.extend({
  appRoutes: {
    '': 'pageSearchForm',
    'search': 'pageSearchForm',
    'search/:query': 'pageSearch',
    'search/voice/:query': 'pageSearchVoice',
    'trends': 'pageTrends',
    'collection': 'pageCollection',
    'likes': 'pageUserLikes',
    'copyrights/:lang': 'pageCopyrights',
    'copyrights': 'pageCopyrights',

    '*notFound': 'pageNotFound',
  },

  onRoute: function (name, path, args) {
    this.controller.triggerMethod('route', name, path, args);
  }
})
