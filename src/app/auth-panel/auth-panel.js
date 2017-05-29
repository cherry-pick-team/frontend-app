import Mn from 'backbone.marionette'
import template from './auth-panel.hbs'
import api from '../api';

export default Mn.View.extend({
  template: template,

  events: {
    'click #logout': 'onLogout',
  },

  templateContext: function () {
    return {
      user: this.options.user,
    };
  },

  onLogout: function () {
    api.logout();
    return false;
  }
})