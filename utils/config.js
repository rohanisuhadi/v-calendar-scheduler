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
            id: 1,
            name: 'Japra',
            type: 'Supplement'
        },
        {
            id: 2,
            name: 'Narto',
            type: 'Supplement'
        }
    ]
};

export default config

export const setOptions = options => { config = options };
