import Controller from '@ember/controller';

export default Controller.extend({
  pvaluethreshold: 0.05,
  pvalueslider: 5,
  genelistValidation: [{
    message: 'Genes must be listed in a comma seperated value format with no white spaces or line feed characters. e.g. gene1,gene2,...',
    validate: (inputValue) => {
      let csvPattern = /^([a-z0-9])+(,[a-z0-9]+)*$/;
      return csvPattern.test(inputValue);
    }
  }],
  actions: {
    geneformSubmit(){
      this.transitionToRoute('visualization')
    },
    updatePValueSlider(value){
      this.set('pvalueslider',value);
      this.set('pvaluethreshold',value/100);
    },
    updatePValue(value){
      this.set('pvalueslider',value*100);
      this.set('pvaluethreshold',value);
    }
  }
});
