import { App } from 'koishi';
import * as Help from '@koishijs/plugin-help';
import Console from '@koishijs/plugin-console';
import LogProvider from '@koishijs/plugin-logger';
import * as sandbox from '@koishijs/plugin-sandbox';
import Sqlite from "@koishijs/plugin-database-sqlite";
import Dataview from "@koishijs/plugin-dataview"

import Starrail from '../packages/core'
import Atlas from '../packages/atlas';
import GachaLog from '../packages/gachaLog';
import * as Code from '../packages/code';


const app = new App({
  prefix: '.',
  port: 5140,
});

app.plugin(Help);
app.plugin(Console);
app.plugin(LogProvider);
app.plugin(sandbox);
app.plugin(Sqlite, {
  path: "./koishi.db"
})
app.plugin(Dataview)

// Target plugin
app.plugin(Starrail);
app.plugin(Atlas, {
  prefix: "#",
  engine: true,
  src_path: '',
  repo: 'https://gitee.com/Nwflower/star-rail-atlas/raw/master'
});
app.plugin(GachaLog);
app.plugin(Code);


app.start();
