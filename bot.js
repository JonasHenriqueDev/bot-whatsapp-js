const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();
let dia;
let horario;
let etapaAgendamento = 0;
let erro = 'Desculpe, não entendi sua escolha. Por favor, digite uma opção válida.'

client.on('qr', qr => {
	qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
	console.log('Client is ready!');
});

client.on('message', message => {
	if (etapaAgendamento === 0) {
		message.reply('Olá! Bem-vindo ao Laboratório de Informática! Em que posso ajudar você hoje? \n1. Reserva de horários.');
		etapaAgendamento = 1;
	}

	console.log('LOG: ETAPA AGENDAMENTO: ' + etapaAgendamento);
});

client.on('message', message => {
	console.log(message.body);

	if (message.body === '!ping') {
		message.reply('pong');
	} else if (etapaAgendamento === 1 && message.body === '1') {
		message.reply(`Claro, ficarei feliz em ajudar! Para agendar um computador, precisamos verificar a disponibilidade. 
Poderia me informar o dia em que deseja agendar?

1 - Segunda-Feira
2 - Terça-Feira
3 - Quarta-Feira
4 - Quinta-Feira
5 - Sexta-Feira`);

		etapaAgendamento = 2;
	} else if (etapaAgendamento === 2 && ['1', '2', '3', '4', '5'].includes(message.body)) {
		switch (message.body) {
			case '1':
				dia = 'Segunda-Feira';
				break;
			case '2':
				dia = 'Terça-Feira';
				break;
			case '3':
				dia = 'Quarta-Feira';
				break;
			case '4':
				dia = 'Quinta-Feira';
				break;
			case '5':
				dia = 'Sexta-Feira';
				break;
			default:
				message.reply(erro);
				return;
		}

		console.log('LOG: ETAPA AGENDAMENTO: ' + etapaAgendamento);

		message.reply(`Você escolheu ${dia}. Pronto, agora escolha um horário disponível abaixo:
1 - (08:00 - 09:00)
2 - (09:00 - 10:00)
3 - (10:00 - 11:00)
4 - (11:00 - 12:00)
5 - (14:00 - 15:00)`);
		etapaAgendamento = 3;
		console.log('LOG: ETAPA AGENDAMENTO: ' + etapaAgendamento);

	} else if (etapaAgendamento === 3 && ['1', '2', '3', '4', '5'].includes(message.body)) {
		switch (message.body) {
			case '1':
				horario = '08:00 - 09:00';
				break;
			case '2':
				horario = '09:00 - 10:00';
				break;
			case '3':
				horario = '10:00 - 11:00';
				break;
			case '4':
				horario = '11:00 - 12:00';
				break;
			case '5':
				horario = '14:00 - 15:00';
				break;
			default:
				message.reply(erro);
				return;
		}

		message.reply(`Certo! Seu horário escolhido foi:
Dia: ${dia}
Horário: ${horario}

Confirma?
1. Sim
2. Cancelar`);
		etapaAgendamento = 4;
		console.log('LOG: ETAPA AGENDAMENTO: ' + etapaAgendamento);
	} else if (etapaAgendamento === 4 && ['1', '2'].includes(message.body)) {
		switch (message.body) {
			case '1':
				message.reply('Horário confirmado!');
				// Realize aqui a lógica para agendar o horário (por exemplo, salvar em um banco de dados ou arquivo)
				break;
			case '2':
				message.reply('Agendamento cancelado!');
				break;
			default:
				message.reply(erro);
				return;
		}
		etapaAgendamento = 0;
		console.log('LOG: ETAPA AGENDAMENTO: ' + etapaAgendamento);
	}
});

client.initialize();
