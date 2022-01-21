<template>
  <div id="app">


  <div class="vis-component" ref="chart" >


  <svg class="main-svg" :width="svgWidth" :height="svgHeight">
        <g class="chart-group" ref="chartGroup1">
          <g class="axis axis-x" ref="axisX1"></g>
          <g class="axis axis-y" ref="axisY1"></g>
          <g class="bar-grop" ref="barGroup1"></g>
        </g>
      </svg>

  </div>


  <div>
  <p>Please specify number to predict:</p>
  <multiselect
    v-model="numberToPredict"
    :options="number_options"
    track-by="name"
    label="name"
    placeholder="Select one"
  ></multiselect>
  
  </div>

  <b-button type="submit" class="mr-1" ref="start" v-on:click="start">
          Start
  </b-button>


  <div v-if="!showGraph">
  <p>Please make selections to see results</p>
  </div>
  <div v-if="showGraph">
  <p>Iteration: {{iteration}}</p>
  <p>Predicted probabilities</p>
  <vue-bar-graph
  :points= "data"
  :show-y-axis="true"
  :show-x-axis="true"
  :width="600"
  :height="300"
  :show-values="true"
  :use-custom-labels="true"
/>
</div>
    
      
  </div>
</template>

<script>



import axios from 'axios'
//import * as d3 from "d3";
import VueBarGraph from 'vue-bar-graph';
import Multiselect from "vue-multiselect";



export default {
  name: 'App',
  components: {
    VueBarGraph,
    Multiselect
  },
  data() {
    return {
      
      // Canvas parameters
      svgWidth: 600,
      svgHeight: 400,
      svgPadding: {
        top: 20,
        right: 0,
        bottom: 20,
        left: 0,
      },

      number_options: [
        { name: '1', value: '0' },
        { name: '2', value: '1' },
        { name: '3', value: '2' },
        { name: '4', value: '3'},
        { name: '5', value: '4' },
        { name: '6', value: '5' },
        { name: '7', value: '6' },
        { name: '8', value: '7' },
        { name: '9', value: '8' },
        { name: '10', value: '9' },

      ],

      gridData: {},

      probabilities: null,

      showGraph: false,

      finished: false,

      iteration: null,

      data: [
        {label:"1", value: 55},
        {label:"2", value: 10},
        {label:"3", value: 10},
        {label:"4", value: 10},
        {label:"5", value: 10},
        {label:"6", value: 10},
        {label:"7", value: 10},
        {label:"8", value: 10},
        {label:"9", value: 10},
        {label:"0", value: 10}
        ],

      dataPresent: false,

      numberToPredict: null, 
      maxIter: null,

      pramData: {},
      }
  },
  methods: {
    async startComputation() {

      this.pramData.number = this.numberToPredict.value
      this.pramData.max_iter = this.maxIter

      return axios({
        method: "post",
        url: "//localhost:5000/start",
        headers: {},
        data: this.pramData,
      })
        .then((data) => {
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
      
    },


    start() {

      this.startComputation()
      this.updateData()


    },


    


    drawGrid() {

    },

    async updateData() {

      for (var i = 0; i < 10; i++) {

        
          axios({
            method: "get",
            url: "//localhost:5010",
            headers: {},
            data:{},
          })
            .then((d) => {

              

              if (d.data != null) {
                
                this.iteration = d.data.iteration

                this.showGraph = true

                this.probabilities = d.data.preds
                
                const predict = d.data.preds
                console.log(predict)

                const updatedData = []

                predict.forEach((el, i) => {

                  let val = parseFloat(el)*100-10
                  let num = this.data[i].number
                  updatedData.push({"label":num, "value": val})
                });

                this.data = updatedData


                if(d.data.pre_emptive_final == 1) {this.finished = true}

                //this.drawBarChart()
              }

              
              
            })
            .catch((err) => {
              console.log(err);
            });



            await new Promise(res => setTimeout(res, 10000))

            if(this.finished) {
              break;
            }


      }

    }
  },

  computed: {

  },
  mounted() {

  
  },
}
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}
</style>