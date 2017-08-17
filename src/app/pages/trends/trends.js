import Mn from 'backbone.marionette'
import template from './trends.hbs'

import api from '../../api'

export default Mn.View.extend({
  template: template,

  templateContext: function () {
    return this.options;
  },

  initialize: function (options) {
    this.options.limit = options.limit || 20;
    this.setItems([]);
    this.setLoading();

    api.getTrends(function (data, status) {
      if (status === 'success') {
        this.setItems(data.responseJSON);
      }
      this.setLoading(false);
    }.bind(this), this.options.limit);
  },

  setLoading: function (loading = true) {
    this.options.loading = loading;
    this.render();
  },

  setItems: function (items) {
    this.options.items = items.map((item) => {
      const itemInfo = {
        id: item.id,
        coverUrl: item.album.cover_url,
        title: item.song.title,
        albumTitle: item.album.name,
        singers: item.song.singers.map((singer) => {
          return singer.name;
        }).join(', '),
        songUrl: api.getCropUrl(item.song.mongo_id),
        count: item.count,
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