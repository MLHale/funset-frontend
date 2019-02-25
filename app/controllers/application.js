/**
 * @Author: Matthew Hale <mlhale>
 * @Date:   2018-02-14T23:03:42-06:00
 * @Email:  mlhale@unomaha.edu
 * @Filename: application.js
 * @Last modified by:   matthale
 * @Last modified time: 2019-02-25T17:44:33-06:00
 * @License: Funset is a web-based BIOI tool for visualizing genetic pathway information. This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
 * @Copyright: Copyright (C) 2017 Matthew L. Hale, Dario Ghersi, Ishwor Thapa
 */



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
      this.set('dialogOrigin', event.currentTarget);
      this.set('showDialog', true);
      
    },
    closeDialog(result) {
      this.set('result', result);
      this.set('showDialog', false);
    },
  }
});
