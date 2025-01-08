<template>
  <div>
    <main>

      <div class="couriers_map">
        <!--<EntregadoresList 
          :deliverers="deliverers" 
          :selectedCouriers="selectedCouriers"
          @showRouteOnMap="handleShowRouteOnMap"
        />-->

        <div class="card_couriers">
            <button type="button" @click="getAllOrdersAndDeliverers">Todos</button>
            <button type="button" @click="getAllOrdersWithoutPerson">Sem entregador</button>
            <div class="couriers_options" v-for="courier in deliverers" :key="courier.name">
              <button 
                type="button"
                @click="mapDeliverers(courier)"  
                :class="selectedCouriersState[courier.id] ? 'ball_custom_card_active' : 'ball_custom_card'"
                :style="
                'background-color:'+
                  [
                    selectedCouriersState[courier.id] ?
                    courier.color :
                    '#ffffff'
                  ] + ';'+
                  'color:'+ 
                  [
                    selectedCouriersState[courier.id] ?
                    '#ffffff' :
                    '#000000'
                  ]
                "
              >
                <div class="card_custom_option" 
                  v-show="!selectedCouriersState[courier.id]"
                  :style="'background-color:'+ [courier.color] + ';'"></div><!--card_custom_option-->

                <span>{{ courier.name }}</span>
              </button>
            </div>

        </div><!--card_couriers-->

        <Map
          ref="map"
          :selectedDeliverer="selectedDeliverer" 
          :order="selectedOrder" 
          :selectedMultipleCouriers="selectedMultipleCouriers"
          
        />
      </div><!--couriers_map-->

    </main>
  </div>
</template>

<script>
//import EntregadoresList from '@/components/EntregadoresList.vue';
import Map from '@/components/MapComponent.vue';
import { deliverers } from '@/services/order';

export default {
  components: {
    //EntregadoresList,
    Map
  },
  data() {
    return {
      deliverers,
      selectedDeliverer: null,
      selectedOrder: null,
      updateMapDeliverers: null,
      showMap: false,
      selectedCouriers: [],
      selectedMultipleCouriers: [],
      selectedCouriersState: {},
    };
  },
  methods: {
    handleShowRouteOnMap(deliverer, order) {
      this.selectedDeliverer = deliverer;
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
      this.$refs.map.clearMap();
    },

    mapDeliverers(deliverer) {
      this.selectedCouriersState[deliverer.id] = !this.selectedCouriersState[deliverer.id];

      this.updateMapDeliverers = deliverer;
      this.selectCourierMap(deliverer.name, deliverer.id, deliverer.currentLocation, deliverer.color, this.selectedCouriersState[deliverer.id]);
    },


    updateMapAccordingToSelection() { 
      this.clearMapWithMarkersAndPolylines();

      if (this.selectedCouriers.length === this.deliverers.length || this.selectedCouriers.length === 0) { 
        this.$refs.map.addAllOrdersToMap(); 
      } else { 
        this.selectedCouriers.forEach(courier => { 
          const deliverer = this.deliverers.find(d => d.name === courier); 
          if (deliverer) { 
            this.$refs.map.addAllOrdersForDeliverers(deliverer); 
          } 
        }); 
      } 
    },

    getAllOrdersAndDeliverers(){
      this.selectedCouriers = []; 
      this.selectedCouriersState = {}
      this.$refs.map.addAllOrdersToMap();
    },

    getAllOrdersWithoutPerson(){
      //this.selectedMultipleCouriers = [];
      this.$refs.map.searchOrdersWithoutPerson();
    },

    selectCourierMap(courier, courierId, courierLocation, courierColor, courierSelectedCard) {
      this.selectedCouriersState[courierId] = courierSelectedCard;

      const courierKey = `${courier}.${courierId}.${courierLocation.lat}.${courierLocation.lng}.${courierColor}`;

      const index = this.selectedMultipleCouriers.indexOf(courierKey);

      if (index !== -1) {
        this.selectedMultipleCouriers = this.selectedMultipleCouriers.filter(item => item !== courierKey);
      } else {
        this.selectedMultipleCouriers.push(courierKey);
      }

      this.$refs.map.addAllOrdersForDeliverers(this.selectedMultipleCouriers);
    }
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

  main > .couriers_map{
    display: var(--display-flex);
    flex-direction: row;
    position: relative;
    z-index: 0;
    width: 100%;
    height: 100%;
  }

  @media (width < 580px){
    .card_couriers {
      top: 80px;
      right: 15px;
      height: 250px; 
      padding: 15px;
      width: 240px; 
    }

    .card_couriers > button,.couriers_options > button{
      height: 37px;
    }
  }

  @media (width < 390px){
    .card_couriers {
      top: 85px;
      right: 12px;
      height: 240px; 
      padding: 14px;
      width: 230px; 
    }

    .card_couriers > button,.couriers_options > button{
      height: 35px;
    }
  }
</style>
