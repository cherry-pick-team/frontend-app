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
    const newActive = this.$el.find('[data-route="' + id + '"]');

    if (newActive.length === 0) {
      return;
    }

    this.$el.find('[data-route]').parents('li').removeClass('active');
    newActive.parent('li').addClass('active');
  }
})