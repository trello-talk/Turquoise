<!--
 This file is part of Turquoise.
 Copyright (c) Snazzah 2016-2019
 Copyright (c) Yamboy1 (and contributors) 2019

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->

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
