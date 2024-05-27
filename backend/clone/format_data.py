
import re
import html
from bs4 import BeautifulSoup

# file_path = "./clone/facebook_clone.html"
# output_unescaped_path = "./escape_html_format/facebook_file_unescaped.html"
# output_escaped_path = "./escape_html_format/facebook_file_escape.html"

def read_file(file_path):
    """Read the content from a file."""
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()

def write_file(file_path, content):
    """Write the content to a file."""
    with open(file_path, "w", encoding="utf-8") as file:
        file.write(content)
        

# html_en_content = read_file(file_path)

def escape_html(input_data):
    escaped_data = html.escape(input_data)
    escaped_data = re.sub(r'\s+', ' ', escaped_data).strip()
    return escaped_data

def unescape_html(input_data):
    unescaped_content = html.unescape(input_data)
    parsed_data = BeautifulSoup(unescaped_content, "html.parser")
    return parsed_data.prettify()
    
# escaped_content = escape_html(html_en_content)
# write_file(output_escaped_path, escaped_content)


# html_unen_content = read_file(output_escaped_path)
# unescaped_content = unescape_html(html_unen_content)
# write_file(output_unescaped_path, unescaped_content)



print("successfully")

