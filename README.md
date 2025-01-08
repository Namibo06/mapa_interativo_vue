## Projeto de Mapa Interativo

#### Este projeto implementa um mapa interativo utilizando a API do Google Maps para visualizar localizações, desenhar rotas e simular o movimento de entregadores. A aplicação é baseada em Vue.js.

----------------------------------

### Funcionalidades

#### 1. Exibição de Mapa:
- #### Carregamento dinâmico do Google Maps.

#### 2. Desenho de Rotas:
- #### Traça rotas entre os pontos com base nas coordenadas fornecidas.

#### 3. Limpeza do Mapa:
- #### Remove marcadores e rotas anteriores para uma nova interação.

#### 4. Filtros dinâmicos:
- #### Renderiza marcadores, entregadores e rotas, com base na escolha dinâmica.

------------------------------

### Tecnologias Utilizadas

- #### Vue.js: Framework JavaScript para construir a interface do usuário.

- #### Node.js: Linguagem JavaScript que roda no lado do servidor.

- #### NPM: Instalador e gerenciador de pacotes e dependências.

- #### Google Maps API: Ferramenta para renderização de mapas e rotas.

- #### PopperJs: É um motor de posicionamento que calcula a posição de um elemento até uma posição próxima de referência

-------------------------------

### Dependências

- #### Bootstrap | ``npm install --save bootstrap bootstrap-vue-3``
- #### Axios | ``npm install --save axios``
- #### Google Maps | ``npm install --save @googlemaps/js-api-loader``
- #### Eslint Plugin Vue | ``npm install --save-dev eslint eslint-plugin-vue vue-eslint-parser babel-eslint ``
- #### PopperJs | ``npm i --save popperjs/core``

-------------------------------

### Configuração do Ambiente

#### 1. Certifique-se de ter Node.js na versão 12.9+ e NPM instalado, caso não tenha, clique no link abaixo.
#### Clique [aqui](https://nodejs.org/en/download/prebuilt-installer/current) para fazer o download no site do NodeJS

#### 1. Certifique-se de ter uma IDE instalada, como por exemplo o VsCode, caso não tenha, clique no link abaixo.
#### Clique [aqui](https://code.visualstudio.com/Download) para fazer o download no site do VsCode

#### 2. Certifique-se de ter a CLI do Vuejs na versão 3.26 instalado, caso não tenha, copie o link abaixo e cole no seu terminal.
```javascript
npm i -g vue@3.2.26
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

#### 2. Adicionar Filtros:
- #### No lado superior direito, por padrão ele puxa todos os pedidos pendentes, basta clicar nas outras opções que são 'Sem entregador', e os demais motoristas, que poderá perceber as alterações dinâmicas.

-------------------------

### Estrutura de Arquivos
- #### ``node_modules: Diretório onde ficam as dependências do projeto.``

- #### ``public/index.html: Ponto de entrada da aplicação.``

- #### ``public/assets: Pasta de imagens para icones.``

- #### ``src/components/Map.vue: Componente principal que implementa o mapa interativo.``

- #### ``src/services/order.js: Módulo que gerencia os dados dos pedidos e entregadores.``

- #### ``src/App.vue: Componente principal que renderiza toda a aplicação e lida com card de filtros.``

- #### ``src/main.js:  Arquivo de entrada JavaScript que inicializa a aplicação Vue.``

- #### ``.env: Arquivo para armazenar variáveis de ambiente (ex.: API_KEY_GOOGLE_MAPS).``

- #### ``.eslintrc.js: Arquivo de configuração para o ESLint, usado para manter a qualidade do código.``

- #### ``.gitignore: Arquivo que especifica quais arquivos e diretórios devem ser ignorados pelo Git.``

- #### ``package.json: Arquivo de configuração que inclui informações sobre o projeto e suas dependências.``

- #### ``package-lock.json: Arquivo que garante que a instalação das dependências seja consistente entre diferentes máquinas.``

- #### ``README.md: Arquivo de documentação que fornece uma visão geral do projeto, instruções de instalação e uso.``

- #### ``babel.config.js: Arquivo de configuração do Babel, usado para transpilar o código JavaScript.``
