/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define(['accUtils',
        'knockout',
        'ojs/ojvalidation-base',
        'dynamic-form/loader',
        'ojs/ojbutton',
        'ojs/ojvalidationgroup',
        'vs/editor/editor.main',
        'ojs/ojnavigationlist',
        'ojs/ojswitcher',
        'ojs/ojtoolbar',
    ],
    function(accUtils, ko) {

        function ControllerViewModel() {
            var self = this;
            self.selectedEditor = ko.observable('js');
            self.defaultJs = `require(['knockout'], 
            function(ko){
                var Model = function() {
                    var self = this;
                    self.value = ko.observable();
                    self.metadata = {
                    type: "object",
                    properties: {
                    firstName: {
                        type: 'string',
                        labelHint: 'First Name',
                        helpHints: {
                            definition: 'First Name of the user'
                        },
                        required: true
                    },
                    lastName: {
                        type: 'string',
                        labelHint: 'Last Name'
                    },
                    gender: {
                        type: 'string',
                        labelHint: 'Gender',
                        options: [{
                            label: 'Male',
                            value: 'M'
                        }, {
                            label: 'Female',
                            value: 'F'
                        }]
                    },
                    email: {
                        type: 'string',
                        labelHint: 'Email',
                        required: true
                    }
                    }
                    };
                    self.submit = function() {
                        var tracker = document.getElementById('tracker');
                        if (tracker.valid === 'valid') {
                        console.log(self.value())
                        } else {
                        tracker.showMessages();
                        tracker.focusOn('@firstInvalidShown');
                    }
                    }
                }
            ko.applyBindings(new Model(), document.getElementById('binding'))
        })
    `;
            self.defaultHtml = `<div class="oj-flex">
    <div class="oj-flex-item oj-sm-6">
        <oj-validation-group id="tracker">
            <dynamic-form metadata="[[metadata]]" value="{{value}}">
            </dynamic-form>
        </oj-validation-group>
        <oj-button on-oj-action="[[submit]]">Submit</oj-button>
    </div>
    <div class="oj-flex-item oj-sm-6">
        <label>Value</label>
        <pre>
        <code>
            <oj-bind-text value="[[JSON.stringify(value(),0,2)]]"></oj-bind-text>
        </code>
    </pre>
    </div>
    </div>`;
            self.render = function(html, js) {
                document.getElementById('binding').innerHTML = html;
                ko.cleanNode(document.getElementById('binding'));
                eval(`(function(){${js}})()`)
            }
            self.render(self.defaultHtml, self.defaultJs)
            self.applyHandler = function() {
                self.render(htmlEditor.getValue(), jsEditor.getValue())
            }

            self.formatHandler = function() {
                if (self.selectedEditor() === 'js') {
                    jsEditor.getAction('editor.action.formatDocument').run()
                } else {
                    htmlEditor.getAction('editor.action.formatDocument').run()
                }
            }

            self.resetHandler = function() {
                jsEditor.setValue(self.defaultJs)
                htmlEditor.setValue(self.defaultHtml)
            }
            var jsEditor = monaco.editor.create(document.getElementById('jsContainer'), {
                value: self.defaultJs,
                language: 'javascript'
            });

            var htmlEditor = monaco.editor.create(document.getElementById('htmlContainer'), {
                value: self.defaultHtml,
                language: 'html'
            });
            monaco.editor.setTheme('vs-dark')
        }
        return new ControllerViewModel();
    }
);