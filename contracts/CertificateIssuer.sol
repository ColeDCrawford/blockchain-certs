// SPDX-License-Identifier: GPL-3.0

// pragma solidity ^0.7.0;
// pragma experimental ABIEncoderV2;
pragma solidity ^0.8.0;
// Using the new ABI coder which can return arrays of structs

contract CertificateIssuer {
    address public owner;
    string public issuerName;
    mapping(uint => Certificate) private issued_certificates;
    mapping(uint => CertificateType) public certificate_types;
    mapping(uint => Course) public courses;
    mapping(uint => Enrollment) private enrollments;
    mapping(address => Student) public students;
    
    // need to track the ids for things somewhere, can't get keys from mappings
    uint[] public certTypeIds;
    uint[] public courseIds;
    uint[] private certIds;
    uint[] private enrollmentIds;
    address[] private studentAddresses;

    
    uint private certCount = 1;
    uint private certTypeCount = 1;
    uint private courseCount = 1;
    uint private enrollmentCount = 1;
    
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
    
    function getCertId() private returns (uint){
        return certCount++;
    }
    
    function getCertTypeId() private returns (uint){
        return certTypeCount++;
    }
    
    function getCourseId() private returns(uint){
        return courseCount++;
    }
    
    function getEnrollmentId() private returns(uint){
        return enrollmentCount++;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    constructor(string memory _issuerName, string memory _certName, string memory _certDesc, uint _numCertCoursesRequired) {
        // set up the first cert type - can't call public function?
        uint certTypeId = getCertTypeId();
        CertificateType memory certType = CertificateType(_certName, certTypeId, _certDesc, _numCertCoursesRequired);
        certificate_types[certTypeId] = certType;
        certTypeIds.push(certTypeId);
        
        owner = msg.sender;
        issuerName = _issuerName;
    }
    
    struct Certificate {
        uint certificateId;
        string studentName;
        address studentAddress;
        uint certificateTypeId;
        uint issuedDate;
        bool valid;
        // Potentially, a mapping of courses applied to the cert
    }
    
    struct CertificateType {
        string certificateName;
        uint certificateTypeId;
        string certificateDescription;
        uint numCoursesRequired;
    }
    
    struct Course {
        uint courseId;
        string courseName;
        string courseDescription;
    }
    
    struct Enrollment {
        uint enrollmentId;
        address studentAddress;
        uint courseId;
        bool pass;
    }
    
    struct Student {
        address studentAddress;
        string studentName;
        uint[] enrollmentIds;
        uint[] certificateIds;
    }
    
    function requestCert(uint _certificateTypeId) external payable returns (uint certificateId)  {
        require(msg.value == 1 ether, "You did not pay the correct amount for your certificate issuance request.");
        
        address studentAddress = msg.sender;
        
        bool validRequest = validateRequest(studentAddress, _certificateTypeId);
        require(validRequest, "You have not successfully passed enough courses for this certificate type");
        
        string memory studentName = students[studentAddress].studentName;
        uint certificateTypeId = _certificateTypeId;
        uint issuedDate = block.timestamp;
        certificateId = getCertId();
        
        Certificate memory cert = Certificate(certificateId, studentName, studentAddress, certificateTypeId, issuedDate, true);
        
        issued_certificates[certificateId] = cert;
        students[studentAddress].certificateIds.push(certificateId);
        
        return certificateId;
    }
    
    function validateRequest(address _studentAddress, uint _certTypeId) private view returns (bool valid){
        Student memory student = students[_studentAddress];
        CertificateType memory certType = certificate_types[_certTypeId];
        uint numCoursesPassed = 0;
        
        for(uint i = 0; i < student.enrollmentIds.length; i++){
            uint id = student.enrollmentIds[i];
            Enrollment memory e = enrollments[id];
            if(e.pass){
                numCoursesPassed++;
            }
        }
        valid = false;
        if(numCoursesPassed >= certType.numCoursesRequired){
            valid = true;
        }
        return valid;
    }
    
    function getCert(uint id) public view returns (Certificate memory){
        Certificate memory cert = issued_certificates[id];
        return(cert);
    }
    
    function addStudent(address _studentAddress, string calldata _studentName) public onlyOwner returns (bool success){
        Student memory checkStudent = students[_studentAddress];
        require(bytes(checkStudent.studentName).length == 0, "This student address has already been registered");
        uint[] memory tempEIds;
        uint[] memory tempCertIds;
        Student memory tempStudent = Student(_studentAddress, _studentName, tempEIds, tempCertIds);
        studentAddresses.push(_studentAddress);
        students[_studentAddress] = tempStudent;
        return true;
    }
    
    function addCourse(string calldata _courseName, string calldata _courseDesc) public onlyOwner returns (uint courseId){
        courseId = getCourseId();
        Course memory tempCourse = Course(courseId, _courseName, _courseDesc);
        courses[courseId] = tempCourse;
        courseIds.push(courseId);
        return courseId;
    }
    
    function addEnrollment(uint _courseId, address _studentAddress, bool _pass) public onlyOwner{
        uint enrollmentId = getEnrollmentId();
        
        require(courses[_courseId].courseId > 0, "This courseId doesn't exist.");
        require(!studentEnrollmentAlreadyExists(_courseId, _studentAddress), "This student has already passed this course.");
        
        Enrollment memory tempEnrollment = Enrollment(enrollmentId, _studentAddress, _courseId, _pass);
        enrollments[enrollmentId] = tempEnrollment;
        students[_studentAddress].enrollmentIds.push(enrollmentId);
        enrollmentIds.push(enrollmentId);
    }
    
    function studentEnrollmentAlreadyExists(uint _courseId, address _studentAddress) private view returns (bool exists){
        Student memory student = students[_studentAddress];
        exists = false;
        for(uint i = 0; i < student.enrollmentIds.length; i++){
            uint id = student.enrollmentIds[i];
            Enrollment memory e = enrollments[id];
            if(e.courseId == _courseId && e.pass){
                exists = true;
            }
        }
        return exists;
    }
    
    function addCertificateType(string calldata _certName, string calldata _certDesc, uint _numCoursesRequired) public onlyOwner returns (uint certTypeId){
        require(_numCoursesRequired > 0, "A certificate must require at least one course.");
        certTypeId = getCertTypeId();
        CertificateType memory certType = CertificateType(_certName, certTypeId, _certDesc, _numCoursesRequired);
        certificate_types[certTypeId] = certType;
        certTypeIds.push(certTypeId);
        return certTypeId;
    }

    function getAllStudentIds() public view onlyOwner returns (address [] memory){
        return studentAddresses;
    }

    function getAllStudents() public view onlyOwner returns (Student [] memory){
        Student[] memory studentArr = new Student[](studentAddresses.length);
        for(uint i = 0; i < studentAddresses.length; i++){
            Student memory s = students[studentAddresses[i]];
            studentArr[i] = s;
        }
        return studentArr;
    }

    function getAllCertTypes() public view returns (CertificateType [] memory){
        CertificateType[] memory certArr = new CertificateType[](certTypeIds.length);
        for(uint i = 0; i < certTypeIds.length; i++){
            CertificateType memory c = certificate_types[certTypeIds[i]];
            certArr[i] = c;
        }
        return certArr;
    }

    function getAllCourses() public view returns (Course [] memory){
        Course[] memory courseArr = new Course[](courseIds.length);
        for(uint i = 0; i < courseIds.length; i++){
            Course memory c = courses[courseIds[i]];
            courseArr[i] = c;
        }
        return courseArr;
    }

    function getAllCourseIds() public view returns (uint [] memory){
        return courseIds;
    }

    function getAllEnrollments() public view onlyOwner returns (Enrollment [] memory){
        Enrollment[] memory enrollArr = new Enrollment[](enrollmentIds.length);
        for(uint i= 0; i < enrollmentIds.length; i++){
            Enrollment memory e = enrollments[enrollmentIds[i]];
            enrollArr[i] = e;
        }
        return enrollArr;
    }

    function getEnrollment(uint enrollmentId) public view onlyOwner returns(Enrollment memory){
        return enrollments[enrollmentId];
    }

    function getAllCertificates() public view onlyOwner returns(Certificate [] memory){
        Certificate[] memory certArr = new Certificate[](certIds.length);
        for(uint i=0; i < certIds.length; i++){
            Certificate memory c = issued_certificates[certIds[i]];
            certArr[i] = c;
        }
        return certArr;
    }
    
}