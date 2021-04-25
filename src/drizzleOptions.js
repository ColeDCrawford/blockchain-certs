// From https://medium.com/@james.m.kehoe/building-a-guestbook-dapp-with-vue-js-and-truffle-e0c9e3fcdeeb

import CertificateIssuer from "@/contracts/CertificateIssuer.json";
const options = {
  web3: {
    block: false,
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:9545"
    }
  },
// The contracts to monitor
  contracts: [CertificateIssuer],
//   events: {
//     Guestbook: ["SignatureAdded"]
//   },
//   polls: {
//     // check accounts ever 15 seconds
//     accounts: 15000
//   }
};
export default options;