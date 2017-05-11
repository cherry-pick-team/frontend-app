import Bn from 'backbone'
import Mn from 'backbone.marionette'
import template from './player.hbs'

const $$ = Bn.$;

export default Mn.View.extend({
  template: template,

  ui: {
    player: '.playlist'
  },

  player: undefined,
  playerPlayList: undefined,

  initialize: function () {
    this.options.visible = false;
  },

  clickPlay: function (e) {
    const $curBut = $$(e.currentTarget);
    const playlist = $curBut.data('playlist');
    const id = $curBut.data('play-id');

    if ($curBut.data('play') === 'playlist') {
      const $chunks = $$('[data-playlist="' + playlist + '"][data-play="playlist-chunk"]');
      const $firstChunk = $chunks.find('.active [data-play]').length > 0 ? $chunks.find('.active [data-play]').first() : $chunks.first();

      $firstChunk.click();
      return;
    }

    const getChunksInfo = (playlistName) => {
      return $$('[data-playlist="' + playlistName + '"][data-play="playlist-chunk"]').map((k, chunk) => {
        const $chunk = $$(chunk);
        const id = $chunk.data('play-id');
        const songInfo = $chunk.data('song-info');
        const chunkInfo = $chunk.data('chunk-info');

        return {
          id,
          playlist,
          title: songInfo.title,
          except: '',
          link: '',
          thumb: {src: songInfo.coverUrl,},
          src: chunkInfo.streamUrl,
          meta: {
            author: songInfo.singers,
          }
        };
      });
    };

    if (this.player) {
      const currentTrack = this.player.mepGetCurrentTrack();
      if (currentTrack && currentTrack.playlist === playlist) {
        if (id === currentTrack.id) {
          this.player.media.paused ? this.player.play() : this.player.pause();
        }
        else {
          this.player.mepSelect(this.player.find(id), true);
        }
      }
      else {
        const num = this.player.options.mepPlaylistTracks.length;
        for (let i = 0; i < num; i++) {
          this.player.mepRemove({id: this.player.options.mepPlaylistTracks[0].id});
        }

        const chunks = getChunksInfo(playlist);
        $$(chunks).map((k, chunk) => {
          this.player.mepAdd(chunk);
        });

        this.player.mepSelect(this.player.find(id), true);
      }
    }
    else {
      this.initPlayer(getChunksInfo(playlist));
      this.player.mepSelect(this.player.find(id), true);
    }
  },

  initPlayer: function (tracks) {
    this.show();
    this.player = this.getUI('player').mepPlaylist({
      audioHeight: '40',
      audioWidth: '100%',
      videoHeight: '40',
      videoWidth: '100%',
      audioVolume: 'vertical',
      mepPlaylistLoop: false,
      mepPlaylistRepeat: false,
      alwaysShowControls: true,
      mepSkin: 'mejs-audio',
      mepResponsiveProgress: true,
      mepSelectors: {
        playlist: '.playlist',
        track: '.track',
        tracklist: '.tracks'
      },
      features: [
        'mepartwork',
        'mepcurrentdetails',
        'mepplaylist',
        'mepprevioustrack',
        'playpause',
        'mepnexttrack',
        'progress',
        'current',
        'duration',
        'volume',
        'mepsource',
        'mepbuffering'
      ],
      mepPlaylistTracks: tracks,
    }).find('audio, video')[0].player;
    this.player.$node.on('play', this.updateStatus.bind(this));
    this.player.$node.on('pause', this.updateStatus.bind(this));
  },

  updateStatus: function () {
    $$('[data-play]').removeClass('is-playing').parent().removeClass('active');

    const currentTrack = this.player.mepGetCurrentTrack();
    if (currentTrack) {
      const $curBut = $$('[data-play-id="' + currentTrack.id + '"]');
      const $curButPlaylist = $$('[data-play="playlist"][data-playlist="' + currentTrack.playlist + '"]');
      [$curBut, $curButPlaylist].forEach((el) => {
        el.toggleClass('is-playing', !this.player.media.paused).parent().addClass('active');
      });
    }
  },

  hide: function () {
    this.options.visible = false;
    this.getUI('player').hide();
    this.triggerMethod('change', this.options.visible);
  },

  show: function () {
    this.options.visible = true;
    this.getUI('player').show();
    this.triggerMethod('change', this.options.visible);
  },

  onRender: function () {
    this.getUI('player').toggle(this.options.visible);
  }
});