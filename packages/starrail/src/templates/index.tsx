import { Context, Element } from 'koishi'
import { Footer } from './footer'

export class Template {
    define(element: Element) { }
    render() {
        return <>
            <Footer dataBy=""></Footer>
        </>
    }
}

export class TemplateCore {
    constructor(ctx: Context) {
        ctx.component('g-card', async (attrs, children) => {
            return <></>
        })

        ctx.component('g-list', async () => {
            return <></>
        })
    }
}
