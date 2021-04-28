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

      // console.log("test enrollment retrieval");
      // certIssuerInstance.enrollments.call(1).then(function(d){
      //   console.log(d);
      //   console.log(d.courseId.toString());
      // })

      // Larger loads which can change
      App.loadCertificateData();
      App.loadCourseData();
      App.loadStudentData();
      App.loadCertificateTypeData();
      App.loadEnrollmentData();

      // Not actually using this - is there a better way to make this function wait for all the async calls to contract to load?
      return certIssuerInstance.getAllCourses.call();
    }).then(function(courses){
      // Populate with contract data
      console.log('populating templates');

      $('#ownerAddress').text(App.store.ownerAddress);
      $('#issuerName').text(App.store.issuerName);

      // Runs every .5s
      App.checkAdminVis();
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

        $('#students').empty();

        App.store.students.forEach(function(s){
          console.log(s);
          var studentTemplate = $('#studentTemplate');
          studentTemplate.find('.studentName').text(s.studentName);
          studentTemplate.find('.studentAddress').text(s.studentAddress);
          studentTemplate.find('.studentEnrollments').text(s.enrollmentIds.length);
          // append all certs
          studentCerts = [];
          s.certificateIds.forEach(function(certId){
            App.store.certificates.forEach(function(cert){
              if(certType.certificateId == certId){
                //find the cert tpye
                App.store.certificateTypes.forEach(function(type){
                  if(type.certificateTypeId == cert.certificateTypeId){
                    studentCerts.append({
                      cert: cert,
                      certType: type
                    })
                  }
                })
              }
            })
          });
          s.certificates = studentCerts;
          studentCerts.forEach(function(cert){
            studentTemplate.find('.studentCertificates').append(`<li>${cert.certType.certificateName}</li>`);
          });
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

  loadCertificateData: function(){
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      certIssuerInstance.getAllCertificates.call().then(function(data){
        App.store.certificates = data;
      })
    })
  },

  loadEnrollmentData: function(){
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      certIssuerInstance.getAllEnrollments.call().then(function(data){
        console.log("Enrollments");
        console.log(data);
        App.store.enrollments = data;
        $('#enrollments').empty();
        App.store.enrollments.forEach(function(e){
          var enrollmentTemplate = $('#enrollmentTemplate');
          enrollmentTemplate.find('.enrollmentId').text(e.enrollmentId);
          enrollmentTemplate.find('.enrollmentStudentAddress').text(e.studentAddress);
          enrollmentTemplate.find('.enrollmentCourseId').text(e.courseId);
          enrollmentTemplate.find('.enrollmentPass').text(e.pass);
          $('#enrollments').append(enrollmentTemplate.html());
        })
      })
    })
  },

  requestCertificate: function(certTypeId){
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      let certCostEther = "1";
      let certCostWei = web3.utils.toWei(certCostEther, 'ether');
      console.log(`certCostWei ${certCostWei}`);
      return certIssuerInstance.requestCert(certTypeId, {
        from: App.store.userAccount,
        value: certCostWei
      });
    }).then(function(tx){
      console.log(tx);
      // Do some sort of congrats here
    }).catch(function(err){
      console.log(err.message);
    })
  },

  validateCertificate: function(){

  },

  bindEvents: function() {
    $(document).on('click', '#addCourse', App.handleAddCourse);
    $(document).on('click', '#addStudent', App.handleAddStudent);
    $(document).on('click', '#addCertType', App.handleAddCertificateType);
    $(document).on('click', '#addEnrollment', App.handleAddEnrollment);
    $(document).on('click', '#requestCert', App.handleRequestCertificate);
  },

  addCourse: function(name, desc){
    var certIssuerInstance;
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      return certIssuerInstance.addCourse(name, desc, {from: App.store.userAccount});
    }).then(function(tx){
      console.log(tx);
      App.loadCourseData();
      $("#courseForm").trigger("reset");
    }).catch(function(err){
      console.log(err.message);
    });
  },

  addStudent: function(address, name){
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      return certIssuerInstance.addStudent(address, name, {from: App.store.userAccount});
    }).then(function(tx){
      console.log(tx);
      App.loadStudentData();
      $("#studentForm").trigger("reset");
    }).catch(function(err){
      console.log(err.message);
    });
  },

  addCertificateType: function(name, desc, numCoursesRequired){
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      return certIssuerInstance.addCertificateType(name, desc, numCoursesRequired, {from: App.store.userAccount});
    }).then(function(tx){
      console.log(tx);
      App.loadCertificateTypeData();
      $("#certTypeForm").trigger("reset");
    }).catch(function(err){
      console.log(err.message);
    });
  },

  addEnrollment: function(courseId, studentAddress, pass){
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      return certIssuerInstance.addEnrollment(courseId, studentAddress, pass, {from: App.store.userAccount});
    }).then(function(tx){
      console.log(tx);
      $("#enrollmentForm").trigger("reset");
      App.loadEnrollmentData();
    }).catch(function(err){
      console.log(err.message);
    });
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

  handleAddEnrollment: function(event){
    event.preventDefault();
    let studentAddress = $('#enrollStudentAddress').val();
    let courseId = $('#enrollCourseId').val();
    let pass = $('#enrollmentPass').is(':checked');
    App.addEnrollment(courseId, studentAddress, pass);
  },

  handleRequestCertificate: function(event){
    event.preventDefault();
    let certId = $('#certIdInput').val();
    App.requestCertificate(certId);
  },

  isOwner: function(){
    return App.store.ownerAddress == App.store.userAccount;
  },

  checkAdminVis: function(){
    // every .5s, check if the user account has changed
    let intervalId = setInterval(function(){
      App.setAccount();
      if(App.isOwner()){
        $('.ownerOnly').show();
      } else {
        $('.ownerOnly').hide();
      }
    }, 500);
    App.store.intervalId = intervalId;
    return intervalId;
  }

};

$(function() {
  $(window).on('load', function() {
    App.init();
  });
});
