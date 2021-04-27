App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    console.log(web3.version);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('CertificateIssuer.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var CertificateIssuerArtifact = data;
      App.contracts.CertificateIssuer = TruffleContract(CertificateIssuerArtifact);
    
      // Set the provider for our contract
      App.contracts.CertificateIssuer.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      // return App.markAdopted();
      return App.getAllCourses();
    });

    return App.bindEvents();
  },

  getAllCourses: function(){
    console.log("getting all courses");
    var certIssuerInstance;
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      console.log(certIssuerInstance);

      let owner = certIssuerInstance.owner.call();
      console.log(owner);
      let issuerName = certIssuerInstance.issuerName.call();
      console.log(issuerName);
      let courseId = 1;
      let course = certIssuerInstance.courses.call(courseId);
      console.log(course);
      let courseIds = certIssuerInstance.getAllCourseIds.call();
      console.log(courseIds);
      
      let courses = certIssuerInstance.getAllCourses.call();
      console.log(courses);

      return certIssuerInstance.getAllCourses.call();
    }).then(function(courses){
      console.log(courses);
      courses.forEach(function(c){
        console.log(c);
      })
    });
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function() {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    /*
     * Replace me...
     */
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
