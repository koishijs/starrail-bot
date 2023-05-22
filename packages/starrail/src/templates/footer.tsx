import { version } from "koishi";

const footerStyle = {

}

export function Footer({ dataBy = null as string }) {
    return <footer style={footerStyle}>
        {dataBy ?? <span>Data by {dataBy}</span>}
        <span>Render by Koishi v{version} & koishi-plugin-starrail</span>
    </footer>
}