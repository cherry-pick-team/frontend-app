import Bn from 'backbone'
import Mn from 'backbone.marionette'
import Trianglify from 'trianglify'
import template from './searchForm.hbs'
import popularQueriesTemplate from './popularQueries.hbs'

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
    button: 'button',
    form: 'form',
  },

  events: {
    'submit @ui.form': 'onSubmit',
  },

  initialize: function () {
    $$(window).on('resize', this.renderTriangles.bind(this));

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

  renderTriangles: function () {
    const triangles = new Trianglify({
      width: window.innerWidth,
      height: window.innerHeight,
      /*jshint camelcase: false */
      x_colors: ['#553d87', '#794ad6', '#fff', '#F2F2F2', '#553d87', '#794ad6'],
    });

    this.$el.find('#search-form-background').css('background-image', 'url(' + triangles.png() + ')');
  },

  onDestroy: function () {
    $$(window).off('resize', this.renderTriangles);
  }
})