/**
 * @Author: Matthew Hale <mlhale>
 * @Date:   2018-02-14T23:03:42-06:00
 * @Email:  mlhale@unomaha.edu
 * @Filename: term.js
 * @Last modified by:   matthale
 * @Last modified time: 2019-03-05T18:57:39-06:00
 * @License: Funset is a web-based BIOI tool for visualizing genetic pathway information. This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
 * @Copyright: Copyright (C) 2017 Matthew L. Hale, Dario Ghersi, Ishwor Thapa
 */



import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  termid: DS.attr('string'),
  name: DS.attr('string'),
  namespace: DS.attr('string'),
  description: DS.attr('string'),
  synonym: DS.attr('string'),
  parents: DS.hasMany('term', { inverse: 'children' }),
  children: DS.hasMany('term', { inverse: 'parents'}),
  enrichments: DS.belongsTo('enrichment'),
  ontology : DS.belongsTo('ontology'),
  shortname: computed('name',function(){
    var name = this.get('name');
    var maxLength = 40;
    if (name.length <= maxLength) return name;
    return name.substr(0, name.lastIndexOf(' ', maxLength)).concat('...');
  })
});
