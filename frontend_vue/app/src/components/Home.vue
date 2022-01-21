<template>
  <div class="home">
    <h1>Welcome to the App!</h1>
    <div>
      To use this app you'll need to
      <router-link to="/login"> Login </router-link>
      or
      <router-link to="/register"> Register </router-link>
    </div>

    <div>
      <br />
      <br />
      <p>
        To add random data to the database please press the following button. Tables are
        created and filled with 5 rows of sample data each, only two users are left:
      </p>

      <p>
        - user with email "test44@gmail.com" and password: "testPassword" who has embassy
        worker user rights, i.e. can add events
      </p>
      <p>
        - user with email "test33@gmail.com" and password: "testPassword" who has company
        user rights, i.e. can register to events
      </p>
      <b-button type="submit" variant="primary" class="mr-1" v-on:click="addInitialData"
        >Submit</b-button
      >
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  computed: {},

    data() {
    return {
      pramData: {},
    };
  },

  methods: {
    getUpdates() {

      const timer = ms => new Promise(res => setTimeout(res, ms))

      for (var i = 0; i < 10; i++) {
         timer(3000); 

        axios({
        method: "get",
        url: "//localhost:5010",
        headers: {},
        data: {},
      })
        .then((data) => {
          console.log(i)
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
  
}



    },

    addInitialData() {

      this.getUpdates()

      this.pramData.number = "4"
      this.pramData.max_iter = "11"

      
    },


  },
};
</script>
