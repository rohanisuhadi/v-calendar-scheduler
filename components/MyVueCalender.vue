<template>
  <div class="bg-white">
    <div class="mb-2 v-cal-header__actions p-3">
      <div class="actions-left">
        <button class="v-cal-button" @click="goToToday">Today</button>
        <button class="v-cal-button" @click="prev">Back</button>
        <button class="v-cal-button" @click="next">Next</button>
      </div>
      <slot/>
      <div class="v-cal-header__title-bar">
        <h3 class="v-cal-header__title">{{ calendarTitle }}</h3>
      </div>
    </div>
    <div class="text-xxs mb-2 px-2">
      <span>Calender Color and Initial Code</span> = 
      Custom Cabinet (C) : Green,
      Fit Out (F) : Yellow,
      LED (L): Purple,
      Service (S): Pink,
      Supplement Order (SO) : Orange,
      Top Table (T): Blue
    </div>
    <div class="rounded body_page">
      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th v-for="(day, index) in days" v-bind:key="index" :class="{ 'bg-green-600': day.isToday, 'bg-red-400' : day.isSunday }">{{ day.d.format('ddd DD/MM') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(team, index) in teams" v-bind:key="index">
            <td><span class="text-sm">{{team.name}}</span><br/><span class="text-xs">{{team.type}}</span></td>
            <td @click="openDialog( getDefaultForm(team, day)  )" v-for="(day, index) in days" v-bind:key="index" class="cursor-pointer" v-bind:class="[{  'bg-gray-200' : (day.isSunday || isHoliday(day) ) }, getColor(team.schedules, day.d.format('YYYY-MM-DD') )]" >
              <div class="w-full h-auto" :class="{'text-center' : isHoliday(day)}">
                <span>{{ getSchedule(team.schedules, day.d.format('YYYY-MM-DD') ) }}</span>
                <span class="text-black text-center">{{ isHoliday(day) }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import moment from 'moment';
import { EventBus } from './EventBus';
import EventItem from './EventItem';
import ShowsTimes from './mixins/ShowsTimes';
import Event from '../model/Event';
import config from '../utils/config';
import { defaultLabels, defaultViews } from '../utils/config';

export default {
  props: {
      events: {
          type: Array,
          default: () => []
      },
      teams: {
          type: Array,
          default: () => config.teams
      },
      publicHolidays: {
          type: Array,
          default: () => []
      },
      showTodayButton: {
          type: Boolean,
          default: () => config.showTodayButton
      },
      minDate: {
          type: [Date, Object],
          default: () => config.minDate
      },
      maxDate: {
          type: [Date, Object],
          default: () => config.maxDate
      },
      labels: {
          type: Object,
          default: () => config.labels,
          validator(value) {
              for (const labelKey in defaultLabels ) {
                  if ( !value.hasOwnProperty(labelKey) ) {
                      console.error('Missing prop label: ' + labelKey);
                      return false;
                  }
              }
              return true;
          }
      },
      timeRange: {
          type: Array,
          default: () => config.timeRange,
          validator(value) {
              if ( value.length !== 2 || value[0] > value[1] || value[0] < 0 || value[1] > 23) {
                  console.error('Invalid time range.');
                  return false;
              }
              return true;
          }
      },
      availableViews: {
          type: Array,
          default: () => config.availableViews,
          validator (value) {
              const possible = defaultViews;
              let error = false;
              value.forEach(view => {
                  if ( possible.indexOf(view) === -1 ) {
                      console.error('Invalid view: ' + view);
                      error = true;
                  }
              });
              return !error;
          }
      },
      initialDate: {
          type: [Date, Object],
          default: () => config.initialDate
      },
      initialView: {
          type: String,
          default: () => config.initialView
      },
      use12: {
          type: Boolean,
          default: () => config.use12
      },
      showTimeMarker: {
          type: Boolean,
          default: () => config.showTimeMarker
      },
      eventDisplay: {
          type: [String, Function],
          default: () => config.eventDisplay
      },
      disableDialog: {
          type: Boolean,
          default: false
      },
      eventDialogConfig: {
          type: Object,
          default: () => { return {} }
      }
  },
  mixins: [ ShowsTimes ],
  components: { EventItem },
  computed: {
    calendarTitle() {
      const weekStart = moment(this.activeDate).day(0);
      const weekEnd = moment(this.activeDate).day(26);
      return weekStart.format('MMM D') + ' - ' + weekEnd.format('MMM D');
    }
  },
  data () {
    return {
      days: [],
      today: moment(),
      activeView: 'week',
      activeDate: null
    }
  },
  mounted() {
    this.buildCalendar();
    this.activeDate = moment(this.initialDate);
  },
  watch: {
    initialDate() {
      this.activeDate = moment(this.initialDate);
    },
    activeDate() {
      this.buildCalendar();
    },
  },
  methods: {
    isDayDisabled(day) {
      if ( !this.minDate && !this.maxDate )
          return false;
      if ( this.minDate && this.minDate.isAfter(day, 'day') ) return true;
      if ( this.maxDate && this.maxDate.isBefore(day, 'day') ) return true;
    },
    close() {
      setTimeout(() => {
        this.$destroy();
        this.$el.remove();
      }, 150);
    },
    openDialog(schedule){
      // console.log(schedule);
      this.$emit('openForm', schedule)
    },
    buildCalendar() {

      let now = moment();
      let temp = moment( this.activeDate ).day(moment.localeData().firstDayOfWeek());
      var w = moment( this.activeDate ).day(moment.localeData().firstDayOfWeek()).add( 21, 'day' ).week();
      var diff = 0;
      if( temp.week() > w  ){
        w = moment( this.activeDate ).day(moment.localeData().firstDayOfWeek()).weeksInYear();
        diff = 3 - (w - temp.week());
      }
      this.days = [];

      do {
          const day = moment(temp);

          const dayEvents = this.events.filter( e => e.date.isSame(day, 'day') )
              .sort( (a, b) => {
                  if ( !a.startTime ) return -1;
                  if ( !b.startTime ) return 1;
                  return moment(a.startTime).format('HH') - moment(b.startTime).format('HH');
              });
          
          const mappedEvents = dayEvents.map( event => {
              event.overlaps = dayEvents.filter( e => moment(event.startTime).isBetween( moment(e.startTime), moment(e.endTime) ) && e !== event ).length;
              return event;
          });

          let newDay = {
              d: day,
              isPast: temp.isBefore( now, 'day' ),
              isToday: temp.isSame( now, 'day' ),
              isSunday: (day.format('ddd') == 'Sun') ? true : false,
              isDisabled: this.isDayDisabled(temp),
              availableTimes: this.times.map( time => moment(time).dayOfYear( day.dayOfYear() ) ),
              events: mappedEvents
          };

          this.days.push(newDay);

          temp.add( 1, 'day' );
          /* switch for new year */
          if( diff > 0 && temp.week() == 1 )
            w = diff;
      } while ( temp.week() <= w );
    },
    goToToday() {
      this.activeDate = moment(this.today);
    },
    prev() {
      const page = this.activeView;
      this.activeDate = moment(this.activeDate.subtract(1, page + 's'));
    },
    next() {
      const page = this.activeView;
      this.activeDate = moment(this.activeDate.add(1,  page+ 's'));
    },
    getDefaultForm(team, day){
      var data = team.schedules.find(x => x.schedule_at == day.d.format('YYYY-MM-DD') )
      if( data )
        return data
      else{
        return {
          team: team.id,
          schedule_at: day.d.format('YYYY-MM-DD'),
          client_id: null,
          schedule_id: null,
          is_all: false
        }
      }
    },
    getSchedule(calenders, schedule){
      for (let index = 0; index < calenders.length; index++) {
        const element = calenders[index];
        if( element.schedule_at == schedule ){
          return element.client_id+' - '+element.client_name+' ('+element.number_of_member+') - ('+element.category+') '+`${(element.remark) ? element.remark : ''}`
        }
      }
    },
    getColor(calenders, schedule){
      for (let index = 0; index < calenders.length; index++) {
        const element = calenders[index];
        if( element.schedule_at == schedule ){
          switch (element.category) {
            case 'C':
              return 'bg-green-600 text-white';
              break;
            case 'F':
              return 'bg-yellow-400 text-white';
              break;
            case 'SO':
              return 'bg-orange-600 text-white';
              break;
            case 'S':
              return 'bg-pink-600 text-white';
              break;
            case 'L':
              return 'bg-purple-900 text-white';
              break;
            case 'T':
              return 'bg-blue-500 text-white';
              break;
            default:
              return 'bg-purple-500 text-white';
              break;
          }
        }
      }
    },
    isHoliday(day){
      for (let index = 0; index < this.publicHolidays.length; index++) {
        const element = this.publicHolidays[index];
        if( day.d.format('YYYY-MM-DD') == element.holiday_on  ){
          return element.description
        }
      }
      return null
    },
    isPreview(calenders, schedule){
      for (let index = 0; index < calenders.length; index++) {
        const element = calenders[index];
        if( element.schedule_at == schedule ){
          return element.is_preview
        }
      }
    },
  }
}
</script>
<style scoped>
.body_page{
  overflow:auto;
  width:100%;
  height:100vh;
}

th {
  border: 1px solid #EAF0F4;
  width: 170px;
  padding-bottom: 10px;
  padding-top: 10px;
  text-transform: none;
  color:#A3A6B4;
}
th {background-color:#f4f8fb;}

table {
  table-layout: fixed;
  width:100%;
}
tbody td {
  padding-left: 4px;
  padding-right: 4px;
  padding-bottom: 10px;
  padding-top: 10px;
  border: 1px solid #EAF0F4;
}
td:first-child, th:first-child {
  position:sticky;
  left:0;
  z-index:1;
  /* background-color:#f4f8fb; */
}
td:first-child{
  background-color:#f4f8fb;
}
thead tr th {
  position:sticky;
  top:0;
}
th:first-child {
  z-index:2;background-color:#f4f8fb;
}
</style>