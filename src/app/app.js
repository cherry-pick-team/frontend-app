import Bn from 'backbone'
import Mn from 'backbone.marionette'
import Router from './router'
import RootView from './root/root'

export default Mn.Application.extend({

  region: '#root',

  onStart() {
    const rootView = new RootView({player: this.options.player});
    this.showView(rootView);
    this.Router = new Router({controller: rootView});
    Bn.history.start({pushState: true})
  }
})