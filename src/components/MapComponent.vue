<template>
  <div id="map"></div>
</template>

<script>
import { Loader } from '@googlemaps/js-api-loader';
import { toRaw } from 'vue';
import { orders } from '@/services/order';

let loader;

export default {
  props: {
    selectedDeliverer: {
      type: Object,
      default: null
    },
    order: {
      type: Object,
      default: null,
    },
    updateMapDeliverers: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      map: null,
      directionsService: null,
      markers: [], 
      polylines: [], 
      movementInterval: null, 
      destinationReached: false,
      orders: orders
    };
  },
  watch: {
    selectedDeliverer(newValue) {
      if (this.order) {
        this.updateMap(newValue, this.order);
      }
    },
    order(newValue) {
      if (newValue) {
        this.updateMap(this.selectedDeliverer, newValue);
      }
    },
    updateMapDeliverers(newValue){
      if(newValue){
        this.addAllOrdersForDeliverer(newValue);
      }
    }
  },
  mounted() {
    this.initMap().then(() => {
      this.addAllOrdersToMap();
    });
  },
  beforeUnmount() {
    clearInterval(this.movementInterval);
  },
  methods: {
    async initMap() {
      if (!loader) {
        loader = new Loader({
          apiKey: process.env.VUE_APP_GOOGLE_MAPS_API_KEY,
          libraries: ["places", "geometry"] 
        });
      }

      await loader.load();

      if (typeof google === "undefined") {
        console.error("Google Maps API não carregou corretamente");
        return;
      }

      if (this.map) {
        this.map = null; // Limpa a instância anterior
      }

      this.map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -12.2666, lng: -38.9663 },
        zoom: 14,
        streetViewControl: true,
      });

      this.directionsService = new google.maps.DirectionsService();
    },

    drawRouteForDeliverer(deliverer, order) {
      this.clearMap();

      this.addMarker(order.restaurantLocation, "R", 'restaurant', `restaurant-${order.id}`);

      this.addMarker(order.restaurantLocation, "E", 'deliverer', `deliverer-${deliverer.id}`);
      
      this.addMarker(order.customerLocation, "C", 'customer', `customer-${order.id}`);

      const request = {
        origin: order.restaurantLocation,
        destination: order.customerLocation,
        waypoints: [],
        travelMode: google.maps.TravelMode.DRIVING
      };

      // Solicitar rota ao DirectionsService
      this.directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map: this.map,
            suppressMarkers: true,
          });

          directionsRenderer.setDirections(result);

          this.polylines.push(directionsRenderer);

          const route = result.routes[0].overview_path;
          this.moveDelivererAlongPath(deliverer, route);
        } else {
          console.error("Não foi possível calcular a rota:", status);
        }
      });
    },

    addMarker(position, title, type, id) {
      const existingMarker = this.markers.find(marker => marker.id === id);
      if (existingMarker) {
        existingMarker.marker.setMap(null);
        this.markers = this.markers.filter(marker => marker.id !== id);
      }

      const icons = { 
        deliverer: { 
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: 'white',
          fillOpacity: 1,
          scale: 8,
          strokeColor: 'black',
          strokeWeight: 2
        }, 
        restaurant: { 
          url: '', 
          scaledSize: new google.maps.Size(32, 32), 
        }, 
        customer: { 
          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }, 
      };

      const marker = new google.maps.Marker({
        position: position,
        map: this.map,
        title: title,
        icon: icons[type] || icons.deliverer
      });

      this.markers.push({ id, marker });
    },

    addAllOrdersToMap() {
      this.orders.forEach(order => {
        this.addMarker(order.customerLocation, "C", "customer", `customer-${order.id}`);
      });
    },

    addAllOrdersForDeliverer(deliverer) { 
      this.clearMap(); 
      const delivererOrders = this.orders.filter(order => order.deliveryId === deliverer.id); 

      delivererOrders.forEach(order => { 
        this.addMarker(order.restaurantLocation, "R", "restaurant", `restaurant-${order.id}`); 
        this.addMarker(order.customerLocation, "C", "customer", `customer-${order.id}`); 
      }); 
    },

    clearPolylines() { 
      this.polylines.forEach(polyline => polyline.setMap(null)); 
      this.polylines = []; 
    }, 
    
    clearMarkers() { 
      this.markers.forEach(({ marker }) => {
        if (marker) {
          toRaw(marker).setMap(null);
        }
      });
      this.markers = []; 
    }, 
    
    clearMap() { 
      clearInterval(this.movementInterval); 
      this.clearPolylines(); 
      this.clearMarkers(); 
      this.destinationReached = false; 
      this.map.setCenter({ lat: -12.2666, lng: -38.9663 }); 
    },

    updateMap(deliverer, order) {
      if (deliverer && order) {
        this.clearMap();
        this.initMap().then(() => {
          this.drawRouteForDeliverer(deliverer, order);
        });
      }
    },

    moveDelivererAlongPath(deliverer, route) {
      const timePerStep = 1000;
      const delivererMarker = this.markers.find(marker => marker.id === `deliverer-${deliverer.id}`)?.marker;

      if (!delivererMarker) {
        console.error("Marcador do entregador não encontrado!");
        return;
      }

      let step = 0;
      const moveDeliverer = () => {
        if (step < route.length - 1) {
          const currentPosition = {
            lat: route[step].lat(),
            lng: route[step].lng()
          };
          const nextPosition = {
            lat: route[step + 1].lat(),
            lng: route[step + 1].lng()
          };

          if (currentPosition && nextPosition) {
            const interpolatedPosition = nextPosition;

            delivererMarker.setPosition(interpolatedPosition);

            if (
              google.maps.geometry.spherical.computeDistanceBetween(interpolatedPosition, new google.maps.LatLng(nextPosition.lat, nextPosition.lng)) < 10
            ) {
              step++;
            }
          } else {
            console.error("Pontos inválidos:", { currentPosition, nextPosition });
          }
        } else {
          if (!this.destinationReached) {
            console.log("Entregador chegou ao destino!");
            this.destinationReached = true;
          }
          clearInterval(this.movementInterval); 
        }
      };

      this.movementInterval = setInterval(moveDeliverer, timePerStep);
    }
  }
};
</script>

<style scoped>
#map {
  border-radius: 10px; 
  height: 500px; 
  width: 700px; 
  max-width: 97%; 
  z-index: 0; 
  position: relative;
  top: -80px;
  margin-right: 20px;
}

@media (width < 1000px) {
  #map {
    top: 0;
    width: 80%;
    height: 300px;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 40px;
  }
}

@media (width < 640px) {
  #map {
    width: 90%;
  }
}
</style>
