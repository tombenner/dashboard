// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Namespace creation dialog controller.
 *
 * @final
 */
export default class NamespaceDialogController {
  /**
   * @param {!md.$dialog} $mdDialog
   * @param {!angular.$log} $log
   * @param {!angular.$resource} $resource
   * @param {!Array<string>} namespaces
   * @ngInject
   */
  constructor($mdDialog, $log, $resource, namespaces) {
    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /**
     * List of available namespaces.
     * @export {!Array<string>}
     */
    this.namespaces = namespaces;

    /** @export {string} */
    this.namespace = '';
  }

  /**
   * Returns true if new namespace name hasn't been filled by the user, i.e, is empty.
   * @return {boolean}
   * @export
   */
  isDisabled() {
    return !this.namespace || /^\s*$/.test(!this.namespace) ||
           this.namespaces.indexOf(this.namespace) >= 0;
  }

  /**
   * Cancels the new namespace form.
   * @export
   */
  cancel() { this.mdDialog_.cancel(); }

  /**
   * Creates new namespace based on the state of the controller.
   * @export
   */
  createNamespace() {
    /** @type {!backendApi.NamespaceSpec} */
    let namespaceSpec = {name: this.namespace};

    /** @type {!angular.Resource<!backendApi.NamespaceSpec>} */
    let resource = this.resource_('/api/namespaces');

    resource.save(
        namespaceSpec,
        (savedConfig) => {
          this.log_.info('Successfully created namespace:', savedConfig);
          this.mdDialog_.hide(this.namespace);
        },
        (err) => {
          this.log_.info('Error creating namespace:', err);
          this.mdDialog_.hide();
        });
  }
}
