import moment from 'moment';

export const formattedDate = (date) => moment(date).format('YYYY-MM-DD');

export const getSpecificDate = (days) => moment().subtract(days, 'days').calendar();