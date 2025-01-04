<template>
  <div class="container">
    <main>
      <div class="filters">
        <h3>Filtros:</h3>

        <div class="filter_wrapers">
          <div class="form-check filter_single" v-for="courier in deliverers" :key="courier.name">
            <input
              class="form-check-input"
              type="checkbox"
              :checked="selectedCouriers.includes(courier.name)"
              @change="toggleCourierInSearch(courier.name)" 
            />
            <label class="form-check-label"> {{ courier.name }} </label>
          </div>
        </div><!--filter_wrapers-->
      </div><!--filters-->

      <div class="couriers_map">
        <EntregadoresList 
          :deliverers="deliverers" 
          :searchTerm="searchTerm"
          :selectedCouriers="selectedCouriers"
          @showRouteOnMap="handleShowRouteOnMap"
        />

        <Map 
          :selectedDeliverer="selectedDeliverer" 
          :order="selectedOrder" 
        />
      </div><!--couriers_map-->
    </main>
  </div>
</template>

<script>
import EntregadoresList from '@/components/EntregadoresList.vue';
import Map from '@/components/MapComponent.vue';
import { deliverers } from '@/services/order';

export default {
  components: {
    EntregadoresList,
    Map
  },
  data() {
    return {
      deliverers,
      selectedDeliverer: null,
      selectedOrder: null,
      showMap: false,
      selectedCouriers: []
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
    },
  },
};
</script>

<style scoped>
  body {
    background-color: #F7FDFF;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  }

  .search-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin: 30px auto 0 auto;
  }

  .form-control {
    max-width: 400px;
    width: 100%;
  }

  main{
    padding-top: 80px;
    display: flex;
    flex-direction: column;
  }

  .filters{
    padding: 0 45px;
  }

  .filter_wrapers,main > .couriers_map{
    display: flex;
    flex-direction: row;
  }

  .filter_single{
    margin-right: 15px;
  }

  .filter_single:last-child{
    margin-right: 0;
  }

  .checkbox_custom{
    width: 20px;
    height: 20px;
    border: 1px solid #333;
    border-radius: 4px;
    cursor: pointer;
  }

  .checkbox_custom_active{
    width: 20px;
    height: 20px;
    border-radius: 4px;
    background-color: rgb(0,200,200);
    cursor: pointer;
  }

  @media (width < 361px) {
    input::placeholder{
      font-size: 14px;
    }
  }

  @media (width < 290px) {
    input::placeholder{
      font-size: 12px;
    }
  }
</style>
