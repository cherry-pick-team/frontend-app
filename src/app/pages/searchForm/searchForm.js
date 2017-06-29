import Bn from 'backbone'
import Mn from 'backbone.marionette'
import Trianglify from 'trianglify'
import template from './searchForm.hbs'
import popularQueriesTemplate from './popularQueries.hbs'
import {throttle} from 'lodash'

import api from '../../api'

const $$ = Bn.$;

const PopularQueries = Mn.View.extend({
  template: popularQueriesTemplate,

  templateContext: function () {
    const colors = ['yellow', 'red', 'pink', 'purple', 'indigo', 'blue', 'light-blue', 'orange', 'green'];

    return {
      items: this.options.queries.map((item) => {
        return Object.assign({}, item, {
          color: colors[[Math.floor(Math.random() * colors.length)]],
        });
      }),
    }
  },

  events: {
    'click a': 'onClickItem',
  },

  onClickItem: function (e) {
    e.preventDefault();
    Bn.history.navigate($$(e.currentTarget).attr('href'), true);
  }
});

export default Mn.View.extend({
  template: template,

  regions: {
    popular: '#popular-queries',
  },

  ui: {
    input: 'input',
    button: '#button-search',
    form: 'form',
    buttonVoice: '#button-voice',
  },

  events: {
    'submit @ui.form': 'onSubmit',
    'click @ui.buttonVoice': 'onClickVoice',
  },

  initialize: function () {
    $$(window).on('resize', throttle(this.renderTriangles.bind(this), 60));

    this.setPopular([]);
    this.loadPopular();
  },

  templateContext: function () {
    const phrases = [
      'Что ищем?',
      'Слова из песни?',
      'вордс фром ве сонг',
    ];

    const placeholder = phrases[Math.floor(Math.random() * phrases.length)];
    return {
      inputPlaceholder: placeholder,
    };
  },

  loadPopular: function () {
    api.getPopularSearch(function (data, status) {
      if (status === 'success') {
        this.setPopular(data.responseJSON)
      }
    }.bind(this));
  },

  setPopular: function (queries) {
    this.showChildView('popular', new PopularQueries({queries}));
  },

  onRender: function () {
    this.renderTriangles();
  },

  onDomRefresh: function () {
    this.getUI('input').focus();
  },

  onSubmit: function (e) {
    e.preventDefault();

    const val = this.getUI('input').val();
    if (val === undefined || val.trim().length > 0) {
      Bn.history.navigate('/search/' + val, true);
    }
    else {
      this.getUI('input').focus();
    }
  },

  onClickVoice: function (e) {
    this.initAudio();
    $$('.modal-voice-recording').modal('show');
  },

  renderTriangles: function () {
    const triangles = new Trianglify({
      width: window.innerWidth,
      height: window.innerHeight,
      /*jshint camelcase: false */
      x_colors: ['#785bb5', '#a788e4', '#fff', '#F2F2F2', '#785bb5', '#a788e4'],
    });

    this.$el.find('#search-form-background').css('background-image', 'url(' + triangles.png() + ')');
  },

  onDestroy: function () {
    $$(window).off('resize', this.renderTriangles);
  },

  initAudio: function () {
    if (!navigator.getUserMedia) {
      navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    }
    if (!navigator.cancelAnimationFrame) {
      navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
    }
    if (!navigator.requestAnimationFrame) {
      navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;
    }

    navigator.getUserMedia(
      {
        'audio': {
          'mandatory': {
            'googEchoCancellation': 'false',
            'googAutoGainControl': 'false',
            'googNoiseSuppression': 'false',
            'googHighpassFilter': 'false'
          },
          'optional': []
        },
      }, this.onAudioGetStream.bind(this), function (e) {
      });

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new window.AudioContext();
  },

  onAudioGetStream: function (stream) {
    this.stream = stream;

    this.inputPoint = this.audioContext.createGain();
    this.realAudioInput = this.audioContext.createMediaStreamSource(stream);
    this.audioInput = this.realAudioInput;
    this.audioInput.connect(this.inputPoint);
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.inputPoint.connect(this.analyserNode);
    this.audioRecorder = new window.Recorder(this.inputPoint, {}, this.onVoiceProcess.bind(this));

    // this.zeroGain = this.audioContext.createGain();
    // this.zeroGain.gain.value = 0.0;
    // this.inputPoint.connect(this.zeroGain);
    // this.zeroGain.connect(this.audioContext.destination);

    this.audioRecorder.clear();
    this.audioRecorder.record();

    $$('#button-voice-stop').unbind('click').bind('click', this.onClickVoiceStop.bind(this));
  },

  onVoiceProcess: function (buffers) {
    const input = buffers[0];
    let sum = 0;
    for (let i = 0; i < input.length; ++i) {
      sum += input[i] * input[i];
    }
    let level = Math.sqrt(sum / input.length) * 10000;

    $$('#voice-sound-progress').width(`${5 + level}%`);
  },

  onClickVoiceStop: function (e) {
    $$('.modal-voice-recording').modal('hide');
    $$('.modal-voice-handling').modal('show');
    this.audioRecorder.stop();
    this.audioRecorder.getBuffers(function (buffers) {
      this.stream.getTracks().forEach((track) => {
        track.stop();
      });
      this.audioRecorder.exportWAV(this.onVoiceRecord.bind(this));
      this.audioContext.close();
    }.bind(this));
  },

  onVoiceRecord: function (blob) {
    api.sendVoice(blob, function (data, status) {
      if (status === 'success') {
        const res = data.responseJSON;
        if (res.length > 0) {
          $$('.modal-voice-handling').modal('hide');
          if (res.length === 1) {
            const searchQuery = res.shift();
            if (searchQuery.query.length > 0) {
              Bn.history.navigate('/search/voice/' + searchQuery.query, true);
              return;
            }
          }
          else {
            const songsWord = (num) => {
              const r100 = num % 100;
              const r10 = num % 10;
              if (r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14)) {
                return 'песни';
              }
              else if (r10 === 1 && r100 !== 11) {
                return 'песня';
              }
              return 'песен';
            };
            const $queries = res.map(function (searchQuery) {
              const {songs, query, full_info: fullInfo = null} = searchQuery;

              if (songs === 0) {
                return '';
              }

              const href = '/search/voice/' + query;

              let albumUrl = '/static/no_cover_2.png';
              let authors = [];
              let titles = [];

              if (fullInfo && fullInfo.length > 0) {
                albumUrl = fullInfo[0].album.cover_url;

                for (let i = 0; i < fullInfo.length; i++) {
                  if (authors.indexOf(fullInfo[i].author) < 0) {
                    authors.push(fullInfo[i].author);
                  }

                  if (titles.indexOf(fullInfo[i].title) < 0 && titles.length < 4) {
                    titles.push(fullInfo[i].title);
                  }

                  if (authors.length >= 3) {
                    break;
                  }
                }

                authors = authors.join(', ');
                titles = titles.join(', ');
              }

              return $$('<div></div>').addClass('col-xs-12').append($$('<div></div>').addClass('item r').append(
                $$('<div></div>').addClass('item-media').append(
                  $$('<a></a>').addClass('item-media-content').attr('href', href).data('route', href)
                    .css('background-image', 'url(' + albumUrl + ')')
                ),
                $$('<div></div>').addClass('item-info').append(
                  $$('<div></div>').addClass('item-title text-ellipsis').append(
                    $$('<a></a>').attr('href', href).append(
                      $$('<span></span>').text(query), ' ',
                      $$('<span></span>').addClass('text-muted').text(`${songs} ${songsWord(songs)}`)
                    )
                  ),
                  $$('<div></div>').addClass('item-author text-ellipsis').append(
                    $$('<a></a>').attr('href', href).text(authors)
                  ),
                  $$('<div></div>').addClass('item-author text-sm text-muted text-ellipsis').append(
                    $$('<a></a>').attr('href', href).text(titles)
                  )
                )
              )).click(function (e) {
                e.preventDefault();
                $$('.modal-voice-results').modal('hide');
                Bn.history.navigate(href, true);
              });
            });

            const $itemList = $$('<div></div>').addClass('row item-list item-list-md').css({
              'text-align': 'left',
              'max-height': '400px',
              'overflow-y': 'scroll',
              'cursor': 'pointer'
            }).append($queries);

            $$('#modal-voice-results-part-queries').html('').append($itemList);
            $$('.modal-voice-results').modal('show');
            return;
          }
        }
      }
      $$('.modal-voice-handling').modal('hide');
      $$('.modal-voice-error').modal('show');
    });
  }
})
