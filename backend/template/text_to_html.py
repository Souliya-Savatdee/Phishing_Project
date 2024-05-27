
import re
import html
from clone.format_data import escape_html

def text_to_html(text_content):
    lines = text_content.strip().split('\n')
    first_line = f"<h1>{html.escape(lines[0])}</h1>"
    remaining_lines = "".join(f"<p>{html.escape(line)}</p>" for line in lines[1:])
    

    html_content = f"""
    <html><body>{first_line}{remaining_lines}<img src="https://test-gcp-yxksxlem4a-as.a.run.app/track_pixel?id=[userid]" alt="" /></body></html>
    """
    url = f"http://127.0.0.1:5500/clone/Work_facebook.html?id=[userid]"
    html_content = re.sub(r'Click Here', f'<a style="text-decoration:none" href="{url}">Click Here</a>', html_content, flags=re.IGNORECASE)
    
    html_content = escape_html(html_content)
    
    return html_content

