import Bn from 'backbone'
import Mn from 'backbone.marionette'
import template from './collection.hbs'
import CollectionPage from './collectionPage'

const $$ = Bn.$;

export default Mn.View.extend({
  template: template,

  ui: {
    pages: '#collection-pages',
    reload: '.collection-load-next-page',
  },

  events: {
    'click .collection-load-next-page': 'onClickLoadNextPage',
  },

  pageNum: 0,

  templateContext: function () {
    return this.options;
  },

  loadNext: function () {
    const $container = $$('<div class="collection-page-container"></div>');
    this.getUI('pages').append($container);

    const page = new CollectionPage({el: $container, page: ++this.pageNum,});
    page.on('loaded', this.onPageLoaded.bind(this));
  },

  onPageLoaded: function (data) {
    this.getUI('reload').toggle(!data.error && data.items.length > 0);
  },

  onClickLoadNextPage: function (e) {
    e.preventDefault();
    this.getUI('reload').hide();
    this.loadNext();
  },

  onRender: function () {
    this.loadNext();
  }
});