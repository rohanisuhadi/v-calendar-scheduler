/**
 * Created by David on 23-Apr-18.
 */

import config, { setOptions } from './utils/config'
import VueScheduler from './components/VueScheduler';
import MyVueCalender from './components/MyVueCalender';

import moment from 'moment';

export default {
  install: (Vue, options = {}) => {

    setOptions(Object.assign(config, options));
    moment.locale(config.locale);

    Vue.component('vue-scheduler', VueScheduler);
    Vue.component('my-vue-calender', MyVueCalender);
  }
}
