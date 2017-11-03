import Controller from '@ember/controller';

export default Controller.extend({
  menuitems: Ember.A([
    // {
    //   title: 'Some title',
    //   icon: 'material icon name',
    //   link: 'http://somelink.com',
    // },
  ]),
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
