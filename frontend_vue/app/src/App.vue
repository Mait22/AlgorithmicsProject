
<template>
  <div id="app">


  <b-container class="bv-example-row">


  <b-row class="justify-content-md-center">
    <b-col col lg="2"></b-col>
    <b-col cols="12" md="auto">


    <div v-if="!showGraph">
      <p>Please make selections to see results and then give 5-10s for first iteration to finish</p>
    </div>

    
    <div v-if="!running">
      <p>Please specify number to predict:</p>
      <multiselect
        v-model="numberToPredict"
        :options="number_options"
        track-by="name"
        label="name"
        placeholder="Select one"
      ></multiselect>
    </div>

    <div v-if="showGraph">
      <br>
      <p>Computautin is running ... Current iteration shown is: {{iteration}}</p>
    </div>

    </b-col>
    <b-col col lg="2"><br></b-col>
  </b-row>


  <b-row class="justify-content-md-center">
    <b-col col lg="5"></b-col>
    <b-col cols="6" md="auto">
    
    <div v-if="!running">
    <br/>
      <b-button type="submit" class="mr-1" ref="start" v-on:click="start">
            Start
      </b-button>
    </div>

    </b-col>
    <b-col col lg="5"><br></b-col>
  </b-row>


    <b-row class="justify-content-md-center">
    <b-col col lg="3"></b-col>
    <b-col cols="10" md="auto">
    
    <div v-if="showGraph">
    <br/>
      <div v-if="showGraph">
          <p>Pixel graph of data</p>
      </div>
        <div v-if="showGraph" id="grid_graph"></div>
    </div>

    </b-col>
    <b-col col lg="3"><br></b-col>
  </b-row>

  </b-container>



  <div v-if="showGraph">
  <p>Predicted probabilities</p>
  <vue-bar-graph
  :points= "data"
  :show-y-axis="true"
  :show-x-axis="true"
  :width="800"
  :height="400"
  :show-values="false"
  :use-custom-labels="true"
  :labels="['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']"
/>
</div>


    
      
</div>
</template>

<script>
import axios from 'axios'
import * as d3 from "d3";
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

      running: false,
      
      svgWidth: 220,
      svgHeight: 220,
      svgPadding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
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

      gridData: null,

      probabilities: null,
      showGraph: false,
      finished: false,
      iteration: null,

      data: [
        {label:"1", value: 10},
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
      maxIter: 11,
      pramData: {},
      }
  },
  methods: {
    async drawGrid() {


      let svg = d3.select("#grid_graph")
      .append("svg")
        .attr("width", this.svgWidth + this.svgPadding.left + this.svgPadding.right)
        .attr("height", this.svgHeight + this.svgPadding.top + this.svgPadding.bottom)
      .append("g")
        .attr("transform",
              "translate(" + this.svgPadding.left + "," + this.svgPadding.top + ")")


      let rows = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10', 'r11', 'r12', 'r13', 'r14']
      rows = rows.reverse()

      let columns = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13', 'c14']


      const x = d3.scaleBand()
      .range([ 0, this.svgWidth ])
      .domain(columns)
      .padding(0.05);
      
      svg.append("g")
      .style("font-size", 15)
      .attr("transform", `translate(0, ${this.svgHeight})`)
      .call(d3.axisBottom(x).tickSize(1))
      .select(".domain").remove()


      const y = d3.scaleBand()
      .range([ this.svgWidth, 0 ])
      .domain(rows)
      .padding(0.05);

      svg.append("g")
      .style("font-size", 15)
      .call(d3.axisLeft(y).tickSize(1))
      .select(".domain").remove()

      
      const myColor = d3.scaleLinear()
      .range(["white", "black"])
      .domain([0,1])

      let data = []

      let ii = 0
      for (var r = 1; r < 15; r++) {
        for (var c = 1; c < 15; c++) {

          let rr = 15-r 
          let el = {}
          el.value = this.gridData[ii]
          el.row = 'r' + rr.toString()
          el.column = 'c' + c.toString()
          data.push( el )
          ii++
        }
      } 


      svg.append("g")
      const rectangles = 
      svg
      .selectAll('rect')
      .data(data)


      rectangles.exit().remove();

      rectangles
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.column))
      .attr("y", (d) => y(d.row))
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", d => myColor(d.value))
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
    },

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
          this.running = false;

        })
        .catch((err) => {
          console.log(err);
        });
      
    },
    start() {
      this.startComputation()
      this.updateData()
      this.running = true;
    },
    
    async updateData() {
      for (var i = 0; i < 11; i++) {
        
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
                  let val = parseFloat(el)*100
                  let num = this.data[i].number
                  updatedData.push({"label":num, "value": val})
                });

                // Pixel values
                let raw_matrix = d.data.res_array
                raw_matrix = raw_matrix.replace(/(\r\n|\n|\r)/gm, '');
                raw_matrix = raw_matrix.replace(/[\])}[{(]/g, '')
                raw_matrix = raw_matrix.split('.')
                let cleanedMatrix = []
                raw_matrix.forEach((e) => cleanedMatrix.push(parseFloat(e)))


                if(!this.finished) {
                  this.data = updatedData
                  this.gridData = cleanedMatrix
                  this.drawGrid()
                }
                
                if(d.data.pre_emptive_final != 0) {
                  this.finished = true
                }

              }
              
              
            })
            .catch((err) => {
              console.log(err);
            });
            await new Promise(res => setTimeout(res, 3000))
            

      }
    },
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
