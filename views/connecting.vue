<template>
  <div class="main">
    <data :data-profile="profile" :data-fetching="fetching" :data-match="match" :data-token="token" :data-ticket="ticket"></data>

    <img :src="`/images/profiles/${profile}.png`"> <img :class="`c-icon${fetching ? ' ' : ' f'}`" src="/images/connecting.svg"> <img src="/images/discord.svg">
    <h1 class="status">{{ fetching ? `Connecting with ${profileName}`: `Returning to ${profileName}` }}...</h1>
  </div>
</template>

<script>
export default {
    data: () => ({})
}
</script>