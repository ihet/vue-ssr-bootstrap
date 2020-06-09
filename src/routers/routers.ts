import VueRouter from 'vue-router';
import Vue from 'vue';

Vue.use(VueRouter);

const isServer = process.env.NODE_ENV === 'server';

const PageIndex = () => import( /* webpackChunkName:"pagehome" */ '../pages/index.vue');
const PageAbout = () => import( /* webpackChunkName:"pageabout" */ '../pages/about.vue');
const Page404 = () => import( /* webpackChunkName:"page404" */ '../pages/404.vue');



export default function CreateRouter(){
    return new VueRouter({
        mode:"history",
        fallback: false,
        scrollBehavior: () => ({ x:0, y: 0 }),
        routes: [
            {
                path: '/', component: PageIndex
            },
            {
                path: '/index', component: PageIndex
            },
            {
                path: '/about', component: PageAbout
            },
            {
                path: '/404', component: Page404
            },
            {
                path: '*', component: Page404
            }
        ]
    })
}