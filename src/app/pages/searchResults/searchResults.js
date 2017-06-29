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
    }.bind(this), options.query, options.voice);
  },

  setLoading: function (loading = true) {
    this.options.loading = loading;
    this.render();
  },

  setItems: function (items) {
    this.options.items = items.map((item) => {
      const chunks = item.lyrics_chunks;
      const lyrics = item.timestamp_lyrics;

      const resChunks = chunks.map(({start, end, lyrics: words}) => {
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
        id: item.id,
        coverUrl: item.album.cover_url,
        title: item.song.title,
        albumTitle: item.album.name,
        singers: item.song.singers.map((singer) => {
          return singer.name;
        }).join(', '),
        songUrl: api.getCropUrl(item.mongo_id),
        chunks: resChunks,
        like: item.like,
      };
      itemInfo.json = JSON.stringify(itemInfo);
      return itemInfo;
    });
    this.render();
  }
});
