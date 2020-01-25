/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
define(['ojs/ojcomposite', 'text!./dynamic-form-view.html', './dynamic-form-viewModel', 'text!./component.json', 'css!./dynamic-form-styles'],
  function(Composite, view, viewModel, metadata) {
    Composite.register('dynamic-form', {
      view: view,
      viewModel: viewModel,
      metadata: JSON.parse(metadata)
    });
  }
);