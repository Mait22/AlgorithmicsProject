import Vue from 'vue';
import Vuex from 'vuex';
import * as d3 from 'd3';
//import worldMap from '@/assets/countries-110m.json';
//import * as topojson from 'topojson';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    selectedCountries: [],
    highLightedStates: [],
    brushLoc: [[0,0], [0,0]],
    covidData: null,
    mapCountries: null,

    renderComponents: false, 

    xVariable: 'human_development_index',
    xVariableLabel: 'Human Development Index', 
    yVariable: 'life_expectancy',
    yVariableLabel: 'Life Expectancy',

    lineVariable1: { name: 'New cases per million', varibale_technical_name: 'new_cases_per_million' },
    lineVariable2: { name: 'Total cases per million', varibale_technical_name: 'total_cases_per_million', type: 'per' },  

  },

  mutations: {
    changeSelectedCountries(state, val) {
      //console.log(val)
      state.selectedCountries = val;
    },

    setCovidData(state, val) {
      state.covidData = val;
    },
    changeRenderComponents(state, val) {
      state.renderComponents = val;
    },
    changexVariable(state, val) {
      state.xVariable = val;
    },
    changexVariableLabel(state, val) {
      state.xVariableLabel = val;
    },
    changeyVariable(state, val) {
      state.yVariable = val;
    },
    changeyVariableLabel(state, val) {
      state.yVariableLabel = val;
    },
    changeLineVariable1(state, val) {
      state.lineVariable1 = val;
    },
    changeLineVariable2(state, val) {
      state.lineVariable2 = val;
    },
  },

  getters: {
    selectedCountries: (state) => state.selectedCountries,
    getRenderComponents: (state) => state.renderComponents,
    getxVariableLabel: (state) => state.xVariableLabel,
    getyVariableLabel: (state) => state.yVariableLabel,
    getxVariable: (state) => state.xVariable,
    getyVariable: (state) => state.yVariable,
    getLineVariable1: (state) => state.lineVariable1,
    getLineVariable2: (state) => state.lineVariable2,




    xAxisData (state) {

      let result = [];
      for (let el in state.covidData.data) {
        if(!isNaN(+(state.covidData.data[el][state.xVariable])) && !isNaN(+(state.covidData.data[el][state.yVariable]))) {
          result.push({
            state: state.covidData.data[el].location,
            value: +(state.covidData.data[el][state.xVariable])
          })
        }
      }
      return result;
    },

    lineVariableNo1 (state) {

      let result = []
      if(state.selectedCountries.length > 0) {
        for (let el in state.covidData.data) {
          if(state.selectedCountries.includes(state.covidData.data[el].location)) {
            result.push({
              state: state.covidData.data[el].location,
              dataObject: (state.covidData.data[el]['data'])
            })
          }
        }
      }
      if(state.selectedCountries.length === 0) {
            result.push({
              state: 'World',
              dataObject: (state.covidData.data['OWID_WRL']['data'])
            })
      }

      //console.log(result)

      const dParser = d3.timeParse("%Y-%m-%d");


      let aggregatedResult1 = []
      let aggregatedResult2 = []
      let dateUniqueVal = []
      let measureUniqueVal1 = []
      let measureUniqueVal2 = []


      // Aggregated result 1
      for (let i = 0; i < result.length; i++){
        let curVal = {countryName: result[i].state, values: []}

        for (let ii = 0; ii < result[i].dataObject.length; ii++) {

          if(state.lineVariable1.varibale_technical_name in result[i].dataObject[ii] && 'date' in result[i].dataObject[ii]) {
            if( result[i].dataObject[ii][state.lineVariable1.varibale_technical_name] >= 0) {
              curVal.values.push(
                {
                date: dParser(result[i].dataObject[ii].date), 
                measure: result[i].dataObject[ii][state.lineVariable1.varibale_technical_name]
                }
              )
              // For max and min computation
              if (dateUniqueVal.includes(result[i].dataObject[ii].date) === false) {
                dateUniqueVal.push(result[i].dataObject[ii].date)
              }
              if (measureUniqueVal1.includes(result[i].dataObject[ii][state.lineVariable1.varibale_technical_name]) === false) {
                measureUniqueVal1.push(result[i].dataObject[ii][state.lineVariable1.varibale_technical_name])
              }
            }
          }
        }
        if(curVal.values.length > 0) {
          aggregatedResult1.push(curVal)
        }
      }

      // Aggregated result 2
      if(state.lineVariable2 !== null) {
        //console.log('Val2')
        for (let i = 0; i < result.length; i++){
          let curVal = {countryName: result[i].state, values: []}
  
          for (let ii = 0; ii < result[i].dataObject.length; ii++) {
  
            if(state.lineVariable2.varibale_technical_name in result[i].dataObject[ii] && 'date' in result[i].dataObject[ii]) {
              if( result[i].dataObject[ii][state.lineVariable2.varibale_technical_name] >= 0) {
                curVal.values.push(
                  {
                  date: dParser(result[i].dataObject[ii].date), 
                  measure: result[i].dataObject[ii][state.lineVariable2.varibale_technical_name]
                  }
                )
                // For max and min computation
                if (dateUniqueVal.includes(result[i].dataObject[ii].date) === false) {
                  dateUniqueVal.push(result[i].dataObject[ii].date)
                }
                if (measureUniqueVal2.includes(result[i].dataObject[ii][state.lineVariable2.varibale_technical_name]) === false) {
                  measureUniqueVal2.push(result[i].dataObject[ii][state.lineVariable2.varibale_technical_name])
                }
              }
            }

          }
          if(curVal.values.length > 0) {
            aggregatedResult2.push(curVal)
          }
        }
      }

      dateUniqueVal = dateUniqueVal.map(el => dParser(el))


      return {
        data1: aggregatedResult1, 
        data2: aggregatedResult2,
        dateUniqueVal: dateUniqueVal,
        measureUniqueVal1: measureUniqueVal1,
        measureUniqueVal2: measureUniqueVal2 
      }
    },

    
    yAxisData (state) {

      let result = [];
      for (let el in state.covidData.data) {
        if(!isNaN(+(state.covidData.data[el][state.xVariable])) && !isNaN(+(state.covidData.data[el][state.yVariable]))) {
          result.push({
            state: state.covidData.data[el].location,
            value: +(state.covidData.data[el][state.yVariable])
          })
        }
      }
      return result;
    },


    scatterData (state) {

      let resultX = [];
      for (let el in state.covidData.data) {
        if(!isNaN(+(state.covidData.data[el][state.xVariable])) && !isNaN(+(state.covidData.data[el][state.yVariable]))) {
        resultX.push({
          state: state.covidData.data[el].location,
          value: +(state.covidData.data[el][state.xVariable])
        })
        }
      }

      let resultY = [];
      for (let el in state.covidData.data) {
        if(!isNaN(+(state.covidData.data[el][state.xVariable])) && !isNaN(+(state.covidData.data[el][state.yVariable]))) {
        resultY.push({
          state: state.covidData.data[el].location,
          value: +(state.covidData.data[el][state.yVariable])
        })
        }
      }


      let resultXY = []
      for (let i = 0; i < resultX.length; i++) {
        if (resultX.length > 0 && resultY.length > 0) {

          // Data joining
          let tempVal = {
            name: resultX[i].state,
            valueX: resultX[i].value,
            valueY: +(resultY.filter(el => el.state === resultX[i].state))[0].value,
            highlight: state.highLightedStates.includes(resultX[i].state) ? 1 : 0
          }
          resultXY.push(tempVal)
        }
      }

      // color filling
      let xNumeric = []
      let yNumeric = []

      resultXY.forEach(el => {yNumeric.push(el.valueY)})
      resultXY.forEach(el => {xNumeric.push(el.valueX)})

      let xExtent = d3.extent(xNumeric)
      let yExtent = d3.extent(yNumeric)

      let xCritVals = [xExtent[0],(xExtent[1] -xExtent[0])*(1.0/3) + xExtent[0],(xExtent[1] -xExtent[0])*(2.0/3) + xExtent[0], xExtent[1]]
      let yCritVals = [yExtent[0],(yExtent[1] -yExtent[0])*(1.0/3) + yExtent[0],(yExtent[1] -yExtent[0])*(2.0/3) + yExtent[0], yExtent[1]]

      for (let i = 0; i < resultXY.length; i++) {
        if(resultXY[i].valueX < xCritVals[1] 
          && resultXY[i].valueY < yCritVals[1]) {
          resultXY[i].color = "#e8e8e8"
        }
        else if(resultXY[i].valueX >= xCritVals[1] && resultXY[i].valueX < xCritVals[2] 
          && resultXY[i].valueY < yCritVals[1]) {
          resultXY[i].color = "#e4acac"
        }
        else if(resultXY[i].valueX >= xCritVals[2] 
          && resultXY[i].valueY < yCritVals[1]) {
          resultXY[i].color = "#c85a5a"
        }

        else if(resultXY[i].valueX < xCritVals[1] 
          && resultXY[i].valueY >= yCritVals[1] && resultXY[i].valueY < yCritVals[2]) {
          resultXY[i].color = "#b0d5df"
        }
        else if(resultXY[i].valueX >= xCritVals[1] && resultXY[i].valueX < xCritVals[2] 
          && resultXY[i].valueY >= yCritVals[1] && resultXY[i].valueY < yCritVals[2]) {
          resultXY[i].color = "#ad9ea5"
        }
        else if(resultXY[i].valueX >= xCritVals[2] 
          && resultXY[i].valueY >= yCritVals[1] && resultXY[i].valueY < yCritVals[2]) {
          resultXY[i].color = "#985356"
        }

        else if(resultXY[i].valueX < xCritVals[1] 
          && resultXY[i].valueY >= yCritVals[2] ) {
          resultXY[i].color = "#64acbe"
        }
        else if(resultXY[i].valueX >= xCritVals[1] && resultXY[i].valueX < xCritVals[2] 
          && resultXY[i].valueY >= yCritVals[2]) {
          resultXY[i].color = "#627f8c"
        }
        else if(resultXY[i].valueX >= xCritVals[2] 
          && resultXY[i].valueY >= yCritVals[2]) {
          resultXY[i].color = "#574249"
        }
        
      }
      //console.log('ScatterData')
      //console.log(resultXY)
      return resultXY;
    },

    getAllCountries() {
      const countries = this.scatterData()
      let  listOfCountries = []
      countries.forEach(el => {listOfCountries.push(el.name)})
      return(countries)
    },

    squareData (state) {

      let resultX = [];
      for (let el in state.covidData.data) {
        if(!isNaN(+(state.covidData.data[el][state.xVariable])) && !isNaN(+(state.covidData.data[el][state.yVariable]))) {
        resultX.push({
          state: state.covidData.data[el].location,
          value: +(state.covidData.data[el][state.xVariable])
        })
        }
      }

      let resultY = [];
      for (let el in state.covidData.data) {
        if(!isNaN(+(state.covidData.data[el][state.xVariable])) && !isNaN(+(state.covidData.data[el][state.yVariable]))) {
        resultY.push({
          state: state.covidData.data[el].location,
          value: +(state.covidData.data[el][state.yVariable])
        })
        }
      }

      let resultXY = []
      for (let i = 0; i < resultX.length; i++) {
        if (resultX.length > 0 && resultY.length > 0) {

          // Data joining
          let tempVal = {
            name: resultX[i].state,
            valueX: resultX[i].value,
            valueY: +(resultY.filter(el => el.state === resultX[i].state))[0].value
          }
          resultXY.push(tempVal)
        }
      }

      // color filling

      let xNumeric = []
      let yNumeric = []

      resultXY.forEach(el => {yNumeric.push(el.valueY)})
      resultXY.forEach(el => {xNumeric.push(el.valueX)})



      let xExtent = d3.extent(xNumeric)
      let yExtent = d3.extent(yNumeric)

      let xCritVals = [xExtent[0],(xExtent[1] -xExtent[0])*(1.0/3) + xExtent[0],(xExtent[1] -xExtent[0])*(2.0/3) + xExtent[0], xExtent[1]]
      let yCritVals = [yExtent[0],(yExtent[1] -yExtent[0])*(1.0/3) + yExtent[0],(yExtent[1] -yExtent[0])*(2.0/3) + yExtent[0], yExtent[1]]

      let squares = [{name: '1', color: "#e8e8e8", xStart: xCritVals[0], yStart: yCritVals[0], xEnd: xCritVals[1], yEnd: yCritVals[1]},
        {name: '2', color: "#e4acac", xStart: xCritVals[1], yStart: yCritVals[0], xEnd: xCritVals[2], yEnd: yCritVals[1]},
        {name: '3', color: "#c85a5a", xStart: xCritVals[2], yStart: yCritVals[0], xEnd: xCritVals[3], yEnd: yCritVals[1]},
        {name: '4', color: "#b0d5df", xStart: xCritVals[0], yStart: yCritVals[1], xEnd: xCritVals[1], yEnd: yCritVals[2]},
        {name: '5', color: "#ad9ea5", xStart: xCritVals[1], yStart: yCritVals[1], xEnd: xCritVals[2], yEnd: yCritVals[2]},
        {name: '6', color: "#985356", xStart: xCritVals[2], yStart: yCritVals[1], xEnd: xCritVals[3], yEnd: yCritVals[2]},
        {name: '7', color: "#64acbe", xStart: xCritVals[0], yStart: yCritVals[2], xEnd: xCritVals[1], yEnd: yCritVals[3]},
        {name: '8', color: "#627f8c", xStart: xCritVals[1], yStart: yCritVals[2], xEnd: xCritVals[2], yEnd: yCritVals[3]},
        {name: '9', color: "#574249", xStart: xCritVals[2], yStart: yCritVals[2], xEnd: xCritVals[3], yEnd: yCritVals[3]}]
        
      return squares;
    },

    



  },

  actions: {}
})

export default store;
