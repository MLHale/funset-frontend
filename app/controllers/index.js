import Controller from '@ember/controller';

export default Controller.extend({
  pvaluethreshold: 0.05,
  pvalueslider: 5,
  numclusters: 1,
  organismselected: {code: 'hsa', name: 'Homo sapiens (human)'},
  organismoptions: [
    {code: 'hsa', name: 'Homo sapiens (human)'},
    {code: 'gga', name: 'Gallus gallus (chicken)'},
    {code: 'bta', name: 'Bos taurus (cow)'},
    {code: 'cfa', name: 'Canis familiaris (dog)'},
    {code: 'mmu', name: 'Mus musculus (mouse)'},
    {code: 'rno', name: 'Rat norvegicus (rat)'},
    {code: 'cel', name: 'Caenorhabditis elegans (nematode)'},
    {code: 'ath', name: 'Arabidopsis thaliana (thale cress)'},
    {code: 'dme', name: 'Drosophila melanogaster (fruit fly)'},
    {code: 'sce', name: 'Saccharomyces cerevisiae (budding yeast)'},
    {code: 'eco', name: 'Escherichia coli'},
    {code: 'dre', name: 'Danio rerio (zebrafish)'}
  ],
  background: '',
  namespaceselected: {code: 'bp', name: 'Biological Process'},
  namespaceOptions: [{code: 'bp', name: 'Biological Process'},{code: 'mf', name: 'Molecular Function'},{code: 'cc', name: 'Cellular Component'}],
  genelist: '',
  genelistValidation: [{
    message: 'Genes must be listed in a comma seperated value format with no white spaces or line feed characters. e.g. gene1,gene2,...',
    validate: (inputValue) => {
      // let csvPattern = /^([A-Za-z0-9])+(,[A-Za-z0-9]+)*$/;
      let csvPattern = /^([^;,\<\>\s],?)+$/;

      return csvPattern.test(inputValue);
    }
  }],
  actions: {
    populateExample(){
      // this.set('genelist', 'KLRC3,KLRC2,LYN,PMCH,GCNT1,AKAP5,KLRD1,KLRB1,CD109,TNFRSF9,CFH,GEM,IKZF2,STAP1,CRIM1,IL18RAP,IGF1,PON2,TNIP3,MYO1E,PLCB1,FCGR3A,KIR2DL4,PDGFA,GFPT2,TRGV3,CHN2,ABCB1,DYNC2H1,PIK3AP1,PTPRM,NDFIP2,KLRC1,TNFSF4,SPOCK1,MPP1,VAV3,PRR5L,TTLL7,PLS3,ATP9A,APOBEC3B,CDC42BPA,SERPINE2,ST8SIA6,ELOVL6,ATP8B4,CCL3,WNT11,SYCP2,CCR1,PAM,FAM3C,SLC4A4,ARHGEF12,NCR3LG1,CD244,CDH17,PIP5K1B,NRIP1,PTCH1,RAB38,SETD7,FASLG,AFAP1L2,HIST1H2BB,CD86,ATP10D,RHOC,FBN1,APBB2,SLC41A2,RASGRF2,SMOX,DTL,ATP1B1,KIF18A,XCL2,IVNS1ABP,P2RY14,SH3BP5,CD200R1,PECAM1,AKR1C3,HLADOA,FCER1G,GCNT4,LEF1,ICAM2,IL7R,LDLRAP1,KLF3,RHOU,CSGALNACT1,SLC7A11,S1PR1,AQP3,CCR8,ITGA6,NCF2,CCR7,EPHA4,MSC,KLF7,CCR4')
      this.set('genelist', 'HLA-DMA,HLA-DMB,HLA-DOA,HLA-DOB,HLA-DPA1,HLA-DPB1,HLA-DQA1,HLA-DQA2,HLA-DQB1,HLA-DRA,CD40LG,CD40,IL10,IL9,FCER1A,MS4A2,FCER1G,IL4,IL13,RNASE3,PRG2,IGH,EPX,CCL11,IL5,IL3,TNF,ALDOA,ALDOB,ALDOC,ALDH2,ALDH1B1,ALDH9A1,ALDH3A2,ALDH7A1,ALDH3A1,ALDH1A3,ALDH3B1,ALDH3B2,AKR1A1,ADH1A,ADH1B,ADH1C,ADH4,ADH5,ADH6,ADH7,PDHA1,PDHA2,PDHB,DLAT,LDHAL6A,LDHA,LDHB,LDHC,LDHAL6B,PKLR,PKM,ENO1,ENO2,ENO3,ENO4,PGAM4,PGAM1,PGAM2,BPGM,GAPDH,GAPDHS,TPI1,PFKL,PFKM,PFKP,FBP1,FBP2,GPI,PGM1,PGM2,HK1,HK2,HK3,HKDC1,GCK,GALM,G6PC,G6PC2,G6PC3,DLD,PGK1,PGK2,PCK1,PCK2,ACSS2,ACSS1,ADPGK,MINPP1');
    },
    geneformSubmit(){
      this.transitionToRoute('visualization', { queryParams: { geneids: this.get('genelist'), pvalue: this.get('pvaluethreshold'), clusters: this.get('numclusters'), organism: this.get('organismselected.code'), background: this.get('background'), namespace: this.get('namespaceselected.code') }})
    },
    updatePValueSlider(value){
      this.set('pvalueslider',value);
      this.set('pvaluethreshold',value/100);
    },
    updatePValue(value){
      this.set('pvalueslider',value*100);
      this.set('pvaluethreshold',value);
    },
    inputgenesFileChanged(file){
      var reader = new FileReader();
      var _this = this;
      console.log('test')
      reader.onload = event => {
        var result = event.target.result;
        _this.set('genelist', result.replace(new RegExp('\n', 'g'),','));
      }
      reader.readAsText(file.value);
    },
    backgroundFileChanged(file){
      var reader = new FileReader();
      var _this = this;
      reader.onload = event => {
        var result = event.target.result;
        _this.set('background', result);
      }
      reader.readAsText(file.value);
    }
  }
});
