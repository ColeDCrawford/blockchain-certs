# blockchain-certs

## Overview
This project is a DApp which grants certificates to students who have successfully completed courses. The contract owner is able to create different types of certificates; they can then add courses and track students (using a wallet address) who enroll in those courses. When a student has completed the certificate requirements, they can then request a certificate. If their request is valid, the certificate is generated and a certificate ID returned. The certificate ID can be used to verify the certificate validity on the platform.

The project uses
- Solidity
- Truffle
- Ganache
- [Truffle Contract (NPM package version)](https://www.npmjs.com/package/@truffle/contract); this is bundled using `browserify`, a package which bundles NPM packages for use by vanilla JS projects without a full build system.
- Bootstrap 4
- jQuery 3

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
