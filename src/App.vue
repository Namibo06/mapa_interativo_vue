<template>
  <div>
    <main>
      <!--<TesteAtualizacao 
        @atualizar-dados="atualizarDados" 
        @marcar-como-entregue="marcarComoEntregue"
      />-->

      <div class="couriers_map">
        <div class="card_couriers">
            <button type="button" @click="getAllOrdersAndDeliverers">Todos</button>      
            <div class="couriers_options" v-for="courier in this.arrayPedidosMerge" :key="courier.entregador.entregador_id">
              <button 
                type="button"
                @click="mapDeliverers(courier)"  
                :class="selectedCouriersState[courier.entregador.ent_nome] ? 'ball_custom_card_active' : 'ball_custom_card'"
                :style="{
                  'background-color': selectedCouriersState[courier.entregador?.ent_nome] ? courier.entregador.color : '#ffffff',
                  'color': selectedCouriersState[courier.entregador.ent_nome] ? '#ffffff' : '#000000'
                }"
              >
                <div class="card_custom_option" 
              
                  v-if="showHideCardCustomOption"
                  v-show="!selectedCouriersState[courier.entregador.ent_nome]"
                  :style="'background-color:' +  getCourierColor(courier)"></div>
                <span>{{courier.entregador.ent_nome}}</span>
              </button>

            </div><!--couriers_options-->
        </div><!--card_couriers-->

        <Map
          ref="map"
          :selectedDeliverer="selectedDeliverer" 
          :order="selectedOrder" 
          :selectedMultipleCouriers="selectedMultipleCouriers"
          :updatedOrder="updatedOrder"
          :marcadoComoEntregue="marcadoComoEntregue"
        />
      </div><!--couriers_map-->
    </main>
  </div>
</template>

<script>
import Map from '@/components/MapComponent.vue';
import { pedidos } from '@/services/order';
//import TesteAtualizacao from './components/TesteAtualizacao.vue';
import { fixedColors } from './services/fixedColors';

const courierColorsMap = {}; 
let colorIndex = 0;

