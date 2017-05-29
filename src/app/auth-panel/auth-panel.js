import Mn from 'backbone.marionette'
import template from './auth-panel.hbs'

export default Mn.View.extend({
  template: template,

  templateContext: function () {
    return {
      user: this.options.user,
    };
  }
})