import { Dict, Schema } from "koishi"

export abstract class StarRailPlugin {

}

export namespace StarRailPlugin {
    export interface Config { }
    const schema = []
    export function defineSchema<T extends Dict>(obj: T, desc: string) {
        schema.push(Schema.object<T>(obj).description(desc))
    }
    export const Config: Schema<Config> = Schema.intersect(schema)
}
