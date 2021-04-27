# blockchain-certs

## Overview
This project is a DApp which grants certificates to students who have successfully completed courses. The contract owner is able to create different types of certificates; they can then add courses and track students (using a wallet address) who enroll in those courses. When a student has completed the certificate requirements, they can then request a certificate. If their request is valid, the certificate is generated and a certificate ID returned. The certificate ID can be used to verify the certificate validity on the platform.

The project uses
- Solidity
- Truffle
- Ganache
- Drizzle Vue Plugin: `@drizzle/vue-plugin`
- Vue
- `vue-bootstrap`

## Resources
- [Blog post on integrating Vue and Truffle](https://medium.com/@james.m.kehoe/building-a-guestbook-dapp-with-vue-js-and-truffle-e0c9e3fcdeeb)
- [Example vue-drizzle app](https://github.com/remote-gildor/vue-drizzle-crowdsale). The `vue-drizzle` plugin is a major pain and doesn't maintain state very well - trying to use the Vuex state pattern followed here instead ...

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
