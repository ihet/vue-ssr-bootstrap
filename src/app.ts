import Vue from "vue";
import entry from "./entry.vue";
import CreateStore from "./stores/stores";
import CreateRouter from "./routers/routers";
import { sync } from 'vuex-router-sync'


export default function CreateApp(){
    const store = CreateStore();
    const router = CreateRouter();
    sync(store,router);
    const app = new Vue({
        store,
        router,
        render: ( createElement ) => {
            return createElement(entry);
        }
    })
    return { app, router, store } ;
}