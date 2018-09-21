<template>
	<div class="card-scene">
      <div  v-bind:class="{ active: keyShift, 'alert':true}"> * Shift key to copy</div>

      <Container 
				orientation="horizontal" 
				@drop="onColumnDrop($event)"
				drag-handle-selector=".column-drag-handle"
				@drag-start="dragStart"
        drag-class="column-ghost"
        drop-class="column-ghost-drop"
			>
				<Draggable v-for="column in scene.columns" :key="column.id" class="coleft">
					<div class="card-container" >
						<div class="card-column-header column-drag-handle ">
                <input type="text" v-model="column.name" class="column_name"   />
						</div>
            <div class="column-color" v-bind:style="{backgroundColor:column.props.cardColor.value}"></div>
            <div class="column-menu" >
             <b-dropdown variant="column-menu"  no-caret>
              <template slot="button-content">
              <icon name="ellipsis-h"></icon>
              </template>
              <b-dropdown-item @click="deleteColumn(column.id)">Delete</b-dropdown-item>
            </b-dropdown>
            </div>
            <div class="column-body">
              <Container 
              class="column-container"
                group-name="col"
                @drop="(e) => onCardDrop(column.id, e)"
                @drag-start="(e) => log('drag start', e)"
                @drag-end="(e) => log('drag end', e)"
                :get-child-payload="getCardPayload(column.id)"
                drag-class="card-ghost"
                drop-class="card-ghost-drop"
                :options="{handle:'.column-container'}"
              >
                <Draggable v-for="card in column.children" :key="card.id"  :id="card.id" class="draggable-card">
                  <div @click="showFeedModal(card)" class="card-draggable">
                      {{card.data.urls[0].value}}
                  </div>
                </Draggable>
              </Container>
            </div>
            <div class="newTask"> 
              <button :id="'addFeedButton'+column.id"  @click="showAddFeedForm(column.id)" class="btn btn-feed"> <icon name="plus"></icon> Add Feed </button>
              <div class="add_task_form hide" :id="'addFeedForm'+column.id">
                <div class="field-wrap">
                    <div v-for="(url, index) in addFeed.data.urls" :key="index" class="feed-url">
                        <input type="text" v-model="url.value" placeholder="https://" class="field">
                        <div v-if="index == addFeed.data.urls.length - 1">
                          <button @click="addUrlFeed()" class="btn-add-url"><icon name="plus"></icon></button>
                        </div>
                    </div>
                </div>  
                
                <button @click="addNewFeed(column.id)" class="btn-save">Add Feed</button>
                <button @click="closeNewFeedForm(column.id)" class="btn-times"><icon name="times"></icon> </button>
              </div>
            </div>
					</div>
				</Draggable>

        <div class="newBoard"> 
            <button @click="addBoard.button=false;addBoard.showForm = true;" v-if="addBoard.button" class="" id="addBoardButton"><icon name="plus"></icon> Add Board </button>
            <div class="add_board_form"  v-if="addBoard.showForm">
              <input type="text" id="add_board_form_input" v-model="addBoard.name" placeholder="Board name" class="field">
              <div class="v-select-color-wrap">
                <div class="choosed-color" :style="{backgroundColor:addBoard.props.cardColor.value}">

                </div>
              <v-select :options="colors" v-model="addBoard.props.cardColor">
                  <template slot="option" slot-scope="option">
                      <span class="select-color-option" v-bind:style="{backgroundColor:option.value}"></span>
                      {{ option.label }}
                  </template>
              </v-select>
              </div>
           
              <button @click="saveNewBoard()" class="btn-save">Add Board</button>
              <button @click="addBoard.button=true;addBoard.showForm = false;" class="btn-times"><icon name="times"></icon> </button>

            </div>
          </div>
			</Container>

      <b-modal ref="myModalRef" hide-footer :title="selectedCard.data.urls[0].value">
          <div v-for="url in selectedCard.data.urls" :key="url.id" class="feed-url">
              <a :href="url.value" target="_blank" class="url">{{url.value}} <icon name="external-link-alt"></icon> </a>
          </div>
        <b-btn class="mt-3" variant="danger"  @click="deleteFeed()">Delete feed</b-btn>
      </b-modal>
    <span style="display:none">{{keyShiftMethod}}</span>

    </div>
</template>

