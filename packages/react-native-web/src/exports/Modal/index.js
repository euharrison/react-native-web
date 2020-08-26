/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, { forwardRef, useCallback, useMemo, useEffect, useState } from 'react';

import ModalPortal from './ModalPortal';
import ModalAnimation from './ModalAnimation';
import ModalContent from './ModalContent';
import ModalFocusTrap from './ModalFocusTrap';

export type ModalProps = {|
  animationType?: ?('none' | 'slide' | 'fade'),
  children: any,
  onDismiss?: ?() => void,
  onRequestClose?: ?() => void,
  onShow?: ?() => void,
  transparent?: ?boolean,
  visible?: ?boolean
|};

let uniqueModalIdentifier = 0;

const activeModalStack = [];
const activeModalListeners = {};

function notifyActiveModalListeners() {
  if (activeModalStack.length > 0) {
    const activeModalId = activeModalStack[activeModalStack.length - 1];
    activeModalStack.forEach(modalId => {
      if (activeModalListeners[modalId] != null) {
        activeModalListeners[modalId](modalId === activeModalId);
      }
    });
  }
}

function addActiveModal(modalId, listener) {
  removeActiveModal(modalId);
  activeModalStack.push(modalId);
  activeModalListeners[modalId] = listener;
  notifyActiveModalListeners();
}

function removeActiveModal(modalId) {
  if (activeModalListeners[modalId] != null) {
    // Notify the active modal that is it closing
    activeModalListeners[modalId](false);
    delete activeModalListeners[modalId];
  }
  const index = activeModalStack.indexOf(modalId);
  if (index !== -1) {
    activeModalStack.splice(index, 1);
    notifyActiveModalListeners();
  }
}

const Modal = forwardRef<ModalProps, *>((props, forwardedRef) => {
  const {
    visible = false,
    animationType = 'none',
    transparent = false,
    children,
    onShow,
    onDismiss,
    onRequestClose
  } = props;

  const [isActive, setIsActive] = useState(false);

  // Set a unique model identifier to correctly route dismissals and check
  // the layering of modals.
  const modalId = useMemo(() => uniqueModalIdentifier++, []);

  // Search the stack and remove the exact modal.
  const onDismissCallback = useCallback(() => {
    removeActiveModal(modalId);
    if (onDismiss) {
      onDismiss();
    }
  }, [modalId, onDismiss]);

  const onShowCallback = useCallback(() => {
    addActiveModal(modalId, setIsActive);
    if (onShow) {
      onShow();
    }
  }, [modalId, onShow]);

  // Remove the modal from the active modals stack when this component
  // undergoes a cleanup (e.g., unmounting).
  useEffect(() => {
    return () => removeActiveModal(modalId);
  }, [modalId]);

  return (
    <ModalPortal>
      <ModalAnimation
        animationType={animationType}
        onDismiss={onDismissCallback}
        onShow={onShowCallback}
        visible={visible}
      >
        <ModalFocusTrap active={isActive}>
          <ModalContent
            active={isActive}
            onRequestClose={onRequestClose}
            ref={forwardedRef}
            transparent={transparent}
          >
            {children}
          </ModalContent>
        </ModalFocusTrap>
      </ModalAnimation>
    </ModalPortal>
  );
});

export default Modal;
