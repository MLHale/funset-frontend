import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel(/* transition */) {
    // console.log('redirecting to visualization');
    // this.transitionTo('visualization');
  },
  model(){
    // this.store.query('term',{termids:'GO:0000001,GO:0000002'})
    // this.store.query('term', {geneids:'KLRC3,KLRC2,LYN,PMCH,GCNT1,AKAP5,KLRD1,KLRB1,CD109,TNFRSF9,CFH,GEM,IKZF2,STAP1,CRIM1,IL18RAP,IGF1,PON2,TNIP3,MYO1E,PLCB1,FCGR3A,KIR2DL4,PDGFA,GFPT2,TRGV3,CHN2,ABCB1,DYNC2H1,PIK3AP1,PTPRM,NDFIP2,KLRC1,TNFSF4,SPOCK1,MPP1,VAV3,PRR5L,TTLL7,PLS3,ATP9A,APOBEC3B,CDC42BPA,SERPINE2,ST8SIA6,ELOVL6,ATP8B4,CCL3,WNT11,SYCP2,CCR1,PAM,FAM3C,SLC4A4,ARHGEF12,NCR3LG1,CD244,CDH17,PIP5K1B,NRIP1,PTCH1,RAB38,SETD7,FASLG,AFAP1L2,HIST1H2BB,CD86,ATP10D,RHOC,FBN1,APBB2,SLC41A2,RASGRF2,SMOX,DTL,ATP1B1,KIF18A,XCL2,IVNS1ABP,P2RY14,SH3BP5,CD200R1,PECAM1,AKR1C3,HLA-DOA,FCER1G,GCNT4,LEF1,ICAM2,IL7R,LDLRAP1,KLF3,RHOU,CSGALNACT1,SLC7A11,S1PR1,AQP3,CCR8,ITGA6,NCF2,CCR7,EPHA4,MSC,KLF7,CCR4'})
  }
});
