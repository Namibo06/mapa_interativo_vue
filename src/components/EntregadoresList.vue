<template>
  <div class="container mt-5">
    <div class="deliverers-container fade-in">
      <div v-for="deliverer in deliverers" :key="deliverer.id" class="deliverer-card card mb-4">
        <div class="card-header p-4 d-flex justify-content-between align-items-center">
          <h3 class="deliverer-name card-title">{{ deliverer.name }}</h3>
          <b-button class="card-header-btn" @click="viewRoutes(deliverer.id)" variant="primary">Visualizar Rotas</b-button>
        </div>

        <div v-if="selectedDeliverer === deliverer.id" class="orders-list card-body">
          <ul>
            <li v-for="order in getOrdersForDeliverer(deliverer.id)" :key="order.id" class="order-item list-group-item">
              <strong>Pedido:</strong> {{ order.id }} |
              <strong>Empresa:</strong> {{ order.companyName }} |
              <strong>Cliente:</strong> {{ order.customerName }}
              <div class="buttons-group mt-2">
                <b-button variant="outline-primary" @click="viewOnMap(deliverer, order)" :disabled="order.completed" class="btn-sm">
                  Ver no Mapa
                </b-button>
                <b-button variant="success" @click="completeOrder(order.id)" :disabled="order.completed" class="complete-trip-btn btn-sm position-relative">
                  {{ order.completed ? 'Concluído' : 'Concluir Viagem' }}
                </b-button>
              </div>
            </li>
          </ul>
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
      selectedDeliverer: null,
      reactiveOrders: [],
    };
  },
  props: {
    deliverers: {
      type: Array,
      required: true,
    },
  },
  created() {
    this.reactiveOrders = [...orders];
  },
  methods: {
    viewRoutes(delivererId) {
      this.selectedDeliverer = delivererId;
    },
    getOrdersForDeliverer(delivererId) {
      return this.reactiveOrders.filter(order => order.deliveryId === delivererId);
    },
    viewOnMap(deliverer, order) {
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
  from {
    opacity: 0; 
  } 
  to { 
    opacity: 1; 
  } 
} 

.fade-in { 
  animation: fadeIn 1s ease-in-out;
}

button:focus {
  outline: none;
  box-shadow: none;
}

button:active {
  position: relative;
  top: 1px;
}

.deliverers-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.deliverer-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 600px;
  max-width: 97%;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.deliverer-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.orders-list {
  padding-left: 20px;
  position: relative;
}

.order-item {
  margin-bottom: 30px;
  font-size: 0.95rem;
}

.order-item:nth-child(1) {
  margin: 40px 0 30px 0;
}

.complete-trip-btn{
  left: 15px;
}

@media (max-width: 768px) {
  .orders-list {
    padding-left: 0px;
  }
}

@media (max-width: 550px) {
  .deliverers-container {
    padding: 20px;
  }

  .deliverer-card {
    width: 600px;
    max-width: 99%;
  }

  .deliverer-name {
    font-size: 28px;
    letter-spacing: 0.7px;
  }

  .routes-button {
    padding: 8px;
    font-size: 14px;
    letter-spacing: 0.5px;
  }

  .orders-list {
    padding: 0 30px 0 0;
  }

  .order-item {
    font-size: 15px;
  }

  .view-map-button,
  .complete-order-button {
    padding: 6px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .deliverers-container {
    padding: 5px;
  }

  .deliverer-name {
    font-size: 21px;
  }

  .card-header-btn{
    width: 120px;
    font-size: 13px;
  }
}

@media (max-width: 361px) {
  .deliverer-name {
    font-size: 17px;
  }

  .card-header-btn{
    width: 110px;
    font-size: 11px;
  }

  .routes-button {
    padding: 6px;
    font-size: 12px;
  }

  .orders-list {
    padding: 0px;
    gap: 0;
  }

  ul{
    padding: 0 20px;
  }

  .order-item {
    font-size: 13px;
  }

  .view-map-button,
  .complete-order-button {
    padding: 4px;
    font-size: 12px;
  }
}

@media (width < 335px) {
  .p-4{
    padding: 0.9rem 0.5rem !important;
  }

  .deliverer-name {
    font-size: 15px;
  }

  .card-header-btn{
    width: 100px;
    font-size: 10px;
    padding: 6px 0px;
  }

  ul{
    padding: 0 10px;
  }
  
  .order-item {
    margin-bottom: 40px;
  }

  .order-item:nth-child(1) {
    margin: 40px 0;
  }

  .complete-trip-btn{
    left: 0;
    margin-top: 10px;
  }

  .buttons-group{
    display: flex;
    flex-direction: column;
  }
}
</style>
