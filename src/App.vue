<template>
  <div class="container">
    <div class="search-container mb-4">
      <input 
        type="text"
        class="form-control"
        v-model="searchTerm"
        placeholder="Pesquisar entregador pelo nome..."
      >
    </div>

    <EntregadoresList 
      :deliverers="filteredDeliverers" 
      @showRouteOnMap="handleShowRouteOnMap" 
    />
    <div class="container position-fixed shadow-lg rounded p-4 bg-white border border-secondary shadow-lg rounded overflow-hidden d-flex flex-column" style="top: 0px; left: 50%; transform: translateX(-50%);width: 600px; max-width: 97%; height: 600px; margin: 20px auto;" :class="{ 'd-block': showMap, 'd-none': !showMap }">
      <button class="btn btn-danger close-btn" @click="hideMap">✖</button>
      <Map 
        :selectedDeliverer="selectedDeliverer" 
        :order="selectedOrder" 
      />
    </div>
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
      searchTerm: '',
      selectedDeliverer: null,
      selectedOrder: null,
      showMap: false
    };
  },
  computed: {
    filteredDeliverers(){
      console.log(this.searchTerm);
      if(!this.searchTerm.trim()){
        console.log('sem nada exibe todos');
        return this.deliverers;
      }

      const term = this.searchTerm.toLowerCase();
      return this.deliverers.filter(deliverer =>
        deliverer.name.toLowerCase().includes(term)
      );
    }
  },
  methods: {
    handleShowRouteOnMap(deliverer, order) {
      this.selectedDeliverer = deliverer;
      this.selectedOrder = order;
      this.showMap = true;
    },
    hideMap() {
      this.showMap = false;
    }
  },
};
</script>

<style scoped>
  body {
    background-color: #F7FDFF;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 20px;
    border: none;
    width: 43px;
    height: 43px;
    font-size: 14px;
    cursor: pointer;
  }

  .search-container {
    display: flex;
    justify-content: center;
    width: 90%;
    margin: 30px auto 0 auto;
  }

  .form-control {
    max-width: 400px;
    width: 100%;
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
