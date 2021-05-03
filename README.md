# blockchain-certs

## Overview
This project is a DApp which grants certificates to students who have successfully completed courses. The contract owner is able to create different types of certificates; they can then add courses and track students (using a wallet address) who enroll in those courses. When a student has completed the certificate requirements, they can then request a certificate. If their request is valid, the certificate is generated and a certificate ID returned. The certificate ID can be used to verify the certificate validity on the platform.

The project uses
- Solidity
- Truffle
- Ganache
- [Truffle Contract (NPM package version)](https://www.npmjs.com/package/@truffle/contract)
- `browserify`, a package which bundles NPM packages (here, `@truffle/contract`) for use by vanilla JS projects without a full build system. It generates `app-bundle.js` which is then loaded by the SPA. Running `browserify app.js > app-bundle.js` in the `src/js` directory will rebundle things.
- Bootstrap 4
- jQuery 3
- `lite-server`

## Resources
I looked at a lot of things when I originally tried using Drizzle / Vue and the Vue-Drizzle plugin, but that plugin did a terrible job of maintaining state and obscured a lot of the Web3 functionality so I couldn't write my own state management with those functions. Besides looking up some Javascript syntax and Bootstrap snippets I wrote this version from scratch.

## Project setup
```
npm install
```
- I built this using Ganache for my local blockchain. I imported 3 different accounts to Metamask - the address from which the contract was deployed (admin), an address which course enrollments / certificates / etc would be issued to (student), and an address which should have neither admin nor student rights but could validate certificates and look at public data
- When using the admin account, you can use the tabs to:
    - View all registered students (empty on init)
    - View all enrollment records (empty on init)
    - View all issued certificates (empty on init)
    - Create a new student
    - Create a new course
    - Create an enrollment record (a student's pass/fail of a course)
    - Create a new type of certificate
- When using the student account, you can:
    - Look at your enrollment and certificate records
    - Request a new certificate (cost: 1 ETH)
- When using any of the accounts (including public), you can:
    - Look at public data (courses and certificates offered)
    - Validate a certificate if you have a certificate ID
- When you switch an account in Metamask, the appropriate permissions should be applied and the additional interface will appear / be removed
- A known issue is that App.store (data cache) may contain private data which shouldn't be exposed to all users if switching between accounts. I haven't implemented functionality to protect this cache, which I would do for a production application.

### Compiles and hot-reloads for development
```
npm run dev
```
### Sample Content
- Certificates 
    - There is a sample DSSG certificate which gets deployed from the `2_deploy_contracts.js` migration
    - Bok Center Teaching Certificate
        - The Bok Center's Teaching Certificate offers GSAS PhD students a tangible marker of their ongoing commitment to developing as teachers in higher education. GSAS PhD students may pursue a Certificate through a variety of different avenues, depending on the pedagogical training offered in their respective departments and their own skills and interests. In order to receive a Teaching Certificate, participants must fulfill requirements in each of the following three areas: (1) Learn; (2) Practice; and (3) Reflect.
        - 1 course required (just to have something different)
- Courses
    - Visual Eloquence: A Participatory Workshop on Creating Effective Data Visualizations
        - Visual Eloquence is a participatory workshop on visualizing data and understanding the powerful role it plays in analysis and presentation for digital scholarship. You will learn some fundamentals principles for presenting data and work with others to put them into action. The workshop will feature brief presentations, a collaborative small-group exercise working with a dataset and visualization tools to create a visual presentation, and a discussion.
    - Fundamentals of Digital Scholarship
        - Fundamentals of Digital Scholarship introduces participants to the core stages of digital scholarship’s research workflow: the acquisition, manipulation, analysis, and presentation of data. This seminar serves as a springboard for faculty, students, and staff who wish to explore the potential of digital scholarship. It will provide a solid foundation from which participants can continue to develop these skills whether on their own or through a series of advanced, subject-specific follow-up seminars.
    - Using Web APIs with Python
        - Comfortable with basic Python and want to expand your digital toolkit? Interested in querying and analyzing real-time data or faceted big data? Want to process data using web services or create data mashups? This workshop will help participants integrate RESTful APIs into their data processing workflows. We'll look at how to query the Harvard Art Museums API to get metadata about the most popular images in their collections and exhibits, use the IIIF Image API to manipulate the image files, and use the Omeka API to push information into our own collection of digital objects.
    - Scalar in the Classroom
        - Introducing multimedia assignments into a class for the first time can seem intimidating. In this workshop, we will help you remediate an existing assignment in Scalar, a free, open source authoring and publishing platform designed to make it easy for authors and instructors to create born-digital scholarship online. Scalar enables users to assemble media from multiple sources and juxtapose them with their own writing in a variety of ways, with minimal technical expertise required.