<script>
import { Container, Draggable } from "vue-smooth-dnd";
import { applyDrag, generateItems } from "./utils";

export default {
  name: "Cards",
  components: { Container, Draggable },
  data: function() {
    return {
      color: "#2ECC70",
      keyShift: false,
      scene: {
        columns: []
      },
      addBoard: {
        showForm: false,
        button: true,
        id: "",
        name: "",
        props: {
          orientation: "vertical",
          className: "card-container",
          cardColor: {
            label: "red",
            value: "#f44336"
          }
        },
        children: []
      },
      addFeed: {
        showForm: false,
        button: true,
        id: "",
        data: {
          name: "",
          urls: [{ value: "", id: "" }]
        }
      },
      colors: [
        {
          label: "red",
          value: "#eb5a46"
        },
        {
          label: "green",
          value: "#61bd4f"
        },
        {
          label: "blue",
          value: "#0079bf"
        },
        {
          label: "yellow",
          value: "#f2d600"
        },
        {
          label: "orange",
          value: "#ff9f1a"
        },
        {
          label: "violet",
          value: "#c377e0"
        }
      ],
      selectedCard: {
        id: "",
        props: {
          className: "card",
          style: { backgroundColor: "#" }
        },
        data: {
          name: "",
          urls: [{ value: "" }]
        }
      }
    };
  },
  computed: {
    // геттер вычисляемого значения
    keyShiftMethod: function() {
      var app = this;
      document.onkeydown = function checkKeycode(event) {
        var keycode;
        if (!event) {
          var event = window.event;
        }
        if (event.keyCode) {
          keycode = event.keyCode;
        } else if (event.which) {
          // IE
          keycode = event.which; // all browsers
        }
        if (keycode == 16) {
          var cardShift = document.getElementsByClassName("card-ghost");
          if (cardShift.length > 0) {
            cardShift[0].classList.add("shift");
          }
          app.keyShift = true;
        }
      };

      document.onkeyup = function checkUP(event) {
        var keycode;
        if (!event) {
          var event = window.event;
        }
        if (event.keyCode) {
          keycode = event.keyCode;
        } else if (event.which) {
          // IE
          keycode = event.which; // all browsers
        }
        if (keycode == 16) {
          var cardShift = document.getElementsByClassName("card-ghost");
          if (cardShift.length > 0) {
            cardShift[0].classList.remove("shift");
          }
          app.keyShift = false;
        }
      };
      return false;
    }
  },
  mounted: function() {
    var firstCol = {
      id: new Date().getTime(),
      name: "Philosophers",
      props: {
        cardColor: {
          label: "red",
          value: "#f44336"
        }
      },
      children: [
        {
          id: new Date().getTime() + 1,
          data: {
            urls: [
              {
                value: "https://en.wikipedia.org/wiki/Augustine_of_Hippo"
              },
              {
                value: "https://en.wikipedia.org/wiki/Plato"
              },
              {
                value: "https://en.wikipedia.org/wiki/Aristotle"
              },
              {
                value: "https://en.wikipedia.org/wiki/Socrates"
              }
            ]
          }
        }
      ]
    };

    var secondCol = {
      id: new Date().getTime() + 2,
      name: "Github",
      props: {
        cardColor: {
          label: "green",
          value: "#61bd4f"
        }
      },
      children: [
        {
          id: new Date().getTime() + 3,
          data: {
            urls: [
              {
                value: "http://github.com"
              }
            ]
          }
        }
      ]
    };

    this.scene.columns.push(firstCol);
    this.scene.columns.push(secondCol);
  },
  methods: {
    deleteFeed() {
      for (var i = 0; i < this.scene.columns.length; i++) {
        for (var j = 0; j < this.scene.columns[i].children.length; j++) {
          if (this.scene.columns[i].children[j].id == this.selectedCard.id) {
            this.scene.columns[i].children.splice(j, 1);

            this.$refs.myModalRef.hide();
          }
        }
      }
    },
    deleteColumn(colId) {
      for (var i = 0; i < this.scene.columns.length; i++) {
        if (this.scene.columns[i].id == colId) {
          this.scene.columns.splice(i, 1);
        }
      }
    },
    showFeedModal(card) {
      this.selectedCard = card;
      this.$refs.myModalRef.show();
    },
    addUrlFeed() {
      this.addFeed.data.urls.push({ value: "", id: new Date().getTime() });
    },
    showAddFeedForm(colId) {
      this.addFeed.data.urls = [{ value: "", id: new Date().getTime() }];

      var feedForms = document.getElementsByClassName("add_task_form");
      for (var i = 0; i < feedForms.length; i++) {
        feedForms[i].classList.add("hide");
      }
      var feedForms = document.getElementsByClassName(" btn-feed");
      for (var i = 0; i < feedForms.length; i++) {
        feedForms[i].classList.remove("hide");
      }

      document.getElementById("addFeedForm" + colId).classList.remove("hide");
      document.getElementById("addFeedButton" + colId).classList.add("hide");
    },
    addNewFeed(colId) {
      if (this.addFeed.data.urls[0].value == "") {
        this.addFeed.data = {
          name: "",
          urls: [{ value: "" }]
        };

        var fields = document.querySelectorAll(".add_task_form .field");
        for (var i = 0; i < fields.length; i++) {
          fields[i].classList.add("required");
        }
        return;
      }

      var fields = document.querySelectorAll(".add_task_form .field");
      for (var i = 0; i < fields.length; i++) {
        fields[i].classList.remove("required");
      }
      this.axios({
        method: "get",
        url: this.addFeed.data.urls[0].value,
        headers: {
          "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
          "Access-Control-Allow-Origin": "*"
        }
      }).then(response => {
        console.log(response);
      });

      for (var i = 0; i < this.scene.columns.length; i++) {
        if (this.scene.columns[i].id == colId) {
          var timestamp = new Date();
          var newArr = {
            id: timestamp.getTime(),
            props: {
              className: "card",
              style: { backgroundColor: "#CDDC39" }
            },
            data: this.addFeed.data
          };
          this.scene.columns[i].children.push(newArr);

          this.addFeed.data = {
            name: "",
            urls: [{ value: "" }]
          };
          var feedForm = document.getElementById("addFeedForm" + colId);
          feedForm.classList.add("hide");

          var feedButton = document.getElementById("addFeedButton" + colId);
          feedButton.classList.remove("hide");
        }
      }
    },
    closeNewFeedForm(colId) {
      document.getElementById("addFeedForm" + colId).classList.add("hide");
      document.getElementById("addFeedButton" + colId).classList.remove("hide");
    },
    showAddBoard() {
      // document.getElementById("addBoardForm" + colId).classList.remove("hide");
      // document.getElementById("addBoardButton" + colId).classList.add("hide");
    },
    saveNewBoard(colId) {
      var timestamp = new Date();
      if (this.addBoard.name == "") {
        document
          .getElementById("add_board_form_input")
          .classList.add("required");
        return;
      }
      if (this.addBoard.props.cardColor == null) {
        this.addBoard.props.cardColor = {
          label: "transparent",
          value: "rgba(0,0,0,0)"
        };
      }
      var newBoard = {
        id: timestamp.getTime(),
        name: this.addBoard.name,
        props: {
          orientation: "vertical",
          className: "card-container",
          cardColor: this.addBoard.props.cardColor
        },
        children: []
      };
      this.scene.columns.push(newBoard);
      this.addBoard.id = "";
      this.addBoard.showForm = false;
      this.addBoard.button = true;
      this.addBoard.props.cardColor = {
        label: "red",
        value: "#f44336"
      };
      this.addBoard.name = "";
    },
    onColumnDrop: function(dropResult) {
      const scene = Object.assign({}, this.scene);
      scene.columns = applyDrag(scene.columns, dropResult);
      this.scene = scene;
    },
    clone: function(el) {
      return el;
    },
    onCardDrop: function(columnId, dropResult) {
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
        const scene = Object.assign({}, this.scene);
        const column = scene.columns.filter(p => p.id === columnId)[0];
        const columnIndex = scene.columns.indexOf(column);
        const newColumn = Object.assign({}, column);
        newColumn.children = applyDrag(
          newColumn.children,
          dropResult,
          this.keyShift
        );
        scene.columns.splice(columnIndex, 1, newColumn);
        this.scene = scene;
        // this.keyShift = false;
      }
    },

    getCardPayload: function(columnId) {
      return index => {
        return this.scene.columns.filter(p => p.id === columnId)[0].children[
          index
        ];
      };
    },
    dragStart: function(e) {},
    log: function(...params) {}
  }
};
</script>

<style>
</style>
