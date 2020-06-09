import Events from 'events';
import webpack, { Stats } from 'webpack';
import webpackDevMiddleWare from 'webpack-dev-middleware';
import { NextHandleFunction } from 'connect';
import webpackHotMiddleWare from 'webpack-hot-middleware';
import express,{Express} from 'express';
import {createBundleRenderer, createRenderer, BundleRenderer, Renderer} from 'vue-server-renderer';
import path from 'path';
import mfs from 'memory-fs';
import chokidar from "chokidar";
import fs from 'fs';

import clientConfig from "../build/webpack.config.client";
import serverConfig from "../build/webpack.config.server";

type updateResource = {
    clientManifest?: object,
    template?: string,
    bundle?:object|string
}


/** 观察模板页面 */
class TemplateWatcher{
    /** 网页模板 */
    public template: string;
    /** 模板路径 */
    public templatePath = path.resolve( __dirname, "../assets/template/index.template.html" );
    /** 初始化 */
    constructor(devRenderer:DevRendererWatcher){
        this.template = fs.readFileSync( this.templatePath , 'utf-8');
        devRenderer.set({template: this.template});
        //模板文件改动后更新模板
        chokidar.watch(this.templatePath).on('change', ( path, stats) => {
            devRenderer.set({template: this.template});
        })
    }
}

/** 服务器打包 */
class ServerBundle{
    /** 服务端编译器 */
    public comelier:webpack.Compiler;
    /** 编译结果 */
    public bundle:object|string;
    /** webpack文件系统 */
    public fileSystem:mfs;
    /** 初始化 */
    constructor(serverConfig:webpack.Configuration, devRendererWatcher:DevRendererWatcher){
        const _self = this;
        this.comelier = webpack(serverConfig);
        this.fileSystem = new mfs();
        this.comelier.outputFileSystem = this.fileSystem;
        this.comelier.watch({},(err, stats)=>{
            if(err){
                HandleErr(err);
            }else{
                const bundleFilePath = path.resolve( __dirname, "./vue-ssr-server-bundle.json");
                const bundleFile = _self.fileSystem.readFileSync( bundleFilePath, 'utf-8');
                _self.bundle = JSON.parse(bundleFile);
                devRendererWatcher.set({bundle:_self.bundle})
            }
        })
    }
}



/** 客户端打包 */
class ClientBundle{
    /** webpack编译器 */
    public comelier: webpack.Compiler;
    /** 客户端打包文件 */
    public clientManifest: Object;
    /** webpackDevMiddleWare */
    public devServer: webpackDevMiddleWare.WebpackDevMiddleware & NextHandleFunction;
    /** webpackHotMiddleWare */
    public hotServer: NextHandleFunction & webpackHotMiddleWare.EventStream;
    /** devServer的客户端配置 */
    public devClientConfig: webpack.Configuration;

    constructor(clientConfig:webpack.Configuration, devRenderer:DevRendererWatcher) {
        const _self = this;

        //修改客户端配置
        this.devClientConfig = Object.assign( {}, clientConfig, {
            entry: {
                app: ['webpack-hot-middleware/client', clientConfig.entry["app"]]
            }
        })
        this.devClientConfig.output.filename = '[name].js';
        this.devClientConfig.plugins.push(
            new webpack.HotModuleReplacementPlugin()
        );

        //编译客户端
        this.comelier = webpack(this.devClientConfig);

        // 初始化devMiddleWare
        this.devServer = webpackDevMiddleWare(this.comelier,{
            publicPath: clientConfig.output.publicPath
        });

        //打包完成后触发事件
        this.comelier.hooks.done.tap("clientDone", ( stats ) =>{
            try{
                if(stats.compilation.errors.length){
                    //打包出错
                    HandleErr( new Error(JSON.stringify(stats.compilation.errors)) );
                }else{
                    //打包成功
                    const clientManifestFilePath = path.resolve(__dirname, "../dist/vue-ssr-client-manifest.json")
                    const clientManifestFile = this.devServer.fileSystem.readFileSync( clientManifestFilePath, 'utf-8');
                    this.clientManifest = JSON.parse(clientManifestFile);
                    devRenderer.set( {clientManifest:this.clientManifest} )
                }
            }catch(e){
                HandleErr(e);
            }
            
        })
        

        //初始化hotMiddleWare
        this.hotServer = webpackHotMiddleWare(this.comelier,{ heartbeat: 5000 });

    }
}


/** 开发渲染器，代码改动后生成新的打包 */
class DevRendererWatcher  extends Events.EventEmitter {
    /** html渲染器 */
    public renderer:BundleRenderer = null;
    /** 客户端资源列表 */
    public clientManifest:object = null;
    /** 网页模板 */
    public template:string = null;
    /** 服务端的包 */
    public bundle:object|string = null;

    constructor(){
        super();
    }
    /** 编译完成，创建新的html渲染器 */
    createRenderer( bundle:string | object, template:string, clientManifest:object){
        this.renderer = createBundleRenderer( bundle, { template, clientManifest, basedir:path.resolve(__dirname,"../dist") });
        this.emit( "done", this.renderer );
    }

    /** 每当有资源生成时，调用此方法更新渲染器 */
    set( options: updateResource){
        options.clientManifest && ( this.clientManifest = options.clientManifest);
        options.template && ( this.template = options.template);
        options.bundle && ( this.bundle = options.bundle);
        console.dir("资源加载：" + (this.bundle && "bundle") + (this.template && "template") + (this.clientManifest && "clientManifest"));
        /** 如果资源都已加载完毕，创建renderer */
        if(this.clientManifest && this.template && this.bundle ){
            this.createRenderer( this.bundle, this.template, this.clientManifest );
        }
    }
}


/** 创建开发服务器 */
const CreateDevServer = async ( port:number, clientConfig:webpack.Configuration, serverConfig:webpack.Configuration ):Promise<Express> => {
    const Server = express();

    //创建开发打包器
    const devRendererWatcher = new DevRendererWatcher();

    //观察html模板
    const templateWatcher = new TemplateWatcher(devRendererWatcher);

    //打客户端包
    const clientBundle = new ClientBundle(clientConfig, devRendererWatcher);

    //打服务端包
    const serverBundle = new ServerBundle(serverConfig,devRendererWatcher);

    Server.use(clientBundle.devServer);

    Server.use(clientBundle.hotServer);
    
    
    Server.use('/dist',express.static( path.resolve(__dirname,"../dist")) )
    
    Server.get( "*", async ( req, res) => {

        try{
            const context = {
                title: "vue-ssr-test",
                url: req.url
            }
            if(devRendererWatcher.renderer){
                devRendererWatcher.renderer.renderToString(context, (err, html) => {
                    res.status(200).send( html )
                })
            }else{
                //当打包器确认到新改动时，返回新的打包
                devRendererWatcher.once("done", ( renderer:BundleRenderer )=>{
                    renderer.renderToString(context, (err, html) => {
                        res.status(200).send( html )
                    })         
                })
            }
            
        }catch(e){
            res.status(500).send(e);
            HandleErr(e);
        }
        
    });

    

    Server.listen(port,"0.0.0.0");
    console.dir("****************** Dev Server is Listening on port 10101 ******************")

    return Server;
}


const HandleErr = ( e:Error )=> {
    console.dir(e);
}
const resolve = file => path.resolve(__dirname, file);

const serve = (path, cache) => express.static(resolve(path), {
    maxAge: 0
  })

CreateDevServer(10101,clientConfig,serverConfig).catch(e => console.dir(e));



