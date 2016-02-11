/**
 * Replaces the Ugly Yellow Sigma Square images that represent a LaTeX equation 
 * in D2L's content editor with the underlying LaTeX.
 * 
 * Also, it corrects for a bug in some versions of D2L where inline LaTeX (as 
 * indicated by \( and \) tags around the equation) still receives a "block" 
 * display attribute on the MathML.
 */

if(typeof Bookmarklets == "undefined") {
    var Bookmarklets = {};
}

/**
 * Cleans up after ourselves, either when re-running the bookmarklet or after 
 * saving or previewing the page.
 */
Bookmarklets.removeLatex = function(frame) {
    frame
        .find('.latexequation-raw')
            .remove()
            .end()
        .find('.latexequation')
            .show();
}

/**
 * Find the underlying LaTeX stored in a MathML annotation, parse it from 
 * a JSON object, escaping and replacing newlines.
 */
Bookmarklets.getAnnotation = function(mathml) {
    var raw_latex = mathml.contents()
                            .find('annotation')
                            .text()
                            .replace(/\n/gmi, "\\n")
                            .replace(/\\/gmi, "\\\\");
    try {
        raw_latex = $.parseJSON(raw_latex).math
                        .replace(/\\n/gmi, "<br/>")
                        .replace(/\{\{(.*?)\}\}/gi, "{$1}");
        return raw_latex;
    } catch(e) {
        console.log(e);
        return false;
    }
}

/**
 * This is the main event. This wrapper is so we can import and run the 
 * bookmarklet from this external file.
 */
Bookmarklets.parseLatex = function() {
    var self = this;
    // Grab the iFrame holding the TinyMCE editor and find all LaTeX equation 
    // placeholders.
    var frame = $('#topicContent\\$html_ifr').contents();
    var equations = frame.find('.latexequation');
    self.removeLatex(frame);

    // This will remove the raw LaTeX when we click the preview or any submit buttons
    $('.d2l-htmleditor-button[title="Preview"], .d2l-htmleditor-button[title="HTML Source Editor"], .vui-button-primary').click(function(e) {
        self.removeLatex(frame);
    });


    /**
     * Iterate over the LaTeX equations, extracting the raw LaTeX from a MathML 
     * annotation, and hiding/replacing the image with a span that shows the code.
     */
    var parsed = skipped = 0;
    $.each(equations, function(key, equation) {
        var mathml = $(decodeURIComponent($(equation).data('d2l-mathml')));
        var raw_latex = self.getAnnotation(mathml);
        if(!raw_latex) {
            // Sometimes the JSON parser will still barf, and tbh ain't nobody got 
            // time to escape all the weird stuff D2L does with its annotations.
            skipped += 1;
            return true;
        }
        parsed += 1;
        // Make MathML display="inline" if necessary
        if(raw_latex.match(/\\\(.*?\\\)/, 'gmi')) {
            mathml.attr('display', 'inline');
        }
        // Replace double braces for great justice
        mathml.contents()
            .find('annotation')
            .text(function() {
                return $(this).text().replace(/\{\{(.*?)\}\}/gi, "{$1}");
            });
        $(equation).attr('data-d2l-mathml', encodeURIComponent(mathml[0].outerHTML));
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
                    .html(raw_latex)
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
}