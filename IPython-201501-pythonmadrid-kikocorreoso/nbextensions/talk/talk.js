/*
* ----------------------------------------------------------------------------
* Copyright (c) 2014 - Kiko Correoso
*
* Distributed under the terms of the MIT License.
*
* A little extension to talk with the IPython notebook and write the 
* conversation in a cell.
*
* Ths extension is based on previous work by Damián Ávila and Min Ragan Kelley 
* see https://github.com/damianavila/mIPyex/tree/master/custom/spellchecker
* see https://github.com/minrk/ipython_extensions
* ----------------------------------------------------------------------------
*/

/*
* ----------------------------------------------------------------------------
* INSTALLATION
* 
* Add this file and neighboring talk.css to $(ipython locate)/nbextensions/talk
*
* And load it with:
*
* %%javascript
* IPython.load_extensions('talk/talk');
* ----------------------------------------------------------------------------
*/

define(["require"], function (require) {
  "use strict";
  
  // Test browser support
  window.SpeechRecognition = window.SpeechRecognition        ||
                             window.webkitSpeechRecognition  ||
                             null;
    
  if (window.SpeechRecognition){    
      
    var recognizer = new window.SpeechRecognition();
    recognizer.continuous = true; 
    recognizer.interimResults = true;
    recognizer.lang = "es-ES"   
    
    var talk_func = function(){
    
      var textarea = $('<textarea/>')
        .attr('rows','15')
        .attr('cols','80')
        .attr('name','source')
        .attr('id', 'talkarea')
        /*.attr('readonly', 'readonly')*/
        .text('Text will be written here...');
      
      var dialogform = $('<div/>')
        .append(
          $('<form/>').append(
            $('<fieldset/>').append(
              $('<label/>')
                .attr('for','source')
                .text("Please, talk to a microphone and the words " +
                      "will appear in the textarea below. " +
                      "This extension shall work on Chrome and maybe in the " +
                      "nightly builds of Firefox." +
                      "When the content is ready, press OK or Cancel if you " +
                      "want to discard the text. ")
            )
            .append($('<br/>'))
            .append(
              textarea
            )
          )
        );
    
      IPython.dialog.modal({
        title: "Please, talk and when ready click the button",
        body: dialogform,
        buttons: {
          "OK": { class : "btn-primary",
                  click: function() {
                           talkstop();
                           var corr_input = $.trim($(textarea).val());
                           console.log(corr_input);
                           IPython.notebook.get_selected_cell().set_text(corr_input);
                         }
                },
          Cancel: { click: function() {
                               talkstop();
                           }
                  }
        }
      });
      
      var talkstart = function (){
        console.log('entrostart');
        // Start recognising
        recognizer.onresult = function(event) {
                                console.log('onresult');
                                var transcription = $('#talkarea');
                                transcription.val('');
                                  for (var i = event.resultIndex; i < event.results.length; i++) {
                                    if (event.results[i].isFinal) {
                                      transcription.val(
                                        transcription.val() + event.results[i][0].transcript + '\n(Confidence: ' + event.results[i][0].confidence + ')'
                                      );
                                    } else {
                                      transcription.val(
                                        transcription.val() + event.results[i][0].transcript
                                      );
                                    };
                                  };
                              };
        // Error on recognising
        recognizer.onerror = function(event) {
                               console.log('onerror')
                               transcription.val('Recognition error: ' + event.message);
                             };
        // Start listening
        recognizer.start();
      };
    
      var talkstop = function () {
        // Stop listening
        console.log('entrostop')
        recognizer.stop();
      };
      
      talkstart();
    
    };
    
  } else {
    
    var talk_func = function(){
      
      var dialogupdate = $('<div/>')
        .append(
          $('<p/>')
            .text("Sorry, it seems that your browser doesn't support this functionality")
        );
      
      IPython.dialog.modal({
        title: "Not recognised",
        body: dialogupdate,
      });
    
    };  
  
  };
    
  var talk_button = function () {
    if (!IPython.toolbar) {
      $([IPython.events]).on("app_initialized.NotebookApp", talk_button);
      return;
    }
    if ($("#talk_button").length === 0) {
      IPython.toolbar.add_buttons_group([
        {
          'label'   : 'Talk to IPython',
          'icon'    : 'fa-pencil-square-o',
          'callback': toggle_talk,
          'id'      : 'talk_button'
        },
      ]);
    };
  };
  
  var toggle_talk = function(){
    talk_func()
  };
    
  var load_css = function () {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = require.toUrl("./talk.css");
    console.log(link);
    document.getElementsByTagName("head")[0].appendChild(link);
  };
  
  var load_ipython_extension = function () {
    load_css();
    talk_button();
  };

  return {
    load_ipython_extension : load_ipython_extension,
    toggle_talk : toggle_talk,
    talk_func : talk_func,
    
  };
  
});
