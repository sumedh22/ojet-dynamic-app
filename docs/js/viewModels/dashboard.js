/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your dashboard ViewModel code goes here
 */
define(['accUtils',
        'knockout',
        'ojs/ojvalidation-base',
        'dynamic-form/loader',
        'ojs/ojbutton',
        'ojs/ojvalidationgroup'
    ],
    function(accUtils, ko) {

        function DashboardViewModel() {
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
                // Below are a set of the ViewModel methods invoked by the oj-module component.
                // Please reference the oj-module jsDoc for additional information.
            self.submit = function() {
                    var tracker = document.getElementById('tracker');
                    if (tracker.valid === 'valid') {
                        console.log(self.value())
                    } else {
                        tracker.showMessages();
                        tracker.focusOn('@firstInvalidShown');

                    }
                }
                /**
                 * Optional ViewModel method invoked after the View is inserted into the
                 * document DOM.  The application can put logic that requires the DOM being
                 * attached here.
                 * This method might be called multiple times - after the View is created
                 * and inserted into the DOM and after the View is reconnected
                 * after being disconnected.
                 */
            self.connected = function() {
                accUtils.announce('Dashboard page loaded.');
                document.title = "Dashboard";
                // Implement further logic if needed
            };

            /**
             * Optional ViewModel method invoked after the View is disconnected from the DOM.
             */
            self.disconnected = function() {
                // Implement if needed
            };

            /**
             * Optional ViewModel method invoked after transition to the new View is complete.
             * That includes any possible animation between the old and the new View.
             */
            self.transitionCompleted = function() {
                // Implement if needed
            };
        }

        /*
         * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
         * return a constructor for the ViewModel so that the ViewModel is constructed
         * each time the view is displayed.
         */
        return DashboardViewModel;
    }
);