<template>
  <div class="container mt-5">
    <div class="deliverers-container fade-in">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card card mb-4">
        <div class="order-details card-body card_deliverers">
          <div class="card_data">
            <strong>Pedido:</strong> <span>{{ order.id }} | </span>
            <strong>Entregador:</strong> <span>{{ getDelivererName(order.deliveryId) }} | </span>
            <strong>Restaurante:</strong> <span>{{ order.companyName }} | </span>
            <strong>Cliente:</strong> <span>{{ order.customerName }}</span>
          </div><!--card_data-->
          
          <div class="buttons-group mt-2 card_buttons">
            <i :class="[
              'bi',
              order.completed ? 
              'bi-map-fill'
              :
              (order.hovered_map ? 'bi-map-fill' : 'bi-map'),
              'button_list_custom'
              ]"
            :style="order.completed ? 'cursor: auto' : 'cursor:pointer'"
            @click="order.completed ? 'null' : viewOnMap(order)" 
            @mouseleave="addedClassMap(order)"
            @mouseenter="addedClassMapFill(order)"></i>
            
            <p 
            :class="[
              order.hovered_map
              ? 'open_title_order'
              : 'close_title_order'
            ]"
            >{{ order.completed ? 'Mapa indisponível' : 'Ver no mapa' }}</p>

            <i :class="['bi', order.completed ? 'bi-check-circle-fill' : 'bi-check-circle' ,'button_list_custom']" 
            :style="order.completed ? 'cursor: auto' : 'cursor:pointer'"
            @click="order.completed ? 'null' : completeOrder(order.id)"
            @mouseleave="addedClassTravel(order)"
            @mouseenter="addedClassTravelFill(order)"></i>
            
            <p
            :class="[
              order.hovered_travel 
              ? 'open_title_order'
              : 'close_title_order'
            ]">{{ order.completed ? 'Viagem concluída' : 'Concluir viagem' }}</p>
          </div><!--card_buttons-->
        </div><!--card_deliverers-->
      </div>
    </div>
  </div>
</template>

<script>
import { orders } from '@/services/order';

export default {
  data() {
    return {
      reactiveOrders: orders.map(order => ({
        ...order,
        hovered_map: false,
        hovered_travel: false
      })),
      classMap: 'bi-map',
    };
  },
  props: {
    deliverers: {
      type: Array,
      required: true,
    },
    searchTerm: {
      type: String,
      default: '',
    },
    selectedCouriers: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    filteredOrders() {
      let filteredDeliverers = this.deliverers;

      if (this.selectedCouriers.length > 0) {
        filteredDeliverers = filteredDeliverers.filter(deliverer =>
          this.selectedCouriers.includes(deliverer.name)
        );
      }

      const term = this.searchTerm.trim().toLowerCase();
      if (term) {
        filteredDeliverers = filteredDeliverers.filter(deliverer =>
          deliverer.name.toLowerCase().includes(term)
        );
      }

      const delivererIds = filteredDeliverers.map(deliverer => deliverer.id);
      return this.reactiveOrders.filter(order => delivererIds.includes(order.deliveryId));
    },
  },
  methods: {
    getDelivererName(delivererId) {
      const deliverer = this.deliverers.find(deliverer => deliverer.id === delivererId);
      return deliverer ? deliverer.name : '';
    },
    viewOnMap(order) {
      const deliverer = this.deliverers.find(deliverer => deliverer.id === order.deliveryId);
      this.$emit('showRouteOnMap', deliverer, order);
    },
    completeOrder(orderId) {
      const order = this.reactiveOrders.find(order => order.id === orderId);
      if (order) {
        order.completed = true;
      }
    },
    addedClassMap(order) {
      order.hovered_map = false; 
    },
    addedClassMapFill(order) {
      order.hovered_map = true; 
    },
    addedClassTravel(order) {
      order.hovered_travel = false; 
    },
    addedClassTravelFill(order) {
      order.hovered_travel = true; 
    },
  },
};
</script>

<style scoped>

@keyframes fadeIn {
  from { opacity: 0; } 
  to { opacity: 1; } 
} 

.open_title_order{
  display: flex;
  position: absolute;
  top: 40px;
  background-color: #333;
  color: #f5f5f5;
  padding: 10px;
  border-radius: 7px;
}

.close_title_order{
  display: none;
}

.fade-in { 
  animation: fadeIn 1s ease-in-out;
}

.deliverers-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 600px;
  max-width: 97%;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.order-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.card_deliverers{
  display: flex;
  flex-direction: column;
}

.card_data{
  cursor: auto;
}

.card_data > strong{
  font-size: 17px;
  color: rgb(32, 3, 56);;
}

.card_data > span{
  font-size: 15px;
  color: rgb(32, 3, 56);
}

.card_buttons{
  position: relative;
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding-top: 10px;
  padding-right: 20px;
  justify-content: flex-end;
}

@media (width < 680px){
  .card_data > strong{
    font-size: 15px;
  }

  .card_data > span{
    font-size: 14px;
  }
}

@media (width < 380px){
  .card_data > strong{
    font-size: 14px;
  }

  .card_data > span{
    font-size: 13px;
  }
}
</style>
