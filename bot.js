const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();
const axios = require('axios');
const token = "k2nx65j0b8ubp8f16ilrgil4vsxl7vl7rjrxsudd"
const apiUrl = 'http://localhost:8080/agendamento';

let dia;
let horario;
let etapaAgendamento = 0;
let horarioSelecionado;
let erro = 'Desculpe, não entendi sua escolha. Por favor, digite uma opção válida.'

async function atualizarStatusPorId(id, novoStatus) {
	try {
		await axios.patch(`${apiUrl}/${id}`, {
			"data": { "status": novoStatus }
		}, {
			params: {
				status: novoStatus
			}
		});

		console.log(`Status do ID ${id} atualizado para "${novoStatus}".`);
	} catch (error) {
		console.error('Erro na atualização:', error.message);
	}
}

async function listar() {
	try {
		const response = await axios.get(apiUrl);
		return response.data;
	} catch (error) {
		console.error('Erro ao listar agendamentos:', error);
		throw error;
	}
}

async function listarPorId(id) {
	try {
		const response = await axios.get(`${apiUrl}/${id}`);
		return response.data;
	} catch (error) {
		console.error(`Erro ao listar agendamento com ID ${id}:`, error);
		throw error;
	}
}


async function listarDisponiveis() {
	try {
		const response = await axios.get(`${apiUrl}/disponiveis`);
		return response.data;
	} catch (error) {
		console.error('Erro ao listar agendamentos disponíveis:', error);
		throw error;
	}
}

async function listarDisponiveisDia(dia) {
	try {
		const response = await axios.get(`${apiUrl}/disponiveis/${dia}`);
		return response.data;
	} catch (error) {
		console.error(`Erro ao listar agendamentos disponíveis para o dia ${dia}:`, error);
		throw error;
	}
}
async function listarHorariosDisponiveis(numero, dia) {
	try {
		const horariosDisponiveis = await listarDisponiveisDia(dia);

		if (horariosDisponiveis.length === 0) {
			client.sendMessage(numero, `Não há horários disponíveis na ${dia}.`);
		} else {
			let horariosDisponiveisTexto = `Horários disponíveis na ${dia}:\n`;

			for (let i = 0; i < horariosDisponiveis.length; i++) {
				horariosDisponiveisTexto += `${horariosDisponiveis[i].id} - (${horariosDisponiveis[i].horaInicio} - ${horariosDisponiveis[i].horaFim})\n`;
			}

			client.sendMessage(numero, horariosDisponiveisTexto);
		}
	} catch (error) {
		console.error('Erro:', error.message);
		client.sendMessage(numero, 'Ocorreu um erro ao buscar os horários disponíveis. Por favor, tente novamente mais tarde.');
	}
}

function setHorarioSelecionado(horario) {
	horarioSelecionado = horario;
}

client.on('qr', qr => {
	qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
	console.log('Client is ready!');
});

client.on('message', message => {
	if (etapaAgendamento === 0 && message.body == "/start") {
		message.reply('Olá! Bem-vindo ao Laboratório de Informática! Em que posso ajudar você hoje? \n1. Reserva de horários.');
		etapaAgendamento = 1;
	} else if (etapaAgendamento === 0 && message.body == "/listar") {
		listar()
			.then(agendamentos => {
				const agendamentosStr = JSON.stringify(agendamentos, null, '\t');

				message.reply(`${agendamentosStr}`)
			})
			.catch(error => {
				console.error('Erro geral:', error);
			});
	}

	console.log('LOG: ETAPA AGENDAMENTO: ' + etapaAgendamento);
});

client.on('message', async message => {
	console.log(message.body);

	if (message.body === '!ping') {
		message.reply('pong');
	} else if (etapaAgendamento === 1 && message.body === '1') {
		message.reply(`Claro, ficarei feliz em ajudar! Para agendar um laboratório, precisamos verificar a disponibilidade. 
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
				dia = 'segunda';
				break;
			case '2':
				dia = 'terca';
				break;
			case '3':
				dia = 'quarta';
				break;
			case '4':
				dia = 'quinta';
				break;
			case '5':
				dia = 'sexta';
				break;
			default:
				message.reply(erro);
				return;
		}

		console.log('LOG: ETAPA AGENDAMENTO: ' + etapaAgendamento);

		message.reply(`Você escolheu ${dia}. Pronto, agora escolha um horário disponível abaixo (escreva o número a sua esquerda):`);

		listarHorariosDisponiveis(message.from, dia); // Enviar a lista de horários disponíveis

		etapaAgendamento = 3;
		console.log('LOG: ETAPA AGENDAMENTO: ' + etapaAgendamento);
	} else if (etapaAgendamento === 3) {
		const horarioSelecionado = await listarPorId(parseInt(message.body));
		setHorarioSelecionado(horarioSelecionado);
		horario = horarioSelecionado.horaInicio + ' - ' + horarioSelecionado.horaFim;

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
				// Atualizar status do horário para "indisponível"
				if (horarioSelecionado) {
					console.log(horarioSelecionado.id);
					atualizarStatusPorId(horarioSelecionado.id, false);
				}
				message.reply('Horário confirmado!');
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

client.on('message', message => {
	if (etapaAgendamento === 0 && message.body == "/listar") {
		listar()
			.then(agendamentos => {
				client.sendMessage(message.from, agendamentos)
			})
			.catch(error => {
				console.error('Erro geral:', error);
			});
	}
});

client.initialize();
