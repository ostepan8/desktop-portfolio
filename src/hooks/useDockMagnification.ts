"use client";

import { type RefObject } from "react";
import { useSpring, useTransform, type MotionValue } from "framer-motion";

const DISTANCE_RANGE = [-150, -75, 0, 75, 150];
const WIDTH_RANGE = [54, 62, 72, 62, 54];
const SPRING_CONFIG = {
  mass: 0.05,
  stiffness: 200,
  damping: 15,
};

export function useDockMagnification(
  mouseX: MotionValue<number>,
  ref: RefObject<HTMLElement | null>,
): MotionValue<number> {
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, DISTANCE_RANGE, WIDTH_RANGE);

  return useSpring(widthSync, SPRING_CONFIG);
}
