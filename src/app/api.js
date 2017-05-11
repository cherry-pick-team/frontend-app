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

  getCollection: function(onComplete, page = 1, limit = 20) {
    $$.ajax({
      url: baseUri + 'song/popular', // TODO:!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
  }
};

export default api;