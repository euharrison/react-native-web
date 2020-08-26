/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { useEffect, useState, useCallback } from 'react';

import StyleSheet from '../StyleSheet';
import createElement from '../createElement';

const ANIMATION_DURATION = 300;

function getAnimationStyle(animationType, visible) {
  if (animationType === 'slide') {
    return visible ? animatedSlideInStyles : animatedSlideOutStyles;
  }
  if (animationType === 'fade') {
    return visible ? animatedFadeInStyles : animatedFadeOutStyles;
  }
  return visible ? styles.container : styles.hidden;
}

export type ModalAnimationProps = {|
  children?: any,
  animationType: ?('none' | 'slide' | 'fade'),
  visible?: ?boolean,
  onShow?: ?() => void,
  onDismiss?: ?() => void
|};

function ModalAnimation(props: ModalAnimationProps) {
  const { children, animationType, visible, onShow, onDismiss } = props;

  const [isRendered, setIsRendered] = useState(visible);

  const isAnimated = animationType !== 'none';

  const animationEndCallback = useCallback(() => {
    if (visible) {
      if (onShow != null) {
        onShow();
      }
    } else {
      setIsRendered(false);
      if (onDismiss != null) {
        onDismiss();
      }
    }
  }, [onDismiss, onShow, visible]);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
    }
    if (!isAnimated) {
      // Manually call `animationEndCallback` if no animation
      animationEndCallback();
    }
  }, [isAnimated, visible, animationEndCallback]);

  return isRendered
    ? createElement('div', {
        children,
        onAnimationEnd: animationEndCallback,
        style: getAnimationStyle(animationType, visible)
      })
    : null;
}

const styles = StyleSheet.create({
  container: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  animatedIn: {
    animationDuration: `${ANIMATION_DURATION}ms`,
    animationTimingFunction: 'ease-in'
  },
  animatedOut: {
    pointerEvents: 'none',
    animationDuration: `${ANIMATION_DURATION}ms`,
    animationTimingFunction: 'ease-out'
  },
  fadeIn: {
    opacity: 1,
    animationKeyframes: {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    }
  },
  fadeOut: {
    opacity: 0,
    animationKeyframes: {
      '0%': { opacity: 1 },
      '100%': { opacity: 0 }
    }
  },
  slideIn: {
    transform: [{ translateY: '0%' }],
    animationKeyframes: {
      '0%': { transform: [{ translateY: '100%' }] },
      '100%': { transform: [{ translateY: '0%' }] }
    }
  },
  slideOut: {
    transform: [{ translateY: '100%' }],
    animationKeyframes: {
      '0%': { transform: [{ translateY: '0%' }] },
      '100%': { transform: [{ translateY: '100%' }] }
    }
  },
  hidden: {
    display: 'none'
  }
});

const animatedSlideInStyles = [styles.container, styles.animatedIn, styles.slideIn];
const animatedSlideOutStyles = [styles.container, styles.animatedOut, styles.slideOut];
const animatedFadeInStyles = [styles.container, styles.animatedIn, styles.fadeIn];
const animatedFadeOutStyles = [styles.container, styles.animatedOut, styles.fadeOut];

export default ModalAnimation;
