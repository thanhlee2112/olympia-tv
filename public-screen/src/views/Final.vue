<template>
<div>

  <div v-if="!state.final.packageValue">
    <button>40</button>
    <button>60</button>
    <button>80</button>
  </div>

  <div v-else>

    <h2>
      {{
        state.final.questions[
          state.final.currentIndex
        ]?.text
      }}
    </h2>

    <h3>
      {{
        state.players.find(
          p=>p.id===state.final.activePlayer
        )?.name
      }}
    </h3>

    <div>
      {{
        state.players.map(p=>(
          p.name+" "+p.score
        ))
      }}
    </div>

  </div>

</div>
</template>

<script setup>
import { state } from "../socket"
</script>
