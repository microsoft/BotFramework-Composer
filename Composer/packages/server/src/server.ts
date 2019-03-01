<<<<<<< HEAD
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import {fileServer} from './router/fileServer';
import {launcherServer} from './router/launcherServer';

const app = express();

app.all('*',function(req: any,res: { header: { (arg0: string, arg1: string): void; (arg0: string, arg1: string): void; (arg0: string, arg1: string): void; }; },next: () => void){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req: any, res: any, next: any) {
    res.send('fortest')
  });

app.use('/api/fileserver', new fileServer().getRouter());
app.use('/api/launcher', new launcherServer().getRouter());

=======
import express from "express"

const app = express();

>>>>>>> 315fa2b... basic ts setup
app.listen(process.env.PORT || 5000, () => {
    console.log('Server running');
});