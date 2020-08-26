/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React, { forwardRef, useCallback, useEffect } from 'react';

import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';

import View from '../View';
import StyleSheet from '../StyleSheet';

export type ModalContentProps = {|
  children?: any,
  active?: ?(boolean | (() => boolean)),
  transparent?: ?boolean,
  onRequestClose?: ?() => void
|};

const ModalContent = forwardRef<ModalContentProps, *>((props, forwardedRef) => {
  const { active, children, onRequestClose, transparent } = props;

  const closeOnEscapeCallback = useCallback(
    (e: KeyboardEvent) => {
      if (active && e.key === 'Escape') {
        e.stopPropagation();
        if (onRequestClose) {
          onRequestClose();
        }
      }
    },
    [active, onRequestClose]
  );

  useEffect(() => {
    if (canUseDOM) {
      document.addEventListener('keyup', closeOnEscapeCallback, false);
      return () => {
        document.removeEventListener('keyup', closeOnEscapeCallback, false);
      };
    }
  }, [closeOnEscapeCallback]);

  return (
    <View
      accessibilityRole={active ? 'dialog' : null}
      aria-modal
      ref={forwardedRef}
      style={[styles.modal, transparent ? styles.modalTransparent : styles.modalOpaque]}
    >
      <View style={styles.container}>{children}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  modal: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 9999
  },
  modalTransparent: {
    backgroundColor: 'transparent'
  },
  modalOpaque: {
    backgroundColor: 'white'
  },
  container: {
    flex: 1
  }
});

export default ModalContent;
