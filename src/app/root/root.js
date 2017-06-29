import Bn from 'backbone'
import Mn from 'backbone.marionette'
import template from './root.hbs'
import menuItems from './menu-items'
import Menu from '../menu/menu'
import SearchFormPage from '../pages/searchForm/searchForm'
import SearchResultsPage from '../pages/searchResults/searchResults'
import TrendsPage from '../pages/trends/trends'
import CollectionPage from '../pages/collection/collection'
import UserLikesPage from '../pages/userLikes/userLikes'
import AuthPanel from '../auth-panel/auth-panel'

import player from '../player'
import api from '../api'

const $$ = Bn.$;

export default Mn.View.extend({

  pagesCache: {},

  template: template,

  regions: {
    menu: '#menu',
    content: '#page-content',
    player: '#player',
    auth: '#auth-panel',
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

    api.addAuthCallback(function (data, status) {
      if (status === 'success' && data.responseJSON && data.responseJSON.user) {
        this.changeAuth(data.responseJSON.user);
      }
      else {
        this.changeAuth(null);
      }
    }.bind(this));
    api.checkAuth();
  },

  onClickItem: function (e) {
    e.preventDefault();
    Bn.history.navigate($$(e.currentTarget).attr('href'), true);
  },

  onClickPlay: function (e) {
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

  pageSearchVoice: function (query) {
    this.showPage('search-query-voice:' + query, () => {
      return new SearchResultsPage({query, voice: true});
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

  pageUserLikes: function () {
    this.showPage('likes', () => {
      return new UserLikesPage();
    });
  },

  pageNotFound: function () {
    Bn.history.navigate('', true);
  },

  onRender: function () {
    this.showChildView('menu', new Menu({menuItems: menuItems}));
    this.showChildView('player', this.options.player);
  },

  onRoute: function (name, path, args) {
    const route = path.split('/').shift();
    this.getMenu().setActive(route);
  },

  changeAuth: function (user) {
    const auth = new AuthPanel({user});
    this.showChildView('auth', auth);
  }
})
