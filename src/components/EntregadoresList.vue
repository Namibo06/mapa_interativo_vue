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
            <b-button variant="outline-primary" @click="viewOnMap(order)" :disabled="order.completed" class="btn-sm button_list_custom">
              Ver no Mapa
            </b-button>
            <b-button variant="success" @click="completeOrder(order.id)" :disabled="order.completed" class="complete-trip-btn btn-sm position-relative button_list_custom">
              {{ order.completed ? 'Concluído' : 'Concluir Viagem' }}
            </b-button>
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
      reactiveOrders: [...orders],
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
  },
};
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; } 
  to { opacity: 1; } 
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

.card_data > strong{
  font-size: 17px;
}

.card_data > span{
  font-size: 15px;
}

.card_buttons{
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding-top: 10px;
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

  .card_buttons > .button_list_custom{
    width: 100px;
    height: 30px;
    font-size: 12px;
    padding: 0 5px;
  }
}

@media (width < 330px){
  .card_buttons{
    display: flex;
    flex-direction: column;
  }

  .card_buttons > .button_list_custom{
    width: 90%;
    height: 30px;
    font-size: 14px;
    
    margin: 0 auto;
  }
}
</style>
