/*
 * Telegram 客户端自动重定向 (模块参数版)
 * 功能：读取 Surge 模块参数，自动重定向到指定的第三方客户端
 */

const url = $request.url;
const pathMatch = url.match(/^https?:\/\/(?:t|telegram)\.me\/(.+)$/);

// 如果没有匹配到具体路径，直接放行
if (!pathMatch) {
    $done({});
} else {
    const path = pathMatch[1];
    let query = "";
    
    // 解析 Telegram 链接逻辑 (兼容群组、频道、帖子和带参数的链接)
    if (path.startsWith("+") || path.startsWith("joinchat/")) {
        // 邀请链接
        const inviteCode = path.replace(/^(\+|joinchat\/)/, "");
        query = `join?invite=${inviteCode}`;
    } else if (path.includes("/")) {
        // 帖子链接 (如 username/123?start=1)
        const parts = path.split("?");
        const pathParts = parts[0].split("/");
        query = `resolve?domain=${pathParts[0]}&post=${pathParts[1]}`;
        if (parts[1]) query += `&${parts[1]}`; // 附加原有参数
    } else {
        // 普通用户名 (如 username?start=1)
        const parts = path.split("?");
        query = `resolve?domain=${parts[0]}`;
        if (parts[1]) query += `&${parts[1]}`; // 附加原有参数
    }

    // 获取 Surge 模块中传递的参数，默认使用官方客户端
    const clientArg = (typeof $argument !== "undefined" && $argument !== "") ? $argument.trim().toLowerCase() : "official";
    
    // 根据参数匹配对应的 URL Scheme
    let scheme = "tg://";
    switch (clientArg) {
        case "nicegram":
            scheme = "nicegram://";
            break;
        case "swiftgram":
            scheme = "swiftgram://"; // 或者 sg://，视 App 版本而定
            break;
        case "turrit":
            scheme = "turrit://";
            break;
        case "ime":
            scheme = "ime://";
            break;
        case "official":
        default:
            scheme = "tg://";
            break;
    }

    const finalUrl = scheme + query;

    // 直接返回 302 重定向，实现无感跳转
    $done({
        response: {
            status: 302,
            headers: { 
                "Location": finalUrl 
            }
        }
    });
}