export default {
  components: {
    //TesteAtualizacao,
    Map
  },
  data() {
    return {
      fixedColors,
      showAllOrders: true,
      showHideCardCustomOption: true,
      pedidos,  
      selectedDeliverer: null,
      selectedOrder: null,
      updateMapDeliverers: null,
      showMap: false,
      selectedCouriers: [],
      selectedMultipleCouriers: [],
      selectedCouriersState: {},
      arrayPedidosMerge: [],
      pedidoProducaoArray: [],
      pedidoSaiuEntregaArray: [],
      pedidoRecebidosArray: [],
      usedColors: [],
      arrayPedidosMergeFacility: [],
      processedEntregador: null,
      validationEntregador: [],
      updatedOrder: null,
      marcadoComoEntregue: null,
    };
  },
  mounted(){
    this.setDeliverersColors();
  },
  created(){
    this.getAllData();
  },
  computed: {
    usedColorsMethod() {
      return this.$root.usedColors || [];
    }
  },
  methods: {
    /*marcarComoEntregue(idPedido){
      this.marcadoComoEntregue = idPedido;
    },*/

    /*atualizarDados(payload) { 
      const updatePedido = (pedidoArray) => { 
        const pedidoIndex = pedidoArray.findIndex(pedido => 
          pedido.pedido_id === payload.pedidoId
        ); 
        
        if (pedidoIndex !== -1) { 
          this.$set(pedidoArray, pedidoIndex, payload); 
          return true; 
        } 
        return false; 
      };

      const pedidoKeys = ['recebidos', 'producao', 'saiuentrega'];
      let updated = false;

      for (const key of pedidoKeys) {
        if (updatePedido(this.pedidos[key])) {
          updated = true;
          break;
        }
      }

      if (!updated) { 
        this.pedidos.producao.push(payload); 
      } 

      this.updatedOrder = payload;  
    },*/

    changeCardCustomOptionShowHide(courierName) {
      this.showHideCardCustomOption = !this.showHideCardCustomOption;
  
      if (this.showHideCardCustomOption) {
        this.$refs.map.showPolylines(courierName);  
      } else {
        this.$refs.map.hidePolylines(courierName); 
      }
    },

    setDeliverersColors() { 
      this.arrayPedidosMerge.forEach(pedido => { 
        if (!pedido.entregador.color) { 
          if (pedido.entregador.ent_nome === "Sem Entregador" ||
              pedido.entregador.ent_nome === "Sem entregador" || 
              pedido.entregador.ent_nome === "sem Entregador" || 
              pedido.entregador.ent_nome === "sem entregador") { 
            pedido.entregador.color = "#808080"; 
          } else { 
            const entregadorId = pedido.entregador.entregador_id; 
            if (!courierColorsMap[entregadorId]) { 
              courierColorsMap[entregadorId] = this.fixedColors[colorIndex];
              colorIndex = (colorIndex + 1) % this.fixedColors.length; 
            } 
            pedido.entregador.color = courierColorsMap[entregadorId]; 
          } 
        } 
      }); 
    },

    getCourierColor(courier) {
      if (
        courier.entregador.ent_nome === "Sem Entregador" ||
        courier.entregador.ent_nome === "Sem entregador" ||
        courier.entregador.ent_nome === "sem Entregador" ||
        courier.entregador.ent_nome === "sem entregador"
      ) {
        courier.entregador.color = "#808080";
      }

      return courier.entregador?.color || '#000000'; 
    },

    getAllData(){
      this.pedidoProducaoArray = this.pedidos.producao || [];
      this.pedidoSaiuEntregaArray = this.pedidos.saiuentrega || [];
      this.pedidoRecebidosArray = this.pedidos.recebidos || [];

      this.arrayPedidosMerge = [];
      this.processedEntregador = new Set();

      const addPedidosComEntrega = (pedidoArray) => {
        pedidoArray.forEach(pedido => {
          if(pedido.ped_entrega !== "S") {
            return;
          }

          const keyEntregador = `${pedido.entregador.entregador_id}`;

          if(this.processedEntregador.has(keyEntregador)){
            return;
          }
          this.processedEntregador.add(keyEntregador);
          
          this.arrayPedidosMerge.push(pedido);
        });
      };

      addPedidosComEntrega(this.pedidoProducaoArray);
      addPedidosComEntrega(this.pedidoSaiuEntregaArray);
      addPedidosComEntrega(this.pedidoRecebidosArray);

      this.arrayPedidosMerge.sort((a, b) => {
        if (a.entregador.ent_nome === "Sem Entregador") return -1;
        if (b.entregador.ent_nome === "Sem Entregador") return 1;
        return 0;
      });

      this.setDeliverersColors();
    },

    handleShowRouteOnMap(courier, order) {
      this.selectedDeliverer = courier;
      this.selectedOrder = order;
      this.showMap = true;
    },
    toggleCourierInSearch(courier) {
      const index = this.selectedCouriers.indexOf(courier);
      if (index === -1) {
        this.selectedCouriers.push(courier);
      } else {
        this.selectedCouriers.splice(index, 1);
      }
      this.selectCourierMap();
    },

    clearMapWithMarkersAndPolylines(){
      this.selectedCouriersState = {};
      this.selectedCouriers = {};

      this.selectedMultipleCouriers = [];
      this.validationEntregador = [];
      this.$refs.map.clearMap();
    },

    mapDeliverers(courier) {
      this.showAllOrders= false;
      if (
        courier.entregador.ent_nome === "Sem Entregador" ||
        courier.entregador.ent_nome === "Sem entregador" ||
        courier.entregador.ent_nome === "sem Entregador" ||
        courier.entregador.ent_nome === "sem entregador"
      ) {
        courier.entregador.color = "#808080"; 
      } else {
        const entregadorId = courier.entregador.entregador_id;
        
        if (!courierColorsMap[entregadorId]) {
          courierColorsMap[entregadorId] = this.fixedColors[colorIndex];
          colorIndex = (colorIndex + 1) % this.fixedColors.length;
        }
        
        courier.entregador.color = courierColorsMap[entregadorId];
      }

      if(this.showAllOrders){
        this.selectedCouriersState[courier.entregador.ent_nome] = false;
        this.selectedCouriersState[courier.entregador.entregador_id] = false; 
      }else{
        this.selectedCouriersState[courier.entregador.ent_nome] = !this.selectedCouriersState[courier.entregador.ent_nome];
        this.selectedCouriersState[courier.entregador.entregador_id] = !this.selectedCouriersState[courier.entregador.entregador_id];
      }
      this.updateMapDeliverers = courier;

      //console.log('selected no mapDeliverer: '+this.selectedCouriersState[courier.entregador.ent_nome]);

      this.selectCourierMap(
        courier.entregador.ent_nome, 
        courier.entregador.entregador_id, 
        courier.entregador.ent_coordenadas, 
        this.selectedCouriersState[courier.entregador.ent_nome],
        courier.entregador.color
      );
    },

    selectCourierMap(courierName, courierId, courierLocation, courierSelectedCard, courierColor) {
      if ( 
        courierName === "Sem Entregador" || 
        courierName === "Sem entregador" || 
        courierName === "sem Entregador" || 
        courierName === "sem entregador" ) { 
          courierColor = "#808080"; 
        } 
      
      this.selectedCouriersState[courierId] = courierSelectedCard;

      const courierKey = `${courierName}.${courierId}.${courierLocation.lat}.${courierLocation.lng}.${courierColor}`;

      let validationEntregadorIndex = this.validationEntregador.indexOf(courierKey);
  
      /**index que não permite quando todos for apertado de ele zerar 
       * 
       * 1. se tiver ativo fica com index -1
       * 2. se tiver desativado fica com index 0
       * 3. o ideal é quando showAllOrders estiver como true, ele ficar com index -1
       * 4. se showAllOrders estiver como false, ele fica com 0
       * 
       * 
       * ---Testes
       *  index -1 fica com showAllOrders false = ativei entregador
       *  index 0 fica com showAllOrders false = desativa entregador
       *  ativei showAllOrders e apertei em ativar entregador ficou = index 0 e showAllOrders false
       * 
      */

      if(courierSelectedCard){
        validationEntregadorIndex = -1;

        if (validationEntregadorIndex !== -1) {
          this.validationEntregador = this.validationEntregador.filter(item => item !== courierKey);
        } else {
          this.validationEntregador.push(courierKey);
          this.selectedMultipleCouriers.push(courierKey);
        }
      }else{
        if (validationEntregadorIndex !== 1) {
          this.validationEntregador = this.validationEntregador.filter(item => item !== courierKey);
        } else {
          this.validationEntregador.push(courierKey);
          this.selectedMultipleCouriers.push(courierKey);
        }
      }

      this.$refs.map.addAllOrdersForDeliverers(this.validationEntregador, courierColor);
    },

    updateMapAccordingToSelection() { 
      this.clearMapWithMarkersAndPolylines();

      if (this.selectedCouriers.length === this.pedidos.producao.length || this.selectedCouriers.length === 0) { 
        this.$refs.map.addAllOrdersToMap(); 
      } else { 
        this.selectedCouriers.forEach(courier => { 
          const deliverer = this.pedidos.producao.find(d => d.entregador.ent_nome === courier); 
          if (deliverer) {   
            this.$refs.map.addAllOrdersForDeliverers([deliverer], deliverer.entregador.color);
          } 
        }); 
      } 
    },

    getAllOrdersAndDeliverers(){
      this.showAllOrders= true;
      this.selectedCouriers = []; 
      this.selectedCouriersState = {};
      this.validationEntregador = [];
      this.$refs.map.addAllOrdersToMap();
    },
  },
};
</script>

