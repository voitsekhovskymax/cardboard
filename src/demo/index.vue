<template>
	<div :class="'app'">
	<div :class="'content'">
		<div class="header open">
			{{selectedPage.title}}
		</div>
		<div :class="'demo'">
			<Cards v-if="selectedPage.page == 'cards'"></Cards>
		</div>
	</div>
</div>
</template>

<script>
import Pages from "./pages";
import { Cards } from "./pages";
export default {
  name: "Demo",
  components: {
    Cards
  },
  data: function() {
    return {
      isNavOpen: true,
      selectedPage: Pages[0].pages[0],
      pages: Pages
    };
  }
};
</script>

<style></style>

