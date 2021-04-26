<template>
  <b-container id="app">
    <b-row>
      <b-col>
        <navbar/>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <router-view/>
      </b-col>
    </b-row>

  </b-container>
</template>

<script>
import { mapGetters } from "vuex";
import Navbar from "@/components/Navbar";
export default {
  name: "app",
  components: {
    Navbar,
  },
  computed: {
    ...mapGetters("drizzle", ["drizzleInstance", "isDrizzleInitialized"]),
    ...mapGetters("contracts", ["getContractData"]),
    // getNames() {
    //   let data = this.getContractData({
    //     contract: "Cert",
    //     method: "getNames"
    //   });
    //   if (data === "loading") return false;
    //   return data
    // },
    utils() {
      return this.drizzleInstance.web3.utils
    }
  },
  created() {
    this.$store.dispatch("drizzle/REGISTER_CONTRACT", {
      contractName: "Guestbook",
      method: "getNames",
      methodArgs: []
    })
  },
  data(){
    return {

    }
  }
}
</script>

<style>

</style>
