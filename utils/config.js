import moment from 'moment';

export const defaultLabels = {
    today: 'Today',
    back: 'Back',
    next: 'Next',
    month: 'Month',
    week: 'Week',
    schedule: 'Schedule',
    day: 'Day',
    all_day: 'all day'
};

export const defaultViews = ['month', 'week', 'day', 'schedule'];

let config = {
    locale: 'en',
    showTodayButton: true,
    minDate: null,
    maxDate: null,
    labels: defaultLabels,
    timeRange: [0, 23],
    availableViews: defaultViews,
    initialDate: new Date(),
    initialView: 'month',
    use12: false,
    showTimeMarker: true,
    eventDisplay: null,
    teams: [
        {
          name: 'Rohani Suhadi',
          type: 'Beginner',
          schedules: [
            '2021-10-11', '2021-10-12'
          ]
        },
        {
            name: 'Supriyanto',
            type: 'Beginner',
            schedules: [
              '2021-10-11', '2021-10-12', '2021-10-16'
            ]
        }
    ]
};

export default config

export const setOptions = options => { config = options };
