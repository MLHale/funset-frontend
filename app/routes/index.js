import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel(/* transition */) {
    console.log('redirecting to visualization');
    this.transitionTo('visualization');
  }
});
