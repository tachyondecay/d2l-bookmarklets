/**
 * Replaces the Ugly Yellow Sigma Square images that represent a LaTeX equation 
 * in D2L's content editor with the underlying LaTeX.
 * 
 * Also, it corrects for a bug in some versions of D2L where inline LaTeX (as 
 * indicated by \( and \) tags around the equation) still receives a "block" 
 * display attribute on the MathML.
 */


/**
 * Cleans up after ourselves, either when re-running the bookmarklet or after 
 * saving or previewing the page.
 */
function removeLatex(frame) {
    frame
        .find('.latexequation-raw')
            .remove()
            .end()
        .find('.latexequation')
            .show();
}


// Grab the iFrame holding the TinyMCE editor and find all LaTeX equation 
// placeholders.
var frame = $('#topicContent\\$html_ifr').contents();
var equations = frame.find('.latexequation');
removeLatex(frame);

// This will remove the raw LaTeX when we click the preview or any submit buttons
$('.d2l-htmleditor-button[title="Preview"], .d2l-htmleditor-button[title="HTML Source Editor"], .vui-button-primary').click(function(e) {
    removeLatex(frame);
});


/**
 * Iterate over the LaTeX equations, extracting the raw LaTeX from a MathML 
 * annotation, and hiding/replacing the image with a span that shows the code.
 */
var parsed = skipped = 0;
$.each(equations, function(key, equation) {
    var mathml = $(decodeURIComponent($(equation).data('d2l-mathml')));
    var raw_latex = mathml
                        .contents()
                            .find('annotation')
                            .text()
                            .replace("\\(", "%%")       // Deal with JSON parser barfing on inline notation
                            .replace("\\)", "%%")       // Ditto
                            .replace("\\", "\\\\");     // ESCAPE ALL THE THINGS
    try {
        raw_latex = $.parseJSON(raw_latex)
                        .math
                            .replace(/^%%/, "\\(")
                            .replace(/%%$/, "\\)");
        parsed += 1;
    } catch(e) {
        // Sometimes the JSON parser will still barf, and tbh ain't nobody got 
        // time to escape all the weird stuff D2L does with its annotations.
        console.log(e);
        skipped += 1;
        return true;
    }
    // Make MathML display="inline" if necessary
    if(raw_latex.match(/\\\(.*?\\\)/, 'gmi')) {
        mathml.attr('display', 'inline');
        $(equation).attr('data-d2l-mathml', encodeURIComponent(mathml[0].outerHTML));
    }
    // Build our replacement
    $(equation)
        .hide()
        .after(
            $('<span>')
                .addClass('latexequation-raw')
                .css({
                    cursor: "pointer",
                    "font-family": "monospace"
                })
                .text(raw_latex)
                .attr('title', 'Click to revert.')
                .click(function(e) {
                    $(this)
                        .prev()
                            .show()
                            .end()
                        .remove();
                })
    );
});


/**
 * Display a status message indicating how successful we were.
 */
$('<span>')
    .text(parsed + ' LaTeX equations parsed and ' + skipped + ' skipped. Click on an equation to revert.')
    .addClass('latexequation-message')
    .css('padding', '4px')
    .hide()
    .appendTo('.d2l-page-buttons')
    .fadeIn(500)
    .delay(3000)
    .fadeOut(750);
