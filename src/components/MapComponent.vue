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
    selectedMultipleCouriers: {
      type: Array,
      default: () => []
    },
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
    selectedMultipleCouriers(newValue){
      this.addAllOrdersForDeliverers(newValue);
    },
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
        this.addAllOrdersForDeliverers(newValue);
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

    async addAllOrdersToMap() {
      this.clearMap();  

      this.orders.forEach(order => {
        this.addMarker(order.customerLocation, order.customerName, "customer", `customer-${order.id}`);
      });

      this.deliverers.forEach(deliverer => {
        this.addMarker(deliverer.currentLocation, deliverer.name, "deliverer", `deliverer-${deliverer.id}`);
      });

      for (const order of this.orders) {
        if(order.id === 6 || order.id === 9){
          continue;
        }
        for (const deliverer of this.deliverers) {
          const request = {
            origin: deliverer.currentLocation,
            destination: order.customerLocation,
            travelMode: google.maps.TravelMode.DRIVING
          };

          await this.directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              const directionsRenderer = new google.maps.DirectionsRenderer({
                map: this.map,
                suppressMarkers: true,
                //draggable: true,  
                polylineOptions: {
                  strokeColor: deliverer.color,  
                  strokeOpacity: 1.0,
                  strokeWeight: 4  
                }
              });

              directionsRenderer.setDirections(result);

              this.polylines.push(directionsRenderer);
            } else {
              console.error("Não foi possível calcular a rota:", status);
            }
          });
        }
      }
    },

    async addAllOrdersForDeliverers(deliverers) {
      if (!Array.isArray(deliverers)) {
        console.error("deliverers não é um array"); 
        return; 
      }

      this.clearMap(); 

      for (const deliverer of deliverers) {
        let delivererArray = deliverer.split('.'); 
        let latitude = parseFloat(delivererArray[2] + '.' + delivererArray[3]); 
        let longitude = parseFloat(delivererArray[4] + '.' + delivererArray[5]); 
        let delivererColor = delivererArray[6];
        let latLngLiteral = { lat: latitude, lng: longitude }; 

        const delivererOrders = this.orders.filter(order => { 
          const deliveryIdString = String(order.deliveryId);
          return deliveryIdString === delivererArray[1]; 
        });

        if (!delivererOrders || delivererOrders.length === 0) {
          console.log('Id do entregador não encontrado');
          continue; 
        }
        for (const order of delivererOrders) {
          this.addMarker(order.customerLocation, order.customerName, "customer", `customer-${order.id}`);
          this.addMarker(latLngLiteral, deliverer.name, "deliverer", `deliverer-${order.id}`);

          const request = {
            origin: latLngLiteral, 
            destination: order.customerLocation, 
            travelMode: google.maps.TravelMode.DRIVING  
          };

          await this.directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              const directionsRenderer = new google.maps.DirectionsRenderer({
                map: this.map,
                suppressMarkers: true,  
                polylineOptions: {
                  strokeColor: delivererColor, 
                  strokeOpacity: 1.0,
                  strokeWeight: 4 
                }
              });
              directionsRenderer.setDirections(result);

              this.polylines.push(directionsRenderer);
            } else {
              console.error("Não foi possível calcular a rota:", status);
            }
          });
        }
      }
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
      this.polylines.length = 0;
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
