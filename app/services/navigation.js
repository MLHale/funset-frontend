import Service from '@ember/service';

export default Service.extend({
  menuitems: Ember.ArrayProxy.create({content: Ember.A([
    // {
    //   title: 'Some title',
    //   icon: 'material icon name',
    //   link: 'http://somelink.com',
    // },
  ])}),
  dynamicbuttons: Ember.ArrayProxy.create({content: Ember.A()}),
});
