import Mn from 'backbone.marionette'
import template from './copyrights.hbs'
import templateEn from './copyrights-en.hbs'

export default Mn.View.extend({
  template: function (data) {
    return data.lang === 'en' ? templateEn(data) : template(data);
  },

  templateContext: function () {
    return this.options;
  }
});