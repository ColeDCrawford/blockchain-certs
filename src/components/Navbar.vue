<template>
  <b-navbar
    toggleable="md"
    type="dark"
    variant="info">
    <b-navbar-brand :to="{ name: 'Home' }">Home</b-navbar-brand>
    <b-navbar-nav>
      <b-nav-item :to="{ name: 'Validate'}">Validate</b-nav-item>
      <b-nav-item :to="{ name: 'Request'}">Request</b-nav-item>
      <b-nav-item :to="{ name: 'Programs'}">Programs</b-nav-item>
      <b-nav-item :to="{ name: 'Admin'}">Admin</b-nav-item>
    </b-navbar-nav>
  </b-navbar>
</template>

<script>
export default {
  name: 'Navbar'
};
</script>