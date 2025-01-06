<template>
  <div id="map"></div>
</template>

<script>
import { Loader } from '@googlemaps/js-api-loader';
import { toRaw } from 'vue';
import { orders, deliverers } from '@/services/order';

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
      orderName: '',
      orderId: '',
      map: null,
      directionsService: null,
      markers: [], 
      polylines: [], 
      movementInterval: null, 
      destinationReached: false,
      orders: orders,
      deliverers: deliverers
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
    //clearInterval(this.movementInterval);
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

      this.addMarker(order.customerLocation, order.customerName, 'customer', `customer-${order.id}`);
      this.addMarker(deliverer.location, deliverer.name, 'deliverer', `deliverer-${order.id}`);

      const customerLatLng = new google.maps.LatLng(order.customerLocation.lat, order.customerLocation.lng);
      const delivererLatLng = new google.maps.LatLng(deliverer.location.lat, deliverer.location.lng);

      const polyline = new google.maps.Polyline({
        path: [customerLatLng, delivererLatLng],
        geodesic: true,
        strokeColor: deliverer.color, 
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });

      polyline.setMap(this.map);

      this.polylines.push(polyline);

      const request = {
        origin: order.restaurantLocation,
        destination: order.customerLocation,
        waypoints: [],
        travelMode: google.maps.TravelMode.DRIVING,
      };

      this.directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map: this.map,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: deliverer.color, 
              strokeOpacity: 1.0,
              strokeWeight: 2,
            },
          });

          directionsRenderer.setDirections(result);
          this.polylines.push(directionsRenderer.polyline);
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
          fillColor: '#fff',
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

      if(type === "customer"){
        const infowindow = new google.maps.InfoWindow({ 
          content: `
            <div>
              <strong>Nome:</strong>
              ${title}<br>
              <strong>ID:</strong> 
              ${this.getNumbers(id)}
            </div>` 
        }); 

        marker.addListener('click', () => { 
          infowindow.open({ 
            anchor: marker,
            map: this.map, 
            shouldFocus: false 
          }); 
        }); 
      }

      this.markers.push({ id, marker });
    },

    getNumbers(stringValue){
      return stringValue.replace(/\D/g, '');
    },

    addAllOrdersToMap() {
      this.clearMap();

      this.orders.forEach(order => {
        this.addMarker(order.customerLocation, order.customerName, "customer", `customer-${order.id}`);
      });

      this.deliverers.forEach(deliverer => {
        this.addMarker(deliverer.currentLocation, deliverer.name, "deliverer", `deliverer-${deliverer.id}`);
      });

      this.orders.forEach(order => {
        this.deliverers.forEach(deliverer => {
          const request = {
            origin: deliverer.currentLocation,
            destination: order.customerLocation,
            travelMode: google.maps.TravelMode.DRIVING
          };

          this.directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              const directionsRenderer = new google.maps.DirectionsRenderer({
                map: this.map,
                suppressMarkers: true,
              });

              directionsRenderer.setDirections(result);
              this.polylines.push(directionsRenderer);
            } else {
              console.error("Não foi possível calcular a rota:", status);
            }
          });
        });
      });
    },

    async addAllOrdersForDeliverer(deliverer) {
      this.clearMap(); 
      
      const delivererOrders = this.orders.filter(order => order.deliveryId === deliverer.id);

      delivererOrders.forEach(order => {
        this.addMarker(order.customerLocation, "C", "customer", `customer-${order.id}`);
        this.addMarker(deliverer.currentLocation, "E", "deliverer", `deliverer-${order.id}`);

        const request = {
          origin: deliverer.currentLocation,
          destination: order.customerLocation,
          travelMode: google.maps.TravelMode.DRIVING
        };

        this.directionsService.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            const directionsRenderer = new google.maps.DirectionsRenderer({
              map: this.map,
              suppressMarkers: true,
            });

            directionsRenderer.setDirections(result);

            this.polylines.push(directionsRenderer);
          } else {
            console.error("Não foi possível calcular a rota:", status);
          }
        });
      });
    },

    searchOrdersWithoutPerson(){
      this.clearMap();

      const ordersWithoutPerson = this.orders.filter(order => order.deliveryId === null);

      ordersWithoutPerson.forEach(order => {
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
      //clearInterval(this.movementInterval); 
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

    /*moveDelivererAlongPath(deliverer, route) {
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
    }*/
  }
};
</script>

<style scoped>
#map { 
  height: 100vh; 
  width: 100%;  
  z-index: 0; 
  transition: opacity display 0.3s ease-in-out;
}
</style>
