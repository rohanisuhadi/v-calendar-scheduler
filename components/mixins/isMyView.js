import moment from 'moment';

export default {
    props: {
        minDate: {
            type: [Date, Object]
        },
        maxDate: {
            type: [Date, Object]
        },
        events: {
            type: Array
        },
        teams: {
            type: Array
        },
        use12: {
            type: Boolean,
            required: true
        }
    },
    methods: {
        isDayDisabled(day) {
            if ( !this.minDate && !this.maxDate )
                return false;

            if ( this.minDate && this.minDate.isAfter(day, 'day') ) return true;
            if ( this.maxDate && this.maxDate.isBefore(day, 'day') ) return true;
        }
    },
    watch: {
        events() {
            this.buildCalendar();
        },
        teams() {
            this.buildCalendar();
        }
    }
}