<style>

  :root{
    --display-flex: flex;
    --width-height-checkbox: 20px;
  }

  body {
    background-color: #F7FDFF;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  }

  main{
    display: var(--display-flex);
    flex-direction: row;
    justify-content: center;
    position: relative;
  }
  
  .select_options_render{
    position: absolute;
    top: 100px;
    left: 150px;
  }

  .form-check{
    display: flex !important;
    flex-direction: row-reverse !important;
    margin-right: 20px;
  }

  .form-check > input{
    margin-left: 0em !important;
  }

  .form-check > label{
    margin-right: 10px !important;
  }

  .card_couriers {
    position: absolute;
    top: 70px;
    right: 20px;
    z-index: 999;
    height: auto;
    overflow-y: auto;
    max-height: 300px;
    background-color: #FFFFFF;  
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);  
    padding: 20px;
    width: 250px; 
    display: flex;
    flex-direction: column;
  }

  .card_couriers button {
    background-color: #F44336;  
    color: #FFFFFF;
    border: none;
    padding: 10px 15px;
    margin: 5px 0;
    width: 100%;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s ease;
  }

  .card_couriers{
    display: flex;
    flex-direction: column;
  }

  .card_couriers > button,.couriers_options > button{
    padding: 10px 0 10px 30px;
    border: 0;
    background-color: #8209a7; 
    color: #f5f5f5;  
    text-align: left;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 40px;
    transition: box-shadow display opacity 0.2s ease-in-out;
  }

  .couriers_options > button:hover {
    box-shadow: 2px 2px 3px 3px rgba(0,0,0,0.1);  
  }

  .ball_custom_card{
    width: 9px;
    height: 8px;
    background-color: #cac3c3;
    border-radius: 60%;
    margin-left: 5px;
  }

  .ball_custom_card_active{
    width: 9px;
    height: 8px;
    border-radius: 60%;
    margin-left: 5px;
    background-color: #8209a7;
  }

  .couriers_options{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .card_custom_option{
    width: 25px;
    height: 4px;
    border-radius: 5px;
    margin-right: 10px;
  }

  .filters{
    width: 1050px;
    max-width: 99%;
    margin: 0 auto;
  }

  .filters > h3{
    letter-spacing: 7%;
    font-size: 27px;
    font-weight: 400;
    color: rgb(32, 3, 56);
  }

  .filter_wrapers,main > .couriers_map{
    display: var(--display-flex);
    flex-direction: row;
    position: relative;
    z-index: 0;
    width: 100%;
    height: 100%;
  }

  .filter_single{
    margin-right: 15px;
  }

  .filter_single:last-child{
    margin-right: 0;
  }

  .filter_single > input{
    cursor: pointer;
  }

  label{
    color: rgb(32, 3, 56);
  }

  .clear_map{
    position: relative;
    top: -5px;
    left: var(--width-height-checkbox);
    transition: top 0.2s ease-in;
  }

  .clear_map:active{
    top: -3px;
  }

  @media (width < 1130px){
    .filters{
      width: auto;
      max-width: auto;
      padding-left: 30px;
      margin: 0;
    }
  }

  @media (width < 1000px) {
    .filters{
      padding-left: 85px;
    }

    .filter_wrapers,main > .couriers_map{
      display: flex;
      flex-direction: column-reverse;
    }

    .filter_wrapers{
      display: flex;
      flex-direction: row;
    }
  }

  @media (width < 700px) {
    .filters{
      padding-left: 65px;
    }
  }

  @media (width < 640px) {
    .filters{
      padding-left: 30px;
    }
  }

  @media (width < 540px) {
    .filters{
      padding-left: 25px;
    }
  }

  @media (width < 420px) {
    .filters{
      padding-left: var(--width-height-checkbox);
    }

    .filter_wrapers{
      display: flex;
      flex-direction: column;
    }

    .filter_single:nth-child(1){
      margin-top: 10px;
    }

    .filter_single > input{
      cursor: pointer;
    }

    .filter_single > input{
      margin-bottom: 8px;
    }

    .filter_single > input:last-child{
      margin-bottom: 0;
    }

    .clear_map{
      top: 10px;
      left: -33%;
      margin: 15px auto;
    }

    .clear_map:active{
      top: 12px;
    }
  }

  @media (width < 361px) {
    input::placeholder{
      font-size: 14px;
    }

    .filters{
      padding-left: 15px;
    }

    .clear_map{
      left: -29%;
    }
  }

  @media (width < 290px) {
    input::placeholder{
      font-size: 12px;
    }

    .filters{
      padding-left: 10px;
    }

    .clear_map{
      left: -26%;
    }
  }
</style>
