import Bn from 'backbone'
import Mn from 'backbone.marionette'
import template from './menu.hbs'

export default Mn.View.extend({
  template: template,

  templateContext: function () {
    return {
      menuItems: this.options.menuItems,
    };
  },

  setActive: function (id) {
    this.$el.find('[data-route]').parents('li').removeClass('active');
    this.$el.find('[data-route=' + id + ']').parent('li').addClass('active');
  }
})