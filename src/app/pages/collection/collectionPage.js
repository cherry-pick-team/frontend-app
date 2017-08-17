import Mn from 'backbone.marionette'
import template from './collectionPage.hbs'
import api from '../../api'

export default Mn.View.extend({
  template: template,

  events: {
    'click .reload': 'onReloadClick',
  },

  templateContext: function () {
    return this.options;
  },

  initialize: function (options) {
    this.setItems([]);
    this.setLoading();

    this.load();
  },

  onReloadClick: function (e) {
    e.preventDefault();
    this.setLoading();
    this.load();
  },

  load: function () {
    api.getCollection(function (data, status) {
      let error = true;
      if (status === 'success') {
        if (data.responseJSON.message !== undefined) {
          // error
          data.responseJSON = [];
        }
        else {
          error = false;
        }
        this.setItems(data.responseJSON);
      }
      else {
        this.setItems([]);
      }
      this.setLoading(false);
      this.triggerMethod('loaded', {error, items: data.responseJSON, page: this.options.page});
    }.bind(this), this.options.page);
  },

  setLoading: function (loading = true) {
    this.options.loading = loading;
    this.render();
  },

  setItems: function (items) {
    this.options.items = items.map((item) => {
      const chunks = item.chunks;
      const lyrics = item.timestamp_lyrics;

      const itemInfo = {
        id: item.id,
        coverUrl: item.album.cover_url,
        title: item.song.title,
        albumTitle: item.album.name,
        singers: item.song.singers.map((singer) => {
          return singer.name;
        }).join(', '),
        songUrl: api.getCropUrl(item.mongo_id),
        like: item.like,
        videoUrl: item.video_link,
        iTunesUrl: item.itunes_link,
      };
      itemInfo.json = JSON.stringify(itemInfo);

      const from = 0;
      const to = 60000;
      const chunkInfo = {
        from,
        to,
        id: `${from}:${to}`,
        streamUrl: api.getCropUrl(item.mongo_id, from, to),
        words: [],
        wordsStr: '',
      };
      itemInfo.chunkInfo = chunkInfo;
      itemInfo.chunkInfoJson = JSON.stringify(chunkInfo);
      return itemInfo;
    });
    this.render();
  }
});