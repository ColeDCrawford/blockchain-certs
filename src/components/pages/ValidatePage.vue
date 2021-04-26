<template>
    <div>
    <h1>Validate a Certificate</h1>

    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ValidatePage",
  computed: {
    ...mapGetters("drizzle", ["drizzleInstance", "isDrizzleInitialized"]),
    ...mapGetters("contracts", ["getContractData"]),
    addClass(){
      let data = this.getContractData({
        contract: "CertificateIssuer",
        method: "addCourse"
      });
      if (data === "loading") return false;
      return data
    },
  }
};
</script>
