var contract = require("@truffle/contract");
App = {
  web3Provider: null,
  contracts: {},
  store:{},

  init: async function() {
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
      console.log('artifact');
      console.log(CertificateIssuerArtifact);
      App.contracts.CertificateIssuer = TruffleContract(CertificateIssuerArtifact);
    
      // Set the provider for our contract
      App.contracts.CertificateIssuer.setProvider(App.web3Provider);
      
      App.setAccount();
    
      return App.loadContractData();
    });

    return App.bindEvents();
  },

  loadContractData: function(){
    var certIssuerInstance;
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      console.log(certIssuerInstance);

      certIssuerInstance.owner.call().then(function(data){
        App.store.ownerAddress = data;
      })
      certIssuerInstance.issuerName.call().then(function(data){
        App.store.issuerName = data;
      });

      // Larger loads
      App.loadCourseData();
      App.loadStudentData();
      App.loadCertificateTypeData();
      // certIssuerInstance.getAllCertTypes.call().then(function(data){
      //   App.store.certificateTypes = data;
      // });
      // certIssuerInstance.getAllStudents.call().then(function(data){
      //   App.store.students = data;
      // })

      // Not actually using this - is there a better way to make this function wait for all the async calls to contract to load?
      return certIssuerInstance.getAllCourses.call();
    }).then(function(courses){
      // Populate with contract data
      console.log('populating templates');

      $('#ownerAddress').text(App.store.ownerAddress);
      $('#issuerName').text(App.store.issuerName);

      console.log(App.isOwner());
      console.log(App.store.ownerAddress);
      console.log(App.store.userAccount);
      if(App.isOwner()){
        $('.ownerOnly').toggle();
      }

    });
  },

  loadCourseData: function(){
    var certIssuerInstance;
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      certIssuerInstance.getAllCourses.call().then(function(data){
        App.store.courses = data;
        $('#courses').empty();
        App.store.courses.forEach(function(c){
          var courseTemplate = $('#courseTemplate');
          console.log(c);
          courseTemplate.find('.courseName').text(c.courseName);
          courseTemplate.find('.courseId').text(c.courseId);
          courseTemplate.find('.courseDescription').text(c.courseDescription);
          $('#courses').append(courseTemplate.html());
        })
      });
    });
  },

  loadStudentData: function(){
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      certIssuerInstance.getAllStudents.call().then(function(data){
        App.store.students = data;

        // Wipe current data, then rebuild
        $('#students').empty();

        // Verify owner
        App.store.students.forEach(function(s){
          var studentTemplate = $('#studentTemplate');
          studentTemplate.find('.studentName').text(s.name);
          studentTemplate.find('.studentAddress').text(s.address);
          $('#students').append(studentTemplate.html());
        })
      })
    });
  },

  loadCertificateTypeData: function(){
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      certIssuerInstance.getAllCertTypes.call().then(function(data){
        App.store.certificateTypes = data;
        $('#certificateTypes').empty();
        App.store.certificateTypes.forEach(function(t){
          var certTypeTemplate = $('#certificateTypeTemplate');
          console.log(t);
          certTypeTemplate.find('.certificateName').text(t.certificateName);
          certTypeTemplate.find('.certificateDescription').text(t.certificateDescription);
          certTypeTemplate.find('.certificateTypeId').text(t.certificateTypeId);
          certTypeTemplate.find('.numCoursesRequired').text(t.numCoursesRequired);
          $('#certificateTypes').append(certTypeTemplate.html());
        })
      })
    })
  },

  bindEvents: function() {
    $(document).on('click', '#addCourse', App.handleAddCourse);
    $(document).on('click', '#addStudent', App.handleAddStudent);
    $(document).on('click', '#addCertType', App.handleAddCertificateType);
  },

  addCourse: function(name, desc){
    var certIssuerInstance;
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      return certIssuerInstance.addCourse(name, desc, {from: App.store.userAccount});
    }).then(function(tx){
      // could try to just add the new one?
      console.log(tx);
      App.loadCourseData();
    }).catch(function(err){
      console.log(err.message);
    });
  },

  addStudent: function(address, name){
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      // Need to see if the contract owner is the sender?
      certIssuerInstance = instance;
      return certIssuerInstance.addStudent(address, name, {from: App.store.userAccount});
    }).then(function(tx){
      console.log(tx);
      App.loadStudentData();
    });
  },

  addCertificateType: function(name, desc, numCoursesRequired){
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      return certIssuerInstance.addCertificateType(name, desc, numCoursesRequired, {from: App.store.userAccount});
    }).then(function(tx){
      console.log(tx);
      App.loadCertificateTypeData();
    })
  },

  setAccount: function(){
    web3.eth.getAccounts().then(function(accounts){
      App.store.userAccount = accounts[0];
      return accounts[0];
    });
  },

  handleAddCourse: function(event){
    event.preventDefault();
    let name = $('#courseNameInput').val();
    let description = $('#courseDescInput').val();
    App.addCourse(name, description);
  },

  handleAddStudent: function(event){
    event.preventDefault();
    let name = $('#studentNameInput').val();
    let address = $('#studentAddressInput').val();
    App.addStudent(address, name);
  },

  handleAddCertificateType: function(event){
    event.preventDefault();
    let name = $('#certTypeNameInput').val();
    let desc = $('#certTypeDescInput').val();
    let numCoursesRequired = parseInt($('#certTypeNumCoursesRequired').val());
    App.addCertificateType(name, desc, numCoursesRequired);
  },

  isOwner: function(){
    return App.store.ownerAddress == App.store.userAccount;
  }

};

$(function() {
  $(window).on('load', function() {
    App.init();
  });
});
