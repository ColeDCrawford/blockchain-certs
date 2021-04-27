const state = {
    owner: "",
    issuerName: "",
    certificateTypes: [],
    courses: [],
    contractBalance: null
}

const getters = {
    getOwnerAddress(state){
        return state.owner;
    },
    getIssuerName(state){
        return state.issuerName;
    },
    getCertificateTypes(state){
        return state.certificateTypes;
    },
    getCourses(state){
        return state.courses;
    },
    getContractBalance(state){
        return state.contractBalance;
    }
}

const actions = {
    async fetchIssuerName({commit, rootState}){
        let drizzleInstance = rootState.drizzle.drizzleInstance;
        console.log('drizzleInstance');
        console.log(drizzleInstance);
        const issuerName = await drizzleInstance.contracts.CertificateIssuer.methods.issuerName().call();
        commit("setIssuerName", issuerName);
    },

    async fetchOwnerAddress({commit, rootState}){
        let drizzleInstance = rootState.drizzle.drizzleInstance;
        const ownerAddress = await drizzleInstance.contracts.CertificateIssuer.methods.owner().call();
        commit("setOwnerAddress", ownerAddress);
    },

    async fetchCertificateTypes({ commit, rootState }){
        let drizzleInstance = rootState.drizzle.drizzleInstance;
        const certTypes = await drizzleInstance.contracts.CertificateIssuer.methods.getAllCertTypes().call();
        console.log("certTypes");
        console.log(certTypes);
        commit("setCertificateTypes", certTypes);
    },

    async fetchCourses({ commit, rootState }){
        let drizzleInstance = rootState.drizzle.drizzleInstance;
        const courses = await drizzleInstance.contracts.CertificateIssuer.methods.getAllCourses().call();
        console.log("courses");
        console.log(courses);
        commit("setCourses", courses);
    }
}

const mutations = {
    setIssuerName(state, name){
        state.issuerName = name;
    },
    setOwnerAddress(state, addr){
        state.owner = addr;
    },
    setCertificateTypes(state, types){
        state.certificateTypes = types;
    },
    setCourses(state, courses){
        state.courses = courses;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
  };