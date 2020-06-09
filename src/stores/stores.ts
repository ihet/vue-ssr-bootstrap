import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
Vue.use(Vuex);

export default function CreateStore(){
    return new Vuex.Store({
        state:{
            title: "hahah34",
            currentRouteName:"test",
            debug:"1"
        },
        mutations:{
            setTitle: function( state, val){
                state.title = val;
            },
            setDebug: function( state, val ){
                state.debug = val;
            }
        },
        actions:{
            FETCH_INDEX_TITLE: (context)=>{
                // return axios({
                //     url:"https://www.bigbigwork.com/qstatic?kw=jijian44_1",
                //     method:"get"
                // }).then( res =>{
                //     if(res.status == 200){
                //         context.commit("setTitle",res.data.data.cnkw);
                //     }else{
                //         context.commit("setTitle",res.status);
                //     }
                // }).catch(e =>{
                //     context.commit("setTitle",JSON.stringify(e));
                // })
                return Promise.resolve(true).then( () => {
                    context.commit("setTitle","更改标题成功");
                    return true;
                })
            }
        }
    })
}