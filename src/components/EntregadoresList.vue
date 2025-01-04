<template>
  <div class="container mt-5">
    <div class="deliverers-container fade-in">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card card mb-4">
        <div class="card-header p-3 d-flex justify-content-between align-items-center">
          <h3 class="order-id card-title">Pedido: {{ order.id }}</h3>
        </div>

        <div class="order-details card-body card_deliverers">
          <div class="card_data">
            <p><strong>Entregador:</strong> {{ getDelivererName(order.deliveryId) }}</p>
            <p><strong>Empresa:</strong> {{ order.companyName }}</p>
            <p><strong>Cliente:</strong> {{ order.customerName }}</p>
          </div>
          
          <div class="buttons-group mt-2 card_buttons">
            <b-button variant="outline-primary" @click="viewOnMap(order)" :disabled="order.completed" class="btn-sm">
              Ver no Mapa
            </b-button>
            <b-button variant="success" @click="completeOrder(order.id)" :disabled="order.completed" class="complete-trip-btn btn-sm position-relative">
              {{ order.completed ? 'Concluído' : 'Concluir Viagem' }}
            </b-button>
          </div>
        </div>
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
  flex-direction: row;
  justify-content: space-between;
}

.card_buttons{
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-left: 10px;
}
</style>
