<template>
    <main id="tela">
      <form @submit.prevent="enviarFormSemAtualizar">
        <input type="hidden" v-model="idPedido" />
        <input type="text" v-model="clienteName" placeholder="Nome do Cliente" required />
        <input type="text" v-model="cep" placeholder="Cep" />
        <input type="text" v-model="cidade" placeholder="Cidade" />
        <input type="text" v-model="bairro" placeholder="Bairro" />
        <input type="text" v-model="logradouro" placeholder="Logradouro" />
        <input type="text" v-model="numero" placeholder="Número" />
        <input type="text" v-model="complemento" placeholder="Complemento" />
        <input type="text" v-model="pontoReferencia" placeholder="Ponto de Referência" />
        <input type="text" v-model="valorEntrega" placeholder="Valor Total" />
        <input type="datetime-local" v-model="dataHoraEntrega" />
  
        <button type="submit">Atualizar</button>

        <button type="button">Marcar como Entregue</button>
      </form>
    </main>
</template>
  
<script>
  export default {
    data() {
      return {
        clienteName: 'Joca',
        idPedido: "015697",
        cep: '44095400',
        cidade: 'Feira de Santana',
        bairro: 'Aviário',
        logradouro: 'Estrada Chácara Brandão',
        numero: 'S/N',
        complemento: 'Condominio Rio de Contas',
        pontoReferencia: 'Próximo ao parque da cidade',
        valorEntrega: '75.90',
        dataHoraEntrega: ''
      };
    },
    methods: {
      enviarFormSemAtualizar() {
        const payload = {
          idPedido: this.idPedido,
          clienteName: this.clienteName,
          cep: this.cep,
          cidade: this.cidade,
          bairro: this.bairro,
          logradouro: this.logradouro,
          numero: this.numero,
          complemento: this.complemento,
          pontoReferencia: this.pontoReferencia,
          valorEntrega: this.valorEntrega,
          dataHoraEntrega: this.dataHoraEntrega
        };
  
        this.$emit('atualizar-dados', payload);
      }
    }
  };
</script>
  
<style scoped>
  #tela{
    width: 450px;
  }
</style>