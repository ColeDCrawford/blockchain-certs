var CertificateIssuer = artifacts.require("CertificateIssuer");

module.exports = function(deployer) {
  // Args: issuerName, certName, certDesc, numCertCoursesRequired
  deployer.deploy(
    CertificateIssuer,
    "Harvard University Digital Scholarship Support Group",
    "Graduate Certificate in Digital Scholarship",
    "The certificate enables gradudate students in the humanities and social sciences to develop competency in digital methods and display those skills. The curricular structure is built around a common core of workshops designed to provide students with a conceptual framework based on the research data lifecycle and the skills to implement the different stages of that lifecycle.",
    3
  );
};