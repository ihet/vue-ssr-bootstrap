import Vue, {ComponentOptions, VueConstructor} from 'vue'
import VueRouter, { Route } from 'vue-router'
import { Store } from 'vuex'
interface AsyncDataProps {
        store?:Store<any>,
        route?:Route,
        [name:string]:any
}

declare module 'vue/types/vue' {
        interface Vue {
                $router: VueRouter;
                $route: Route;
                $store: Store<any>;
                asyncData?: ( props:AsyncDataProps )=> Promise<any>
        }
}

declare module "vue/types/options" {
        interface ComponentOptions<V extends Vue> {
                asyncData?: ( props:AsyncDataProps )=> Promise<any>
        }
}