<template>
    <div>
        <h1>Admin Interface</h1>

        <h2>Contract Data</h2>
        <p>Owner Address: {{ getOwnerAddress }} </p>
        <p>Issuer Name: {{ getIssuerName }}</p>
        <p>Certificate Types: {{ getCertificateTypes }}</p>
        <p>Courses: {{ getCourses }}</p>

        <h2>Contract Methods</h2>
        <p>If you deployed the contract, you can interact with the public onlyOwner methods here from the owner address.</p>
        <div>
            <h3>Create a Course</h3>
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
            <h3>Create a new Certificate Type</h3>
            <drizzle-contract-form
                v-if="isDrizzleInitialized"
                contractName="CertificateIssuer"
                method="addCertificateType"
            />
            <div v-else>
                "Initializing Drizzle ..."
            </div>
        </div>
        <div>
            <h3>Create a Student</h3>
            <drizzle-contract-form
                v-if="isDrizzleInitialized"
                contractName="CertificateIssuer"
                method="addStudent"
            />
            <div v-else>
                "Initializing Drizzle ..."
            </div>
        </div>
        <div>
            <h3>Add a Student Enrollment</h3>
            <drizzle-contract-form
                v-if="isDrizzleInitialized"
                contractName="CertificateIssuer"
                method="addEnrollment"
            />
            <div v-else>
                "Initializing Drizzle ..."
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

// function getIssuer() {
//   return new Promise((resolve, reject) => {
//     // setTimeout(() => resolve('Changed Value!'), 1000)
//     return this.drizzleInstance.contracts.CertificateIssuer.methods.issuerName.call();
//   })
// }


export default {
  name: "ValidatePage",
//   asyncComputed: {
//     async resolvedIssuer() {
//       return await getIssuer();
//     }
//   },
  computed: {
    ...mapGetters("drizzle", ["drizzleInstance", "isDrizzleInitialized"]),
    ...mapGetters("contracts", ["getContractData"]),
    ...mapGetters("accounts", ["activeAccount", "activeBalance"]),
    ...mapGetters("certs", ["getIssuerName", "getOwnerAddress", "getCertificateTypes", "getCourses"]),

    // getOwner(){
    //     // let data = this.getContractData({
    //     //     contract: "CertificateIssuer",
    //     //     method: "owner"
    //     // });
    //     let data = this.drizzleInstance.contracts.CertificateIssuer.methods.issuerName.call();
    //     console.log(data);
    //     if (data === "loading") return false;
    //     return data;
    // },

    // getBalance(){
    //     let data = this.getContractData({
    //         contract: "CertificateIssuer",
    //         method: "getBalance"
    //     });
    //     if(data === "loading") return false;
    //     return data;
    // },

    // getAllStudents(){
    //     let data = this.getContractData({
    //         contract: "CertificateIssuer",
    //         method: "getAllStudents"
    //     });
    //     if(data === "loading") return false;
    //     return data;
    // },
    utils() {
      return this.drizzleInstance.web3.utils
    }
  },
  created() {
    console.log('created');

    let courseTest = this.drizzleInstance.contracts.CertificateIssuer.methods.courses.call(1);
    console.log("CourseTest");
    console.log(courseTest);

    // Vuex State
    this.$store.dispatch("certs/fetchIssuerName");
    this.$store.dispatch("certs/fetchOwnerAddress");
    this.$store.dispatch("certs/fetchCertificateTypes");
    this.$store.dispatch("certs/fetchCourses");

    // this.drizzleInstance.contracts.CertificateIssuer.methods.getAllStudentIds().call().then((data) => {
    //     console.log(data);
    // });
    this.$store.dispatch("drizzle/REGISTER_CONTRACT", {
        contractName: "CertificateIssuer",
        method: "getBalance",
        methodArgs: []
    });
    // this.$store.dispatch("drizzle/REGISTER_CONTRACT", {
    //     contractName: "CertificateIssuer",
    //     method: "getOwner",
    //     methodArgs: []
    // });
    this.$store.dispatch("drizzle/REGISTER_CONTRACT", {
        contractName: "CertificateIssuer",
        method: "getAllStudents",
        methodArgs: []
    });
    // this.drizzleInstance.contracts.CertificateIssuer.methods.getAllStudents().call().then((result) => {
    //     console.log("get all students");
    //     console.log(result);
    //     this.students = result;
    // });
    // this.drizzleInstance.contracts.CertificateIssuer.methods.issuerName().call().then((result) => {
    //     console.log("issuerName");
    //     console.log(result);
    //     this.issuerName = result;
    // });
  },
  methods: {
      ...mapActions("certs", ["fetchIssuerName", "fetchOwnerAddress", "fetchCertificateTypes", "fetchCourses"])
  }
//   data(){
//       return {
//           students: [],
//           issuerName: ''
//       }
//   }
}
</script>
