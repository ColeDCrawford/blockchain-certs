var contract = require("@truffle/contract");
App = {
  web3Provider: null,
  contracts: {},
  store:{
    ownerAddress: null,
    issuerName: null,
    courses: {},
    students: {},
    certificates: {},
    certificateTypes: {},
    enrollments: {},
    userAccount: null,
    studentData: null,
    initalized: false,
    accountChanged: false
  },

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

      // Larger loads which can change
      App.loadCertificateTypeData();
      App.loadCertificateData();
      App.loadCourseData();
      App.loadEnrollmentData();
      App.loadStudentData();
      // Not actually using this - is there a better way to make this function wait for all the async calls to contract to load?
      return certIssuerInstance.getAllCourses.call();
    }).then(function(courses){
      // Populate with contract data
      console.log('populating templates');

      $('#ownerAddress').text(App.store.ownerAddress);
      $('#issuerName').text(App.store.issuerName);

      // Runs every .5s
      App.checkAdminVis();
      App.checkStudentVis();
    });
  },

  loadCourseData: function(){
    var certIssuerInstance;
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      certIssuerInstance.getAllCourses.call().then(function(data){
        //App.store.courses = data;
        // data manipulation
        data.forEach(function(course){
          let objCourse = Object.assign({}, course);
          App.store.courses[course.courseId] = objCourse;
        });

        // view
        $('#courses').empty();
        // App.store.courses.forEach(function(c){ // use keys instead
        for (const [key, c] of Object.entries(App.store.courses)) {
          var courseTemplate = $('#courseTemplate').clone();
          console.log(c);
          courseTemplate.find('.courseName').text(c.courseName);
          courseTemplate.find('.courseId').text(c.courseId);
          courseTemplate.find('.courseDescription').text(c.courseDescription);
          $('#courses').append(courseTemplate.html());
        }
      });
    });
  },

  loadStudentData: function(){
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      certIssuerInstance.getAllStudents.call().then(function(data){
        // App.store.students = data;
        data.forEach(function(student){
          let objStudent = Object.assign({}, student);
          App.store.students[student.studentAddress] = objStudent;
        })

        $('#students').empty();

        // App.store.students.forEach(function(s){
        for (const [key, s] of Object.entries(App.store.students)) {
          console.log(s);
          var studentTemplate = $('#studentTemplate').clone();
          studentTemplate.find('.studentName').text(s.studentName);
          studentTemplate.find('.studentAddress').text(s.studentAddress);
          studentTemplate.find('.studentEnrollments').text(s.enrollmentIds.length);
          
          // append all certs
          studentCerts = {};
          s.certificateIds.forEach(function(certId){
            let cert = Object.assign({}, App.store.certificates[certId]);
            studentCerts[certId] = cert;
            // OLD LOGIC before using object to store certs
            // App.store.certificates.forEach(function(cert){
            //   if(certType.certificateId == certId){
            //     //find the cert tpye
            //     App.store.certificateTypes.forEach(function(type){
            //       if(type.certificateTypeId == cert.certificateTypeId){
            //         studentCerts.append({
            //           cert: cert,
            //           certType: type
            //         })
            //       }
            //     })
            //   }
            // })
          });

          s.certificates = studentCerts;

          studentEnrollments = {};
          s.enrollmentIds.forEach(function(enrollmentId){
            let e = Object.assign({}, App.store.enrollments[enrollmentId]);
            e.course = Object.assign({}, App.store.courses[e.courseId]);
            studentEnrollments[enrollmentId] = e;
          });
          s.enrollments = studentEnrollments;

          for (const [key, cert] of Object.entries(s.certificates)) {
          // studentCerts.forEach(function(cert){
            studentTemplate.find('.studentCertificates').append(`<li>${cert.certificateName}</li>`);
          };
          $('#students').append(studentTemplate.html());
        }
      })
    });
  },

  loadCertificateTypeData: function(){
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      certIssuerInstance.getAllCertTypes.call().then(function(data){
        // App.store.certificateTypes = data;
        data.forEach(function(certType){
          let objCertType = Object.assign({}, certType);
          App.store.certificateTypes[certType.certificateTypeId] = objCertType;
        });

        $('#certificateTypes').empty();
        // App.store.certificateTypes.forEach(function(t){
        for (const [key, t] of Object.entries(App.store.certificateTypes)) {
          var certTypeTemplate = $('#certificateTypeTemplate').clone();
          console.log(t);
          certTypeTemplate.find('.certificateName').text(t.certificateName);
          certTypeTemplate.find('.certificateDescription').text(t.certificateDescription);
          certTypeTemplate.find('.certificateTypeId').text(t.certificateTypeId);
          certTypeTemplate.find('.numCoursesRequired').text(t.numCoursesRequired);
          $('#certificateTypes').append(certTypeTemplate.html());
        }
      })
    })
  },

  loadCertificateData: function(){
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      certIssuerInstance.getAllCertificates.call().then(function(data){
        // console.log(data);
        // App.store.certificates = data;
        if(data.length > 0){
          data.forEach(function(c){
            let certType = App.store.certificateTypes[c.certificateTypeId];
            console.log('enhancing cert data');
            console.log(c);
            console.log(certType);
            console.log(certType.certificateName);
            let cert = Object.assign({}, c);
            cert["certificateName"] = certType.certificateName;
            cert["certficateDescription"] = certType.certificateDescription;
            App.store.certificates[cert.certificateId] = cert;
            console.log(cert);
          });

          $('#certs').empty();
          for (const [key, c] of Object.entries(App.store.certificates)) {
            var certTemplate = $("#certificateTemplate").clone();
            certTemplate.find('.alert').remove();
            certTemplate.find('.certificateName').text(c.certificateName);
            certTemplate.find('.certId').text(c.certificateId);
            certTemplate.find('.certStudentName').text(c.studentName);
            certTemplate.find('.certIssuedDate').text(App.unixTimestampToDate(c.issuedDate));
            $('#certs').append(certTemplate.html());
          }
        }
      })
    })
  },

  loadEnrollmentData: function(){
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      certIssuerInstance.getAllEnrollments.call().then(function(data){
        console.log("Enrollments");
        console.log(data);
        // App.store.enrollments = data;
        data.forEach(function(enrollment){
          let objEnrollment = Object.assign({}, enrollment);
          App.store.enrollments[enrollment.enrollmentId] = objEnrollment;
        })

        $('#enrollments').empty();
        // App.store.enrollments.forEach(function(e){
        for (const [key, e] of Object.entries(App.store.enrollments)) {
          var enrollmentTemplate = $('#enrollmentTemplate').clone();
          enrollmentTemplate.find('.enrollmentId').text(e.enrollmentId);
          enrollmentTemplate.find('.enrollmentStudentAddress').text(e.studentAddress);
          enrollmentTemplate.find('.enrollmentCourseId').text(e.courseId);
          enrollmentTemplate.find('.enrollmentPass').text(e.pass);
          $('#enrollments').append(enrollmentTemplate.html());
        }
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
      // todo add certID to notification
      App.createNotification("Certificate created successfully", "alert-success");
    }).catch(function(err){
      console.log(err.message);
    })
  },

  validateCertificate: function(event){
    event.preventDefault();
    let certId = $('#validateCertId').val();
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      return certIssuerInstance.getCert(certId).then(function(c){
        // need to add additional certType data
        let cert = Object.assign({}, c);
        $('#validatedCert').empty();
        if(!cert.valid){
          let certTemplate = $('#certificateTemplate').clone();
          certTemplate.find('.alert').addClass("alert-danger");
          certTemplate.find('.alert').text("Certificate invalid");
          certTemplate.find('.certInnerContent').remove();
          $('#validatedCert').append(certTemplate.html());
        } else {
          let certType = App.store.certificateTypes[cert.certificateTypeId];
          cert["certificateName"] = certType.certificateName;
          cert["certficateDescription"] = certType.certificateDescription;
  
          let certTemplate = $('#certificateTemplate').clone();
          let alertClass = cert.valid ? "alert-success" : "alert-danger";
          let alertText = cert.valid ? "Certificate valid" : "Certificate invalid";
          certTemplate.find('.alert').addClass(alertClass);
          certTemplate.find('.alert').text(alertText);
          certTemplate.find('.certificateName').text(cert.certificatName);
          certTemplate.find('.certId').text(cert.certificateId);
          certTemplate.find('.certStudentName').text(cert.studentName);
          certTemplate.find('.certIssuedDate').text(App.unixTimestampToDate(cert.issuedDate));
          $('#validatedCert').append(certTemplate.html());
  
          // update all cert data with new info
          App.loadCertificateData();
        }
      })
    });
  },

  createNotification: function(html, alertClass){
    var alertTemplate = $('#alertTemplate').clone();
    alertTemplate.find('.alertContent').html(html);
    alertTemplate.find('.alert').addClass(alertClass);
    $('#main').append(alertTemplate.html());
  },

  bindEvents: function() {
    $(document).on('click', '#addCourse', App.handleAddCourse);
    $(document).on('click', '#addStudent', App.handleAddStudent);
    $(document).on('click', '#addCertType', App.handleAddCertificateType);
    $(document).on('click', '#addEnrollment', App.handleAddEnrollment);
    $(document).on('click', '#requestCert', App.handleRequestCertificate);
    $(document).on('click', '#validateCert', App.validateCertificate);
  },

  addCourse: function(name, desc){
    var certIssuerInstance;
    App.contracts.CertificateIssuer.deployed().then(function(instance){
      certIssuerInstance = instance;
      return certIssuerInstance.addCourse(name, desc, {from: App.store.userAccount});
    }).then(function(tx){
      App.createNotification("Course created successfully", "alert-success");
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
      App.createNotification("Student created successfully", "alert-success");
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
      App.createNotification("Certificate Type created successfully", "alert-success");
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
      App.createNotification("Enrollment created successfully", "alert-success");
      console.log(tx);
      $("#enrollmentForm").trigger("reset");
      App.loadEnrollmentData();
      App.loadStudentData();
    }).catch(function(err){
      console.log(err.message);
    });
  },

  setAccount: function(){
    let oldAccount = App.store.userAccount;
    web3.eth.getAccounts().then(function(accounts){
      App.store.userAccount = accounts[0];
      if(!App.store.accountChanged && (oldAccount != accounts[0])){
        App.store.accountChanged = true;
      };
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

  isStudent: function(){
    return App.store.userAccount in App.store.students;
  },

  checkAdminVis: function(){
    // every .5s, check if the user account has changed
    let intervalId = setInterval(function(){
      // current Account is set by checkStudentVis
      // let currentAccount = App.store.userAccount;
      // App.setAccount();
      // let changed = (currentAccount != App.store.userAccount);

      if(App.isOwner()){
        $('.ownerOnly').show();
      } else {
        $('.ownerOnly').hide();
      }
    }, 500);
    App.store.adminIntervalId = intervalId;
    return intervalId;
  },

  checkStudentVis: function(){
    // every .5s, check if the user is a student
    let intervalId = setInterval(function(){
      // let currentAccount = App.store.userAccount;
      App.setAccount();
      // let newAccount = App.store.userAccount;
      // console.log(`${currentAccount} - ${newAccount}`);
      // let changed = (currentAccount != newAccount);

      // this should only trigger if student status has changed
      if(App.isStudent() && (App.store.accountChanged || !App.store.initialized)){
        App.store.accountChanged = false;
        // set the student data
        App.store.initialized = true;
        App.store.studentData = App.store.students[App.store.userAccount];
        // // Object filtering: https://stackoverflow.com/questions/38750705/filter-object-properties-by-key-in-es6
        // let studentCerts = Object.keys(App.store.certificates)
        //   .filter(key => studentData.certificateIds.includes(key))
        //   .reduce((obj, key) => {
        //     obj[key] = App.store.certificates[key];
        //     return obj;
        //   }, {});

        $('.studentInfoField').empty();
        $('.studentInfoName').html(App.store.studentData.studentName);
        $('.studentInfoAddress').html(App.store.studentData.studentAddress);

        for (const [key, c] of Object.entries(App.store.studentData.certificates)) {
          var certTemplate = $("#certificateTemplate").clone();
          certTemplate.find('.alert').remove();
          certTemplate.find('.certificateName').text(c.certificateName);
          certTemplate.find('.certId').text(c.certificateId);
          certTemplate.find('.certStudentName').text(c.studentName);
          certTemplate.find('.certIssuedDate').text(App.unixTimestampToDate(c.issuedDate));
          $('#studentInfoCerts').append(certTemplate.html());
        };

        for (const [key, e] of Object.entries(App.store.studentData.enrollments)){
          var enrollmentTemplate = $('#enrollmentStudentTemplate').clone();
          enrollmentTemplate.find(".enrollmentStudentCourse").text(e.course.courseName);
          enrollmentTemplate.find(".enrollmentStudentCourseDesc").text(e.course.courseDescription);
          enrollmentTemplate.find('.enrollmentId').text(e.enrollmentId);
          let pass = e.pass ? "Pass" : "Fail";
          enrollmentTemplate.find('.enrollmentPass').text(pass);
          $('#studentInfoEnrollments').append(enrollmentTemplate.html());
        }

        $('.studentOnly').show();
      } else {
        // remove student data
        if(App.store.accountChanged){
          App.store.accountChanged = false;
          App.store.initalized = true;
          App.store.studentData = null;
          $('.studentInfoField').empty();
          $('.studentOnly').hide();
        }
      }
    }, 500);
    App.store.studentIntervalId = intervalId;
  },
  //https://coderrocketfuel.com/article/convert-a-unix-timestamp-to-a-date-in-vanilla-javascript
  unixTimestampToDate: function(timestamp){
    const milliseconds = timestamp * 1000;
    const dateObject = new Date(milliseconds)
    return dateObject.toLocaleString();
  }

};

$(function() {
  $(window).on('load', function() {
    App.init();
  });
});
