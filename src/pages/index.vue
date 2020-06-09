<template>
    <div>
        <h1>{{h1}}</h1>
    </div>
</template>
<script lang=ts>
import axios from 'axios';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Vue,{Component} from 'vue';

export default {
    name:"PageIndex",
    asyncData: function( {store, route} ){
        return store.dispatch("FETCH_INDEX_TITLE");
    },
    data:function(){
        return{
            h1:"Hello123111"
        }
    }
} as Component;

</script>