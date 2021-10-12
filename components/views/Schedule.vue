<template>
  <section class="v-cal-content">
    <div class="v-cal-weekdays">
      <div class="v-cal-weekday__wrapper">
        <div class="w-40 p-3">Team</div>
        <div class="w-40 p-3" v-for="day in days">{{ day.d.format('ddd DD/MM') }}</div>
      </div>
    </div>
    <div class="v-cal-days">
      <div class="v-cal-times">
        <div class="w-40 p-2 border-b border-gray-400" v-for="team in teams">{{ team.name }} ({{ team.type }})</div>
      </div>
      <div class="v-cal-days__wrapper">
        <div class="v-cal-day w-40 p-2" v-for="day in days" :class="{ 'is-today': day.isToday, 'is-disabled': day.isDisabled, 'is-sunday' : day.isSunday }">
          <div class="v-cal-day__hour-block"  v-for="time in teams">
            <span class="v-cal-day__hour-block-fill">{{ time }}</span>
            <div class="v-cal-day__hour-content text-center">
              {{ time.type }}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </section>
</template>

<script>
    import moment from 'moment';
    import { EventBus } from '../EventBus';
    import EventItem from '../EventItem';
    import IsView from '../mixins/IsView';
    import ShowsTimes from '../mixins/ShowsTimes';

    export default {
        name: "schedule",
        mixins: [ IsView, ShowsTimes ],
        components: { EventItem },
        data() {
            return {
                days: [],
            }
        },
        mounted() {
            this.buildCalendar();
        },
        methods: {
            timeClicked(data) {
                EventBus.$emit('time-clicked', data)
            },
            buildCalendar() {

                this.days = [];

                let now = moment();

                let temp = moment( this.activeDate ).day(moment.localeData().firstDayOfWeek());
                
                // let w = temp.week();
                // console.log(temp.format('ddd  DD/MM'));
                let w = moment( this.activeDate ).day(moment.localeData().firstDayOfWeek()).add(7, 'day').week();
                // console.log(w);
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

                    // console.log(mappedEvents);

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

                    console.log(temp.format('ddd'));

                    console.log(temp.week());
                    
                    console.log(w);

                } while ( temp.week() <= w );
            }
        },
        watch: {
            timeRange() {
                this.buildCalendar();
            }
        }
    }
</script>

<style scoped>

</style>
