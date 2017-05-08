import Mn from 'backbone.marionette'
import template from './searchResults.hbs'
import api from '../../api'

export default Mn.View.extend({
  template: template,

  templateContext: function () {
    return this.options;
  },

  initialize: function (options) {
    this.setItems([]);
    this.setLoading();

    api.getSearch(function (data, status) {
      if (status === 'success') {
        if (data.responseJSON.message !== undefined) {
          // error
          data.responseJSON = [];
        }
        this.setItems(data.responseJSON);
      }
      else {
        this.setItems([]);
      }
      this.setLoading(false);
    }.bind(this), options.query);
  },

  setLoading: function (loading = true) {
    this.options.loading = loading;
    this.render();
  },

  setItems: function (items) {
    this.options.items = items.map((item) => {
      const chunks = item.chunks;
      const lyrics = item.timestamp_lyrics;

      const resChunks = chunks.map(([start, end]) => {
        const keys = Object.keys(lyrics);
        const key = keys.indexOf(String(start));

        const words = [];

        // TODO: rewrite me to super-modern-js <3
        for (let i = key - 1; i < key + 2; i++) {
          if (i >= 0 && i < keys.length) {
            words.push(lyrics[keys[i]]);
          }
        }

        const chunkInfo = {
          id: String(start) + ':' + String(end),
          from: start,
          to: end,
          streamUrl: api.getCropUrl(item.mongo_id, start, end),
          words: words,
          wordsStr: words.join('<br />'),
        };
        chunkInfo.json = JSON.stringify(chunkInfo);

        return chunkInfo;
      });

      const itemInfo = {
        id: item.mongo_id,
        coverUrl: item.album.cover_url,
        title: item.song.title,
        albumTitle: item.album.name,
        singers: item.song.singers.map((singer) => {
          return singer.name;
        }).join(', '),
        songUrl: api.getCropUrl(item.mongo_id),
        chunks: resChunks,
      };
      itemInfo.json = JSON.stringify(itemInfo);
      return itemInfo;
    });
    this.render();
  }
});
