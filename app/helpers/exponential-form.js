/**
 * @Author: Matthew Hale <matthale>
 * @Date:   2018-02-24T01:04:27-06:00
 * @Email:  mlhale@unomaha.edu
 * @Filename: exponential-form.js
 * @Last modified by:   matthale
 * @Last modified time: 2018-02-24T01:12:03-06:00
 * @Copyright: Copyright (C) 2018 Matthew L. Hale
 */



import { helper } from '@ember/component/helper';

export function exponentialForm(number) {
  return Number(number).toExponential(6);
}

export default helper(exponentialForm);
