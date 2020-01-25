define([
    'require',
    'knockout',
    'ojs/ojcontext',
    'ojs/ojbutton',
    'ojs/ojformlayout',
    'ojs/ojvalidationgroup'

], function(
    require, ko, Context
) {
    'use strict';

    /**
     * require paths to be configured for all the components uses
     */
    var REQUIRE_PATHS = {
        string: 'ojs/ojinputtext',
        number: 'ojs/ojinputnumber',
        date: 'ojs/ojdatetimepicker',
        'oj-text-area': 'ojs/ojinputtext',
        'oj-select-one': 'ojs/ojselectcombobox',
        'oj-switch': 'ojs/ojswitch',
    }

    function DynamicForm(context) {
        var self = this;
        self.props = context.properties;
        self.busyContext = Context.getContext(context.element).getBusyContext();
        self.composite = context.element;

        self._formId = context.uniqueId + '-form-id';
        self._OJINPUT = context.uniqueId + '-OJ-INPUT-';
        self._validationGroupId = context.uniqueId + '-validation-group-id';
        self._busyId = context.uniqueId + '-busyId';

        /**
         * form layout configuration
         */
        self.form = {
            maxColumns: context.properties.maxColumns,
            direction: context.properties.direction,
            labelEdge: context.properties.labelEdge,
            labelWidth: context.properties.labelWidth,
            labelWrapping: context.properties.labelWrapping

        };

        self.readonly = ko.observable(context.properties.readonly);

        self.rules = context.properties.rules || {};
        self._value = {};

        self._metadataArr = ko.observableArray();

        /**
         * sets the valid state of the dynamic form
         * 
         * @param {type} event
         * @return {undefined}
         */
        self.setValid = function(event) {
            context.properties.setProperty('value', ko.toJS(self._value))
            self.props.setProperty('valid', event.detail.value);
        };

    };

    /**
     * Inserts the new attribute into the form,resolves the dependencies (require)
     * add listeners if you want
     * 
     * @param {string} attribute : field name
     * @param {object} props: props
     * @return {Promise} : promise
     */
    DynamicForm.prototype.generateField = function(attribute, props) {
        var self = this;
        return new Promise(function(resolve, reject) {
            var prop = JSON.parse(JSON.stringify(props));
            prop.id = self.getAttributeId(attribute);
            prop.attribute = attribute;
            try {
                require([REQUIRE_PATHS[self.getType(prop)]], function() {
                    self._metadataArr.push(prop);
                    self.applyProperties(prop.id, prop);
                    if (self.rules[attribute]) {
                        document.getElementById(prop.id).addEventListener(
                            self.rules[attribute].attr + 'Changed',
                            function(event) {
                                self.executeRule.bind(self)(event.detail.value,
                                    self.rules[attribute].change, prop)
                            })
                    }
                    resolve();
                })
            } catch (err) {
                resolve(err);
            }
        })

    };

    DynamicForm.prototype.executeRule = function(value, changes, props) {
        var self = this;
        changes.forEach(function(change) {
            Context.getContext(document.getElementById(self.getAttributeId(
                change.field))).getBusyContext().whenReady().then(function() {
                document.getElementById(self.getAttributeId(change.field))
                    .setProperty(
                        change.attr, eval(change.value))
            })

        })
    }
    DynamicForm.prototype.runRulesOnInit = function(metadata, value) {
            var self = this;
            var fields = Object.keys(metadata.properties);
            fields.forEach(function(field) {
                if (value[field]()) {
                    if (self.rules[field]) {
                        self.executeRule(value[field](), self.rules[field].change)
                    }

                }
            })
        }
        /**
         * Returns the field type to be used to render the attribute
         * 
         * @param {type} field
         * @return {undefined}
         */
    DynamicForm.prototype.getType = function(field) {
        var type = field.controlType || field.type;
        if (field.options && type == 'string') {
            return 'oj-select-one';
        }
        return type;
    };

    DynamicForm.prototype.attached = function(context) {};

    /**
     * Adds the pass-through props to the metadata
     * @param {type} metadata
     * @param {type} property
     * @return {undefined}
     */
    DynamicForm.prototype.getProperty = function(metadata, property) {
        property.forEach(function(item) {
            if (metadata.properties[item.field] && item.attr) {
                if (!metadata.properties[item.field][item.attr]) {
                    metadata.properties[item.field][item.attr] = item.value;
                }
            }
        });
        return metadata;
    };

    DynamicForm.prototype.bindingsApplied = function(context) {
        var self = this;
        var val = context.properties.value || {};
        var m = Object.assign({}, context.properties.metadata);
        var p = Object.assign([], context.properties.property);
        var metadata = self.getProperty(m, p);
        var arr = Object.keys(metadata.properties);
        var fieldResolve = self.busyContext.addBusyState({ description: 'rendering fields' });
        var _loop = function _loop(i, _p) {
            _p = _p.then(function() {
                return self.generateField(arr[i], metadata.properties[arr[
                    i]]);
            });
            p = _p;
        };
        for (var i = 0, p = Promise.resolve(); i < arr.length; i++) {
            self._value[arr[i]] = ko.observable(val[arr[i]])
            _loop(i, p);
        }
        fieldResolve();
        setTimeout(function() {
            self.runRulesOnInit(metadata, self._value);
        }, 2000)
        ko.computed(function() {
            return ko.toJSON(self._value);
        }).subscribe(function(value) {
            context.properties.setProperty('value', ko.toJS(self._value))
        });
        document.getElementById(self._formId).setProperties(self.form);

    };
    /**
     * binds the user specified props to the component, handles readonly specs
     * @param {type} id : attribute id
     * @param {type} props : attribute props from metadata
     * @return {undefined}
     */
    DynamicForm.prototype.applyProperties = function(id, props) {
        var self = this;
        if (self.readonly()) {
            document.getElementById(id).setProperties(self.trimProperties(
                Object.assign({}, props, {
                    readonly: true
                })))
        } else {
            document.getElementById(id).setProperties(self.trimProperties(props))
        }

    };

    /**
     * removes the unwanted properties
     * @param {type} props
     * @return {undefined}
     */
    DynamicForm.prototype.trimProperties = function(props) {
        var p = Object.assign({}, props);

        delete p.id;
        delete p.attribute;
        delete p.type;
        delete p.labelShort;

        return p;

    };

    /**
     * Generate the attribute ID
     * @param {type} attribute
     * @return {undefined}
     */
    DynamicForm.prototype.getAttributeId = function(attribute) {
        var self = this;
        return self._OJINPUT + attribute;
    };

    DynamicForm.prototype.validate = function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            var e = document.getElementById(self._validationGroupId);
            if (e.valid == 'valid') {
                resolve(ko.toJS(self._value));
            } else {
                reject(e.valid);
            }
        })
    };

    DynamicForm.prototype.showMessages = function() {
        var self = this;
        var e = document.getElementById(self._validationGroupId);
        self.props.setProperty('valid', 'invalidShown')
        e.showMessages();
    };

    DynamicForm.prototype.focusOn = function(at) {
        var self = this;
        var e = document.getElementById(self._validationGroupId);
        e.focusOn(at);
    };

    /**
     * handles property change events
     * @param {type} context
     * @return {undefined}
     */
    DynamicForm.prototype.propertyChanged = function(context) {
        var self = this;
        if (context.property == 'value' && context.updatedFrom == 'external') {
            var val = context.value || {};
            for (var prop in self.props.metadata.properties) {
                self._value[prop](val[prop]);
            }
        }
    }

    DynamicForm.prototype.print = function() {
        var self = this;
        var obj = {};
        var keys = Object.keys(self.props.metadata.properties);
        keys.forEach(function(key) {
            var k = self.getAttributeId(key);
            var e = document.getElementById(k);
            if (e.print) {
                obj[self.props.metadata.properties[key].labelHint] = e.print();
            } else if (self.getType(self.props.metadata.properties[key]) ===
                'oj-select-one') {
                obj[self.props.metadata.properties[key].labelHint] = e.getProperty(
                    'valueOption').label;
            } else {
                obj[self.props.metadata.properties[key].labelHint] = e.getProperty(
                    'value');
            }

        });
        return obj;
    }

    DynamicForm.prototype.format = function(field, value) {
        var self = this;
        var el = document.getElementById(self.getAttributeId(field));
        if (el && el.format) {
            return el.format(value);
        } else {
            return value;
        }
    }

    return DynamicForm;
});