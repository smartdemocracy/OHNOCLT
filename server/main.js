import faker from 'faker'
import json2csv from 'json2csv'
import moment  from 'moment'

global.moment = moment
global.faker = faker
global.json2csv = json2csv
const d = new Date();
const _ano = d.getFullYear();
const _mes = d.getMonth();

// moment.js locale configuration
// locale : brazilian portuguese (pt-br)
// author : Caio Ribeiro Pereira : https://github.com/caio-ribeiro-pereira

function _getCSV(cb, mes) {
  moment.defineLocale('pt-br', {
    months: 'janeiro_fevereiro_março_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro'.split('_'),
    monthsShort: 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_'),
    weekdays: 'domingo_segunda-feira_terça-feira_quarta-feira_quinta-feira_sexta-feira_sábado'.split('_'),
    weekdaysShort: 'dom_seg_ter_qua_qui_sex_sáb'.split('_'),
    weekdaysMin: 'dom_2ª_3ª_4ª_5ª_6ª_sáb'.split('_'),
    longDateFormat: {
      LT: 'HH:mm',
      L: 'DD/MM/YYYY',
      LL: 'D [de] MMMM [de] YYYY',
      LLL: 'D [de] MMMM [de] YYYY [às] LT',
      LLLL: 'dddd, D [de] MMMM [de] YYYY [às] LT'
    },
    calendar: {
      sameDay: '[Hoje às] LT',
      nextDay: '[Amanhã às] LT',
      nextWeek: 'dddd [às] LT',
      lastDay: '[Ontem às] LT',
      lastWeek: function () {
        return (this.day() === 0 || this.day() === 6) ?
          '[Último] dddd [às] LT' : // Saturday + Sunday
          '[Última] dddd [às] LT'; // Monday - Friday
      },
      sameElse: 'L'
    },
    relativeTime: {
      future: 'em %s',
      past: '%s atrás',
      s: 'segundos',
      m: 'um minuto',
      mm: '%d minutos',
      h: 'uma hora',
      hh: '%d horas',
      d: 'um dia',
      dd: '%d dias',
      M: 'um mês',
      MM: '%d meses',
      y: 'um ano',
      yy: '%d anos'
    },
    ordinal: '%dº'
  })

  moment.locale('pt-br');

  data = [];
  fields = ['Dia', 'Entrada', 'Saída para almoço', 'Volta do Almoço', 'Fim do Expediente'];
  const ano_mes = `${_ano}-${mes || _mes}`;

  Array.apply(null, new Array(30)).map((e, i) => {
    const dia = i + 1;

    const diaDaSemana = moment(faker.date.between(`${ano_mes}-${dia} 08:00`, `${ano_mes}-${dia} 08:05`)).format('dddd');
    if (diaDaSemana == 'sábado' || diaDaSemana == 'domingo') {
      return data[i] = {
        [fields[0]]: '',
        [fields[1]]: '',
        [fields[2]]: '',
        [fields[3]]: '',
        [fields[4]]: ''
      }
    }

    data[i] = {
      [fields[0]]: moment(faker.date.between(`${ano_mes}-${dia} 08:00`, `${ano_mes}-${dia} 08:05`)).format('dddd'),
      [fields[1]]: moment(faker.date.between(`${ano_mes}-${dia} 08:00`, `${ano_mes}-${dia} 08:05`)).format('HH:mm'),
      [fields[2]]: moment(faker.date.between(`${ano_mes}-${dia} 11:00`, `${ano_mes}-${dia} 11:03`)).format('HH:mm'),
      [fields[3]]: moment(faker.date.between(`${ano_mes}-${dia} 12:03`, `${ano_mes}-${dia} 12:07`)).format('HH:mm'),
      [fields[4]]: moment(faker.date.between(`${ano_mes}-${dia} 17:00`, `${ano_mes}-${dia} 17:05`)).format('HH:mm')
    }
  })

  global.data = data;

  json2csv({ data, fields }, function (err, csv) {
    if (err) console.log(err);
    cb(err, csv);
  });
}

Picker.route('/get/:mes?', (params, req, res, next) => {
  _getCSV((err, csv) => {
    if (err) return res.end();
    res.setHeader('Content-type', 'application/csv');
    res.setHeader('Content-Disposition', `inline; filename="horarios-${_mes}-${_ano}.csv"`);
    res.end(csv);
  }, params.mes);
});
