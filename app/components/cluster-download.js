import Component from '@ember/component';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';

export default Component.extend(FileSaverMixin,{
  actions:{
    downloadCluster(){
      //save to file
      this.saveFileAs("cluster: "+this.get('cluster.name'), JSON.stringify(this.get('cluster')), "application/json");
    },
  }
});
