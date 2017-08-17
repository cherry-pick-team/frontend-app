import Mn from 'backbone.marionette'
import template from './copyrights.hbs'

export default Mn.View.extend({
  template: template,

  templateContext: function () {
    return this.options;
  }
});