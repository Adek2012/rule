/*
 * Telegram 链接自动重定向至 Turrit
 * 功能：拦截 t.me 链接，无感跳转到 Turrit 客户端
 */

const url = $request.url;
const pathMatch = url.match(/^https?:\/\/(?:t|telegram)\.me\/(.+)$/);

if (!pathMatch) {
    // 没匹配到具体路径（比如纯主页），直接放行
    $done({});
} else {
    const path = pathMatch[1];
    let query = "";
    
    // 解析 Telegram 链接逻辑
    if (path.startsWith("+") || path.startsWith("joinchat/")) {
        // 邀请链接
        const inviteCode = path.replace(/^(\+|joinchat\/)/, "");
        query = `join?invite=${inviteCode}`;
    } else if (path.includes("/")) {
        // 帖子链接
        const parts = path.split("?");
        const pathParts = parts[0].split("/");
        query = `resolve?domain=${pathParts[0]}&post=${pathParts[1]}`;
        if (parts[1]) query += `&${parts[1]}`; 
    } else {
        // 普通用户名或频道名
        const parts = path.split("?");
        query = `resolve?domain=${parts[0]}`;
        if (parts[1]) query += `&${parts[1]}`; 
    }

    // 直接写死 Turrit 的 URL Scheme
    const finalUrl = "turrit://" + query;

    // 返回 302 重定向，直接拉起 Turrit
    $done({
        response: {
            status: 302,
            headers: { 
                "Location": finalUrl 
            }
        }
    });
}
