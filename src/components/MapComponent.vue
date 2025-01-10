<template>
  <div id="map"></div>
</template>

<script>
import { Loader } from '@googlemaps/js-api-loader';
import { toRaw } from 'vue';
import { orders, deliverers, pedidos } from '@/services/order';

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
    },
    updatedOrder: { 
      type: Object, 
      default: null 
    },
    marcadoComoEntregue: { 
      type: String, 
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
      deliverers: deliverers,
      arrayPedidosMerge: [],
      arrayPedidosCliente: [],
      arrayPedidosEtregador: [],
      pedidos: pedidos,
      arraySelectedEntregador: [],
      addPolylines: {},
      pedidoProducaoArray: [],
      pedidoSaiuEntregaArray: [], 
      pedidoRecebidosArray: []
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
    }, 
    updatedOrder(newValue) { 
      if (newValue) { 
        this.updateOrderDetails(newValue); 
      } 
    },
    marcadoComoEntregue(newValue) { 
      if (newValue) { 
        this.finalizarEntrega(newValue); 
      } 
    }
  },
  mounted() {
    this.initMap().then(() => {
      this.addAllOrdersToMap();
    });
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
        this.map = null;
      }

      this.map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -12.2666, lng: -38.9663 },
        zoom: 14,
        streetViewControl: true,
      });

      this.pedidoProducaoArray = this.pedidos.producao;
      this.pedidoSaiuEntregaArray = this.pedidos.saiuentrega;
      this.pedidoRecebidosArray = this.pedidos.recebidos;
      this.pedidoArrayMerge = this.pedidoProducaoArray.concat(this.pedidoSaiuEntregaArray,this.pedidoRecebidosArray);

      this.directionsService = new google.maps.DirectionsService();
    },

    async getLatLongFromCEP(cep) {
      const apiKey = process.env.VUE_APP_GOOGLE_MAPS_API_KEY;
      const endpoint = `https://maps.googleapis.com/maps/api/geocode/json?address=${cep}&key=${apiKey}`;

      try {
          const response = await fetch(endpoint);
          const data = await response.json();

          const results = data.results;
          
          if (results.length > 0) {
              const location = results[0].geometry.location;
              return location;
          } else {
              throw new Error('Nenhum resultado encontrado para o CEP informado.');
          }
      } catch (error) {
          console.error(error);
          return null;
      }
    },

    finalizarEntrega(idPedido) {
      const orderIndex = this.pedidoArrayMerge.findIndex(pedido => {
        return pedido.ped_numero === idPedido;
      });

      if (orderIndex !== -1) {
        const pedidoRemovido = this.pedidoArrayMerge[orderIndex];
        pedidoRemovido.ped_entrega = 'N'; 

        this.markers.forEach((marker, index) => {
          if (marker.id === `customer-${pedidoRemovido.pedido_id}`) {
            marker.marker.setMap(null);
            this.markers.splice(index, 1);
          }
        });

        this.polylines.forEach((polyline, index) => {
          if (polyline.id === `polyline-${pedidoRemovido.pedido_id}`) {
            polyline.polyline.setMap(null);
            this.polylines.splice(index, 1);
          }
        });
        this.pedidoArrayMerge[orderIndex] = pedidoRemovido;

        this.updateMap();
      } else {
        console.log(`Pedido com id ${idPedido} não encontrado.`);
      }
    },

    async updateOrderDetails(updatedOrder) {
      console.log(updatedOrder);
      if(
        updatedOrder.idPedido === "" || updatedOrder.idPedido === null || updatedOrder.idPedido === undefined ||
        updatedOrder.clienteName === "" || updatedOrder.clienteName === null || updatedOrder.clienteName === undefined ||
        updatedOrder.cidade === "" || updatedOrder.cidade === null || updatedOrder.cidade === undefined ||
        updatedOrder.cep === "" || updatedOrder.cep === null || updatedOrder.cep === undefined ||
        updatedOrder.valorEntrega === "" || updatedOrder.valorEntrega === null || updatedOrder.valorEntrega === undefined ||
        updatedOrder.dataHoraEntrega === "" || updatedOrder.dataHoraEntrega === null || updatedOrder.dataHoraEntrega === undefined 
      ){
        console.log('Dados obrigatórios nulos, vazios ou indefinidos');
        return;
      }

      if(updatedOrder.clienteName.length < 4 || updatedOrder.clienteName.length > 30){
        console.log('Nome deve estar entre 4 a 30 caracteres');
        return;
      }

      if(updatedOrder.logradouro === undefined ){updatedOrder.logradouro = "";}
      if(updatedOrder.bairro === undefined ){updatedOrder.bairro = "";}
      if(updatedOrder.pontoReferencia === undefined){updatedOrder.pontoReferencia = ""; }
      if(updatedOrder.numeroCasa === undefined ){updatedOrder.numeroCasa = "";}

      const orderIndex = this.pedidoArrayMerge.findIndex(pedido => {
        return pedido.ped_numero === updatedOrder.idPedido;
      });

      if (orderIndex !== -1) { 
        const pedido = this.pedidoArrayMerge[orderIndex];
        const datetime = this.updateDataForInfoWindow(updatedOrder.dataHoraEntrega);

        pedido.ped_numero = updatedOrder.idPedido;
        pedido.cliente.cli_nome = updatedOrder.clienteName;
        pedido.ped_endereco_entrega = `
          <strong>Logradouro:</strong> ${updatedOrder.logradouro} |
          <strong>Número:</strong> ${updatedOrder.numeroCasa} |
          <strong>Bairro:</strong> ${updatedOrder.bairro} | 
          <strong>Complemento:</strong> ${updatedOrder.complemento} | 
          <strong>Ponto de referência:</strong> ${updatedOrder.pontoReferencia} | 
          <strong>Município:</strong> ${updatedOrder.cidade} | 
          <strong>CEP:</strong> ${updatedOrder.cep}`;
        pedido.ped_valor_total = updatedOrder.valorEntrega;
        pedido.ped_data = datetime;

        const newLocation = await this.getLatLongFromCEP(updatedOrder.cep);
        if (newLocation) {
          pedido.cliente.enderecos = [{
            end_coordenadas_lat: newLocation.lat,
            end_coordenadas_lon: newLocation.lng,
          }];
        }

        this.markers.forEach(ped => {
          console.log(ped);
          const marker = this.markers.find(m => {
            return m.id === `customer-${pedido.pedido_id}`;
          });

          if (marker) {
            if (!this.infoWindows) {
              this.infoWindows = {};
            }
          
            if (this.infoWindows[marker.id]) {
              this.infoWindows[marker.id].close();
            }

            console.log(pedido.ped_data);

            this.infoWindows[marker.id] = new google.maps.InfoWindow({
              content: `
                <div>
                  <strong>N° Pedido: </strong> 
                  ${this.getNumbers(pedido.ped_numero)}<br><br>
                  <strong>Nome: </strong> 
                  ${pedido.cliente.cli_nome}<br><br>
                  <strong>Endereço Completo: </strong> 
                  ${this.removeBrTags(pedido.ped_endereco_entrega)}<br><br>
                  <strong>Valor: </strong> 
                  ${pedido.ped_valor_total}<br><br>
                  <strong>Data e Hora de Entrega: </strong> 
                  ${pedido.ped_data}
                </div>` 
            });

            console.log(pedido.ped_data);

            marker.marker.addListener('click', () => { 
              this.infoWindows[marker.id].open({ 
                anchor: marker.marker,
                map: this.map, 
                shouldFocus: false 
              }); 
            });

            this.infoWindows[marker.id].open(this.map, marker.marker);
            this.addAllOrdersToMap();
          } else {
            console.log('Marker não encontrado para o pedido:', pedido.ped_numero);
          }
        });
      } else {
        console.log('Pedido não encontrado na lista:', updatedOrder.idPedido);
      }
    },

    updateDataForInfoWindow(datetime){
      console.log(datetime);
      const arrayDateTime = datetime.split('T');
      const date = arrayDateTime[0].split('-');
      const time = arrayDateTime[1];
      const dateFormatted = date[2] + "/" + date[1] + "/" + date[0] + " " + time;
      console.log(dateFormatted);
      return dateFormatted;
    },

    generateRandomColorForDeliverer(deliverer) {
      if (!deliverer.color) {
        deliverer.color = this.generateRandomColor();
      }
      return deliverer.color;
    },

    addMarker(position, title,type, id,data) {
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
              <strong>N° Pedido: </strong> 
              ${this.getNumbers(data.ped_numero)}<br><br>
              <strong>Nome: </strong>
              ${data.cliente_nome}<br><br>
              <strong>Endereço Completo: </strong>
              ${this.removeBrTags(data.endereco_completo)}<br><br>
              <strong>Valor: </strong>
              ${data.valor_total}<br><br>
              <strong>Data e Hora de Entrega: </strong>
              ${this.updateDateTime(data.data_hora_entrega)}
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

    updateDateTime(datetime){
      const dataArray = datetime.split(' ');
      const data = dataArray[0].split('-');
      const horario = dataArray[1];
      const dateFormatted = data[2] + "/" + data[1] + "/" + data[0] + " " + horario;
      return dateFormatted;
    },

    removeBrTags(text) { 
      return text.replace(/<br\s*\/?>/gi, ' ').trim(); 
    },

    getNumbers(stringValue){
      return stringValue.replace(/\D/g, '');
    },

    addAllOrdersToMap() {
      this.clearMap(); 

      const processedClientes = new Set(); 

      for (const ped of this.pedidoArrayMerge) {
        if(ped.ped_entrega === "N"){
          continue;
        }

        if (!ped.entregador || !ped.entregador.ent_coordenadas) {
          console.error("Entregador ou localização inválida:", ped);
          continue;
        }

        const latitudeEntregador = parseFloat(ped.entregador.ent_coordenadas.lat);
        const longitudeEntregador = parseFloat(ped.entregador.ent_coordenadas.lng);
        const latLngLiteralDeliverer = { lat: latitudeEntregador, lng: longitudeEntregador };

        const entregadorPedidos = this.pedidoArrayMerge.filter(pedido => {
          if (!pedido || !pedido.entregador) {
            console.error("Pedido ou entregador inválido:", pedido);
            return false;
          }
          return pedido.entregador.entregador_id === ped.entregador.entregador_id;
        });

        if (!entregadorPedidos || entregadorPedidos.length === 0) {
          console.log(`Nenhum pedido encontrado para o entregador ${ped.entregador.ent_nome}`);
          continue;
        }

        for (const pedido of entregadorPedidos) {
          if (pedido.ped_entrega === 'N') {
            console.log(`Pedido ${pedido.pedido_id} não foi entregue, pulando a renderização.`);
            continue;
          }
          if (!pedido.cliente || !pedido.cliente.enderecos || pedido.cliente.enderecos.length === 0) {
            console.error("Dados do cliente inválidos no pedido:", pedido);
            continue;
          }

          pedido.cliente.enderecos.forEach(cliente => {
              const clienteKey = `${cliente.end_coordenadas_lat},${cliente.end_coordenadas_lon}`;

              if (processedClientes.has(clienteKey)) {
                //console.log("Endereço já processado:", clienteKey);
                return;
              }

              processedClientes.add(clienteKey);
      
              const detalhesPedido = {
                ped_numero: ped.ped_numero,
                cliente_nome: ped.cliente.cli_nome,
                endereco_completo: ped.ped_endereco_entrega,
                valor_total: ped.ped_valor_total,
                data_hora_entrega: ped.ped_data
              };

              const latitudeCliente = parseFloat(cliente.end_coordenadas_lat);
              const longitudeCliente = parseFloat(cliente.end_coordenadas_lon);
              const latLngLiteralCliente = { lat: latitudeCliente, lng: longitudeCliente };

              this.addMarker(latLngLiteralCliente, pedido.cliente.cli_nome, "customer", `customer-${pedido.pedido_id}`, detalhesPedido);
              
              this.addMarker(latLngLiteralDeliverer, ped.entregador.ent_nome, "deliverer", `deliverer-${pedido.pedido_id}`, detalhesPedido);

              const request = {
                origin: latLngLiteralDeliverer,
                destination: latLngLiteralCliente,
                travelMode: google.maps.TravelMode.DRIVING,
              };

              this.directionsService.route(request, (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                  const directionsRenderer = new google.maps.DirectionsRenderer({
                    map: this.map,
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: ped.entregador.color, 
                      strokeOpacity: 1.0,
                      strokeWeight: 4,
                    },
                  });

                  directionsRenderer.setDirections(result);
                  this.polylines.push(directionsRenderer);
                } else {
                  console.error("Não foi possível calcular a rota:", status);
                }
              });
          });
        }
      }
    },

     addAllOrdersForDeliverers(deliverers,) {
        if (!Array.isArray(deliverers)) {
          console.error("deliverers não é um array"); 
          return; 
        }

        this.clearMap(); 

        for (const deliverer of deliverers) {
          let delivererArray = deliverer.split('.'); 
          let colorDeliverer = delivererArray[6];

          const delivererOrders = this.pedidoArrayMerge.filter(order => {
            if (order.ped_entrega === 'N') {
              console.log(`Pedido ${order.pedido_id} não foi entregue, pulando a renderização.`);
              return;
            }

            if (order.entregador) {
                return order.entregador.ent_nome === delivererArray[0];
            }
            return false;
          });
          
          if (!delivererOrders || delivererOrders.length === 0) {
              console.log('Id do entregador não encontrado');
              continue; 
          }

          for (const order of delivererOrders) {
              order.cliente.enderecos.forEach(cliente => {
                const clienteKey = `${cliente.end_coordenadas_lat},${cliente.end_coordenadas_lon}`;

                const processedClientes = new Set();

                if (processedClientes.has(clienteKey)) {
                  return;
                }

                processedClientes.add(clienteKey);

                const detalhesPedido = {
                  ped_numero: order.ped_numero,
                  cliente_nome: order.cliente.cli_nome,
                  endereco_completo: order.ped_endereco_entrega,
                  valor_total: order.ped_valor_total,
                  data_hora_entrega: order.ped_data
                };

                const latitudeEntregador = parseFloat(order.entregador.ent_coordenadas.lat);
                const longitudeEntregador = parseFloat(order.entregador.ent_coordenadas.lng);
                const latLngLiteralDeliverer = { lat: latitudeEntregador, lng: longitudeEntregador };

                const latitudeCliente = parseFloat(cliente.end_coordenadas_lat);
                const longitudeCliente = parseFloat(cliente.end_coordenadas_lon);
                const latLngLiteralCliente = { lat: latitudeCliente, lng: longitudeCliente };

                this.addMarker(latLngLiteralCliente, order.cliente.cli_nome, "customer", `customer-${order.pedido_id}`, detalhesPedido);
                
                this.addMarker(latLngLiteralDeliverer, order.entregador.ent_nome, "deliverer", `deliverer-${order.pedido_id}`, detalhesPedido);

                const request = {
                  origin: latLngLiteralDeliverer, 
                  destination: latLngLiteralCliente, 
                  travelMode: google.maps.TravelMode.DRIVING  
                };

                this.directionsService.route(request, (result, status) => {
                  if (status === google.maps.DirectionsStatus.OK) {
                    const directionsRenderer = new google.maps.DirectionsRenderer({
                      map: this.map,
                      suppressMarkers: true,  
                      polylineOptions: {
                        strokeColor: order.entregador.color || colorDeliverer, 
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
              });
          }
        }
    },

    setPolylineColor(color) {
      this.color = color;
      this.updatePolyline();
    },

    updatePolyline() {
      const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
      });

      const polyline = new google.maps.Polyline({
        path: [
          { lat: -34.397, lng: 150.644 },
          { lat: -34.400, lng: 150.650 }
        ],
        strokeColor: this.color,
        strokeOpacity: 1.0,
        strokeWeight: 3
      });
      polyline.setMap(map);
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
      this.clearPolylines(); 
      this.clearMarkers(); 
      this.destinationReached = false; 
      this.map.setCenter({ lat: -12.2666, lng: -38.9663 }); 
    },

    updateMap() {
      this.clearMap();
      this.initMap().then(() => {
        this.addAllOrdersToMap();
      });
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
