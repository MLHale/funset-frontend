/**
 * @Author: Matthew Hale <mlhale>
 * @Date:   2018-02-14T23:03:42-06:00
 * @Email:  mlhale@unomaha.edu
 * @Filename: index.js
 * @Last modified by:   matthale
 * @Last modified time: 2018-12-24T02:30:10-06:00
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
    return this.store.findAll('ontology')
      .then(result=>{return result.sortBy('created').reverse()});
  },
  setupController(controller,model){
    this._super(controller, model);
  }
});
