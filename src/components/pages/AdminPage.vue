<template>
    <div>
        <h1>Admin Interface</h1>
        <p>Contract Owner: {{ getOwner }} </p>
        <drizzle-contract
            contractName="CertificateIssuer"
            method="owner"
            label=""
            toUtf8
        />
        <p>Contract Balance: {{ getBalance }}</p>
        <p>If you deployed the contract, you can interact with the public onlyOwner methods here from the owner address.</p>
        <div>
            <h2>Create a Course</h2>
            <drizzle-contract-form
                v-if="isDrizzleInitialized"
                contractName="CertificateIssuer"
                method="addCourse"
            />
            <div v-else>
                "Initializing Drizzle ..."
            </div>
        </div>
        <div>
            <h2>Create a new Certificate Type</h2>
        </div>
        <div>
            <h2>Create a Student</h2>
        </div>
        <div>
            <h2>Add a Student Enrollment</h2>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ValidatePage",
  computed: {
    ...mapGetters("drizzle", ["drizzleInstance", "isDrizzleInitialized"]),
    ...mapGetters("contracts", ["getContractData"]),
    ...mapGetters("accounts", ["activeAccount", "activeBalance"]),
    addCourse(){
      let data = this.getContractData({
        contract: "CertificateIssuer",
        method: "addCourse",
        methodArgs: []
      });
      if (data === "loading") return false;
      return data
    },

    getOwner(){
        window.console.log(this.activeAccount);
        let data = this.getContractData({
            contract: "CertificateIssuer",
            method: "issuerName"
        });
        if (data === "loading") return false;
        return data;
    },

    getBalance(){
        let data = this.getContractData({
            contract: "CertificateIssuer",
            method: "getBalance"
        });
        // if(data === "loading") return false;
        return data;
    }
  },
  created() {
    this.$store.dispatch("drizzle/REGISTER_CONTRACT", {
        contractName: "CertificateIssuer",
        method: "getBalance",
        methodArgs: []
    });
  }
}
</script>
