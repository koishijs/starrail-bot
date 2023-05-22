import { Channel, Command, FieldCollector, User } from "koishi";
import { StarRail } from "../database";

export class StarRailCommand<G extends keyof StarRailCommand = never, U extends User.Field = never, C extends Channel.Field = never, A extends any[] = any[], O extends {} = {}> extends Command<U, C, A, O> {
    
}