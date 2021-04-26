<template>
    <div>
        <h1>Request a Certificate</h1>
        <p>Using a student address, you can use the below form to generate a certificate.
            Enter the certificate type ID below, and the smart contract will check the address to ensure the request for this certificate is valid.
            The cost of the certificate request is currently set to 1 Ether.
        </p>
        <drizzle-contract-form
        v-if="isDrizzleInitialized"
        contractName="CertificateIssuer"
        method="requestCert"
        />
        <div v-else>
            "Initializing Drizzle ..."
        </div>
    </div>
</template>

<script>
export default {
  name: "RequestPage",
};
</script>
