var field = $('.d2l-dialog-frame').contents().find('.d2l-htmleditor-dialog-textarea');
var replace = {
    "d2l_figure_left": {
        "find": "<div class=\"floatLeft\">([\\s\\S]*?)</div>",
        "replace": "<figure class=\"left\">$1</figure>",
        "flags": "gim"
    },
    "d2l_figure_right": {
        "find": "<div class=\"floatRight\">([\\s\\S]*?)</div>",
        "replace": "<figure class=\"right\">$1</figure>",
        "flags": "gim"
    },
    "d2l_figure_block": {
        "find": "<div (class|align)=\"center\">([\\s\\S]*?)</div>",
        "replace": "<figure class=\"block\">$2</figure>",
        "flags": "gim"
    },
    "d2l_figcaption": {
        "find": "<span class=\"caption\">([\\s\\S]*?)</span>",
        "replace": "<figcaption>$1</figcaption>",
        "flags": "gim"
    },
    "d2l_img_attr": {
        "find": "(<br />[ ]?|<span class=\"caption\">|<figcaption>)(Image|Photo (courtesy|by))([^<]+)",
        "replace": "<p class=\"attribution\">$2$4</p>",
        "flags": "gim"
    },
    "d2l_picturetable": {
        "find": "<table class=\"picturetable\"([\\s\\S]*?)<th>([\\s\\S]*?)</th>[$s]?<td>([\\s\\S]*?)</td>[$s]?</tr>[$s]?</tbody>[$s]?</table>",
        "replace": "<figure class=\"left\">$2</figure>$3",
        "flags": "gim"
    },
    "d2l_navbuttons": {
        "find": "<p class=\"(navbuttons|disclaimer)\">([\\s\\S]*?)</body>",
        "replace": "</body>",
        "flags": "gim"
    },
    "d2l_headings": {
        "find": "h5",
        "replace": "h2",
        "flags": "gi"
    },
    "d2l_stupid_audio": {
        "find": "<object([\\s\\S]*?)<param name=\"src\" value=\"([^\"]+)\"/>([\\s\\S]*?)</object></p>",
        "replace": "<audio controls=\"controls\" preload=\"auto\" src=\"$2\">Your browser does not support the <code>audio</code> element. Please <a href=\"$2\">download the file</a> instead.</audio>",
        "flags": "gim"
    },
    "d2l_styles": {
        "find": "<link rel=\"stylesheet\" href=\"/content/Science/1011_Sem1/SBI3C-01-Jarvis/SBI3CPU04/SBI3CPU04A01/course_science.css\" type=\"text/css\" />",
        "replace": "<link rel=\"stylesheet\" href=\"/shared/templates/Plain/_course_styles.css\" type=\"text/css\"><link rel=\"stylesheet\" href=\"/content/Science/1011_Sem1/SBI3C-01-Jarvis/_course_styles.css\">",
        "flags": "gim"
    },
    "d2l_header_nav": {
        "find": "<div class=\"wrap\">[\\s\\S]*?<hr \/>",
        "replace": "",
        "flags": "gim"
    }
};
$.each(replace, function(cmd, params) {
    var expr = new RegExp(params.find, params.flags);
    field.val(field.val().replace(expr, params.replace));
});