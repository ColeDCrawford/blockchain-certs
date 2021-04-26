// From https://github.com/trufflesuite/drizzle/blob/develop/packages/vue-plugin/README.md

import CertificateIssuer from "@/contracts/CertificateIssuer.json";
const options = {
  web3: {
    block: false,
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:7545"
    }
  },
// The contracts to monitor
  contracts: [CertificateIssuer],
//   events: {
//     CertificateIssuer: ["SignatureAdded"]
//   },
  polls: {
    // check accounts ever 15 seconds
    accounts: 15000
  }
};
export default options;