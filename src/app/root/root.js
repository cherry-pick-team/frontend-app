import Bn from 'backbone'
import Mn from 'backbone.marionette'
import template from './root.hbs'
import menuItems from './menu-items'
import Menu from '../menu/menu'
import SearchFormPage from '../pages/searchForm/searchForm'
import SearchResultsPage from '../pages/searchResults/searchResults'
import TrendsPage from '../pages/trends/trends'
import CollectionPage from '../pages/collection/collection'

import player from '../player'

const $$ = Bn.$;

export default Mn.View.extend({

  pagesCache: {},

  template: template,

  regions: {
    menu: '#menu',
    content: '#page-content',
    player: '#player',
  },

  events: {
    'click a[data-route]': 'onClickItem',
    'click [data-play]': 'onClickPlay',
  },

  initialize: function () {
    this.options.player.on('change', function (playerVisible) {
      this.$el.find('#aside').toggleClass('app-aside-player', !!playerVisible);
      this.$el.find('#page-content').toggleClass('page-content-player', !!playerVisible);
    }.bind(this));
  },

  onClickItem: function (e) {
    e.preventDefault();
    Bn.history.navigate($$(e.currentTarget).attr('href'), true);
  },

  onClickPlay: function(e) {
    player.clickPlay(e);
  },

  getMenu: function () {
    return this.getChildView('menu');
  },

  showPage: function (key, init, cache = true) {
    if (
      this.pagesCache[key] === undefined ||
      this.pagesCache[key].isDestroyed()
    ) {
      this.pagesCache[key] = init();
    }
    this.showChildView('content', this.pagesCache[key]);
  },

  pageSearchForm: function () {
    this.showPage('search-form', () => {
      return new SearchFormPage();
    });
  },

  pageSearch: function (query) {
    this.showPage('search-query:' + query, () => {
      return new SearchResultsPage({query});
    });
  },

  pageTrends: function () {
    this.showPage('trends', () => {
      return new TrendsPage();
    });
  },

  pageCollection: function () {
    this.showPage('collection', () => {
      return new CollectionPage();
    });
  },

  onRender: function () {
    this.showChildView('menu', new Menu({menuItems: menuItems}));
    this.showChildView('player', this.options.player);
  },

  onRoute: function (name, path, args) {
    const route = path.split('/').shift();
    this.getMenu().setActive(route);
  }
})