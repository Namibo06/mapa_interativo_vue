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
              >
                <div class="card_custom_option"
                  :style="'background-color:'+ [courier.color] + ';'"></div><!--card_custom_option-->

                <span>{{ courier.name }}</span>
              </button>

              <div id="[courier.id]" :class="selectedCouriersState[courier.id] ? 'ball_custom_card_active' : 'ball_custom_card'"></div>
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
      //this.selectedMultipleCouriers = [];
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
    padding: 8px 0 8px 30px;
    border: 0;
    background-color: #8209a7; 
    color: #f5f5f5;  
    text-align: left;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .couriers_options button:hover {
    background-color: #FF9800;  
  }

  .couriers_options button.selected {
    background-color: red; 
    color: #FFFFFF;  
    font-size: 32px;
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
