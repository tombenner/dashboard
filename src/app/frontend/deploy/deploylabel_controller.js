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

import DeployLabel from './deploylabel';

/**
 * Service used for handling label actions like: hover, showing duplicated key error, etc.
 * @final
 */
export default class DeployLabelController {
  /**
   * Constructs our label controller.
   */
  constructor() {
    /** @export {!DeployLabel} Initialized from the scope. */
    this.label;

    /** @export {!Array<!DeployLabel>} Initialized from the scope. */
    this.labels;
  }

  /**
   * Calls checks on label:
   *  - adds label if last empty label has been filled
   *  - removes label if some label in the middle has key and value empty
   *  - checks for duplicated key and sets validity of element
   * @param {!angular.FormController|undefined} labelForm
   * @export
   */
  check(labelForm) {
    this.addIfNeeded_();
    this.removeIfNeeded_();
    this.validateKey_(labelForm);
  }

  /**
   * Returns true when label is editable and is not last on the list.
   * Used to indicate whether delete icon should be shown near label.
   * @return {boolean}
   * @export
   */
  isRemovable() {
    /** @type {!DeployLabel} */
    let lastElement = this.labels[this.labels.length - 1];
    return !!(this.label.editable && this.label !== lastElement);
  }

  /**
   * Deletes row from labels list.
   * @export
   */
  deleteLabel() {
    /** @type {number} */
    let rowIdx = this.labels.indexOf(this.label);

    if (rowIdx > -1) {
      this.labels.splice(rowIdx, 1);
    }
  }

  /**
   * Adds label if last label key and value has been filled.
   * @private
   */
  addIfNeeded_() {
    /** @type {!DeployLabel} */
    let lastLabel = this.labels[this.labels.length - 1];

    if (this.isFilled_(lastLabel)) {
      this.addNewLabel_();
    }
  }

  /**
   * Adds row to labels list.
   * @private
   */
  addNewLabel_() { this.labels.push(new DeployLabel()); }

  /**
   * Removes label from labels list if label is empty and is not last label.
   * @private
   */
  removeIfNeeded_() {
    /** @type {!DeployLabel} */
    let lastLabel = this.labels[this.labels.length - 1];

    if (this.isEmpty_(this.label) && this.label !== lastLabel) {
      this.deleteLabel();
    }
  }

  /**
   * Validates label withing label form.
   * Current checks:
   *  - duplicated key
   * @param {!angular.FormController|undefined} labelForm
   * @private
   */
  validateKey_(labelForm) {
    if (angular.isDefined(labelForm)) {
      /** @type {!angular.NgModelController} */
      let elem = labelForm.key;

      // TODO(floreks): Validate label key/value.
      /** @type {boolean} */
      let isValid = !this.isDuplicated_();

      elem.$setValidity('unique', isValid);
    }
  }

  /**
   * Returns true if there are 2 or more labels with the same key on the labelList,
   * false otherwise.
   * @return {boolean}
   * @private
   */
  isDuplicated_() {
    /** @type {number} */
    let duplications = 0;

    this.labels.forEach((label) => {
      if (this.label.key.length !== 0 && label.key === this.label.key) {
        duplications++;
      }
    });

    return duplications > 1;
  }

  /**
   * Returns true if label key and value are empty, false otherwise.
   * @param {!DeployLabel} label
   * @return {boolean}
   * @private
   */
  isEmpty_(label) { return label.key.length === 0 && label.value().length === 0; }

  /**
   * Returns true if label key and value are not empty, false otherwise.
   * @param {!DeployLabel} label
   * @return {boolean}
   * @private
   */
  isFilled_(label) { return label.key.length !== 0 && label.value().length !== 0; }
}
