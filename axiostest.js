const axios = require('axios');

const apiUrl = 'http://localhost:8080/agendamento';

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


console.log('@@@@@@')

listarPorId(2)
    .then(agendamentos => {
        console.log('Agendamentos:', agendamentos);
    })
    .catch(error => {
        console.error('Erro geral:', error);
    });


listarDisponiveisDia('segunda').then(agendamentos => {
    console.log('Agendamentos:', agendamentos);
})
    .catch(error => {
        console.error('Erro geral:', error);
    });