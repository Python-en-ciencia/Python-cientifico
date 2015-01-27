from IPython.display import IFrame
from IPython.core.magic import register_line_magic

@register_line_magic
def ddg(arg):
    phrase = arg.replace(' ', '+')
    url = "https://duckduckgo.com/?&q={0}".format(phrase)
    print(url)
    return IFrame(url, "100%", 400)