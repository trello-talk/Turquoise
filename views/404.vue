<template>
    <div class="main error">
      <img src="/images/error.svg">
      <h1 class="status">{{ error || '404 - Not Found' }}</h1>
    </div>
</template>

<script>
export default {
    data: () => ({})
}
</script>