import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    // login(){
    //   this.get('auth').login();
    // },
    externalLink(item){
      window.open(item.link);
    },
    openDialog(event) {
      this.set('dialogOrigin', Ember.$(event.currentTarget));
      this.set('showDialog', true);
    },
    closeDialog(result) {
      this.set('result', result);
      this.set('showDialog', false);
    },
  }
});
