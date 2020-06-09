import express,{Express} from 'express';
import {createBundleRenderer, createRenderer, BundleRenderer} from 'vue-server-renderer';
import path from 'path';
import fs from 'fs';

const CreateServer = async ( port:number ):Promise<Express> => {
    const Server = express();

    useStatic(Server);
    Server.get("/about", async ( req, res) => {

        try{
            const context = {
                title: "vue-ssr-test",
                url: "About"
            }
            const renderer:BundleRenderer = await CreateRenderer();
            renderer.renderToString(context, (err, html) => {
                res.status(200).send( html )
            })
            
        }catch(e){
            res.status(500).send(e);
            HandleErr(e);
        }
        
    });
    Server.get( "*", async ( req, res) => {

        try{
            const context = {
                title: "vue-ssr-test",
                url: req.url
            }
            const renderer:BundleRenderer = await CreateRenderer();
            renderer.renderToString(context, (err, html) => {
                res.status(200).send( html )
            })
            
        }catch(e){
            res.status(500).send(e);
            HandleErr(e);
        }
        
    });

    Server.listen(port,"0.0.0.0");
    console.dir("****************** Server is Listening on port 10101 ******************")

    return Server;
}

const HandleErr = ( e:Error )=> {
    console.dir(e);
}

const CreateRenderer  = async ():Promise<BundleRenderer> => {
    const bundle = require ("./vue-ssr-server-bundle.json");
    const clientManifest = require ("../dist/vue-ssr-client-manifest.json");

    const templatePath = path.resolve( __dirname, "../assets/template/index.template.html");
    const template = await fs.promises.readFile(templatePath, "utf-8");
    
    return createBundleRenderer(bundle,{
        template: template,
        clientManifest: clientManifest,
        basedir: path.resolve(__dirname, '../dist'),
        runInNewContext: "once"
    })
}


  

const useStatic = (server: Express)=>{
    server.use('/dist',express.static( path.resolve(__dirname,"../dist")) )
}

CreateServer( 10101 );
