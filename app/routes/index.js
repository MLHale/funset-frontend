/**
 * @Author: Matthew Hale <mlhale>
 * @Date:   2018-02-14T23:03:42-06:00
 * @Email:  mlhale@unomaha.edu
 * @Filename: index.js
 * @Last modified by:   mlhale
 * @Last modified time: 2018-02-15T00:23:10-06:00
 * @License: Funset is a web-based BIOI tool for visualizing genetic pathway information. This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
 * @Copyright: Copyright (C) 2017 Matthew L. Hale, Dario Ghersi, Ishwor Thapa
 */



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
