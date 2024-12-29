## Projeto de Mapa Interativo

#### Este projeto implementa um mapa interativo utilizando a API do Google Maps para visualizar localizações, desenhar rotas e simular o movimento de entregadores. A aplicação é baseada em Vue.js.

----------------------------------

### Funcionalidades

#### 1. Exibição de Mapa:
- #### Carregamento dinâmico do Google Maps.

#### 2. Desenho de Rotas:
- #### Traça rotas entre os pontos com base nas coordenadas fornecidas.

#### 3. Simulação de Movimento:
- #### Move um marcador (entregador) ao longo de uma rota traçada.

#### 4. Limpeza do Mapa:
- #### Remove marcadores e rotas anteriores para uma nova interação.

------------------------------

### Tecnologias Utilizadas

- #### Vue.js: Framework JavaScript para construir a interface do usuário.

- #### Google Maps API: Ferramenta para renderização de mapas e rotas.

-------------------------------

### Dependências

- #### Bootstrap | ``npm install --save bootstrap bootstrap-vue-3``
- #### Axios | ``npm install --save axios``
- #### Google Maps | ``npm install --save @googlemaps/js-api-loader``
- #### Eslint Plugin Vue | ``npm install --save-dev eslint eslint-plugin-vue vue-eslint-parser babel-eslint ``

-------------------------------

### Configuração do Ambiente

#### 1. Certifique-se de ter Node.js e NPM instalado, caso não tenha, clique no link abaixo.
#### Clique [aqui](https://nodejs.org/en/download/prebuilt-installer/current) para fazer o download no site do NodeJS

#### 1. Certifique-se de ter uma IDE instalada, como por exemplo o VsCode, caso não tenha, clique no link abaixo.
#### Clique [aqui](https://code.visualstudio.com/Download) para fazer o download no site do VsCode

#### 2. Certifique-se de ter a CLI do Vuejs instalado, caso não tenha, copie o link abaixo e cole no seu terminal.
```javascript
npm install -g @vue/cli
```

#### 3. Clone este repositório:
```javascript
git clone https://github.com/Namibo06/mapa_interativo_vuehttps://github.com/Namibo06/mapa_interativo_vue
```

#### 4. Instale as dependências:
```javascript
npm install
```

#### 5. Configure sua API Key do Google Maps:
- #### Crie um arquivo ``.env`` na raiz do projeto com a seguinte variável:
```javascript
VUE_APP_GOOGLE_MAPS_API_KEY = SUA_API_KEY_AQUI
```
- #### Substitua ``SUA_API_KEY_AQUI`` pela chave da API obtida no Google Cloud Console.

#### 6. Habilite as seguintes API's em "API's e Serviços" no Google Cloud Console:
- #### 1. Google Maps JavaScript API
- #### 2. Directions API

#### 7. Inicie o servidor de desenvolvimento:
```javascript
npm run serve
```

--------------------------

#### Uso da Aplicação
#### 1. Carregamento do Mapa:
- #### O mapa é carregado automaticamente ao iniciar a aplicação.

#### 2. Adicionar Marcadores:
- #### Utilize a função ``addMarker`` para inserir um marcador no mapa:
```javascript
addMarker({
  position: { lat: -23.561684, lng: -46.625378 },
  title: 'Exemplo',
  type: 'restaurant',
  id: 'marker-1'
});
```

#### 3. Desenhar Rotas:
#### Utilize a função ``drawRoute`` para criar uma rota:
```javascript
drawRoute({
  origin: { lat: -23.561684, lng: -46.625378 },
  destination: { lat: -23.562684, lng: -46.626378 },
  waypoints: []
});
```

#### 4. Simular Movimento do Entregador:
#### Use ``moveDelivererAlongPath`` para simular o movimento:
```javascript
moveDelivererAlongPath(deliverer, path);
```

#### 5. Limpar o Mapa:
#### Utilize clearMap para resetar o mapa:
```javascript
clearMap();
```

-------------------------

### Estrutura de Arquivos
- #### ``node_modules: Diretório onde ficam as dependências do projeto.``

- #### ``public/index.html: Ponto de entrada da aplicação.``

- #### ``public/assets: Pasta de imagens para icones.``

- #### ``src/components/EntregadoresListComponent.vue: Componente que gerencia e exibe os cards dos entregadores e seus pedidos pendentes.``

- #### ``src/components/Map.vue: Componente principal que implementa o mapa interativo.``

- #### ``src/services/order.js: Módulo que gerencia os dados dos pedidos e entregadores.``

- #### ``src/App.vue: Componente principal que renderiza toda a aplicação.``

- #### ``src/main.js:  Arquivo de entrada JavaScript que inicializa a aplicação Vue.``

- #### ``.env: Arquivo para armazenar variáveis de ambiente (ex.: API_KEY_GOOGLE_MAPS).``

- #### ``.eslintrc.js: Arquivo de configuração para o ESLint, usado para manter a qualidade do código.``

- #### ``.gitignore: Arquivo que especifica quais arquivos e diretórios devem ser ignorados pelo Git.``

- #### ``package.json: Arquivo de configuração que inclui informações sobre o projeto e suas dependências.``

- #### ``package-lock.json: Arquivo que garante que a instalação das dependências seja consistente entre diferentes máquinas.``

- #### ``README.md: Arquivo de documentação que fornece uma visão geral do projeto, instruções de instalação e uso.``

- #### ``babel.config.js: Arquivo de configuração do Babel, usado para transpilar o código JavaScript.``
