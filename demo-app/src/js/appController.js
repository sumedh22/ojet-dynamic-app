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
        'ojs/ojvalidationgroup'
    ],
    function(accUtils, ko) {
        function ControllerViewModel() {
            var self = this;
            self.value = ko.observable();
            self.metadata = ko.observable({
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
                        required: true,
                        validators: [{
                            type: "regExp",
                            options: {
                                pattern: "^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$",
                                hint: "Email must be in the format johndoe@oracle.com",
                                messageDetail: "you must enter email in proper format"
                            }
                        }]
                    }
                }
            })
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
        return new ControllerViewModel();
    }
);