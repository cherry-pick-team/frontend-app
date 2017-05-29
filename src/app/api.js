import Bn from 'backbone'

const $$ = Bn.$;

const baseUri = '/api/v2/';

const api = {
  getPopularSearch: function (onComplete) {
    $$.ajax({
      url: baseUri + 'search/popular',
      method: 'GET',
      complete: onComplete,
    })
  },

  getTrends: function (onComplete, limit) {
    $$.ajax({
      url: baseUri + 'song/popular',
      data: {
        limit,
      },
      method: 'GET',
      complete: onComplete,
    })
  },

  getSearch: function (onComplete, query) {
    $$.ajax({
      url: baseUri + 'search',
      data: {
        query: query,
      },
      method: 'GET',
      complete: onComplete
    })
  },

  getCollection: function (onComplete, page = 1, limit = 20) {
    $$.ajax({
      url: baseUri + 'song/all',
      data: {
        page,
        limit,
      },
      method: 'GET',
      complete: onComplete
    })
  },

  getCropUrl: function (id, from = 0, to = 200000) {
    // return 'http://api.soundcloud.com/tracks/269944843/stream?client_id=a10d44d431ad52868f1bce6d36f5234c&rand=' + id;
    return '/crop/get_song/?id=' + id + '&from_ms=' + String(from) + '&to_ms=' + String(to);
  },

  sendVoice: function (blob, onComplete) {
    const formData = new window.FormData();
    formData.append('voice', blob, 'my.wav');
    $$.ajax({
      url: baseUri + 'search/voice',
      data: formData,
      processData: false,
      contentType: false,
      method: 'POST',
      complete: onComplete
    });
  },

  checkAuth: function () {
    const callback = function (data, status) {
      if (status === 'success' && data.responseJSON && data.responseJSON.user) {
        this._auth = true;
        this._user = data.responseJSON.user;
      }
      else {
        this._auth = false;
        this._user = {};
      }

      this._authCallbacks.forEach((fn) => {
        if (typeof fn === 'function') {
          fn(data, status);
        }
      });
    }.bind(this);

    $$.ajax({
      url: '/auth/me',
      method: 'GET',
      complete: callback
    });
  },

  isAuth: function () {
    return this._auth;
  },

  getUser: function () {
    return this._user;
  },

  addAuthCallback: function (callback) {
    this._authCallbacks.push(callback);
  }
};

api._auth = false;
api._user = false;
api._authCallbacks = [];
api.isAuth = api.isAuth.bind(api);
api.getUser = api.getUser.bind(api);
api.addAuthCallback = api.addAuthCallback.bind(api);

export default api;