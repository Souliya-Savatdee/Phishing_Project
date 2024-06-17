
export const escapeHTML = (htmlString) => {
    return htmlString
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

export const unescapeHTML = (escapedHTML) => {
    let div = document.createElement('div');
    div.innerHTML = escapedHTML;
    return div.textContent || div.innerText || '';
};

export const formatHTML = (htmlString) => {
    let formatted = '';
    const reg = /(>)(<)(\/*)/g;
    htmlString = htmlString.replace(reg, '$1\r\n$2$3');
    let pad = 0;
    htmlString.split('\r\n').forEach((node) => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else if (node.match(/^<\w([^>]*[^\/])?>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }

        let padding = '';
        for (let i = 0; i < pad; i++) {
            padding += '  ';
        }

        formatted += padding + node + '\r\n';
        pad += indent;
    });

    return formatted;
};
