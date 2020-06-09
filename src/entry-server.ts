import CreateApp from "./app";
import Vue,{Component} from 'vue';


const CreateServerEntry = (context) : Promise<Vue> =>{
    const { app, router, store } = CreateApp();
    
    const { url } = context;
    const { fullPath } = router.resolve(url).route;

    return new Promise( (reslove, reject)=>{
        if (fullPath !== url) {
            router.push("/404");
            return reslove(app)
        }
        
        // set router's location
        router.push(url);
    
        router.onReady(()=>{
            let components = router.getMatchedComponents();
            store.commit("setDebug", JSON.stringify(components) );
            const asyncDataList = 
                    components.filter( com => {
                        return !!(com as Vue).asyncData;
                    })
                    .map( async ( com ) => {
                        return (com as Vue).asyncData({store,route:router.currentRoute})
                    });
                    
            Promise.all(asyncDataList).then( ()=>{
                context.state = store.state;
                context.title = store.state.title;
            }).finally( ()=> {
                reslove(app)
            })
        }, (err)=>{
            // store.commit("setDebug", JSON.stringify(err) );
            reslove(app)
        })
    })
}

export default CreateServerEntry;